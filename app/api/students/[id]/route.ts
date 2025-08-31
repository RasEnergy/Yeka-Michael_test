import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, canAccessBranch } from "@/lib/auth";

export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const user = await getUserFromRequest(request);
		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = params;
		const body = await request.json();

		// First, get the existing student to check permissions
		const existingStudent = await prisma.student.findUnique({
			where: { id },
			include: {
				user: true,
				branch: true,
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
		});

		if (!existingStudent) {
			return NextResponse.json({ error: "Student not found" }, { status: 404 });
		}

		// Check if user can access this student's branch
		if (
			user.role !== "SUPER_ADMIN" &&
			!canAccessBranch(user, existingStudent.branchId)
		) {
			return NextResponse.json({ error: "Access denied" }, { status: 403 });
		}

		// Prepare update data
		const {
			firstName,
			lastName,
			phone,
			dateOfBirth,
			gender,
			nationality,
			address,
			emergencyContact,
			gradeId,
			parents,
		} = body;

		// Update student, user, and parent data in a transaction
		const updatedStudent = await prisma.$transaction(async (tx) => {
			// Update user information (email is not updatable)
			await tx.user.update({
				where: { id: existingStudent.userId },
				data: {
					firstName,
					lastName,
					phone: phone || null,
				},
			});

			// Update student information
			const updatedStudent = await tx.student.update({
				where: { id },
				data: {
					dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
					gender: gender || null,
					nationality: nationality || null,
					address: address || null,
					emergencyContact: emergencyContact || null,
					gradeId: gradeId || null,
				},
			});

			// Handle parent updates
			if (parents && Array.isArray(parents)) {
				// Get existing parent relationships
				const existingParentRels = await tx.studentParent.findMany({
					where: { studentId: id },
					include: {
						parent: {
							include: {
								user: true,
							},
						},
					},
				});

				// Process each parent in the request
				for (const parentData of parents) {
					if (parentData.id && parentData.parentId) {
						// Update existing parent
						const existingRel = existingParentRels.find(
							(rel) => rel.id === parentData.id
						);
						if (existingRel) {
							// Update parent user information (email is not updatable)
							await tx.user.update({
								where: { id: existingRel.parent.userId },
								data: {
									firstName: parentData.firstName,
									lastName: parentData.lastName,
									phone: parentData.phone || null,
								},
							});

							// Update parent information
							await tx.parent.update({
								where: { id: existingRel.parent.id },
								data: {
									occupation: parentData.occupation || null,
									workplace: parentData.workplace || null,
									address: parentData.address || null,
								},
							});

							// Update relationship
							await tx.studentParent.update({
								where: { id: parentData.id },
								data: {
									relationship: parentData.relationship,
								},
							});
						}
					} else if (
						!parentData.id &&
						parentData.firstName &&
						parentData.lastName
					) {
						// Create new parent
						const newParentUser = await tx.user.create({
							data: {
								firstName: parentData.firstName,
								lastName: parentData.lastName,
								email:
									parentData.email ||
									`${parentData.firstName.toLowerCase()}.${parentData.lastName.toLowerCase()}@temp.com`,
								password: "temp_password", // This should be handled properly in production
								phone: parentData.phone || null,
								role: "PARENT",
								schoolId: existingStudent.user.schoolId,
								branchId: existingStudent.branchId,
							},
						});

						const newParent = await tx.parent.create({
							data: {
								userId: newParentUser.id,
								occupation: parentData.occupation || null,
								workplace: parentData.workplace || null,
								address: parentData.address || null,
							},
						});

						await tx.studentParent.create({
							data: {
								studentId: id,
								parentId: newParent.id,
								relationship: parentData.relationship,
							},
						});
					}
				}
			}

			// Return updated student with all relations
			return await tx.student.findUnique({
				where: { id },
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
											id: true,
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
					grade: true,
				},
			});
		});

		return NextResponse.json({
			message: "Student updated successfully",
			student: updatedStudent,
		});
	} catch (error: any) {
		console.error("Update student error:", error);

		// Handle unique constraint violations
		if (error.code === "P2002") {
			const target = error.meta?.target;
			if (target?.includes("email")) {
				return NextResponse.json(
					{ error: "Email address is already in use" },
					{ status: 400 }
				);
			}
			if (target?.includes("phone")) {
				return NextResponse.json(
					{ error: "Phone number is already in use" },
					{ status: 400 }
				);
			}
		}

		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const user = await getUserFromRequest(request);
		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = params;

		const student = await prisma.student.findUnique({
			where: { id },
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
				grade: true,
			},
		});

		if (!student) {
			return NextResponse.json({ error: "Student not found" }, { status: 404 });
		}

		// Check if user can access this student's branch
		if (
			user.role !== "SUPER_ADMIN" &&
			!canAccessBranch(user, student.branchId)
		) {
			return NextResponse.json({ error: "Access denied" }, { status: 403 });
		}

		return NextResponse.json({ student });
	} catch (error) {
		console.error("Get student error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
