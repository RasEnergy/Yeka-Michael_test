import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, hasPermission, canAccessBranch } from "@/lib/auth";
import { validateClassCapacity, ValidationError } from "@/lib/validation";
import { smsService } from "@/lib/sms";

export async function POST(request: NextRequest) {
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

		const { registrationId, classId } = await request.json();

		if (!registrationId || !classId) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Get registration details
		const registration = await prisma.registration.findUnique({
			where: { id: registrationId },
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
			},
		});

		if (!registration) {
			return NextResponse.json(
				{ error: "Registration not found" },
				{ status: 404 }
			);
		}

		if (registration.status === "ENROLLED") {
			return NextResponse.json(
				{ error: "Student already enrolled" },
				{ status: 400 }
			);
		}

		if (registration.status !== "PAYMENT_COMPLETED") {
			return NextResponse.json(
				{ error: "Registration payment not completed" },
				{ status: 400 }
			);
		}

		// Check branch access
		if (!canAccessBranch(user, registration.branchId)) {
			return NextResponse.json(
				{ error: "Access denied to this branch" },
				{ status: 403 }
			);
		}

		// Get active academic year
		const activeAcademicYear = await prisma.academicYear.findFirst({
			where: { isActive: true },
		});

		if (!activeAcademicYear) {
			return NextResponse.json(
				{ error: "No active academic year found" },
				{ status: 400 }
			);
		}

		// Validate class capacity
		try {
			await validateClassCapacity(classId, 1);
		} catch (error) {
			if (error instanceof ValidationError) {
				return NextResponse.json({ error: error.message }, { status: 400 });
			}
			throw error;
		}

		// Get class details
		const classDetails = await prisma.class.findUnique({
			where: { id: classId },
			include: {
				grade: true,
				branch: true,
			},
		});

		if (!classDetails) {
			return NextResponse.json({ error: "Class not found" }, { status: 404 });
		}

		const result = await prisma.$transaction(async (tx) => {
			// Update student admission date
			await tx.student.update({
				where: { id: registration.studentId },
				data: {
					admissionDate: new Date(),
				},
			});

			// Create enrollment record
			const enrollment = await tx.enrollment.create({
				data: {
					studentId: registration.studentId,
					classId,
					branchId: registration.branchId,
					academicYearId: activeAcademicYear.id,
					enrollmentDate: new Date(),
					status: "ACTIVE",
				},
			});

			// Update registration status
			const updatedRegistration = await tx.registration.update({
				where: { id: registrationId },
				data: {
					status: "ENROLLED",
					enrolledAt: new Date(),
					enrolledById: user.id,
				},
			});

			return { enrollment, updatedRegistration };
		});

		// Send SMS notification to parent
		const parentPhone = registration.student.parents[0]?.parent.user.phone;
		if (parentPhone) {
			try {
				await smsService.sendEnrollmentConfirmation(
					parentPhone,
					`${registration.student.user.firstName} ${registration.student.user.lastName}`,
					registration.student.studentId,
					`${classDetails.name}${
						classDetails.section ? ` - Section ${classDetails.section}` : ""
					}`
				);
			} catch (error) {
				console.error("SMS sending failed:", error);
				// Don't fail the enrollment if SMS fails
			}
		}

		return NextResponse.json({
			message: "Student enrolled successfully",
			enrollment: result.enrollment,
			registration: result.updatedRegistration,
		});
	} catch (error) {
		console.error("Enrollment error:", error);
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
		const status = searchParams.get("status");
		const branchId = searchParams.get("branchId");
		const page = Number.parseInt(searchParams.get("page") || "1");
		const limit = Number.parseInt(searchParams.get("limit") || "10");

		const where: any = {};

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

		if (status) where.status = status;

		const [registrations, total] = await Promise.all([
			prisma.registration.findMany({
				where,
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
							parents: {
								include: {
									parent: {
										include: {
											user: {
												select: {
													firstName: true,
													lastName: true,
													phone: true,
												},
											},
										},
									},
								},
							},
						},
					},
					branch: {
						select: {
							name: true,
							code: true,
						},
					},
				},
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			prisma.registration.count({ where }),
		]);

		return NextResponse.json({
			registrations,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Get registrations error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
