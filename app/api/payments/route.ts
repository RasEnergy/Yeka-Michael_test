import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, hasPermission, canAccessBranch } from "@/lib/auth";

export async function POST(request: NextRequest) {
	try {
		const user = await getUserFromRequest(request);
		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		if (!hasPermission(user.role, ["SUPER_ADMIN", "BRANCH_ADMIN", "CASHIER"])) {
			return NextResponse.json(
				{ error: "Insufficient permissions" },
				{ status: 403 }
			);
		}

		const { invoiceId, amount, paymentMethod, notes } = await request.json();

		if (!invoiceId || !amount || !paymentMethod) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Verify invoice exists and get branch info
		const invoice = await prisma.invoice.findUnique({
			where: { id: invoiceId },
			include: {
				student: {
					include: {
						user: {
							select: {
								firstName: true,
								lastName: true,
								email: true,
							},
						},
					},
				},
				branch: true,
				payments: {
					where: { status: "COMPLETED" },
				},
			},
		});

		if (!invoice) {
			return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
		}

		// Check branch access
		if (!canAccessBranch(user, invoice.branchId)) {
			return NextResponse.json(
				{ error: "Access denied to this branch" },
				{ status: 403 }
			);
		}

		// Calculate remaining amount
		const paidAmount = invoice.payments.reduce(
			(sum, payment) => sum + Number(payment.amount),
			0
		);
		const remainingAmount = Number(invoice.totalAmount) - paidAmount;
		const paymentAmount = Number(amount);

		if (paymentAmount <= 0) {
			return NextResponse.json(
				{ error: "Payment amount must be greater than 0" },
				{ status: 400 }
			);
		}

		if (paymentAmount > remainingAmount) {
			return NextResponse.json(
				{
					error: `Payment amount (${paymentAmount}) exceeds remaining balance (${remainingAmount})`,
				},
				{ status: 400 }
			);
		}

		// Generate payment number
		const currentYear = new Date().getFullYear();
		const paymentCount = await prisma.payment.count({
			where: {
				student: { branchId: invoice.branchId },
			},
		});
		const paymentNumber = `PAY-${currentYear}-${String(
			paymentCount + 1
		).padStart(6, "0")}`;

		const payment = await prisma.$transaction(async (tx) => {
			// Create payment record
			const newPayment = await tx.payment.create({
				data: {
					paymentNumber,
					invoiceId,
					studentId: invoice.studentId,
					branchId: invoice.branchId, // Include branchId for better querying
					amount: paymentAmount,
					paymentMethod,
					status: paymentMethod === "CASH" ? "COMPLETED" : "PENDING",
					notes,
				},
			});

			// Update invoice paid amount and status
			const newPaidAmount = paidAmount + paymentAmount;
			const newStatus =
				newPaidAmount >= Number(invoice.totalAmount)
					? "PAID"
					: newPaidAmount > 0
					? "PARTIALLY_PAID"
					: "PENDING";

			await tx.invoice.update({
				where: { id: invoiceId },
				data: {
					paidAmount: newPaidAmount,
					status: newStatus,
				},
			});

			return tx.payment.findUnique({
				where: { id: newPayment.id },
				include: {
					invoice: {
						include: {
							student: {
								include: {
									user: {
										select: {
											firstName: true,
											lastName: true,
											email: true,
										},
									},
								},
							},
						},
					},
				},
			});
		});

		return NextResponse.json({
			message: "Payment processed successfully",
			payment,
		});
	} catch (error) {
		console.error("Payment processing error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const user = await getUserFromRequest(request);
		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const branchId = searchParams.get("branchId");
		const studentId = searchParams.get("studentId");
		const status = searchParams.get("status");
		const paymentMethod = searchParams.get("paymentMethod");
		const page = Number.parseInt(searchParams.get("page") || "1");
		const limit = Number.parseInt(searchParams.get("limit") || "10");

		const where: any = {};

		// Branch filtering
		if (user.role !== "SUPER_ADMIN") {
			if (branchId && canAccessBranch(user, branchId)) {
				where.branchId = branchId;
			} else if (user.branchId) {
				where.branchId = user.branchId;
			} else {
				return NextResponse.json({ error: "Access denied" }, { status: 403 });
			}
		} else if (branchId) {
			where.branchId = branchId;
		}

		if (studentId) where.studentId = studentId;
		if (status) where.status = status;
		if (paymentMethod) where.paymentMethod = paymentMethod;

		const [payments, total] = await Promise.all([
			prisma.payment.findMany({
				where,
				include: {
					invoice: {
						include: {
							student: {
								include: {
									user: {
										select: {
											firstName: true,
											lastName: true,
											email: true,
										},
									},
								},
							},
						},
					},
					branch: {
						select: {
							name: true,
							code: true,
						},
					},
				},
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			prisma.payment.count({ where }),
		]);

		return NextResponse.json({
			payments,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Get payments error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
