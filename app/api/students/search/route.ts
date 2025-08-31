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
			!hasPermission(user.role, ["SUPER_ADMIN", "BRANCH_ADMIN", "REGISTRAR"])
		) {
			return NextResponse.json(
				{ error: "Insufficient permissions" },
				{ status: 403 }
			);
		}

		const { searchParams } = new URL(request.url);
		const studentId = searchParams.get("studentId");

		if (!studentId) {
			return NextResponse.json(
				{ error: "Student ID is required" },
				{ status: 400 }
			);
		}

		let student = null;

		student = await prisma.student.findUnique({
			where: { studentId },
			include: {
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
						phone: true,
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
				parents: {
					include: {
						parent: {
							include: {
								user: {
									select: {
										firstName: true,
										lastName: true,
										phone: true,
										email: true,
									},
								},
							},
						},
					},
				},
				registration: true,
			},
		});

		let latestRegistration = null;

		if (student) {
			latestRegistration = await prisma.registration.findFirst({
				where: { studentId: student.id },

				orderBy: { createdAt: "desc" },
				// take: 3,
				select: {
					id: true,
					registrationNumber: true,
					status: true,
					createdAt: true,
					grade: {
						select: {
							name: true,
						},
					},
				},
			});
		}

		if (!student) {
			return NextResponse.json({ found: false, message: "Student not found" });
		}

		// Check if user has access to this student's branch
		if (
			(user.role === "BRANCH_ADMIN" || user.role === "REGISTRAR") &&
			student.branchId !== user.branchId
		) {
			return NextResponse.json({ found: false, message: "Student not found" });
		}

		// Check if student has a current year registration
		const currentYear = new Date().getFullYear();
		const currentYearRegistration = await prisma.registration.findFirst({
			where: {
				studentId: student.id,
				createdAt: {
					gte: new Date(`${currentYear}-01-01`),
					lt: new Date(`${currentYear + 1}-01-01`),
				},
			},
		});

		return NextResponse.json({
			found: true,
			student: {
				id: student.id,
				studentId: student.studentId,
				studentType: student.studentType,
				academicYear: student.admissionDate,
				user: student.user,
				branch: student.branch,
				grade: student.grade,
				parents: student.parents.map((sp) => ({
					relationship: sp.relationship,
					// isPrimary: sp.isPrimary,
					parent: {
						user: sp.parent.user,
						occupation: sp.parent.occupation,
					},
				})),
				recentRegistrations: student.registration,
				hasCurrentYearRegistration: !!currentYearRegistration,
				currentYearRegistration,
			},
		});
	} catch (error) {
		console.error("Student search error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
