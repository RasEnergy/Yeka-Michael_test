import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, canAccessBranch } from "@/lib/auth";

export async function GET(request: NextRequest) {
	try {
		const user = await getUserFromRequest(request);
		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const branchId = searchParams.get("branchId");
		const classId = searchParams.get("classId");
		const page = Number.parseInt(searchParams.get("page") || "1");
		const limit = Number.parseInt(searchParams.get("limit") || "10");
		const search = searchParams.get("search");

		// Build where clause
		const where: any = {
			isActive: true,
		};

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

		// Class filtering
		if (classId) {
			where.enrollments = {
				some: {
					classId,
					status: "ACTIVE",
				},
			};
		}

		// Search filtering
		if (search) {
			where.OR = [
				{ studentId: { contains: search, mode: "insensitive" } },
				{ user: { firstName: { contains: search, mode: "insensitive" } } },
				{ user: { lastName: { contains: search, mode: "insensitive" } } },
				{ user: { email: { contains: search, mode: "insensitive" } } },
			];
		}

		const [students, total] = await Promise.all([
			prisma.student.findMany({
				where,
				include: {
					user: {
						select: {
							id: true,
							firstName: true,
							lastName: true,
							email: true,
							phone: true,
							isActive: true,
						},
					},
					branch: {
						select: {
							id: true,
							name: true,
							code: true,
						},
					},
					enrollments: {
						where: { status: "ACTIVE" },
						include: {
							class: {
								include: {
									grade: true,
								},
							},
							academicYear: true,
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
											email: true,
											phone: true,
										},
									},
								},
							},
						},
					},
				},
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			prisma.student.count({ where }),
		]);

		return NextResponse.json({
			students,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Get students error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
