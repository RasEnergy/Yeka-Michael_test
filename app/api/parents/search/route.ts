import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, hasPermission } from "@/lib/auth";
import { validateEthiopianPhone } from "@/lib/validation";

export async function GET(request: NextRequest) {
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

		const { searchParams } = new URL(request.url);
		const phone = searchParams.get("phone");
		const email = searchParams.get("email");

		if (!phone && !email) {
			return NextResponse.json(
				{ error: "Phone number or email is required" },
				{ status: 400 }
			);
		}

		// Validate phone format if provided
		if (phone && !validateEthiopianPhone(phone)) {
			return NextResponse.json(
				{ error: "Invalid phone number format" },
				{ status: 400 }
			);
		}

		// Build search criteria
		const whereClause: any = {
			role: "PARENT",
			isActive: true,
		};

		// If user is not SUPER_ADMIN, filter by their school
		// if (user.role !== "SUPER_ADMIN" && user.schoolId) {
		// 	whereClause.schoolId = user.schoolId;
		// }

		const normalizedPhone = phone
			? phone.replace(/[^0-9]/g, "").slice(-9)
			: null;

		// Add phone or email filter
		if (normalizedPhone && email) {
			whereClause.OR = [
				{ phone: { endsWith: normalizedPhone } },
				{ email: email },
			];
		} else if (normalizedPhone) {
			whereClause.phone = { endsWith: normalizedPhone };
		} else if (email) {
			whereClause.email = email;
		}

		// // Add phone or email filter
		// if (phone && email) {

		// 	whereClause.OR = [{ phone: phone }, { email: email }];
		// } else if (phone) {
		// 	whereClause.phone = phone;
		// } else if (email) {
		// 	whereClause.email = email;
		// }

		const parentUser = await prisma.user.findFirst({
			where: whereClause,
			include: {
				parentProfile: {
					include: {
						children: {
							include: {
								student: {
									include: {
										user: {
											select: {
												firstName: true,
												lastName: true,
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
						id: true,
						name: true,
						code: true,
					},
				},
			},
		});

		if (!parentUser || !parentUser.parentProfile) {
			return NextResponse.json({
				found: false,
				message: "No parent found with the provided information",
			});
		}

		return NextResponse.json({
			found: true,
			parent: {
				id: parentUser.parentProfile.id,
				user: {
					id: parentUser.id,
					firstName: parentUser.firstName,
					lastName: parentUser.lastName,
					email: parentUser.email,
					phone: parentUser.phone,
				},
				occupation: parentUser.parentProfile.occupation,
				workplace: parentUser.parentProfile.workplace,
				address: parentUser.parentProfile.address,
				photo: parentUser.parentProfile.photo,
				branch: parentUser.branch,
				children: parentUser.parentProfile.children.map((sp) => ({
					id: sp.student.id,
					studentId: sp.student.studentId,
					name: `${sp.student.user.firstName} ${sp.student.user.lastName}`,
					relationship: sp.relationship,
				})),
				createdAt: parentUser.parentProfile.createdAt,
			},
		});
	} catch (error) {
		console.error("Parent search error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
