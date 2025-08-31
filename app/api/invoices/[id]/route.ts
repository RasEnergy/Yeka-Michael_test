import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { smsService } from "@/lib/sms";
import { getUserFromRequest, hasPermission } from "@/lib/auth";
import InvoiceDetailPage from "@/app/dashboard/invoices/[id]/page";

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const user = await getUserFromRequest(request);
		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		if (
			!hasPermission(user.role, [
				"SUPER_ADMIN",
				"BRANCH_ADMIN",
				"REGISTRAR",
				"CASHIER",
			])
		) {
			return NextResponse.json(
				{ error: "Insufficient permissions" },
				{ status: 403 }
			);
		}

		const invoice = await prisma.invoice.findUnique({
			where: { id: params.id },
			include: {
				student: {
					include: {
						user: true,
						parents: {
							include: {
								parent: {
									include: {
										user: true,
									},
								},
							},
						},
					},
				},
				branch: true,
				items: {
					include: {
						feeType: true,
					},
				},
				payments: {
					orderBy: { createdAt: "desc" },
				},
				createdBy: {
					select: {
						firstName: true,
						lastName: true,
					},
				},
			},
		});

		if (!invoice) {
			return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
		}

		// Check branch access
		if (
			(user.role === "BRANCH_ADMIN" ||
				user.role === "REGISTRAR" ||
				user.role === "CASHIER") &&
			invoice.branchId !== user.branchId
		) {
			return NextResponse.json({ error: "Access denied" }, { status: 403 });
		}

		return NextResponse.json({ invoice });
	} catch (error) {
		console.error("Get invoice error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const user = await getUserFromRequest(request);
		const invoiceId = params.id;
		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		if (
			!hasPermission(user.role, [
				"SUPER_ADMIN",
				"BRANCH_ADMIN",
				"REGISTRAR",
				"CASHIER",
			])
		) {
			return NextResponse.json(
				{ error: "Insufficient permissions" },
				{ status: 403 }
			);
		}

		const { action, transactionReference, notes } = await request.json();

		const invoice = await prisma.invoice.findUnique({
			where: { id: invoiceId },
			include: {
				registrations: {
					select: {
						registrationNumber: true,
						status: true,
						totalAmount: true,
						paidAmount: true,
					},
				},
				student: {
					include: {
						user: true,
						grade: {
							select: {
								name: true,
							},
						},
						parents: {
							include: {
								parent: {
									include: {
										user: true,
									},
								},
							},
						},
					},
				},
				payments: true,
			},
		});

		// const invoice = await prisma.invoice.findUnique({
		// 	where: { id: params.id },
		// 	include: {
		// 		student: {
		// 			include: {
		// 				user: true,
		// 				parents: {
		// 					include: {
		// 						parent: {
		// 							include: {
		// 								user: true,
		// 							},
		// 						},
		// 					},
		// 				},
		// 			},
		// 		},
		// 		payments: true,
		// 	},
		// });

		if (!invoice) {
			return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
		}

		// Check branch access
		if (
			(user.role === "BRANCH_ADMIN" ||
				user.role === "REGISTRAR" ||
				user.role === "CASHIER") &&
			invoice.branchId !== user.branchId
		) {
			return NextResponse.json({ error: "Access denied" }, { status: 403 });
		}

		if (action === "confirm_payment") {
			if (invoice.status === "PAID") {
				return NextResponse.json(
					{ error: "Invoice already paid" },
					{ status: 400 }
				);
			}

			const pendingPayment = invoice.payments.find(
				(p) => p.status === "PENDING"
			);
			if (!pendingPayment) {
				return NextResponse.json(
					{ error: "No pending payment found" },
					{ status: 400 }
				);
			}

			const result = await prisma.$transaction(async (tx) => {
				// Update payment status
				const updatedPayment = await tx.payment.update({
					where: { id: pendingPayment.id },
					data: {
						status: "COMPLETED",
						transactionId: transactionReference,
						notes: notes || pendingPayment.notes,
					},
				});

				// Update invoice status
				const updatedInvoice = await tx.invoice.update({
					where: { id: params.id },
					data: {
						status: "PAID",
						paidAmount: invoice.totalAmount,
					},
				});

				// Update registration status if this is a registration payment
				const registration = await tx.registration.findFirst({
					where: { studentId: invoice.studentId, status: "PENDING_PAYMENT" },
				});

				if (registration) {
					await tx.registration.update({
						where: { id: registration.id },
						data: {
							status: "PAYMENT_COMPLETED",
							completedAt: new Date(),
							paidAmount: invoice.totalAmount,
						},
					});
				}

				return { updatedPayment, updatedInvoice, registration };
			});

			// Send SMS confirmation
			const parentPhone = invoice.student.parents[0]?.parent.user.phone;
			if (parentPhone) {
				try {
					await smsService.sendPaymentConfirmation(
						parentPhone,
						`${invoice.student.user.firstName} ${invoice.student.user.lastName}`,
						invoice.student.studentId,
						Number(invoice.totalAmount),
						pendingPayment.paymentMethod
					);
				} catch (error) {
					console.error("SMS sending failed:", error);
				}
			}

			return NextResponse.json({
				message: "Payment confirmed successfully",
				invoice: result.updatedInvoice,
				payment: result.updatedPayment,
			});
		}

		if (action === "resend_payment_link") {
			const pendingPayment = invoice.payments.find(
				(p) =>
					p.status === "PENDING" &&
					(p.paymentMethod === "TELEBIRR" || p.paymentMethod === "ONLINE")
			);

			if (!pendingPayment) {
				return NextResponse.json(
					{ error: "No pending online payment found" },
					{ status: 400 }
				);
			}

			const parentPhone = invoice.student.parents[0]?.parent.user.phone;
			if (!parentPhone) {
				return NextResponse.json(
					{ error: "Parent phone number not found" },
					{ status: 400 }
				);
			}

			try {
				const invoiceCount = await prisma.invoice.count();
				const newInvoiceNumber = `INV-${Date.now()}-${(invoiceCount + 1)
					.toString()
					.padStart(4, "0")}`;

				// Update invoice with new invoice number
				let updatedInvoice = await prisma.invoice.update({
					where: { id: invoice.id },
					data: { invoiceNumber: newInvoiceNumber },
					include: {
						student: {
							include: {
								user: true,
								parents: {
									include: { parent: { include: { user: true } } },
								},
							},
						},
					},
				});

				const paymentLink = `${process.env.NEXT_PUBLIC_APP_URL}/payment/${invoice.id}`;
				await smsService.resendPaymentLink(
					parentPhone,
					`${invoice.student.user.firstName} ${invoice.student.user.lastName}`,
					paymentLink,
					Number(invoice.totalAmount),
					updatedInvoice.invoiceNumber
				);

				return NextResponse.json({
					message: "Payment link resent successfully",
				});
			} catch (error) {
				console.error("SMS resend failed:", error);
				return NextResponse.json(
					{ error: "Failed to resend payment link" },
					{ status: 500 }
				);
			}
		}

		return NextResponse.json({ error: "Invalid action" }, { status: 400 });
	} catch (error) {
		console.error("Update invoice error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
