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
		const search = searchParams.get("search");
		const format = searchParams.get("format") || "csv";

		// Build where clause (same as in the main GET route)
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

		const students = await prisma.student.findMany({
			where,
			include: {
				user: {
					select: {
						firstName: true,
						lastName: true,
						email: true,
						phone: true,
						isActive: true,
					},
				},
				branch: {
					select: {
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
			orderBy: { createdAt: "desc" },
		});

		if (format === "csv") {
			// Generate CSV content
			const csvHeaders = [
				"Student ID",
				"First Name",
				"Last Name",
				"Email",
				"Phone",
				"Date of Birth",
				"Gender",
				"Nationality",
				"Address",
				"Emergency Contact",
				"Branch",
				"Branch Code",
				"Current Class",
				"Grade",
				"Academic Year",
				"Admission Date",
				"Status",
				"Parent Name",
				"Parent Email",
				"Parent Phone",
			];

			const csvRows = students.map((student) => {
				const currentEnrollment = student.enrollments[0];
				const primaryParent = student.parents[0]?.parent;

				return [
					student.studentId,
					student.user.firstName,
					student.user.lastName,
					student.user.email,
					student.user.phone || "",
					student.dateOfBirth
						? new Date(student.dateOfBirth).toLocaleDateString()
						: "",
					student.gender || "",
					student.nationality || "",
					student.address || "",
					student.emergencyContact || "",
					student.branch.name,
					student.branch.code,
					currentEnrollment
						? `${currentEnrollment.class.name}${
								currentEnrollment.class.section
									? ` - ${currentEnrollment.class.section}`
									: ""
						  }`
						: "",
					currentEnrollment?.class.grade.name || "",
					currentEnrollment?.academicYear.name || "",
					student.admissionDate
						? new Date(student.admissionDate).toLocaleDateString()
						: "",
					student.isActive ? "Active" : "Inactive",
					primaryParent
						? `${primaryParent.user.firstName} ${primaryParent.user.lastName}`
						: "",
					primaryParent?.user.email || "",
					primaryParent?.user.phone || "",
				];
			});

			const csvContent = [
				csvHeaders.join(","),
				...csvRows.map((row) => row.map((field) => `"${field}"`).join(",")),
			].join("\n");

			return new NextResponse(csvContent, {
				headers: {
					"Content-Type": "text/csv",
					"Content-Disposition": `attachment; filename="students-export-${
						new Date().toISOString().split("T")[0]
					}.csv"`,
				},
			});
		}

		return NextResponse.json({ students });
	} catch (error) {
		console.error("Export students error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
