import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, hasPermission } from "@/lib/auth";
import * as XLSX from "xlsx";

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
		const status = searchParams.get("status");
		const branchId = searchParams.get("branchId");
		const paymentMethod = searchParams.get("paymentMethod");
		const search = searchParams.get("search");

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

		if (status && status !== "ALL") {
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

		const invoices = await prisma.invoice.findMany({
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
		});

		// Transform data for Excel export
		const excelData = invoices.map((invoice) => {
			const primaryParent = invoice.student.parents?.[0];
			const allParents =
				invoice.student.parents
					?.map(
						(p) =>
							`${p.parent.user.firstName} ${p.parent.user.lastName} (${
								p.parent.user.phone || "No phone"
							})`
					)
					.join("; ") || "No parent info";

			return {
				"Invoice ID": invoice.invoiceNumber,
				"Transaction No":
					invoice.payments?.[0]?.transactionId || "No transaction",
				"Receipt No": invoice.registrations?.[0]?.registrationNumber || "N/A",
				"Student Name": `${invoice.student.user.firstName} ${invoice.student.user.lastName}`,
				"Student ID": invoice.student.studentId,
				"Parent Name": primaryParent
					? `${primaryParent.parent.user.firstName} ${primaryParent.parent.user.lastName}`
					: "No parent",
				"Parent Phone": primaryParent?.parent.user.phone || "No phone",
				"All Parents": allParents,
				"Branch": invoice.branch.name,
				"Total Amount (ETB)": Number(invoice.totalAmount),
				"Paid Amount (ETB)": Number(invoice.paidAmount),
				"Balance (ETB)":
					Number(invoice.totalAmount) - Number(invoice.paidAmount),
				"Status": invoice.status,
				"Payment Method": invoice.payments?.[0]?.paymentMethod || "No payment",
				"Payment Date": invoice.payments?.[0]?.paymentDate
					? new Date(invoice.payments[0].paymentDate).toLocaleDateString(
							"en-US",
							{
								month: "short",
								day: "numeric",
								year: "numeric",
							}
					  )
					: "No payment date",
				"Due Date": new Date(invoice.dueDate).toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
					year: "numeric",
				}),
				"Created By": `${invoice.createdBy.firstName} ${invoice.createdBy.lastName}`,
				"Created Date": new Date(invoice.createdAt).toLocaleDateString(
					"en-US",
					{
						month: "short",
						day: "numeric",
						year: "numeric",
					}
				),
				"Invoice Items": invoice.items
					.map(
						(item) =>
							`${item.feeType.name}: ETB ${Number(item.amount)} (Qty: ${
								item.quantity
							})`
					)
					.join("; "),
			};
		});

		// Create workbook and worksheet
		const workbook = XLSX.utils.book_new();
		const worksheet = XLSX.utils.json_to_sheet(excelData);

		// Set column widths
		const columnWidths = [
			{ wch: 15 }, // Invoice ID
			{ wch: 15 }, // Transaction No
			{ wch: 15 }, // Receipt No
			{ wch: 20 }, // Student Name
			{ wch: 12 }, // Student ID
			{ wch: 20 }, // Parent Name
			{ wch: 15 }, // Parent Phone
			{ wch: 40 }, // All Parents
			{ wch: 15 }, // Branch
			{ wch: 12 }, // Total Amount
			{ wch: 12 }, // Paid Amount
			{ wch: 12 }, // Balance
			{ wch: 15 }, // Status
			{ wch: 15 }, // Payment Method
			{ wch: 15 }, // Payment Date
			{ wch: 15 }, // Due Date
			{ wch: 20 }, // Created By
			{ wch: 15 }, // Created Date
			{ wch: 50 }, // Invoice Items
		];
		worksheet["!cols"] = columnWidths;

		// Add worksheet to workbook
		XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");

		// Generate Excel file buffer
		const excelBuffer = XLSX.write(workbook, {
			bookType: "xlsx",
			type: "buffer",
		});

		// Set response headers
		const headers = new Headers();
		headers.set(
			"Content-Type",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
		);
		headers.set(
			"Content-Disposition",
			`attachment; filename="invoices-export-${
				new Date().toISOString().split("T")[0]
			}.xlsx"`
		);

		return new NextResponse(excelBuffer, {
			status: 200,
			headers,
		});
	} catch (error) {
		console.error("Export invoices error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
