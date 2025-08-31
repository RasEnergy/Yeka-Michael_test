"use server";

import { prisma } from "@/lib/prisma";
import santimpay from "@/utils/santimpay";
import type { PaymentSchema } from "@/lib/formValidationSchemas";

export const processPayment = async (data: PaymentSchema) => {
	// const thirdPartyId = Math.floor(100000 + Math.random() * 900000).toString();
	const notifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment-webhook`;
	const successRedirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`;
	const failureRedirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failure`;
	const cancelRedirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel`;

	console.log("Processing payment with data:", {
		data,
		// thirdPartyId,
		notifyUrl,
		successRedirectUrl,
		failureRedirectUrl,
		cancelRedirectUrl,
	});

	try {
		// Find the invoice and related payment
		const invoice = await prisma.invoice.findUnique({
			where: { id: data.invoiceId },
			include: {
				payments: {
					where: { status: "PENDING" },
					orderBy: { createdAt: "desc" },
					take: 1,
				},
				student: {
					include: {
						user: true,
					},
				},
			},
		});
		// Check if invoice exists
		console.log("Found invoice:", invoice);

		if (!invoice) {
			return { success: false, error: "Invoice not found" };
		}

		if (invoice.status === "PAID") {
			return { success: false, error: "Invoice already paid" };
		}

		let payment = invoice.payments[0];

		// Create or update payment record
		if (!payment) {
			// Generate payment number
			const paymentCount = await prisma.payment.count();
			const paymentNumber = `PAY-${Date.now()}-${(paymentCount + 1)
				.toString()
				.padStart(4, "0")}`;

			payment = await prisma.payment.create({
				data: {
					paymentNumber,
					invoiceId: data.invoiceId,
					studentId: invoice.studentId,
					registrationId: invoice.registrationId,
					amount: Number(data.amount),
					paymentMethod: "ONLINE",
					status: "PENDING",
					notes: data.reason,
					branchId: invoice.branchId,
				},
			});
		}

		const thirdPartyId = invoice.invoiceNumber;

		// Update payment with thirdPartyId
		const updatedPayment = await prisma.payment.update({
			where: { id: payment.id },
			data: {
				transactionId: thirdPartyId,
				notes: `${payment.notes || ""} | ThirdPartyId: ${thirdPartyId}`,
			},
		});

		console.log({
			thirdPartyId,
			paymentId: updatedPayment.id,
		});

		// Generate payment URL
		const paymentUrl = await santimpay.generatePaymentUrl(
			thirdPartyId,
			Number(data.amount),
			// Number("1"),
			data.reason,
			successRedirectUrl,
			failureRedirectUrl,
			notifyUrl,
			data.phoneNumber,
			cancelRedirectUrl
		);

		return { success: true, paymentId: updatedPayment.id, paymentUrl };
	} catch (err: any) {
		console.error("Payment processing error:", err);
		return { success: false, error: "An unexpected error occurred" };
	}
};
