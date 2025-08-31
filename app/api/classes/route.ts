import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, hasPermission, canAccessBranch } from "@/lib/auth";

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

		const { name, section, capacity, branchId, gradeId, academicYearId } =
			await request.json();

		if (!name || !branchId || !gradeId || !academicYearId) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		if (!canAccessBranch(user, branchId)) {
			return NextResponse.json(
				{ error: "Access denied to this branch" },
				{ status: 403 }
			);
		}

		// Validate capacity
		const classCapacity = capacity || 30;
		if (classCapacity < 1 || classCapacity > 100) {
			return NextResponse.json(
				{ error: "Class capacity must be between 1 and 100" },
				{ status: 400 }
			);
		}

		// Check if class already exists
		const existingClass = await prisma.class.findFirst({
			where: {
				name,
				section: section || null,
				branchId,
				academicYearId,
			},
		});

		if (existingClass) {
			return NextResponse.json(
				{ error: "Class with this name and section already exists" },
				{ status: 400 }
			);
		}

		const newClass = await prisma.class.create({
			data: {
				name,
				section,
				capacity: classCapacity,
				branchId,
				gradeId,
				academicYearId,
			},
			include: {
				branch: {
					select: {
						name: true,
						code: true,
					},
				},
				grade: true,
				academicYear: true,
				_count: {
					select: {
						enrollments: {
							where: { status: "ACTIVE" },
						},
					},
				},
			},
		});

		return NextResponse.json({
			message: "Class created successfully",
			class: newClass,
		});
	} catch (error) {
		console.error("Create class error:", error);
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
		const gradeId = searchParams.get("gradeId");
		const academicYearId = searchParams.get("academicYearId");

		const where: any = { isActive: true };

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

		if (gradeId) where.gradeId = gradeId;
		if (academicYearId) where.academicYearId = academicYearId;

		const classes = await prisma.class.findMany({
			where,
			include: {
				branch: {
					select: {
						name: true,
						code: true,
					},
				},
				grade: true,
				academicYear: true,
				_count: {
					select: {
						enrollments: {
							where: { status: "ACTIVE" },
						},
					},
				},
			},
			orderBy: [
				{ grade: { level: "asc" } },
				{ name: "asc" },
				{ section: "asc" },
			],
		});

		return NextResponse.json({ classes });
	} catch (error) {
		console.error("Get classes error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
