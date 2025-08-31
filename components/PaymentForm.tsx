"use client";

import type React from "react";
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { paymentSchema, type PaymentSchema } from "@/lib/formValidationSchemas";
import { processPayment } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Loader2, Shield, Info, Phone } from "lucide-react";

interface PaymentFormProps {
	invoiceId: string;
	totalAmount: number;
	parentId: string;
	branchId: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
	invoiceId,
	totalAmount,
	parentId,
	branchId,
}) => {
	const [isProcessing, setIsProcessing] = useState(false);
	const router = useRouter();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<PaymentSchema>({
		resolver: zodResolver(paymentSchema),
		defaultValues: {
			amount: totalAmount.toFixed(2),
			invoiceId,
			branchId,
			parentId,
			reason: `Payment for Invoice #${invoiceId}`,
		},
	});

	const onSubmit = useCallback(async (data: PaymentSchema) => {
		console.log("Form submitted with data:", data);
		setIsProcessing(true);
		try {
			// Format the phone number to include the +251 prefix
			const formattedData = {
				...data,
				phoneNumber: data.phoneNumber.startsWith("+251")
					? data.phoneNumber
					: `+251${data.phoneNumber}`,
			};

			const result = await processPayment(formattedData);
			console.log("Payment process result:", result);

			if (result.success && result.paymentUrl) {
				// Redirect to payment gateway
				window.location.href = result.paymentUrl;
			} else {
				toast.error(
					result.error || "Payment processing failed. Please try again."
				);
			}
		} catch (error) {
			console.error("Error processing payment:", error);
			toast.error("An unexpected error occurred. Please try again.");
		} finally {
			setIsProcessing(false);
		}
	}, []);

	return (
		<Card className="w-full shadow-sm border-slate-200">
			<CardHeader className="bg-slate-50 border-b border-slate-200">
				<CardTitle className="flex items-center text-lg md:text-xl text-slate-900">
					<CreditCard className="mr-2 h-5 w-5 text-blue-600" />
					Payment Details
				</CardTitle>
			</CardHeader>
			<CardContent className="py-6 bg-white shadow-lg">
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					{/* Amount Display */}
					<div className="space-y-2">
						<Label htmlFor="amount" className="text-slate-700 font-medium">
							Amount (ETB)
						</Label>
						<div className="relative">
							<Input
								id="amount"
								type="number"
								step="0.01"
								{...register("amount")}
								disabled
								className="bg-blue-50 border-blue-200 font-semibold text-lg text-blue-900 cursor-not-allowed"
							/>
							<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
								<span className="text-blue-600 font-bold">ETB</span>
							</div>
						</div>
						{errors.amount && (
							<p className="text-sm text-red-600 flex items-center gap-1">
								<Info className="h-3 w-3" />
								{errors.amount.message}
							</p>
						)}
					</div>

					<input type="hidden" {...register("branchId")} />

					{/* Phone Number Input */}
					<div className="space-y-2">
						<Label
							htmlFor="phoneNumber"
							className="text-slate-700 font-medium flex items-center gap-2">
							<Phone className="h-4 w-4 text-slate-600" />
							Mobile Money Number
						</Label>
						<div className="flex">
							<div className="bg-slate-100 flex items-center px-4 border border-r-0 border-slate-300 rounded-l-md text-sm font-medium text-slate-700">
								+251
							</div>
							<Input
								id="phoneNumber"
								type="tel"
								placeholder="9xxxxxxxx"
								className="rounded-l-none text-gray-900 border-slate-300 focus:border-blue-500 focus:ring-blue-500 bg-slate-50"
								{...register("phoneNumber", {
									onChange: (e) => {
										// Remove any non-digit characters
										let value = e.target.value.replace(/\D/g, "");
										// Remove the prefix if the user entered it
										if (value.startsWith("251")) {
											value = value.substring(3);
										}
										// Remove leading zero if present
										if (value.startsWith("0")) {
											value = value.substring(1);
										}
										// Ensure the value starts with 9 and limit to 9 digits
										if (value && !value.startsWith("9")) {
											value = "9" + value.substring(0, 8);
										}
										// Limit to 9 digits
										if (value.length > 9) {
											value = value.substring(0, 9);
										}
										// Update the input value
										e.target.value = value;
									},
								})}
							/>
						</div>
						{errors.phoneNumber && (
							<p className="text-sm text-red-600 flex items-center gap-1">
								<Info className="h-3 w-3" />
								{errors.phoneNumber.message}
							</p>
						)}
						<p className="text-xs text-slate-500 flex items-center gap-1">
							<Info className="h-3 w-3" />
							Enter your mobile money number (e.g., 912345678)
						</p>
					</div>

					{/* Payment Description */}
					<div className="space-y-2">
						<Label htmlFor="reason" className="text-slate-700 font-medium">
							Payment Description
						</Label>
						<Input
							id="reason"
							type="text"
							{...register("reason")}
							className="bg-slate-50 text-gray-900 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
							readOnly
						/>
						{errors.reason && (
							<p className="text-sm text-red-600 flex items-center gap-1">
								<Info className="h-3 w-3" />
								{errors.reason.message}
							</p>
						)}
					</div>

					<input type="hidden" {...register("invoiceId")} />
					<input type="hidden" {...register("parentId")} />

					{/* Payment Information Alert */}
					{/* <Alert className="border-blue-200 bg-blue-50">
						<Shield className="h-4 w-4 text-blue-600" />
						<AlertDescription className="text-blue-800">
							<div className="space-y-1">
								<p className="font-medium">Secure Payment Process</p>
								<p className="text-sm">
									You will be redirected to SantimPay to complete your payment
									securely.
								</p>
							</div>
						</AlertDescription>
					</Alert> */}

					{/* Payment Button */}
					<Button
						type="submit"
						className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
						disabled={isProcessing}>
						{isProcessing ? (
							<>
								<Loader2 className="mr-2 h-5 w-5 animate-spin" />
								Processing Payment...
							</>
						) : (
							<>
								<CreditCard className="mr-2 h-5 w-5" />
								Pay Now - ETB {totalAmount.toLocaleString()}
							</>
						)}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
};

export default PaymentForm;
// "use client";

// import type React from "react";
// import { useState, useCallback } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";
// import { paymentSchema, type PaymentSchema } from "@/lib/formValidationSchemas";
// import { processPayment } from "@/lib/actions";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { CreditCard, Loader2 } from "lucide-react";

// interface PaymentFormProps {
// 	invoiceId: string;
// 	totalAmount: number;
// 	parentId: string;
// 	branchId: string;
// }

// const PaymentForm: React.FC<PaymentFormProps> = ({
// 	invoiceId,
// 	totalAmount,
// 	parentId,
// 	branchId,
// }) => {
// 	const [isProcessing, setIsProcessing] = useState(false);
// 	const router = useRouter();

// 	const {
// 		register,
// 		handleSubmit,
// 		formState: { errors },
// 	} = useForm<PaymentSchema>({
// 		resolver: zodResolver(paymentSchema),
// 		defaultValues: {
// 			amount: totalAmount.toFixed(2),
// 			invoiceId,
// 			branchId,
// 			parentId,
// 			reason: `Payment for Invoice #${invoiceId}`,
// 		},
// 	});

// 	const onSubmit = useCallback(async (data: PaymentSchema) => {
// 		console.log("Form submitted with data:", data);
// 		setIsProcessing(true);
// 		try {
// 			// Format the phone number to include the +251 prefix
// 			const formattedData = {
// 				...data,
// 				phoneNumber: data.phoneNumber.startsWith("+251")
// 					? data.phoneNumber
// 					: `+251${data.phoneNumber}`,
// 			};

// 			const result = await processPayment(formattedData);
// 			console.log("Payment process result:", result);

// 			if (result.success && result.paymentUrl) {
// 				// Redirect to payment gateway
// 				window.location.href = result.paymentUrl;
// 			} else {
// 				toast.error(
// 					result.error || "Payment processing failed. Please try again."
// 				);
// 			}
// 		} catch (error) {
// 			console.error("Error processing payment:", error);
// 			toast.error("An unexpected error occurred. Please try again.");
// 		} finally {
// 			setIsProcessing(false);
// 		}
// 	}, []);

// 	return (
// 		<Card className="w-full max-w-md mx-auto">
// 			<CardHeader>
// 				<CardTitle className="flex items-center text-lg md:text-xl">
// 					<CreditCard className="mr-2 h-5 w-5" />
// 					Payment Details
// 				</CardTitle>
// 			</CardHeader>
// 			<CardContent>
// 				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
// 					<div className="space-y-2">
// 						<Label htmlFor="amount">Amount (ETB)</Label>
// 						<Input
// 							id="amount"
// 							type="number"
// 							step="0.01"
// 							{...register("amount")}
// 							disabled
// 							className="bg-gray-100 font-semibold text-lg"
// 						/>
// 						{errors.amount && (
// 							<p className="text-sm text-red-500">{errors.amount.message}</p>
// 						)}
// 					</div>

// 					<input type="hidden" {...register("branchId")} />

// 					<div className="space-y-2">
// 						<Label htmlFor="phoneNumber">Phone Number</Label>
// 						<div className="flex">
// 							<div className="bg-gray-100 flex items-center px-3 border border-r-0 rounded-l-md text-sm">
// 								+251
// 							</div>
// 							<Input
// 								id="phoneNumber"
// 								type="tel"
// 								placeholder="9xxxxxxxx"
// 								className="rounded-l-none"
// 								{...register("phoneNumber", {
// 									onChange: (e) => {
// 										// Remove any non-digit characters
// 										let value = e.target.value.replace(/\D/g, "");

// 										// Remove the prefix if the user entered it
// 										if (value.startsWith("251")) {
// 											value = value.substring(3);
// 										}

// 										// Remove leading zero if present
// 										if (value.startsWith("0")) {
// 											value = value.substring(1);
// 										}

// 										// Ensure the value starts with 9 and limit to 9 digits
// 										if (value && !value.startsWith("9")) {
// 											value = "9" + value.substring(0, 8);
// 										}

// 										// Limit to 9 digits
// 										if (value.length > 9) {
// 											value = value.substring(0, 9);
// 										}

// 										// Update the input value
// 										e.target.value = value;
// 									},
// 								})}
// 							/>
// 						</div>
// 						{errors.phoneNumber && (
// 							<p className="text-sm text-red-500">
// 								{errors.phoneNumber.message}
// 							</p>
// 						)}
// 						<p className="text-xs text-gray-500">
// 							Enter your mobile money number (e.g., 912345678)
// 						</p>
// 					</div>

// 					<div className="space-y-2">
// 						<Label htmlFor="reason">Payment Description</Label>
// 						<Input
// 							id="reason"
// 							type="text"
// 							{...register("reason")}
// 							className="bg-gray-50"
// 						/>
// 						{errors.reason && (
// 							<p className="text-sm text-red-500">{errors.reason.message}</p>
// 						)}
// 					</div>

// 					<input type="hidden" {...register("invoiceId")} />
// 					<input type="hidden" {...register("parentId")} />

// 					<Button type="submit" className="w-full" disabled={isProcessing}>
// 						{isProcessing ? (
// 							<>
// 								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
// 								Processing Payment...
// 							</>
// 						) : (
// 							<>
// 								<CreditCard className="mr-2 h-4 w-4" />
// 								Pay Now - ETB {totalAmount.toLocaleString()}
// 							</>
// 						)}
// 					</Button>

// 					<div className="text-xs text-gray-500 text-center mt-4">
// 						<p>Secure payment powered by SantimPay</p>
// 						<p>You will be redirected to complete your payment</p>
// 					</div>
// 				</form>
// 			</CardContent>
// 		</Card>
// 	);
// };

// export default PaymentForm;
