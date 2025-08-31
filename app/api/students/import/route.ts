import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, canAccessBranch } from "@/lib/auth";
import { parse } from "csv-parse/sync";

export async function POST(request: NextRequest) {
	try {
		const user = await getUserFromRequest(request);
		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const formData = await request.formData();
		const file = formData.get("file") as File;
		const branchId = formData.get("branchId") as string;

		console.log({
			file,
			branchId,
			user,
		});

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}
		if (!branchId) {
			return NextResponse.json(
				{ error: "Branch ID is required" },
				{ status: 400 }
			);
		}

		const branch = await prisma.branch.findUnique({
			where: { id: branchId },
		});

		if (!branch) {
			return NextResponse.json({ error: "Branch not found" }, { status: 404 });
		}

		const fileContent = await file.text();
		console.log({
			fileContent,
		});
		const records = parse(fileContent, {
			columns: true,
			skip_empty_lines: true,
			trim: true,
		});

		const results = {
			success: 0,
			failed: 0,
			errors: [] as string[],
		};

		for (let i = 0; i < records.length; i++) {
			const record = records[i];
			try {
				if (
					!record.firstName ||
					!record.lastName ||
					!record.studentId ||
					!record.parentPhone
				) {
					results.failed++;
					results.errors.push(
						`Row ${
							i + 2
						}: Missing required student fields (firstName, lastName, email)`
					);
					continue;
				}

				// const existingUser = await prisma.user.findUnique({
				// 	where: { email: record.email },
				// });
				// if (existingUser) {
				// 	results.failed++;
				// 	results.errors.push(
				// 		`Row ${i + 2}: User with email ${record.email} already exists`
				// 	);
				// 	continue;
				// }

				const existingStudent = await prisma.student.findUnique({
					where: { studentId: record.studentId },
				});
				if (existingStudent) {
					results.failed++;
					results.errors.push(
						`Row ${i + 2}: Student with student ${
							record.studentId
						} already exists`
					);
					continue;
				}

				// const studentCount = await prisma.student.count({
				// 	where: { branchId },
				// });

				await prisma.$transaction(async (tx) => {
					const studentId = record.studentId;

					console.log({
						studentId,
					});

					const last3 = studentId.slice(-3);

					const studentEmail =
						record.email?.trim() ||
						`${record.firstName.toLowerCase()}${last3}@yekamichael.com`;
					// ✅ 1) Create Student User
					const newStudentUser = await tx.user.create({
						data: {
							firstName: record.firstName,
							lastName: record.lastName,
							email: studentEmail,
							password: "Test@123",
							phone: null,
							role: "STUDENT",
							isActive: true,
							schoolId: branch.schoolId,
							branchId: branchId,
						},
					});

					// ✅ 2) Create Student profile
					const newStudent = await tx.student.create({
						data: {
							userId: newStudentUser.id,
							studentId,
							branchId,
							dateOfBirth: record.dateOfBirth
								? new Date(record.dateOfBirth)
								: null,
							gender: record.gender || null,
							nationality: record.nationality || null,
							address: record.address || null,
							emergencyContact: record.emergencyContact || null,
							admissionDate: record.admissionDate
								? new Date(record.admissionDate)
								: new Date(),
							isActive: true,
						},
					});

					// ✅ 3) Handle Parent logic
					if (record.parentPhone) {
						let parentUser = await tx.user.findUnique({
							where: { phone: record.parentPhone },
						});

						let parentProfile;

						if (!parentUser) {
							const parentEmail =
								record.parentEmail?.trim() ||
								`${record.lastName.toLowerCase()}${last3}@yekamichael.com`;
							// Create Parent User + Parent Profile
							parentUser = await tx.user.create({
								data: {
									firstName: `Parent${Math.floor(Math.random() * 10000)}`,
									lastName: `Auto`,
									email: parentEmail,
									password: record.parentPassword || "Test@123",
									phone: record.parentPhone,
									role: "PARENT",
									isActive: true,
									schoolId: branch.schoolId,
								},
							});

							parentProfile = await tx.parent.create({
								data: {
									userId: parentUser.id,
									// occupation, workplace, etc could be handled here
								},
							});
						} else {
							// Parent user exists → does it have Parent profile?
							parentProfile = await tx.parent.findUnique({
								where: { userId: parentUser.id },
							});

							if (!parentProfile) {
								parentProfile = await tx.parent.create({
									data: {
										userId: parentUser.id,
									},
								});
							}
						}

						// ✅ 4) Create StudentParent link
						await tx.studentParent.upsert({
							where: {
								studentId_parentId: {
									studentId: newStudent.id,
									parentId: parentProfile.id,
								},
							},
							update: {},
							create: {
								studentId: newStudent.id,
								parentId: parentProfile.id,
								relationship: "guardian", // Or set from CSV if you have it
							},
						});
					}
				});

				results.success++;
			} catch (error) {
				console.error(error);
				results.failed++;
				results.errors.push(
					`Row ${i + 2}: ${
						error instanceof Error ? error.message : "Unknown error"
					}`
				);
			}
		}

		return NextResponse.json({
			message: `Import completed. ${results.success} students imported successfully, ${results.failed} failed.`,
			results,
		});
	} catch (error) {
		console.error("Import students error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// export async function POST(request: NextRequest) {
// 	try {
// 		const user = await getUserFromRequest(request);
// 		if (!user) {
// 			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
// 		}

// 		const formData = await request.formData();
// 		const file = formData.get("file") as File;
// 		const branchId = formData.get("branchId") as string;

// 		if (!file) {
// 			return NextResponse.json({ error: "No file provided" }, { status: 400 });
// 		}

// 		if (!branchId) {
// 			return NextResponse.json(
// 				{ error: "Branch ID is required" },
// 				{ status: 400 }
// 			);
// 		}

// 		// Check branch access
// 		// if (user.role !== "SUPER_ADMIN" && !canAccessBranch(user, branchId)) {
// 		// 	return NextResponse.json(
// 		// 		{ error: "Access denied to this branch" },
// 		// 		{ status: 403 }
// 		// 	);
// 		// }

// 		// Verify branch exists
// 		const branch = await prisma.branch.findUnique({
// 			where: { id: branchId },
// 		});

// 		if (!branch) {
// 			return NextResponse.json({ error: "Branch not found" }, { status: 404 });
// 		}

// 		const fileContent = await file.text();

// 		// Parse CSV
// 		const records = parse(fileContent, {
// 			columns: true,
// 			skip_empty_lines: true,
// 			trim: true,
// 		});

// 		const results = {
// 			success: 0,
// 			failed: 0,
// 			errors: [] as string[],
// 		};

// 		// Process each record
// 		for (let i = 0; i < records.length; i++) {
// 			const record = records[i];

// 			try {
// 				// Validate required fields
// 				if (!record.firstName || !record.lastName || !record.email) {
// 					results.failed++;
// 					results.errors.push(
// 						`Row ${i + 2}: Missing required fields (firstName, lastName, email)`
// 					);
// 					continue;
// 				}

// 				// Check if user already exists
// 				const existingUser = await prisma.user.findUnique({
// 					where: { email: record.email },
// 				});

// 				if (existingUser) {
// 					results.failed++;
// 					results.errors.push(
// 						`Row ${i + 2}: User with email ${record.email} already exists`
// 					);
// 					continue;
// 				}

// 				// Generate student ID
// 				const studentCount = await prisma.student.count({
// 					where: { branchId },
// 				});
// 				const studentId = `${branch.code}${String(studentCount + 1).padStart(
// 					4,
// 					"0"
// 				)}`;

// 				// Create user and student in transaction
// 				await prisma.$transaction(async (tx) => {
// 					const newUser = await tx.user.create({
// 						data: {
// 							firstName: record.firstName,
// 							lastName: record.lastName,
// 							email: record.email,
// 							phone: record.phone || null,
// 							role: "STUDENT",
// 							isActive: true,
// 						} as any,
// 					});

// 					await tx.student.create({
// 						data: {
// 							userId: newUser.id,
// 							studentId,
// 							branchId,
// 							dateOfBirth: record.dateOfBirth
// 								? new Date(record.dateOfBirth)
// 								: null,
// 							gender: record.gender || null,
// 							nationality: record.nationality || null,
// 							address: record.address || null,
// 							emergencyContact: record.emergencyContact || null,
// 							admissionDate: record.admissionDate
// 								? new Date(record.admissionDate)
// 								: new Date(),
// 							isActive: true,
// 						},
// 					});
// 				});

// 				results.success++;
// 			} catch (error) {
// 				results.failed++;
// 				results.errors.push(
// 					`Row ${i + 2}: ${
// 						error instanceof Error ? error.message : "Unknown error"
// 					}`
// 				);
// 			}
// 		}

// 		return NextResponse.json({
// 			message: `Import completed. ${results.success} students imported successfully, ${results.failed} failed.`,
// 			results,
// 		});
// 	} catch (error) {
// 		console.error("Import students error:", error);
// 		return NextResponse.json(
// 			{ error: "Internal server error" },
// 			{ status: 500 }
// 		);
// 	}
// }
