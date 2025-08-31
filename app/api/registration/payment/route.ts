import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { smsService } from "@/lib/sms";
import { getUserFromRequest, hasPermission } from "@/lib/auth";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const registrationId = searchParams.get("registrationId");

		if (!registrationId) {
			return NextResponse.json(
				{ error: "Registration ID is required" },
				{ status: 400 }
			);
		}

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
				grade: true,
				invoices: {
					include: {
						payments: true,
					},
					orderBy: { createdAt: "desc" },
					take: 1,
				},
			},
		});

		if (!registration) {
			return NextResponse.json(
				{ error: "Registration not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({ registration });
	} catch (error) {
		console.error("Registration fetch error:", error);
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

		const {
			registrationId,
			paymentMethod,
			discountPercentage = 0,
			receiptNumber,
			transactionNumber,
			paidAmount,
			notes,
			paymentDate,
		} = await request.json();

		if (!registrationId || !paymentMethod) {
			return NextResponse.json(
				{ error: "Registration ID and payment method are required" },
				{ status: 400 }
			);
		}

		// Validate receipt/transaction number for manual payment methods
		if (
			(paymentMethod === "CASH" || paymentMethod === "BANK_TRANSFER") &&
			!receiptNumber &&
			!transactionNumber
		) {
			return NextResponse.json(
				{
					error:
						"Receipt number or transaction number is required for cash and bank transfer payments",
				},
				{ status: 400 }
			);
		}

		// Validate paid amount for manual payment methods
		if (
			(paymentMethod === "CASH" || paymentMethod === "BANK_TRANSFER") &&
			(!paidAmount || paidAmount <= 0)
		) {
			return NextResponse.json(
				{
					error: "Paid amount is required for cash and bank transfer payments",
				},
				{ status: 400 }
			);
		}

		// Validate discount percentage
		if (discountPercentage < 0 || discountPercentage > 100) {
			return NextResponse.json(
				{ error: "Discount percentage must be between 0 and 100" },
				{ status: 400 }
			);
		}

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
				grade: true,
				invoices: {
					include: {
						payments: true,
					},
				},
			},
		});

		if (!registration) {
			return NextResponse.json(
				{ error: "Registration not found" },
				{ status: 404 }
			);
		}

		if (registration.status !== "PENDING_PAYMENT") {
			return NextResponse.json(
				{ error: "Registration payment already completed" },
				{ status: 400 }
			);
		}

		// Check branch access
		if (
			(user.role === "BRANCH_ADMIN" ||
				user.role === "REGISTRAR" ||
				user.role === "CASHIER") &&
			registration.branchId !== user.branchId
		) {
			return NextResponse.json({ error: "Access denied" }, { status: 403 });
		}

		// Calculate amounts with proper additionalFee inclusion
		const registrationFee = Number(registration.registrationFee) || 0;
		const additionalFee = Number(registration.additionalFee) || 0;
		const baseTotal = registrationFee + additionalFee;
		const discountAmount = (baseTotal * discountPercentage) / 100;
		const finalAmount = baseTotal - discountAmount;

		// For manual payments, use the provided paid amount, otherwise use calculated amount
		const actualPaidAmount =
			paymentMethod === "CASH" || paymentMethod === "BANK_TRANSFER"
				? Number(paidAmount)
				: finalAmount;

		let invoice: any = null;
		const result = await prisma.$transaction(async (tx) => {
			const paymentCount = await tx.payment.count();
			const paymentNumber = `PAY-${Date.now()}-${(paymentCount + 1)
				.toString()
				.padStart(4, "0")}`;

			// Generate invoice number
			const invoiceCount = await tx.invoice.count();
			const invoiceNumber = `INV-${Date.now()}-${(invoiceCount + 1)
				.toString()
				.padStart(4, "0")}`;

			// Get fee types for invoice items
			const feeTypes = await tx.feeType.findMany({
				where: {
					name: {
						in: ["Registration Fee", "Monthly Fee", "Quarterly Fee"],
					},
				},
			});

			const registrationFeeType = feeTypes.find(
				(ft) => ft.name === "Registration Fee"
			);
			const monthlyFeeType = feeTypes.find((ft) => ft.name === "Monthly Fee");
			const quarterlyFeeType = feeTypes.find(
				(ft) => ft.name === "Quarterly Fee"
			);

			// Create invoice
			invoice = await tx.invoice.create({
				data: {
					invoiceNumber,
					studentId: registration.studentId,
					branchId: registration.branchId,
					registrationId: registration.id,
					totalAmount: baseTotal,
					discountAmount: discountAmount,
					finalAmount: finalAmount,
					paidAmount: actualPaidAmount,
					status:
						paymentMethod === "CASH" || paymentMethod === "BANK_TRANSFER"
							? "PAID"
							: "PENDING",
					dueDate: registration.paymentDueDate,
					createdById: user.id,
				},
			});

			// Create invoice items
			const invoiceItems = [];

			// Registration fee item
			if (registrationFeeType && registrationFee > 0) {
				invoiceItems.push({
					invoiceId: invoice.id,
					feeTypeId: registrationFeeType.id,
					description: "Registration Fee",
					amount: registrationFee,
					quantity: 1,
				});
			}

			// Additional fee item
			if (additionalFee > 0) {
				let feeType = null;
				let description = "Additional Fee";

				if (
					registration.paymentOption === "REGISTRATION_MONTHLY" &&
					monthlyFeeType
				) {
					feeType = monthlyFeeType;
					description = "Monthly Fee (1st & Last Month)";
				} else if (
					registration.paymentOption === "REGISTRATION_QUARTERLY" &&
					quarterlyFeeType
				) {
					feeType = quarterlyFeeType;
					description = "Quarterly Fee (2.5 Months)";
				}

				if (feeType) {
					invoiceItems.push({
						invoiceId: invoice.id,
						feeTypeId: feeType.id,
						description: description,
						amount: additionalFee,
						quantity: 1,
					});
				}
			}

			// Create all invoice items
			if (invoiceItems.length > 0) {
				await tx.invoiceItem.createMany({
					data: invoiceItems,
				});
			}

			// Create payment record
			const payment = await tx.payment.create({
				data: {
					paymentNumber,
					invoiceId: invoice.id,
					studentId: registration.studentId,
					registrationId: registration.id,
					amount: actualPaidAmount,
					transactionId: receiptNumber || transactionNumber || null,
					notes: notes || null,
					paymentDate: new Date(paymentDate),
					processedById: user.id,
					branchId: registration.branchId,
					paymentMethod: paymentMethod as
						| "CASH"
						| "BANK_TRANSFER"
						| "TELEBIRR"
						| "ONLINE",
					status:
						paymentMethod === "CASH" || paymentMethod === "BANK_TRANSFER"
							? "COMPLETED"
							: "PENDING",
				},
			});

			// Update registration status
			const updatedRegistration = await tx.registration.update({
				where: { id: registrationId },
				data: {
					status:
						paymentMethod === "CASH" || paymentMethod === "BANK_TRANSFER"
							? "PAYMENT_COMPLETED"
							: "PENDING_PAYMENT",
					paidAmount: actualPaidAmount,
					discountPercentage:
						discountPercentage > 0 ? discountPercentage : null,
					discountAmount: discountAmount > 0 ? discountAmount : null,
					// completedAt: new Date(),
					completedAt:
						paymentMethod === "CASH" || paymentMethod === "BANK_TRANSFER"
							? new Date()
							: null,
				},
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
					grade: true,
				},
			});

			return { invoice, payment, registration: updatedRegistration };
		});

		// Send SMS confirmation with enhanced details
		const parentPhone =
			result.registration.student.parents[0]?.parent.user.phone;
		const studentName = `${result.registration.student.user.firstName} ${result.registration.student.user.lastName}`;
		if (parentPhone) {
			if (paymentMethod === "CASH" || paymentMethod === "BANK_TRANSFER") {
				try {
					await smsService.sendEnhancedRegistrationConfirmation(
						parentPhone,
						`${result.registration.student.user.firstName} ${result.registration.student.user.lastName}`,
						result.registration.student.studentId,
						result.registration.registrationNumber,
						actualPaidAmount,
						result.registration.grade?.name || "Not Assigned",
						discountPercentage
					);
				} catch (error) {
					console.error("SMS sending failed:", error);
				}
			} else {
				let paymentLink = `${process.env.NEXT_PUBLIC_APP_URL}/payment/${invoice.id}`;
				let smsMessage = `Registration for ${studentName} requires payment. Amount: ETB ${actualPaidAmount}. Pay online: ${paymentLink} Registration #: ${registration.registrationNumber}`;

				await smsService.sendPaymentLink(
					parentPhone,
					`${registration.student.user.firstName} ${registration.student.user.lastName}`,
					registration.student.studentId,
					Number(actualPaidAmount),
					paymentLink,
					result.invoice.invoiceNumber
				);

				return NextResponse.json({
					message: "Registration payment processed successfully",
					registration: result.registration,
					invoice: result.invoice,
					payment: result.payment,
					redirectTo: `/dashboard/invoices/${result.invoice.id}`,
				});
			}
		}

		return NextResponse.json({
			message: "Payment completed successfully",
			registration: result.registration,
			invoice: result.invoice,
			payment: result.payment,
			redirectTo: `/registration/success/${result.registration.id}`,
		});
	} catch (error) {
		console.error("Registration payment error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// import { type NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { smsService } from "@/lib/sms";
// import { getUserFromRequest, hasPermission } from "@/lib/auth";

// export async function GET(request: NextRequest) {
// 	try {
// 		const { searchParams } = new URL(request.url);
// 		const registrationId = searchParams.get("registrationId");

// 		if (!registrationId) {
// 			return NextResponse.json(
// 				{ error: "Registration ID is required" },
// 				{ status: 400 }
// 			);
// 		}

// 		const registration = await prisma.registration.findUnique({
// 			where: { id: registrationId },
// 			include: {
// 				student: {
// 					include: {
// 						user: true,
// 						parents: {
// 							include: {
// 								parent: {
// 									include: {
// 										user: true,
// 									},
// 								},
// 							},
// 						},
// 					},
// 				},
// 				branch: true,
// 				grade: true,
// 				invoices: {
// 					include: {
// 						payments: true,
// 					},
// 					orderBy: { createdAt: "desc" },
// 					take: 1,
// 				},
// 			},
// 		});

// 		if (!registration) {
// 			return NextResponse.json(
// 				{ error: "Registration not found" },
// 				{ status: 404 }
// 			);
// 		}

// 		return NextResponse.json({ registration });
// 	} catch (error) {
// 		console.error("Registration fetch error:", error);
// 		return NextResponse.json(
// 			{ error: "Internal server error" },
// 			{ status: 500 }
// 		);
// 	}
// }

// export async function POST(request: NextRequest) {
// 	try {
// 		const user = await getUserFromRequest(request);
// 		if (!user) {
// 			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
// 		}

// 		if (
// 			!hasPermission(user.role, [
// 				"SUPER_ADMIN",
// 				"BRANCH_ADMIN",
// 				"REGISTRAR",
// 				"CASHIER",
// 			])
// 		) {
// 			return NextResponse.json(
// 				{ error: "Insufficient permissions" },
// 				{ status: 403 }
// 			);
// 		}

// 		const {
// 			registrationId,
// 			paymentMethod,
// 			discountPercentage = 0,
// 			receiptNumber,
// 			transactionNumber,
// 			paidAmount,
// 			notes,
// 		} = await request.json();

// 		if (!registrationId || !paymentMethod) {
// 			return NextResponse.json(
// 				{ error: "Registration ID and payment method are required" },
// 				{ status: 400 }
// 			);
// 		}

// 		// Validate receipt/transaction number for manual payment methods
// 		if (
// 			(paymentMethod === "CASH" || paymentMethod === "BANK_TRANSFER") &&
// 			!receiptNumber &&
// 			!transactionNumber
// 		) {
// 			return NextResponse.json(
// 				{
// 					error:
// 						"Receipt number or transaction number is required for cash and bank transfer payments",
// 				},
// 				{ status: 400 }
// 			);
// 		}

// 		// Validate paid amount for manual payment methods
// 		if (
// 			(paymentMethod === "CASH" || paymentMethod === "BANK_TRANSFER") &&
// 			(!paidAmount || paidAmount <= 0)
// 		) {
// 			return NextResponse.json(
// 				{
// 					error: "Paid amount is required for cash and bank transfer payments",
// 				},
// 				{ status: 400 }
// 			);
// 		}

// 		// Validate discount percentage
// 		if (discountPercentage < 0 || discountPercentage > 100) {
// 			return NextResponse.json(
// 				{ error: "Discount percentage must be between 0 and 100" },
// 				{ status: 400 }
// 			);
// 		}

// 		const registration = await prisma.registration.findUnique({
// 			where: { id: registrationId },
// 			include: {
// 				student: {
// 					include: {
// 						user: true,
// 						parents: {
// 							include: {
// 								parent: {
// 									include: {
// 										user: true,
// 									},
// 								},
// 							},
// 						},
// 					},
// 				},
// 				branch: true,
// 				grade: true,
// 				invoices: {
// 					include: {
// 						payments: true,
// 					},
// 				},
// 			},
// 		});

// 		if (!registration) {
// 			return NextResponse.json(
// 				{ error: "Registration not found" },
// 				{ status: 404 }
// 			);
// 		}

// 		if (registration.status !== "PENDING_PAYMENT") {
// 			return NextResponse.json(
// 				{ error: "Registration payment already completed" },
// 				{ status: 400 }
// 			);
// 		}

// 		// Check branch access
// 		if (
// 			(user.role === "BRANCH_ADMIN" ||
// 				user.role === "REGISTRAR" ||
// 				user.role === "CASHIER") &&
// 			registration.branchId !== user.branchId
// 		) {
// 			return NextResponse.json({ error: "Access denied" }, { status: 403 });
// 		}

// 		// Calculate amounts with proper additionalFee inclusion
// 		const registrationFee = Number(registration.registrationFee) || 0;
// 		const additionalFee = Number(registration.additionalFee) || 0;
// 		const baseTotal = registrationFee + additionalFee;
// 		const discountAmount = (baseTotal * discountPercentage) / 100;
// 		const finalAmount = baseTotal - discountAmount;

// 		// For manual payments, use the provided paid amount, otherwise use calculated amount
// 		const actualPaidAmount =
// 			paymentMethod === "CASH" || paymentMethod === "BANK_TRANSFER"
// 				? Number(paidAmount)
// 				: finalAmount;

// 		const result = await prisma.$transaction(async (tx) => {
// 			// Generate payment number
// 			const paymentCount = await tx.payment.count();
// 			const paymentNumber = `PAY-${Date.now()}-${(paymentCount + 1)
// 				.toString()
// 				.padStart(4, "0")}`;

// 			// Generate invoice number
// 			const invoiceCount = await tx.invoice.count();
// 			const invoiceNumber = `INV-${Date.now()}-${(invoiceCount + 1)
// 				.toString()
// 				.padStart(4, "0")}`;

// 			// Get fee types for invoice items
// 			const feeTypes = await tx.feeType.findMany({
// 				where: {
// 					name: {
// 						in: ["Registration Fee", "Monthly Fee", "Quarterly Fee"],
// 					},
// 				},
// 			});

// 			const registrationFeeType = feeTypes.find(
// 				(ft) => ft.name === "Registration Fee"
// 			);
// 			const monthlyFeeType = feeTypes.find((ft) => ft.name === "Monthly Fee");
// 			const quarterlyFeeType = feeTypes.find(
// 				(ft) => ft.name === "Quarterly Fee"
// 			);

// 			// Create invoice
// 			const invoice = await tx.invoice.create({
// 				data: {
// 					invoiceNumber,
// 					studentId: registration.studentId,
// 					branchId: registration.branchId,
// 					registrationId: registration.id,
// 					totalAmount: baseTotal,
// 					discountAmount: discountAmount,
// 					finalAmount: finalAmount,
// 					paidAmount: actualPaidAmount,
// 					status: "PAID",
// 					dueDate: registration.paymentDueDate,
// 					createdById: user.id,
// 				},
// 			});

// 			// Create invoice items
// 			const invoiceItems = [];

// 			// Registration fee item
// 			if (registrationFeeType && registrationFee > 0) {
// 				invoiceItems.push({
// 					invoiceId: invoice.id,
// 					feeTypeId: registrationFeeType.id,
// 					description: "Registration Fee",
// 					amount: registrationFee,
// 					quantity: 1,
// 				});
// 			}

// 			// Additional fee item
// 			if (additionalFee > 0) {
// 				let feeType = null;
// 				let description = "Additional Fee";

// 				if (
// 					registration.paymentOption === "REGISTRATION_MONTHLY" &&
// 					monthlyFeeType
// 				) {
// 					feeType = monthlyFeeType;
// 					description = "Monthly Fee (1st & Last Month)";
// 				} else if (
// 					registration.paymentOption === "REGISTRATION_QUARTERLY" &&
// 					quarterlyFeeType
// 				) {
// 					feeType = quarterlyFeeType;
// 					description = "Quarterly Fee (2.5 Months)";
// 				}

// 				if (feeType) {
// 					invoiceItems.push({
// 						invoiceId: invoice.id,
// 						feeTypeId: feeType.id,
// 						description: description,
// 						amount: additionalFee,
// 						quantity: 1,
// 					});
// 				}
// 			}

// 			// Create all invoice items
// 			if (invoiceItems.length > 0) {
// 				await tx.invoiceItem.createMany({
// 					data: invoiceItems,
// 				});
// 			}

// 			// Create payment record
// 			const payment = await tx.payment.create({
// 				data: {
// 					paymentNumber,
// 					invoiceId: invoice.id,
// 					studentId: registration.studentId,
// 					registrationId: registration.id,
// 					amount: actualPaidAmount,
// 					paymentMethod,
// 					status: "COMPLETED",
// 					transactionId: receiptNumber || transactionNumber || null,
// 					notes: notes || null,
// 					processedById: user.id,
// 					branchId: registration.branchId,
// 				},
// 			});

// 			// Update registration status
// 			const updatedRegistration = await tx.registration.update({
// 				where: { id: registrationId },
// 				data: {
// 					status: "PAYMENT_COMPLETED",
// 					paidAmount: actualPaidAmount,
// 					discountPercentage:
// 						discountPercentage > 0 ? discountPercentage : null,
// 					discountAmount: discountAmount > 0 ? discountAmount : null,
// 					completedAt: new Date(),
// 				},
// 				include: {
// 					student: {
// 						include: {
// 							user: true,
// 							parents: {
// 								include: {
// 									parent: {
// 										include: {
// 											user: true,
// 										},
// 									},
// 								},
// 							},
// 						},
// 					},
// 					branch: true,
// 					grade: true,
// 				},
// 			});

// 			return { invoice, payment, registration: updatedRegistration };
// 		});

// 		// Send SMS confirmation with enhanced details
// 		const parentPhone =
// 			result.registration.student.parents[0]?.parent.user.phone;
// 		if (parentPhone) {
// 			try {
// 				await smsService.sendEnhancedRegistrationConfirmation(
// 					parentPhone,
// 					`${result.registration.student.user.firstName} ${result.registration.student.user.lastName}`,
// 					result.registration.student.studentId,
// 					result.registration.registrationNumber,
// 					actualPaidAmount,
// 					result.registration.grade?.name || "Not Assigned",
// 					discountPercentage
// 				);
// 			} catch (error) {
// 				console.error("SMS sending failed:", error);
// 			}
// 		}

// 		return NextResponse.json({
// 			message: "Payment completed successfully",
// 			registration: result.registration,
// 			invoice: result.invoice,
// 			payment: result.payment,
// 		});
// 	} catch (error) {
// 		console.error("Registration payment error:", error);
// 		return NextResponse.json(
// 			{ error: "Internal server error" },
// 			{ status: 500 }
// 		);
// 	}
// }
// import { type NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { getUserFromRequest, hasPermission, canAccessBranch } from "@/lib/auth";
// // import { sendSMS } from "@/lib/sms";
// import { smsService } from "@/lib/sms";

// export async function GET(request: NextRequest) {
// 	try {
// 		const { searchParams } = new URL(request.url);
// 		const registrationId = searchParams.get("registrationId");

// 		if (!registrationId) {
// 			return NextResponse.json(
// 				{ error: "Registration ID is required" },
// 				{ status: 400 }
// 			);
// 		}

// 		const registration = await prisma.registration.findUnique({
// 			where: { id: registrationId },
// 			include: {
// 				student: {
// 					include: {
// 						user: true,
// 						parents: {
// 							include: {
// 								parent: {
// 									include: {
// 										user: true,
// 									},
// 								},
// 							},
// 						},
// 					},
// 				},
// 				branch: true,
// 				grade: true,
// 				invoices: {
// 					include: {
// 						payments: true,
// 					},
// 					orderBy: { createdAt: "desc" },
// 					take: 1,
// 				},
// 			},
// 		});

// 		if (!registration) {
// 			return NextResponse.json(
// 				{ error: "Registration not found" },
// 				{ status: 404 }
// 			);
// 		}

// 		return NextResponse.json({ registration });
// 	} catch (error) {
// 		console.error("Registration fetch error:", error);
// 		return NextResponse.json(
// 			{ error: "Internal server error" },
// 			{ status: 500 }
// 		);
// 	}
// }

// export async function POST(request: NextRequest) {
// 	try {
// 		const user = await getUserFromRequest(request);
// 		if (!user) {
// 			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
// 		}

// 		if (
// 			!hasPermission(user.role, [
// 				"SUPER_ADMIN",
// 				"BRANCH_ADMIN",
// 				"REGISTRAR",
// 				"CASHIER",
// 			])
// 		) {
// 			return NextResponse.json(
// 				{ error: "Insufficient permissions" },
// 				{ status: 403 }
// 			);
// 		}

// 		const {
// 			registrationId,
// 			paymentMethod,
// 			discountPercentage = 0,
// 			receiptNumber,
// 			transactionNumber,
// 			paidAmount,
// 			notes,
// 		} = await request.json();

// 		if (!registrationId || !paymentMethod) {
// 			return NextResponse.json(
// 				{ error: "Registration ID and payment method are required" },
// 				{ status: 400 }
// 			);
// 		}

// 		// Validate receipt/transaction number for manual payment methods
// 		if (
// 			(paymentMethod === "CASH" || paymentMethod === "BANK_TRANSFER") &&
// 			!receiptNumber &&
// 			!transactionNumber
// 		) {
// 			return NextResponse.json(
// 				{
// 					error:
// 						"Receipt number or transaction number is required for cash and bank transfer payments",
// 				},
// 				{ status: 400 }
// 			);
// 		}

// 		// Validate paid amount for manual payment methods
// 		if (
// 			(paymentMethod === "CASH" || paymentMethod === "BANK_TRANSFER") &&
// 			(!paidAmount || paidAmount <= 0)
// 		) {
// 			return NextResponse.json(
// 				{
// 					error: "Paid amount is required for cash and bank transfer payments",
// 				},
// 				{ status: 400 }
// 			);
// 		}

// 		// Validate discount percentage
// 		if (discountPercentage < 0 || discountPercentage > 100) {
// 			return NextResponse.json(
// 				{ error: "Discount percentage must be between 0 and 100" },
// 				{ status: 400 }
// 			);
// 		}

// 		const registration = await prisma.registration.findUnique({
// 			where: { id: registrationId },
// 			include: {
// 				student: {
// 					include: {
// 						user: true,
// 						parents: {
// 							include: {
// 								parent: {
// 									include: {
// 										user: true,
// 									},
// 								},
// 							},
// 						},
// 					},
// 				},
// 				branch: true,
// 				grade: true,
// 				invoices: {
// 					include: {
// 						payments: true,
// 					},
// 				},
// 			},
// 		});

// 		if (!registration) {
// 			return NextResponse.json(
// 				{ error: "Registration not found" },
// 				{ status: 404 }
// 			);
// 		}

// 		if (registration.status !== "PENDING_PAYMENT") {
// 			return NextResponse.json(
// 				{ error: "Registration payment already completed" },
// 				{ status: 400 }
// 			);
// 		}

// 		// Check branch access
// 		if (
// 			(user.role === "BRANCH_ADMIN" ||
// 				user.role === "REGISTRAR" ||
// 				user.role === "CASHIER") &&
// 			registration.branchId !== user.branchId
// 		) {
// 			return NextResponse.json({ error: "Access denied" }, { status: 403 });
// 		}

// 		// Calculate amounts with discount
// 		const originalAmount = Number(registration.totalAmount);
// 		const discountAmount = (originalAmount * discountPercentage) / 100;
// 		const finalAmount = originalAmount - discountAmount;

// 		// For manual payments, use the provided paid amount, otherwise use calculated amount
// 		const actualPaidAmount =
// 			paymentMethod === "CASH" || paymentMethod === "BANK_TRANSFER"
// 				? Number(paidAmount)
// 				: finalAmount;

// 		const result = await prisma.$transaction(async (tx) => {
// 			// Generate payment number
// 			const paymentCount = await tx.payment.count();
// 			const paymentNumber = `PAY-${Date.now()}-${(paymentCount + 1)
// 				.toString()
// 				.padStart(4, "0")}`;

// 			// Generate invoice number
// 			const invoiceCount = await tx.invoice.count();
// 			const invoiceNumber = `INV-${Date.now()}-${(invoiceCount + 1)
// 				.toString()
// 				.padStart(4, "0")}`;

// 			// Create invoice
// 			const invoice = await tx.invoice.create({
// 				data: {
// 					invoiceNumber,
// 					studentId: registration.studentId,
// 					branchId: registration.branchId,
// 					totalAmount: originalAmount,
// 					discountAmount: discountAmount,
// 					finalAmount: finalAmount,
// 					paidAmount: actualPaidAmount,
// 					status: "PAID",
// 					dueDate: registration.paymentDueDate,
// 					createdById: user.id,
// 					items: {
// 						create: [
// 							{
// 								description: "Registration Fee",
// 								amount: Number(registration.registrationFee),
// 								quantity: 1,
// 								feeTypeId: await tx.feeType
// 									.findFirst({
// 										where: { name: "fee_registration" },
// 										select: { id: true },
// 									})
// 									.then((ft) => ft?.id || ""),
// 							},
// 							...(registration.additionalFee &&
// 							Number(registration.additionalFee) > 0
// 								? [
// 										{
// 											description:
// 												registration.paymentOption === "REGISTRATION_MONTHLY"
// 													? "Monthly Fee"
// 													: "Quarterly Fee",
// 											amount: Number(registration.additionalFee),
// 											quantity: 1,
// 											feeTypeId: await tx.feeType
// 												.findFirst({
// 													where: {
// 														name:
// 															registration.paymentOption ===
// 															"REGISTRATION_MONTHLY"
// 																? "Monthly Fee"
// 																: "Quarterly Fee",
// 													},
// 													select: { id: true },
// 												})
// 												.then((ft) => ft?.id || ""),
// 										},
// 								  ]
// 								: []),
// 						],
// 					},
// 				},
// 			});

// 			// Create payment record
// 			const payment = await tx.payment.create({
// 				data: {
// 					paymentNumber,
// 					invoiceId: invoice.id,
// 					studentId: registration.studentId,
// 					amount: actualPaidAmount,
// 					paymentMethod,
// 					status: "COMPLETED",
// 					transactionId: receiptNumber || transactionNumber || null,
// 					notes: notes || null,
// 					processedById: user.id,
// 					branchId: registration.branchId,
// 				},
// 			});

// 			// Update registration status
// 			const updatedRegistration = await tx.registration.update({
// 				where: { id: registrationId },
// 				data: {
// 					status: "PAYMENT_COMPLETED",
// 					paidAmount: actualPaidAmount,
// 					discountPercentage:
// 						discountPercentage > 0 ? discountPercentage : null,
// 					discountAmount: discountAmount > 0 ? discountAmount : null,
// 					completedAt: new Date(),
// 				},
// 				include: {
// 					student: {
// 						include: {
// 							user: true,
// 							parents: {
// 								include: {
// 									parent: {
// 										include: {
// 											user: true,
// 										},
// 									},
// 								},
// 							},
// 						},
// 					},
// 					branch: true,
// 					grade: true,
// 				},
// 			});

// 			return { invoice, payment, registration: updatedRegistration };
// 		});

// 		// Send SMS confirmation with enhanced details
// 		const parentPhone =
// 			result.registration.student.parents[0]?.parent.user.phone;
// 		if (parentPhone) {
// 			try {
// 				await smsService.sendEnhancedRegistrationConfirmation(
// 					parentPhone,
// 					`${result.registration.student.user.firstName} ${result.registration.student.user.lastName}`,
// 					result.registration.student.studentId,
// 					result.registration.registrationNumber,
// 					actualPaidAmount,
// 					result.registration.grade?.name || "Not Assigned",
// 					discountPercentage
// 				);
// 			} catch (error) {
// 				console.error("SMS sending failed:", error);
// 			}
// 		}

// 		return NextResponse.json({
// 			message: "Payment completed successfully",
// 			registration: result.registration,
// 			invoice: result.invoice,
// 			payment: result.payment,
// 		});
// 	} catch (error) {
// 		console.error("Registration payment error:", error);
// 		return NextResponse.json(
// 			{ error: "Internal server error" },
// 			{ status: 500 }
// 		);
// 	}
// }

// export async function POST(request: NextRequest) {
// 	try {
// 		const user = await getUserFromRequest(request);
// 		if (!user) {
// 			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
// 		}

// 		if (
// 			!hasPermission(user.role, [
// 				"SUPER_ADMIN",
// 				"BRANCH_ADMIN",
// 				"REGISTRAR",
// 				"CASHIER",
// 			])
// 		) {
// 			return NextResponse.json(
// 				{ error: "Insufficient permissions" },
// 				{ status: 403 }
// 			);
// 		}

// 		const { registrationId, paymentOption, paymentMethod, notes } =
// 			await request.json();

// 		if (!registrationId || !paymentOption || !paymentMethod) {
// 			return NextResponse.json(
// 				{ error: "Missing required fields" },
// 				{ status: 400 }
// 			);
// 		}

// 		// Validate payment option
// 		if (
// 			!["REGISTRATION_MONTHLY", "REGISTRATION_QUARTERLY"].includes(
// 				paymentOption
// 			)
// 		) {
// 			return NextResponse.json(
// 				{ error: "Invalid payment option" },
// 				{ status: 400 }
// 			);
// 		}

// 		// Validate payment method
// 		if (
// 			!["CASH", "BANK_TRANSFER", "TELEBIRR", "ONLINE"].includes(paymentMethod)
// 		) {
// 			return NextResponse.json(
// 				{ error: "Invalid payment method" },
// 				{ status: 400 }
// 			);
// 		}

// 		const registration = await prisma.registration.findUnique({
// 			where: { id: registrationId },
// 			include: {
// 				student: {
// 					include: {
// 						user: true,
// 						parents: {
// 							include: {
// 								parent: {
// 									include: {
// 										user: true,
// 									},
// 								},
// 							},
// 						},
// 					},
// 				},
// 				branch: true,
// 			},
// 		});

// 		if (!registration) {
// 			return NextResponse.json(
// 				{ error: "Registration not found" },
// 				{ status: 404 }
// 			);
// 		}

// 		if (!canAccessBranch(user, registration.branchId)) {
// 			return NextResponse.json(
// 				{ error: "Access denied to this branch" },
// 				{ status: 403 }
// 			);
// 		}

// 		if (registration.status !== "PENDING_PAYMENT") {
// 			return NextResponse.json(
// 				{ error: "Registration payment already processed" },
// 				{ status: 400 }
// 			);
// 		}

// 		// Calculate total amount based on payment option
// 		let totalAmount = registration.registrationFee;
// 		let additionalFee = 0;

// 		if (paymentOption === "REGISTRATION_MONTHLY") {
// 			additionalFee = 2000; // Monthly fee
// 		} else if (paymentOption === "REGISTRATION_QUARTERLY") {
// 			additionalFee = 5500; // Quarterly fee (3 months with discount)
// 		}

// 		// Ensure both operands are Decimal for addition
// 		// eslint-disable-next-line @typescript-eslint/no-var-requires
// 		const { Decimal } = require("@prisma/client/runtime/library");
// 		totalAmount = new Decimal(totalAmount).plus(new Decimal(additionalFee));

// 		// Ensure fee types exist
// 		const feeTypes = await prisma.feeType.findMany({
// 			where: {
// 				id: {
// 					in: ["fee_registration", "fee_tuition", "fee_quarterly"],
// 				},
// 			},
// 		});

// 		if (feeTypes.length === 0) {
// 			return NextResponse.json(
// 				{
// 					error:
// 						"Fee types not found. Please run the database seeding script first.",
// 				},
// 				{ status: 500 }
// 			);
// 		}

// 		const result = await prisma.$transaction(async (tx) => {
// 			// Update registration
// 			const updatedRegistration = await tx.registration.update({
// 				where: { id: registrationId },
// 				data: {
// 					paymentOption: paymentOption as
// 						| "REGISTRATION_MONTHLY"
// 						| "REGISTRATION_QUARTERLY",
// 					additionalFee,
// 					totalAmount,
// 					status:
// 						paymentMethod === "CASH" || paymentMethod === "BANK_TRANSFER"
// 							? "PAYMENT_COMPLETED"
// 							: "PENDING_PAYMENT",
// 					completedAt:
// 						paymentMethod === "CASH" || paymentMethod === "BANK_TRANSFER"
// 							? new Date()
// 							: null,
// 				},
// 			});

// 			// Generate invoice number
// 			const invoiceCount = await tx.invoice.count({
// 				where: { branchId: registration.branchId },
// 			});
// 			const invoiceNumber = `INV-${
// 				registration.branch.code
// 			}-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(
// 				4,
// 				"0"
// 			)}`;

// 			// Create invoice
// 			const invoice = await tx.invoice.create({
// 				data: {
// 					invoiceNumber,
// 					studentId: registration.studentId,
// 					branchId: registration.branchId,
// 					totalAmount,
// 					dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
// 					status:
// 						paymentMethod === "CASH" || paymentMethod === "BANK_TRANSFER"
// 							? "PAID"
// 							: "PENDING",
// 					createdById: user.id,
// 				},
// 			});

// 			// Create invoice items
// 			const invoiceItems = [];

// 			// Registration fee item
// 			const registrationFeeType = feeTypes.find(
// 				(ft) => ft.id === "fee_registration"
// 			);
// 			if (registrationFeeType) {
// 				invoiceItems.push({
// 					invoiceId: invoice.id,
// 					feeTypeId: registrationFeeType.id,
// 					description: "Student Registration Fee",
// 					amount: registration.registrationFee,
// 					quantity: 1,
// 				});
// 			}

// 			// Additional fee item
// 			if (additionalFee > 0) {
// 				const additionalFeeType =
// 					paymentOption === "REGISTRATION_MONTHLY"
// 						? feeTypes.find((ft) => ft.id === "fee_tuition")
// 						: feeTypes.find((ft) => ft.id === "fee_quarterly");

// 				if (additionalFeeType) {
// 					invoiceItems.push({
// 						invoiceId: invoice.id,
// 						feeTypeId: additionalFeeType.id,
// 						description:
// 							paymentOption === "REGISTRATION_MONTHLY"
// 								? "Monthly Tuition Fee"
// 								: "Quarterly Fee",
// 						amount: additionalFee,
// 						quantity: 1,
// 					});
// 				}
// 			}

// 			// Create all invoice items
// 			if (invoiceItems.length > 0) {
// 				await tx.invoiceItem.createMany({
// 					data: invoiceItems,
// 				});
// 			}

// 			// Generate payment number
// 			const paymentCount = await tx.payment.count({
// 				where: { branchId: registration.branchId },
// 			});
// 			const paymentNumber = `PAY-${
// 				registration.branch.code
// 			}-${new Date().getFullYear()}-${String(paymentCount + 1).padStart(
// 				4,
// 				"0"
// 			)}`;

// 			// Create payment record
// 			const payment = await tx.payment.create({
// 				data: {
// 					paymentNumber,
// 					invoiceId: invoice.id,
// 					studentId: registration.studentId,
// 					branchId: registration.branchId,
// 					amount: totalAmount,
// 					paymentMethod: paymentMethod as
// 						| "CASH"
// 						| "BANK_TRANSFER"
// 						| "TELEBIRR"
// 						| "ONLINE",
// 					status:
// 						paymentMethod === "CASH" || paymentMethod === "BANK_TRANSFER"
// 							? "COMPLETED"
// 							: "PENDING",
// 					notes,
// 				},
// 			});

// 			return { updatedRegistration, invoice, payment };
// 		});

// 		// Send SMS notification
// 		try {
// 			if (registration.student.parents.length > 0) {
// 				const parentPhone = registration.student.parents[0].parent.user.phone;
// 				const studentName = `${registration.student.user.firstName} ${registration.student.user.lastName}`;

// 				if (!parentPhone) {
// 					console.warn("Parent phone number is missing, SMS not sent.");
// 				} else {
// 					let smsMessage = "";
// 					let paymentLink = "";
// 					if (paymentMethod === "CASH" || paymentMethod === "BANK_TRANSFER") {
// 						smsMessage = `Registration completed for ${studentName}. Registration #: ${registration.registrationNumber}. Amount: ETB ${totalAmount}. Payment confirmed.`;
// 						paymentLink = ""; // No payment link needed for cash/bank transfer
// 					} else {
// 						paymentLink = `${process.env.NEXT_PUBLIC_APP_URL}/registration/payment/${registrationId}`;
// 						smsMessage = `Registration for ${studentName} requires payment. Amount: ETB ${totalAmount}. Pay online: ${paymentLink} Registration #: ${registration.registrationNumber}`;
// 					}

// 					await smsService.sendPaymentLink(
// 						parentPhone,
// 						`${registration.student.user.firstName} ${registration.student.user.lastName}`,
// 						registration.student.studentId,
// 						Number(totalAmount),
// 						paymentLink,
// 						result.invoice.invoiceNumber
// 					);

// 					// await sendSMS(parentPhone, smsMessage);
// 				}
// 			}
// 		} catch (smsError) {
// 			console.error("SMS sending error:", smsError);
// 			// Don't fail the entire process if SMS fails
// 		}

// 		return NextResponse.json({
// 			message: "Registration payment processed successfully",
// 			registration: result.updatedRegistration,
// 			invoice: result.invoice,
// 			payment: result.payment,
// 			redirectTo: `/dashboard/invoices/${result.invoice.id}`,
// 		});
// 	} catch (error) {
// 		console.error("Registration payment processing error:", error);
// 		return NextResponse.json(
// 			{ error: "Internal server error" },
// 			{ status: 500 }
// 		);
// 	}
// }
