import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { smsService } from "@/lib/sms";

export async function POST(request: Request) {
	try {
		const webhookData = await request.json();
		console.log("SantimPay Webhook Received:", webhookData);

		if (
			webhookData.message === "payment successful" &&
			webhookData.Status === "COMPLETED"
		) {
			// Find the payment by thirdPartyId (transactionId), txnId, or clientReference
			const payment = await prisma.payment.findFirst({
				where: {
					OR: [
						{ transactionId: webhookData.thirdPartyId },
						{ transactionId: webhookData.txnId },
						{ transactionId: webhookData.clientReference },
					],
				},
				include: {
					invoice: {
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
									registration: {
										include: {
											grade: true,
										},
									},
								},
							},
						},
					},
				},
			});

			if (!payment) {
				console.error("Payment not found for webhook data:", webhookData);
				return NextResponse.json(
					{ message: "Payment not found" },
					{ status: 404 }
				);
			}

			// Process payment verification using transaction for data consistency
			const result = await prisma.$transaction(async (tx) => {
				// Update the payment record with webhook data
				const updatedPayment = await tx.payment.update({
					where: { id: payment.id },
					data: {
						status: "COMPLETED",
						transactionId: webhookData.txnId || webhookData.thirdPartyId,
						notes: `${payment.notes || ""} | Verified via webhook | TxnId: ${
							webhookData.txnId
						} | RefId: ${webhookData.refId}`,
						paymentDate: new Date(),
					},
				});

				// Update the invoice status
				const updatedInvoice = await tx.invoice.update({
					where: { id: payment.invoiceId },
					data: {
						status: "PAID",
						paidAmount: Number(webhookData.totalAmount) || payment.amount,
					},
				});

				// Update registration status if this is a registration payment
				if (payment.registrationId) {
					await tx.registration.update({
						where: { id: payment.registrationId },
						data: {
							status: "PAYMENT_COMPLETED",
							paidAmount: Number(webhookData.totalAmount) || payment.amount,
							completedAt: new Date(),
						},
					});
				}

				return {
					payment: updatedPayment,
					invoice: updatedInvoice,
				};
			});

			// Destructure useful fields early
			const student = payment.invoice?.student;
			const parentPhone = student?.parents?.[0]?.parent?.user?.phone;

			if (!parentPhone) {
				console.warn("Parent phone number not available, SMS not sent.");
				return NextResponse.json({
					message: "Payment verified but parent phone is missing",
					status: "PARTIALLY_COMPLETED",
					paymentId: result.payment.id,
				});
			}

			const studentName = `${student.user?.firstName || ""} ${
				student.user?.lastName || ""
			}`.trim();
			const studentId = student.studentId;
			const paymentAmount = Number(payment.amount);
			const paidAmount = Number(payment.invoice?.paidAmount) || paymentAmount;
			const discountAmount = Number(payment.invoice?.discountAmount) || 0;
			console.log("Payment details:", {
				studentName,
				studentId,
				paymentAmount,
				payment,
				paidAmount,
				discountAmount,
			});
			const registration = payment.invoice?.student?.registration;

			const registrationNumber = registration?.registrationNumber || "N/A";
			const gradeName = registration?.grade?.name || "Not Assigned";

			try {
				await smsService.sendPaymentConfirmation(
					parentPhone,
					studentName,
					studentId,
					paymentAmount,
					"Online Payment"
				);

				await smsService.sendEnhancedRegistrationConfirmation(
					parentPhone,
					studentName,
					studentId,
					registrationNumber,
					paidAmount,
					gradeName,
					discountAmount
				);

				console.log("SMS notifications sent to:", parentPhone);
			} catch (error) {
				console.error("Failed to send SMS notifications:", error);
			}

			console.log("Payment verified successfully:", result.payment.id);

			return NextResponse.json({
				message: "Payment verified successfully",
				status: "COMPLETED",
				// paymentId: result.payment.id,
			});
		} else if (
			webhookData.Status === "FAILED" ||
			webhookData.message?.toLowerCase().includes("failed")
		) {
			// Handle failed payments
			const payment = await prisma.payment.findFirst({
				where: {
					OR: [
						{ transactionId: webhookData.thirdPartyId },
						{ transactionId: webhookData.txnId },
						{ transactionId: webhookData.clientReference },
					],
				},
				include: {
					invoice: true,
				},
			});

			if (payment) {
				await prisma.payment.update({
					where: { id: payment.id },
					data: {
						status: "FAILED",
						notes: `${payment.notes || ""} | Payment failed: ${
							webhookData.message || "Unknown error"
						}`,
					},
				});

				console.log("Payment marked as failed:", payment.id);
			}

			return NextResponse.json({
				message: "Payment failure recorded",
				status: "FAILED",
			});
		} else {
			// Handle other payment statuses (PENDING, PROCESSING, etc.)
			console.log("Payment webhook received with status:", webhookData.Status);

			return NextResponse.json({
				message: "Payment status noted",
				status: webhookData.Status,
			});
		}
	} catch (error) {
		console.error("Webhook processing error:", error);
		return NextResponse.json(
			{ message: "Webhook processing failed" },
			{ status: 500 }
		);
	}
}
