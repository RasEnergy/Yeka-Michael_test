import { NextResponse } from "next/server";

// This is a mock API route - replace with your actual database queries
import { NextRequest } from "next/server";
import { getUserFromRequest, canAccessBranch } from "@/lib/auth"; // adjust path if needed
import { prisma } from "@/lib/prisma"; // adjust path if needed

export async function GET(request: NextRequest) {
	try {
		const user = await getUserFromRequest(request);
		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const branchId = searchParams.get("branchId");

		let where: any = { isActive: true };

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

		// 👇 Example: calculate stats dynamically if needed
		const totalStudents = await prisma.student.count({ where });
		const totalTeachers = await prisma.teacher.count({ where });
		const pendingInvoices = await prisma.invoice.count({
			where: { status: "PENDING", ...where },
		});
		const totalRevenue = await prisma.payment.aggregate({
			_sum: { amount: true },
			where,
		});

		// Example fixed or placeholder stats
		const stats = {
			totalStudents,
			totalTeachers,
			pendingInvoices,
			totalRevenue: totalRevenue._sum.amount || 0,
			recentEnrollments: 15, // could query for new enrollments this week
			overduePayments: 8, // could query for overdue payments
			activeClasses: 45, // could query for active classes
			monthlyGrowth: 12.5, // static or calculated
		};

		return NextResponse.json({ stats });
	} catch (error) {
		console.error("Get stats error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
