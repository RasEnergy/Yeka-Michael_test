import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, hasPermission } from "@/lib/auth";

export async function GET(request: NextRequest) {
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

		const { searchParams } = new URL(request.url);
		const page = Number.parseInt(searchParams.get("page") || "1");
		const limit = Number.parseInt(searchParams.get("limit") || "10");
		const status = searchParams.get("status");
		const branchId = searchParams.get("branchId");
		const paymentMethod = searchParams.get("paymentMethod");
		const search = searchParams.get("search");

		const skip = (page - 1) * limit;

		// Build where clause
		const where: any = {};

		// Branch filtering based on user role
		if (
			user.role === "BRANCH_ADMIN" ||
			user.role === "REGISTRAR" ||
			user.role === "CASHIER"
		) {
			where.branchId = user.branchId;
		} else if (branchId) {
			where.branchId = branchId;
		}

		if (status) {
			where.status = status;
		}

		if (search) {
			where.OR = [
				{ invoiceNumber: { contains: search, mode: "insensitive" } },
				{
					student: {
						user: { firstName: { contains: search, mode: "insensitive" } },
					},
				},
				{
					student: {
						user: { lastName: { contains: search, mode: "insensitive" } },
					},
				},
				{ student: { studentId: { contains: search, mode: "insensitive" } } },
			];
		}

		// const [invoices, total] = await Promise.all([
		// 	prisma.invoice.findMany({
		// 		where,
		// 		include: {
		// 			student: {
		// 				include: {
		// 					user: true,
		// 				},
		// 			},
		// 			branch: true,
		// 			items: {
		// 				include: {
		// 					feeType: true,
		// 				},
		// 			},
		// 			payments: {
		// 				orderBy: { createdAt: "desc" },
		// 			},
		// 			createdBy: {
		// 				select: {
		// 					firstName: true,
		// 					lastName: true,
		// 				},
		// 			},
		// 		},
		// 		orderBy: { createdAt: "desc" },
		// 		skip,
		// 		take: limit,
		// 	}),
		// 	prisma.invoice.count({ where }),
		// ]);
		const [invoices, total] = await Promise.all([
			prisma.invoice.findMany({
				where,
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
						select: {
							paymentMethod: true,
							status: true,
							transactionId: true,
							paymentDate: true,
						},
					},
					registrations: {
						select: {
							registrationNumber: true,
						},
					},
					createdBy: {
						select: {
							firstName: true,
							lastName: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
			}),
			prisma.invoice.count({ where }),
		]);

		// Transform the data to match the expected interface
		const transformedInvoices = invoices.map((invoice) => ({
			...invoice,
			registration: invoice.registrations?.[0] || null,
			// registration: invoice.Registration?.[0] || null,
			// Registration: undefined, // Remove the original field
			student: {
				...invoice.student,
				parents: invoice.student.parents.map((parent) => ({
					...parent,
					parent: {
						...parent.parent,
						user: parent.parent.user,
					},
				})),
			},
		}));

		return NextResponse.json({
			invoices: transformedInvoices,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Get invoices error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
