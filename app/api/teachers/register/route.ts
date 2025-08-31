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
	ValidationError,
} from "@/lib/validation";

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

		const data = await request.json();
		const {
			firstName,
			lastName,
			email,
			phone,
			branchId,
			qualification,
			experience,
			salary,
			joinDate,
			subjectIds = [],
		} = data;

		// Validate required fields
		if (!firstName || !lastName || !email || !branchId || !joinDate) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Validate email format
		if (!validateEmail(email)) {
			return NextResponse.json(
				{ error: "Invalid email format" },
				{ status: 400 }
			);
		}

		// Validate phone number if provided
		if (phone && !validateEthiopianPhone(phone)) {
			return NextResponse.json(
				{ error: "Invalid phone number format" },
				{ status: 400 }
			);
		}

		// Validate unique phone and email
		try {
			if (phone) await validateUniquePhone(phone);
		} catch (error) {
			if (error instanceof ValidationError) {
				return NextResponse.json({ error: error.message }, { status: 400 });
			}
			throw error;
		}

		// Check branch access
		if (!canAccessBranch(user, branchId)) {
			return NextResponse.json(
				{ error: "Access denied to this branch" },
				{ status: 403 }
			);
		}

		// Check if email already exists
		const existingUser = await prisma.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			return NextResponse.json(
				{ error: "Email already exists" },
				{ status: 400 }
			);
		}

		// Validate salary if provided
		if (
			salary &&
			(Number.parseFloat(salary) < 0 || Number.parseFloat(salary) > 1000000)
		) {
			return NextResponse.json(
				{ error: "Invalid salary amount" },
				{ status: 400 }
			);
		}

		// Validate experience if provided
		if (
			experience &&
			(Number.parseInt(experience) < 0 || Number.parseInt(experience) > 50)
		) {
			return NextResponse.json(
				{ error: "Invalid experience years" },
				{ status: 400 }
			);
		}

		// Get branch info
		const branch = await prisma.branch.findUnique({
			where: { id: branchId },
			include: { school: true },
		});

		if (!branch) {
			return NextResponse.json({ error: "Branch not found" }, { status: 404 });
		}

		// Generate employee ID
		const currentYear = new Date().getFullYear();
		const teacherCount = await prisma.teacher.count({
			where: {
				user: { branchId },
			},
		});
		const employeeId = `T${branch.code}${currentYear}${String(
			teacherCount + 1
		).padStart(3, "0")}`;

		// Generate default password
		const defaultPassword = await hashPassword("teacher123");

		const result = await prisma.$transaction(async (tx) => {
			// Create teacher user
			const teacherUser = await tx.user.create({
				data: {
					email,
					password: defaultPassword,
					firstName,
					lastName,
					phone,
					role: "TEACHER",
					schoolId: branch.schoolId,
					branchId,
				},
			});

			// Create teacher profile
			const teacher = await tx.teacher.create({
				data: {
					userId: teacherUser.id,
					employeeId,
					qualification,
					experience: experience ? Number.parseInt(experience) : null,
					salary: salary ? Number.parseFloat(salary) : null,
					joinDate: new Date(joinDate),
				},
			});

			// Assign subjects if provided
			if (subjectIds.length > 0) {
				// Validate subjects exist
				const subjects = await tx.subject.findMany({
					where: { id: { in: subjectIds } },
				});

				if (subjects.length !== subjectIds.length) {
					throw new Error("One or more subjects not found");
				}

				// Create subject assignments
				await tx.subjectTeacher.createMany({
					data: subjectIds.map((subjectId: string) => ({
						teacherId: teacher.id,
						subjectId,
					})),
				});
			}

			return { teacher, teacherUser };
		});

		return NextResponse.json({
			message: "Teacher registered successfully",
			teacher: {
				id: result.teacher.id,
				employeeId: result.teacher.employeeId,
				user: {
					id: result.teacherUser.id,
					firstName: result.teacherUser.firstName,
					lastName: result.teacherUser.lastName,
					email: result.teacherUser.email,
				},
			},
		});
	} catch (error) {
		console.error("Teacher registration error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
