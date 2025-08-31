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
				"TEACHER",
			])
		) {
			return NextResponse.json(
				{ error: "Insufficient permissions" },
				{ status: 403 }
			);
		}

		const { searchParams } = new URL(request.url);
		const branchId = searchParams.get("branchId");

		// Build where clause
		const whereClause: any = {
			// isActive: true,
		};

		// If user is not SUPER_ADMIN, filter by their school
		// if (user.role !== "SUPER_ADMIN" && user.schoolId) {
		// 	whereClause.schoolId = user.schoolId;
		// }

		const grades = await prisma.grade.findMany({
			where: whereClause,
			include: {
				school: {
					select: {
						id: true,
						name: true,
					},
				},
				_count: {
					select: {
						classes: true,
						registrations: true,
					},
				},
			},
			orderBy: [{ level: "asc" }, { name: "asc" }],
		});

		// Filter grades by branch if specified
		let filteredGrades = grades;
		if (branchId) {
			// Get classes for the specific branch to determine which grades are available
			const branchClasses = await prisma.class.findMany({
				where: {
					branchId: branchId,
					isActive: true,
				},
				select: {
					gradeId: true,
				},
			});

			const availableGradeIds = [
				...new Set(branchClasses.map((c) => c.gradeId)),
			];
			filteredGrades = grades.filter((grade) =>
				availableGradeIds.includes(grade.id)
			);
		}

		return NextResponse.json({
			grades: filteredGrades.map((grade) => ({
				id: grade.id,
				name: grade.name,
				level: grade.level,
				description: grade.description,
				school: grade.school,
				classCount: grade._count.classes,
				registrationCount: grade._count.registrations,
				isActive: grade.isActive,
			})),
		});
	} catch (error) {
		console.error("Grades fetch error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const user = await getUserFromRequest(request);
		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		if (!hasPermission(user.role, ["SUPER_ADMIN", "BRANCH_ADMIN"])) {
			return NextResponse.json(
				{ error: "Insufficient permissions" },
				{ status: 403 }
			);
		}

		const { name, level, description } = await request.json();

		if (!name || !level) {
			return NextResponse.json(
				{ error: "Name and level are required" },
				{ status: 400 }
			);
		}

		if (level < 1 || level > 12) {
			return NextResponse.json(
				{ error: "Grade level must be between 1 and 12" },
				{ status: 400 }
			);
		}

		// if (!user.schoolId) {
		// 	return NextResponse.json(
		// 		{ error: "User school not found" },
		// 		{ status: 400 }
		// 	);
		// }

		// Check if grade already exists for this school and level
		const existingGrade = await prisma.grade.findFirst({
			where: {
				schoolId: user.schoolId,
				level: level,
				isActive: true,
			},
		});

		if (existingGrade) {
			return NextResponse.json(
				{ error: "Grade level already exists for this school" },
				{ status: 400 }
			);
		}

		const grade = await prisma.grade.create({
			data: {
				name,
				level,
				description,
				schoolId: user.schoolId,
				isActive: true,
			},
			include: {
				school: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});

		return NextResponse.json({
			message: "Grade created successfully",
			grade,
		});
	} catch (error) {
		console.error("Grade creation error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
