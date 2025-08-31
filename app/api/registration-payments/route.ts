import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, hasPermission, canAccessBranch } from "@/lib/auth";

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
		const search = searchParams.get("search") || "";
		const status = searchParams.get("status") || "";
		const paymentOption = searchParams.get("paymentOption") || "";
		const branchId = searchParams.get("branchId") || "";

		const skip = (page - 1) * limit;

		// Build where clause
		const whereClause: any = {};

		// Filter by user's access level
		if (user.role === "BRANCH_ADMIN" || user.role === "REGISTRAR") {
			if (user.branchId) {
				whereClause.branchId = user.branchId;
			}
		} else if (user.role !== "SUPER_ADMIN" && user.schoolId) {
			whereClause.branch = {
				schoolId: user.schoolId,
			};
		}

		// Apply filters
		if (
			branchId &&
			(user.role === "SUPER_ADMIN" || canAccessBranch(user, branchId))
		) {
			whereClause.branchId = branchId;
		}

		if (status && status !== "ALL") {
			whereClause.status = status;
		}

		if (paymentOption && paymentOption !== "ALL") {
			whereClause.paymentOption = paymentOption;
		}

		if (search) {
			whereClause.OR = [
				{
					registrationNumber: {
						contains: search,
						mode: "insensitive",
					},
				},
				{
					student: {
						user: {
							OR: [
								{
									firstName: {
										contains: search,
										mode: "insensitive",
									},
								},
								{
									lastName: {
										contains: search,
										mode: "insensitive",
									},
								},
								{
									email: {
										contains: search,
										mode: "insensitive",
									},
								},
							],
						},
					},
				},
				{
					student: {
						studentId: {
							contains: search,
							mode: "insensitive",
						},
					},
				},
			];
		}

		const [registrations, total] = await Promise.all([
			prisma.registration.findMany({
				where: whereClause,
				include: {
					student: {
						include: {
							user: {
								select: {
									firstName: true,
									lastName: true,
									email: true,
									phone: true,
								},
							},
						},
					},
					branch: {
						select: {
							id: true,
							name: true,
							code: true,
						},
					},
					grade: {
						select: {
							id: true,
							name: true,
							level: true,
						},
					},
					invoices: {
						select: {
							id: true,
							invoiceNumber: true,
							status: true,
							totalAmount: true,
							paidAmount: true,
						},
						orderBy: {
							createdAt: "desc",
						},
						take: 1,
					},
					payments: {
						select: {
							id: true,
							paymentNumber: true,
							paymentMethod: true,
							status: true,
							amount: true,
							createdAt: true,
						},
						orderBy: {
							createdAt: "desc",
						},
						take: 1,
					},
				},
				orderBy: {
					createdAt: "desc",
				},
				skip,
				take: limit,
			}),
			prisma.registration.count({
				where: whereClause,
			}),
		]);

		const pages = Math.ceil(total / limit);

		return NextResponse.json({
			registrations: registrations.map((registration) => ({
				id: registration.id,
				registrationNumber: registration.registrationNumber,
				status: registration.status,
				paymentOption: registration.paymentOption,
				registrationFee: registration.registrationFee,
				additionalFee: registration.additionalFee,
				totalAmount: registration.totalAmount,
				discountAmount: registration.discountAmount,
				paidAmount: registration.paidAmount,
				paymentDueDate: registration.paymentDueDate,
				completedAt: registration.completedAt,
				createdAt: registration.createdAt,
				student: {
					id: registration.student.id,
					studentId: registration.student.studentId,
					studentType: registration.student.studentType,
					user: registration.student.user,
				},
				branch: registration.branch,
				grade: registration.grade,
				latestInvoice: registration.invoices[0] || null,
				latestPayment: registration.payments[0] || null,
			})),
			pagination: {
				page,
				limit,
				total,
				pages,
			},
		});
	} catch (error) {
		console.error("Registration payments fetch error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
