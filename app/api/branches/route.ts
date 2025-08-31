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
				"CASHIER",
			])
		) {
			return NextResponse.json(
				{ error: "Insufficient permissions" },
				{ status: 403 }
			);
		}

		// Build where clause based on user role
		const whereClause: any = {
			isActive: true,
		};

		// If user is not SUPER_ADMIN, filter by their school
		if (user.role !== "SUPER_ADMIN" && user.schoolId) {
			whereClause.schoolId = user.schoolId;
		}

		// If user is BRANCH_ADMIN or REGISTRAR, only show their branch
		if (
			(user.role === "BRANCH_ADMIN" || user.role === "REGISTRAR") &&
			user.branchId
		) {
			whereClause.id = user.branchId;
		}

		const branches = await prisma.branch.findMany({
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
						students: true,
						users: {
							where: {
								role: "TEACHER",
								isActive: true,
							},
						},
						classes: {
							where: {
								isActive: true,
							},
						},
					},
				},
			},
			orderBy: [{ name: "asc" }],
		});

		return NextResponse.json({
			branches: branches.map((branch) => ({
				id: branch.id,
				name: branch.name,
				code: branch.code,
				address: branch.address,
				phone: branch.phone,
				email: branch.email,
				school: branch.school,
				studentCount: branch._count.students,
				teacherCount: branch._count.users,
				classCount: branch._count.classes,
				isActive: branch.isActive,
			})),
		});
	} catch (error) {
		console.error("Branches fetch error:", error);
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

		if (!hasPermission(user.role, ["SUPER_ADMIN"])) {
			return NextResponse.json(
				{ error: "Insufficient permissions" },
				{ status: 403 }
			);
		}

		const { name, code, address, phone, email } = await request.json();

		if (!name || !code) {
			return NextResponse.json(
				{ error: "Name and code are required" },
				{ status: 400 }
			);
		}

		if (!user.schoolId) {
			return NextResponse.json(
				{ error: "User school not found" },
				{ status: 400 }
			);
		}

		// Check if branch code already exists for this school
		const existingBranch = await prisma.branch.findFirst({
			where: {
				schoolId: user.schoolId,
				code: code.toUpperCase(),
				isActive: true,
			},
		});

		if (existingBranch) {
			return NextResponse.json(
				{ error: "Branch code already exists for this school" },
				{ status: 400 }
			);
		}

		const branch = await prisma.branch.create({
			data: {
				name,
				code: code.toUpperCase(),
				address,
				phone,
				email,
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
			message: "Branch created successfully",
			branch,
		});
	} catch (error) {
		console.error("Branch creation error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
