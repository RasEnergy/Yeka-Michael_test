import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
	getUserFromRequest,
	hasPermission,
	canAccessBranch,
	hashPassword,
} from "@/lib/auth";
import {
	validateUniquePhone,
	validateEthiopianPhone,
	validateEmail,
	validateDateOfBirth,
	validateNationality,
	validatePlaceOfBirth,
	validateStudentType,
	findExistingParentByPhone,
	ValidationError,
} from "@/lib/validation";
import {
	uploadStudentPhoto,
	uploadParentPhoto,
	validateImageFile,
} from "@/lib/upload";

// Enhanced Student ID generation function
async function generateStudentId(branchName: string): Promise<string> {
	const prefix = "RSYM";
	const branchCode = branchName.substring(0, 2).toUpperCase();

	// Get the highest existing sequence number for this branch
	const existingStudents = await prisma.student.findMany({
		where: {
			studentId: {
				startsWith: `${prefix}${branchCode}`,
			},
		},
		select: {
			studentId: true,
		},
		orderBy: {
			studentId: "desc",
		},
	});

	let nextSequence = 1777; // Starting sequence number

	if (existingStudents.length > 0) {
		// Extract sequence numbers and find the highest
		const sequences = existingStudents
			.map((student: any) => {
				const match = student.studentId.match(
					new RegExp(`^${prefix}${branchCode}(\\d{4})$`)
				);
				return match ? Number.parseInt(match[1], 10) : 0;
			})
			.filter((seq: any) => seq > 0);

		if (sequences.length > 0) {
			nextSequence = Math.max(...sequences) + 1;
		}
	}

	// Ensure sequence stays within 4-digit range (0000-9999)
	if (nextSequence > 9999) {
		nextSequence = 1777; // Reset to starting point if we exceed 9999
	}

	const studentId = `${prefix}${branchCode}${nextSequence
		.toString()
		.padStart(4, "0")}`;

	// Double-check uniqueness
	const existingStudent = await prisma.student.findUnique({
		where: { studentId },
	});

	if (existingStudent) {
		// If somehow this ID exists, try the next one
		return generateStudentId(branchName);
	}

	return studentId;
}

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

		const formData = await request.formData();

		// Extract form data
		const studentData = {
			firstName: formData.get("firstName") as string,
			additionalFee: formData.get("additionalFee") as string,
			lastName: formData.get("lastName") as string,
			email: formData.get("email") as string,
			phone: formData.get("phone") as string,
			branchId: formData.get("branchId") as string,
			gradeId: formData.get("gradeId") as string,
			studentType: formData.get("studentType") as string,
			dateOfBirth: formData.get("dateOfBirth") as string,
			placeOfBirth: formData.get("placeOfBirth") as string,
			gender: formData.get("gender") as string,
			nationality: formData.get("nationality") as string,
			paymentDuration: formData.get("paymentDuration") as string, //
			bloodGroup: formData.get("bloodGroup") as string,
			address: formData.get("address") as string,
			emergencyContact: formData.get("emergencyContact") as string,
			existingStudentId: formData.get("existingStudentId") as string, // For regular student re-registration
		};

		// Extract pricing data from form
		const pricingData = {
			registrationFee: Number(formData.get("registrationFee") as string),
			additionalFee: Number(formData.get("additionalFee") as string),
			serviceFee: Number(formData.get("serviceFee") as string),
			totalAmount: Number(formData.get("totalAmount") as string),
		};

		const parentData = {
			parentFirstName: formData.get("parentFirstName") as string,
			parentLastName: formData.get("parentLastName") as string,
			parentEmail: formData.get("parentEmail") as string,
			parentPhone: formData.get("parentPhone") as string,
			parentOccupation: formData.get("parentOccupation") as string,
			parentWorkplace: formData.get("parentWorkplace") as string,
			parentAddress: formData.get("parentAddress") as string,
			relationship: formData.get("relationship") as string,
		};

		const studentPhoto = formData.get("studentPhoto") as File | null;
		const parentPhoto = formData.get("parentPhoto") as File | null;

		// const existingUser = await prisma.user.findUnique({
		// 	where: { email: parentData.parentEmail },
		// });
		// if (existingUser) {
		// 	throw new Error(
		// 		`User with email ${parentData.parentEmail} already exists.`
		// 	);
		// }

		// Validate required fields
		if (
			!studentData.firstName ||
			!studentData.lastName ||
			!studentData.email ||
			!studentData.branchId ||
			!studentData.gradeId ||
			!studentData.studentType ||
			!studentData.paymentDuration
		) {
			return NextResponse.json(
				{ error: "Missing required student fields" },
				{ status: 400 }
			);
		}

		// Validate pricing data
		if (
			!pricingData.registrationFee ||
			!pricingData.additionalFee ||
			!pricingData.serviceFee ||
			!pricingData.totalAmount
		) {
			return NextResponse.json(
				{ error: "Missing pricing information" },
				{ status: 400 }
			);
		}

		// Validate parent phone is required
		if (!parentData.parentPhone) {
			return NextResponse.json(
				{ error: "Parent phone number is required" },
				{ status: 400 }
			);
		}

		// Validate email format
		if (!validateEmail(studentData.email)) {
			return NextResponse.json(
				{ error: "Invalid email format" },
				{ status: 400 }
			);
		}

		if (parentData.parentEmail && !validateEmail(parentData.parentEmail)) {
			return NextResponse.json(
				{ error: "Invalid parent email format" },
				{ status: 400 }
			);
		}

		// Validate phone numbers
		if (studentData.phone && !validateEthiopianPhone(studentData.phone)) {
			return NextResponse.json(
				{ error: "Invalid phone number format" },
				{ status: 400 }
			);
		}

		if (!validateEthiopianPhone(parentData.parentPhone)) {
			return NextResponse.json(
				{ error: "Invalid parent phone number format" },
				{ status: 400 }
			);
		}

		// Validate date of birth
		if (
			studentData.dateOfBirth &&
			!validateDateOfBirth(studentData.dateOfBirth)
		) {
			return NextResponse.json(
				{
					error:
						"Invalid date of birth. Student must be between 3-25 years old",
				},
				{ status: 400 }
			);
		}

		// Validate place of birth
		if (
			studentData.placeOfBirth &&
			!validatePlaceOfBirth(studentData.placeOfBirth)
		) {
			return NextResponse.json(
				{ error: "Invalid place of birth format" },
				{ status: 400 }
			);
		}

		// Validate nationality
		if (
			studentData.nationality &&
			!validateNationality(studentData.nationality)
		) {
			return NextResponse.json(
				{ error: "Invalid nationality" },
				{ status: 400 }
			);
		}

		// Validate gender
		if (
			studentData.gender &&
			!["MALE", "FEMALE"].includes(studentData.gender)
		) {
			return NextResponse.json({ error: "Invalid gender" }, { status: 400 });
		}

		// Validate student type
		if (!validateStudentType(studentData.studentType)) {
			return NextResponse.json(
				{ error: "Invalid student type" },
				{ status: 400 }
			);
		}

		// // Validate additionalFee
		// const additionalFeeAmount = Number(studentData.additionalFee);
		// if (
		// 	!additionalFeeAmount ||
		// 	(additionalFeeAmount !== 8000 && additionalFeeAmount !== 50000)
		// ) {
		// 	return NextResponse.json(
		// 		{ error: "Invalid additional fee amount. Must be 8000 or 50000" },
		// 		{ status: 400 }
		// 	);
		// }

		// Validate photo files
		if (studentPhoto && studentPhoto.size > 0) {
			const validation = validateImageFile(studentPhoto);
			if (!validation.isValid) {
				return NextResponse.json(
					{ error: `Student photo: ${validation.error}` },
					{ status: 400 }
				);
			}
		}

		if (parentPhoto && parentPhoto.size > 0) {
			const validation = validateImageFile(parentPhoto);
			if (!validation.isValid) {
				return NextResponse.json(
					{ error: `Parent photo: ${validation.error}` },
					{ status: 400 }
				);
			}
		}

		console.log({
			user,
			studentDataBranch: studentData.branchId,
			studentData,
		});

		// Check branch access
		if (!canAccessBranch(user, studentData.branchId)) {
			return NextResponse.json(
				{ error: "Access denied to this branch" },
				{ status: 403 }
			);
		}

		// Get branch info
		const branch = await prisma.branch.findUnique({
			where: { id: studentData.branchId },
			include: { school: true },
		});

		if (!branch) {
			return NextResponse.json({ error: "Branch not found" }, { status: 404 });
		}

		// Get grade info
		const grade = await prisma.grade.findUnique({
			where: { id: studentData.gradeId },
		});

		if (!grade) {
			return NextResponse.json({ error: "Grade not found" }, { status: 404 });
		}

		// Verify pricing schema exists for this branch and grade
		const pricingSchema = await prisma.pricingSchema.findUnique({
			where: {
				branchId_gradeId: {
					branchId: studentData.branchId,
					gradeId: studentData.gradeId,
				},
				isActive: true,
			},
		});

		if (!pricingSchema) {
			return NextResponse.json(
				{ error: "Pricing schema not found for this branch and grade" },
				{ status: 404 }
			);
		}

		// Handle Regular Student Re-registration Flow
		let existingStudent = null;
		if (
			studentData.existingStudentId &&
			studentData.studentType === "REGULAR_STUDENT"
		) {
			existingStudent = await prisma.student.findUnique({
				where: { studentId: studentData.existingStudentId },
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
					registration: true,
				},
			});

			// If you need the latest registration, fetch it separately:
			let latestRegistration = null;
			if (existingStudent) {
				latestRegistration = await prisma.registration.findFirst({
					where: { studentId: existingStudent.id },
					orderBy: { createdAt: "desc" },
				});
			}

			if (!existingStudent) {
				return NextResponse.json(
					{ error: "Student ID not found" },
					{ status: 404 }
				);
			}

			// Check if student already has a pending or completed registration for current academic year
			const currentYear = new Date().getFullYear();
			const existingRegistration = await prisma.registration.findFirst({
				where: {
					studentId: existingStudent.id,
					createdAt: {
						gte: new Date(`${currentYear}-01-01`),
						lt: new Date(`${currentYear + 1}-01-01`),
					},
				},
			});

			if (existingRegistration) {
				return NextResponse.json(
					{
						error: "Student already has a registration for this academic year",
					},
					{ status: 400 }
				);
			}
		}

		// For new students, validate unique email and phone
		if (!existingStudent) {
			// Check if student email already exists
			const existingStudentUser = await prisma.user.findUnique({
				where: { email: studentData.email },
			});

			if (existingStudentUser) {
				return NextResponse.json(
					{ error: "Student email already exists" },
					{ status: 400 }
				);
			}

			// Validate unique student phone (if provided)
			try {
				if (studentData.phone) await validateUniquePhone(studentData.phone);
			} catch (error) {
				if (error instanceof ValidationError) {
					return NextResponse.json({ error: error.message }, { status: 400 });
				}
				throw error;
			}
		}

		console.log({
			existingStudent,
		});

		// const studentId = await generateStudentId(branch.name);
		const studentId = await generateStudentId(branch.name);
		const defaultPassword = await hashPassword("student123");

		let studentPhotoUrl = null;
		if (studentPhoto && studentPhoto.size > 0) {
			try {
				studentPhotoUrl = await uploadStudentPhoto(studentPhoto, studentId);
			} catch (err) {
				console.error("Student photo upload failed", err);
			}
		}

		// let parentPhotoUrl = null;
		// if (parentPhoto && parentPhoto.size > 0) {
		// 	try {
		// 		// Temporarily set userId to a placeholder (you'll assign after parentUser is created)
		// 		parentPhotoUrl = await uploadParentPhoto(parentPhoto, "temp");
		// 	} catch (err) {
		// 		console.error("Parent photo upload failed", err);
		// 	}
		// }

		const result = await prisma.$transaction(
			async (tx: any) => {
				let student: any = existingStudent;
				let studentUser = existingStudent?.user;

				// Create new student only if not existing (new student flow)
				if (!existingStudent) {
					console.log("Not Exist Student");

					console.log("Generated Student ID:", studentId);

					// Create student user
					studentUser = await tx.user.create({
						data: {
							email: studentData.email,
							password: defaultPassword,
							firstName: studentData.firstName,
							lastName: studentData.lastName,
							phone: studentData.phone,
							role: "STUDENT",
							schoolId: branch.schoolId,
							branchId: studentData.branchId,
						},
					});

					// Handle student photo upload
					// let studentPhotoUrl = null;
					// if (studentPhoto && studentPhoto.size > 0) {
					// 	try {
					// 		studentPhotoUrl = await uploadStudentPhoto(studentPhoto, studentId);
					// 	} catch (error) {
					// 		console.error("Student photo upload error:", error);
					// 		// Continue without photo if upload fails
					// 	}
					// }

					student = await tx.student.create({
						data: {
							userId: studentUser.id,
							studentId,
							branchId: studentData.branchId,
							gradeId: studentData.gradeId,
							studentType: studentData.studentType as
								| "REGULAR_STUDENT"
								| "NEW_STUDENT",
							dateOfBirth: studentData.dateOfBirth
								? new Date(studentData.dateOfBirth)
								: null,
							placeOfBirth: studentData.placeOfBirth,
							gender: studentData.gender as "MALE" | "FEMALE" | null,
							nationality: studentData.nationality,
							bloodGroup: studentData.bloodGroup,
							address: studentData.address,
							emergencyContact: studentData.emergencyContact,
							photo: studentPhotoUrl,
							admissionDate: new Date(),
							// admissionDate: new Date().getFullYear().toString(),
						},
						include: {
							user: true,
							registration: true, // If student has any registration linked
							parents: true,
						},
					});
				} else {
					console.log("Exist student");
					// Update existing student's grade for re-registration
					student = await tx.student.update({
						where: { id: existingStudent.id },
						data: {
							gradeId: studentData.gradeId,
							admissionDate: new Date(),
							branchId: studentData.branchId,
							studentType: "REGULAR_STUDENT",
							dateOfBirth: studentData.dateOfBirth
								? new Date(studentData.dateOfBirth)
								: null,
							placeOfBirth: studentData.placeOfBirth,
							gender: studentData.gender as "MALE" | "FEMALE" | null,
							nationality: studentData.nationality,
							bloodGroup: studentData.bloodGroup,
							address: studentData.address,
							emergencyContact: studentData.emergencyContact,
							photo: studentPhotoUrl,
						},
						include: {
							user: true,
							registration: true,
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
				}

				// Generate registration number
				const registrationCount = await tx.registration.count({
					where: { branchId: studentData.branchId },
				});
				const registrationNumber = `REG-${
					branch.code
				}-${new Date().getFullYear()}-${String(registrationCount + 1).padStart(
					4,
					"0"
				)}`;

				// Create registration record with payment due date (7 days from now)
				const paymentDueDate = new Date();
				paymentDueDate.setDate(paymentDueDate.getDate() + 7);

				if (!student || !student.id) {
					throw new Error("Student ID is missing when creating registration.");
				}
				const registration = await tx.registration.create({
					data: {
						studentId: student.id,
						branchId: studentData.branchId,
						gradeId: studentData.gradeId,
						registrationNumber,
						status: "PENDING_PAYMENT",
						registrationFee: pricingData.registrationFee,
						additionalFee: pricingData.additionalFee,
						serviceFee: pricingData.serviceFee,
						totalAmount: pricingData.totalAmount,
						paymentDuration: studentData.paymentDuration as any,
						paymentDueDate,
					},
				});

				// Handle parent creation/linking (same logic as before)
				let parent = null;
				if (parentData.parentPhone) {
					// Check if parent already exists by phone number
					const existingParent = await findExistingParentByPhone(
						parentData.parentPhone
					);

					if (existingParent) {
						// Use existing parent
						parent = existingParent.parent;

						// Update parent info if new data is provided
						if (
							parentData.parentFirstName ||
							parentData.parentLastName ||
							parentData.parentOccupation
						) {
							const updateData: any = {};
							const userUpdateData: any = {};

							if (parentData.parentFirstName)
								userUpdateData.firstName = parentData.parentFirstName;
							if (parentData.parentLastName)
								userUpdateData.lastName = parentData.parentLastName;
							if (parentData.parentOccupation)
								updateData.occupation = parentData.parentOccupation;
							if (parentData.parentWorkplace)
								updateData.workplace = parentData.parentWorkplace;
							if (parentData.parentAddress)
								updateData.address = parentData.parentAddress;

							// Handle parent photo upload for existing parent
							if (parentPhoto && parentPhoto.size > 0) {
								try {
									const parentPhotoUrl = await uploadParentPhoto(
										parentPhoto,
										parent.id
									);
									updateData.photoUrl = parentPhotoUrl;
								} catch (error) {
									console.error("Parent photo upload error:", error);
								}
							}

							if (Object.keys(userUpdateData).length > 0) {
								await tx.user.update({
									where: { id: existingParent.user.id },
									data: userUpdateData,
								});
							}

							if (Object.keys(updateData).length > 0) {
								parent = await tx.parent.update({
									where: { id: parent.id },
									data: updateData,
								});
							}
						}
					} else if (parentData.parentFirstName && parentData.parentLastName) {
						// Create new parent
						const parentPassword = await hashPassword("parent123");
						const parentUser = await tx.user.create({
							data: {
								email:
									parentData.parentEmail ||
									`${parentData.parentPhone}@temp.com`,
								password: parentPassword,
								firstName: parentData.parentFirstName,
								lastName: parentData.parentLastName,
								phone: parentData.parentPhone,
								role: "PARENT",
								schoolId: branch.schoolId,
								branchId: studentData.branchId,
							},
						});

						// Handle parent photo upload
						let parentPhotoUrl = null;
						if (parentPhoto && parentPhoto.size > 0) {
							try {
								parentPhotoUrl = await uploadParentPhoto(
									parentPhoto,
									parentUser.id
								);
							} catch (error) {
								console.error("Parent photo upload error:", error);
							}
						}

						parent = await tx.parent.create({
							data: {
								userId: parentUser.id,
								occupation: parentData.parentOccupation,
								address: parentData.parentAddress,
								photo: parentPhotoUrl,
							},
						});
					}

					// Link student to parent (check if relationship already exists)
					if (parent) {
						const existingRelationship = await tx.studentParent.findUnique({
							where: {
								studentId_parentId: {
									studentId: student.id,
									parentId: parent.id,
								},
							},
						});

						if (!existingRelationship) {
							await tx.studentParent.create({
								data: {
									studentId: student.id,
									parentId: parent.id,
									relationship:
										(parentData.relationship?.toUpperCase() as any) || "OTHER",
								},
							});
						}
					}
				}

				return { student, studentUser, parent, registration };
			},
			{ timeout: 15000 }
		);

		const message = existingStudent
			? "Regular student re-registered successfully. Payment required to complete registration."
			: "New student registered successfully. Payment required to complete registration.";

		return NextResponse.json({
			message,
			isExistingStudent: !!existingStudent,
			student: {
				id: result.student.id,
				studentId: result.student.studentId,
				studentType: result.student.studentType,
				user: result.studentUser
					? {
							id: result.studentUser.id,
							firstName: result.studentUser.firstName,
							lastName: result.studentUser.lastName,
							email: result.studentUser.email,
					  }
					: null,
			},
			registration: {
				id: result.registration.id,
				registrationNumber: result.registration.registrationNumber,
				status: result.registration.status,
				totalAmount: result.registration.totalAmount,
				paymentDueDate: result.registration.paymentDueDate,
			},
			redirectTo: `/registration/payment/${result.registration.id}`,
		});
	} catch (error) {
		console.error("Student registration error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
