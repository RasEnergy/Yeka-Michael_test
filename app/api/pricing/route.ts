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
				"CASHIER",
			])
		) {
			return NextResponse.json(
				{ error: "Insufficient permissions" },
				{ status: 403 }
			);
		}

		const { searchParams } = new URL(request.url);
		const branchId = searchParams.get("branchId");
		const gradeId = searchParams.get("gradeId");

		if (!branchId || !gradeId) {
			return NextResponse.json(
				{ error: "Branch ID and Grade ID are required" },
				{ status: 400 }
			);
		}

		// Fetch pricing schema for the specific branch and grade
		const pricingSchema = await prisma.pricingSchema.findUnique({
			where: {
				branchId_gradeId: {
					branchId,
					gradeId,
				},
				isActive: true,
			},
			include: {
				branch: {
					select: {
						id: true,
						name: true,
						code: true,
					},
				},
				grade: {
					select: {
						id: true,
						name: true,
						level: true,
					},
				},
			},
		});

		if (!pricingSchema) {
			return NextResponse.json(
				{ error: "Pricing schema not found for this branch and grade" },
				{ status: 404 }
			);
		}

		// Calculate payment options based on duration
		const paymentOptions = [
			{
				duration: "ONE_MONTH",
				label: "1 Month",
				months: 1,
				additionalFee: Number(pricingSchema.monthlyFee) * 1,
			},
			{
				duration: "TWO_MONTHS",
				label: "2 Months",
				months: 2,
				additionalFee: Number(pricingSchema.monthlyFee) * 2,
			},
			{
				duration: "QUARTER",
				label: "Quarter (2.5 Months)",
				months: 2.5,
				additionalFee: Number(pricingSchema.monthlyFee) * 2.5,
			},
			{
				duration: "THREE_MONTHS",
				label: "3 Months",
				months: 3,
				additionalFee: Number(pricingSchema.monthlyFee) * 3,
			},
			{
				duration: "FOUR_MONTHS",
				label: "4 Months",
				months: 4,
				additionalFee: Number(pricingSchema.monthlyFee) * 4,
			},
			{
				duration: "FIVE_MONTHS",
				label: "5 Months",
				months: 5,
				additionalFee: Number(pricingSchema.monthlyFee) * 5,
			},
			{
				duration: "TEN_MONTHS",
				label: "10 Months",
				months: 10,
				additionalFee: Number(pricingSchema.monthlyFee) * 10,
			},
		];

		return NextResponse.json({
			pricingSchema: {
				id: pricingSchema.id,
				registrationFee: Number(pricingSchema.registrationFee),
				monthlyFee: Number(pricingSchema.monthlyFee),
				serviceFee: Number(pricingSchema.serviceFee),
				branch: pricingSchema.branch,
				grade: pricingSchema.grade,
			},
			paymentOptions,
		});
	} catch (error) {
		console.error("Pricing fetch error:", error);
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

		if (!hasPermission(user.role, ["SUPER_ADMIN", "BRANCH_ADMIN"])) {
			return NextResponse.json(
				{ error: "Insufficient permissions" },
				{ status: 403 }
			);
		}

		const { branchId, gradeId, registrationFee, monthlyFee, serviceFee } =
			await request.json();

		if (
			!branchId ||
			!gradeId ||
			!registrationFee ||
			!monthlyFee ||
			!serviceFee
		) {
			return NextResponse.json(
				{ error: "All fields are required" },
				{ status: 400 }
			);
		}

		if (!user.schoolId) {
			return NextResponse.json(
				{ error: "User school not found" },
				{ status: 400 }
			);
		}

		// Check if pricing schema already exists
		const existingSchema = await prisma.pricingSchema.findUnique({
			where: {
				branchId_gradeId: {
					branchId,
					gradeId,
				},
			},
		});

		let pricingSchema;
		if (existingSchema) {
			// Update existing schema
			pricingSchema = await prisma.pricingSchema.update({
				where: { id: existingSchema.id },
				data: {
					registrationFee,
					monthlyFee,
					serviceFee,
					isActive: true,
				},
				include: {
					branch: {
						select: {
							id: true,
							name: true,
							code: true,
						},
					},
					grade: {
						select: {
							id: true,
							name: true,
							level: true,
						},
					},
				},
			});
		} else {
			// Create new schema
			pricingSchema = await prisma.pricingSchema.create({
				data: {
					schoolId: user.schoolId,
					branchId,
					gradeId,
					registrationFee,
					monthlyFee,
					serviceFee,
					isActive: true,
				},
				include: {
					branch: {
						select: {
							id: true,
							name: true,
							code: true,
						},
					},
					grade: {
						select: {
							id: true,
							name: true,
							level: true,
						},
					},
				},
			});
		}

		return NextResponse.json({
			message: "Pricing schema saved successfully",
			pricingSchema,
		});
	} catch (error) {
		console.error("Pricing schema creation error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
