"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	CreditCard,
	Banknote,
	Smartphone,
	Building,
	AlertCircle,
	Calculator,
	Receipt,
	CheckCircle,
	ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Registration {
	id: string;
	registrationNumber: string;
	status: string;
	paymentOption: string | null;
	registrationFee: number;
	additionalFee: number | null;
	totalAmount: number;
	paymentDueDate: string;
	student: {
		studentId: string;
		studentType: string;
		user: {
			firstName: string;
			lastName: string;
			email: string;
			phone?: string;
		};
		parents: Array<{
			parent: {
				user: {
					firstName: string;
					lastName: string;
					phone: string;
				};
			};
		}>;
	};
	branch: {
		name: string;
		code: string;
	};
	grade: {
		name: string;
		level: number;
	} | null;
}

export default function RegistrationPaymentPage() {
	const params = useParams();
	const router = useRouter();
	const [registration, setRegistration] = useState<Registration | null>(null);
	const [loading, setLoading] = useState(true);
	const [processing, setProcessing] = useState(false);
	const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
	const [discountPercentage, setDiscountPercentage] = useState(0);
	const [receiptNumber, setReceiptNumber] = useState("");
	const [transactionNumber, setTransactionNumber] = useState("");
	const [paidAmount, setPaidAmount] = useState("");
	const [notes, setNotes] = useState("");
	const [paymentDate, setPaymentDate] = useState(
		new Date().toISOString().slice(0, 10)
	);

	useEffect(() => {
		fetchRegistration();
	}, [params.id]);

	const fetchRegistration = async () => {
		try {
			const response = await fetch(
				`/api/registration/payment?registrationId=${params.id}`
			);
			const data = await response.json();
			if (response.ok) {
				setRegistration(data.registration);
				const totalAmount = calculateTotalAmount(data.registration, 0);
				setPaidAmount(totalAmount.toString());
			} else {
				toast.error(data.error || "Failed to load registration");
			}
		} catch (error) {
			console.error("Failed to fetch registration:", error);
			toast.error("Failed to load registration");
		} finally {
			setLoading(false);
		}
	};

	const calculateTotalAmount = (
		reg: Registration | null,
		discount: number = discountPercentage
	) => {
		if (!reg) return 0;
		const registrationFee = Number(reg.registrationFee) || 0;
		const additionalFee = Number(reg.additionalFee) || 0;
		const baseTotal = registrationFee + additionalFee;
		return baseTotal;
	};

	const calculateAmounts = () => {
		if (!registration)
			return {
				registrationFee: 0,
				additionalFee: 0,
				baseTotal: 0,
				discountAmount: 0,
				finalAmount: 0,
			};

		const registrationFee = Number(registration.registrationFee) || 0;
		const additionalFee = Number(registration.additionalFee) || 0;
		const baseTotal = registrationFee + additionalFee;
		const discountAmount = (baseTotal * discountPercentage) / 100;
		const finalAmount = baseTotal - discountAmount;

		return {
			registrationFee,
			additionalFee,
			baseTotal,
			discountAmount,
			finalAmount,
		};
	};

	const handleDiscountChange = (value: string) => {
		const percentage = Math.max(0, Math.min(100, Number(value) || 0));
		setDiscountPercentage(percentage);
		if (
			selectedPaymentMethod === "CASH" ||
			selectedPaymentMethod === "BANK_TRANSFER"
		) {
			const { finalAmount } = calculateAmounts();
			const newFinalAmount =
				calculateTotalAmount(registration, percentage) -
				(calculateTotalAmount(registration, percentage) * percentage) / 100;
			setPaidAmount(newFinalAmount.toString());
		}
	};

	const handlePaymentMethodChange = (method: string) => {
		setSelectedPaymentMethod(method);
		setReceiptNumber("");
		setTransactionNumber("");
		if (method === "CASH" || method === "BANK_TRANSFER") {
			const { finalAmount } = calculateAmounts();
			setPaidAmount(finalAmount.toString());
		}
	};

	const validateForm = () => {
		if (!selectedPaymentMethod) {
			toast.error("Please select a payment method");
			return false;
		}
		if (
			selectedPaymentMethod === "CASH" ||
			selectedPaymentMethod === "BANK_TRANSFER"
		) {
			if (!receiptNumber && !transactionNumber) {
				toast.error(
					"Please enter either a receipt number or transaction number"
				);
				return false;
			}
			if (!paidAmount || Number(paidAmount) <= 0) {
				toast.error("Please enter a valid paid amount");
				return false;
			}
		}
		return true;
	};

	const handleCompletePayment = async () => {
		if (!validateForm()) return;

		try {
			setProcessing(true);
			const response = await fetch("/api/registration/payment", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					registrationId: params.id,
					paymentMethod: selectedPaymentMethod,
					discountPercentage,
					receiptNumber: receiptNumber || undefined,
					transactionNumber: transactionNumber || undefined,
					paidAmount:
						selectedPaymentMethod === "CASH" ||
						selectedPaymentMethod === "BANK_TRANSFER"
							? Number(paidAmount)
							: undefined,
					paymentDate:
						selectedPaymentMethod === "CASH" ||
						selectedPaymentMethod === "BANK_TRANSFER"
							? paymentDate
							: new Date().toISOString(),
					notes: notes || undefined,
				}),
			});

			const data = await response.json();
			if (response.ok) {
				// If payment is successful, redirect to success page
				console.log("Payment successful:", data);
				toast.success("Payment completed successfully!");
				router.push(
					data.redirectTo || `/registration/success/${data.registration.id}`
				);

				// router.push(`/registration/success/${data.registration.id}`);
			} else {
				toast.error(data.error || "Payment failed");
			}
			// if (response.ok) {
			// 	toast.success("Payment completed successfully!");
			// 	router.push(`/registration/success/${data.registration.id}`);
			// } else {
			// 	toast.error(data.error || "Payment failed");
			// }
		} catch (error) {
			console.error("Payment error:", error);
			toast.error("Payment failed. Please try again.");
		} finally {
			setProcessing(false);
		}
	};

	if (loading || !registration) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">
						Loading registration details...
					</p>
				</div>
			</div>
		);
	}

	const {
		registrationFee,
		additionalFee,
		baseTotal,
		discountAmount,
		finalAmount,
	} = calculateAmounts();

	const isOverdue = new Date(registration.paymentDueDate) < new Date();
	const isPaymentCompleted =
		registration.status === "PAYMENT_COMPLETED" ||
		registration.status === "PAID";

	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-4xl mx-auto p-4 space-y-6">
				{/* Header */}
				<div className="flex items-center gap-4 mb-6">
					<Link href="/dashboard/students">
						<Button variant="ghost" size="icon">
							<ArrowLeft className="h-4 w-4" />
						</Button>
					</Link>
					<div className="text-center flex-1">
						<h1 className="text-3xl font-bold text-foreground mb-2">
							Complete Registration Payment
						</h1>
						<p className="text-muted-foreground">
							Registration #{registration.registrationNumber}
						</p>
					</div>
				</div>

				{/* Payment Completed Alert */}
				{isPaymentCompleted && (
					<Alert className="border-green-200 bg-green-50">
						<CheckCircle className="h-4 w-4 text-green-600" />
						<AlertDescription>
							<div className="space-y-2">
								<p className="font-medium text-green-800">
									Payment Already Completed!
								</p>
								<p className="text-green-700">
									This registration has been paid and is now complete. No
									further payment is required.
								</p>
							</div>
						</AlertDescription>
					</Alert>
				)}

				{/* Overdue Alert */}
				{isOverdue && !isPaymentCompleted && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							This payment is overdue. Due date was{" "}
							{new Date(registration.paymentDueDate).toLocaleDateString()}.
						</AlertDescription>
					</Alert>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Student Information */}
					<Card>
						<CardHeader>
							<CardTitle className="text-foreground">
								Student Information
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label className="text-sm font-medium text-muted-foreground">
										Student Name
									</Label>
									<p className="font-medium text-foreground">
										{registration.student.user.firstName}{" "}
										{registration.student.user.lastName}
									</p>
								</div>
								<div>
									<Label className="text-sm font-medium text-muted-foreground">
										Student ID
									</Label>
									<p className="font-medium text-foreground">
										{registration.student.studentId}
									</p>
								</div>
								<div>
									<Label className="text-sm font-medium text-muted-foreground">
										Branch
									</Label>
									<p className="font-medium text-foreground">
										{registration.branch.name}
									</p>
								</div>
								<div>
									<Label className="text-sm font-medium text-muted-foreground">
										Grade
									</Label>
									<p className="font-medium text-foreground">
										{registration.grade?.name || "Not Assigned"}
									</p>
								</div>
								<div>
									<Label className="text-sm font-medium text-muted-foreground">
										Student Type
									</Label>
									<Badge variant="outline">
										{registration.student.studentType.replace("_", " ")}
									</Badge>
								</div>
								<div>
									<Label className="text-sm font-medium text-muted-foreground">
										Status
									</Label>
									<Badge variant={isPaymentCompleted ? "default" : "secondary"}>
										{registration.status.replace("_", " ")}
									</Badge>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Payment Details */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-foreground">
								<Calculator className="h-5 w-5" />
								Payment Summary
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<div className="flex justify-between">
									<span className="text-muted-foreground">
										Registration Fee
									</span>
									<span className="text-foreground">
										ETB {registrationFee.toLocaleString()}
									</span>
								</div>
								{additionalFee > 0 && (
									<div className="flex justify-between">
										<span className="text-muted-foreground">
											Additional Fee
										</span>
										<span className="text-foreground">
											ETB {additionalFee.toLocaleString()}
										</span>
									</div>
								)}
								<div className="flex justify-between font-medium">
									<span className="text-foreground">Total Amount</span>
									<span className="text-foreground">
										ETB {baseTotal.toLocaleString()}
									</span>
								</div>
								{isPaymentCompleted && (
									<div className="flex justify-between text-green-600 font-medium">
										<span>Status</span>
										<span>PAID</span>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Payment Form - Only show if payment not completed */}
				{!isPaymentCompleted && (
					<>
						{/* Discount Input */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-foreground">
									<Calculator className="h-5 w-5" />
									Payment Calculation
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<Label htmlFor="discount">Discount Percentage (%)</Label>
									<Input
										id="discount"
										type="number"
										min="0"
										max="100"
										value={discountPercentage}
										onChange={(e) => handleDiscountChange(e.target.value)}
										placeholder="Enter discount percentage"
									/>
								</div>
								<Separator />
								<div className="space-y-2">
									<div className="flex justify-between">
										<span className="text-muted-foreground">
											Registration Fee
										</span>
										<span className="text-foreground">
											ETB {registrationFee.toLocaleString()}
										</span>
									</div>
									{additionalFee > 0 && (
										<div className="flex justify-between">
											<span className="text-muted-foreground">
												Additional Fee
											</span>
											<span className="text-foreground">
												ETB {additionalFee.toLocaleString()}
											</span>
										</div>
									)}
									<div className="flex justify-between font-medium">
										<span className="text-foreground">Subtotal</span>
										<span className="text-foreground">
											ETB {baseTotal.toLocaleString()}
										</span>
									</div>
									{discountAmount > 0 && (
										<div className="flex justify-between text-green-600">
											<span>Discount ({discountPercentage}%)</span>
											<span>- ETB {discountAmount.toLocaleString()}</span>
										</div>
									)}
									<Separator />
									<div className="flex justify-between text-lg font-bold text-foreground">
										<span>Total Amount</span>
										<span>ETB {finalAmount.toLocaleString()}</span>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Payment Method Selection */}
						<Card>
							<CardHeader>
								<CardTitle className="text-foreground">
									Payment Method
								</CardTitle>
								<CardDescription>
									Select how you want to complete the payment
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
									<Button
										variant={
											selectedPaymentMethod === "CASH" ? "default" : "outline"
										}
										className="h-20 flex-col"
										onClick={() => handlePaymentMethodChange("CASH")}>
										<Banknote className="h-6 w-6 mb-2" />
										Cash Payment
									</Button>
									<Button
										variant={
											selectedPaymentMethod === "BANK_TRANSFER"
												? "default"
												: "outline"
										}
										className="h-20 flex-col"
										onClick={() => handlePaymentMethodChange("BANK_TRANSFER")}>
										<Building className="h-6 w-6 mb-2" />
										Bank Transfer
									</Button>
									{/* <Button
										variant={
											selectedPaymentMethod === "TELEBIRR"
												? "default"
												: "outline"
										}
										className="h-20 flex-col"
										onClick={() => handlePaymentMethodChange("TELEBIRR")}>
										<Smartphone className="h-6 w-6 mb-2" />
										TeleBirr
									</Button> */}
									<Button
										variant={
											selectedPaymentMethod === "ONLINE" ? "default" : "outline"
										}
										className="h-20 flex-col"
										onClick={() => handlePaymentMethodChange("ONLINE")}>
										<CreditCard className="h-6 w-6 mb-2" />
										Online Payment
									</Button>
								</div>

								{/* Additional Fields for Cash/Bank Transfer */}
								{(selectedPaymentMethod === "CASH" ||
									selectedPaymentMethod === "BANK_TRANSFER") && (
									<div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
										<h4 className="font-medium flex items-center gap-2 text-foreground">
											<Receipt className="h-4 w-4" />
											Payment Verification Required
										</h4>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<Label htmlFor="receiptNumber">Receipt Number</Label>
												<Input
													id="receiptNumber"
													value={receiptNumber}
													onChange={(e) => setReceiptNumber(e.target.value)}
													placeholder="Enter receipt number"
												/>
											</div>
											<div>
												<Label htmlFor="transactionNumber">
													Transaction Number
												</Label>
												<Input
													id="transactionNumber"
													value={transactionNumber}
													onChange={(e) => setTransactionNumber(e.target.value)}
													placeholder="Enter transaction number"
												/>
											</div>
										</div>
										<div>
											<Label htmlFor="paidAmount">Paid Amount (ETB) *</Label>
											<Input
												id="paidAmount"
												type="number"
												value={paidAmount}
												onChange={(e) => setPaidAmount(e.target.value)}
												placeholder="Enter actual paid amount"
												required
											/>
											<p className="text-sm text-muted-foreground mt-1">
												Expected amount: ETB {finalAmount.toLocaleString()}
											</p>
										</div>
										<div>
											<Label htmlFor="notes">Notes (Optional)</Label>
											<Textarea
												id="notes"
												value={notes}
												onChange={(e) => setNotes(e.target.value)}
												placeholder="Additional notes about the payment"
												rows={3}
											/>
										</div>
										<div>
											<Label htmlFor="paymentDate">Payment Date *</Label>
											<Input
												id="paymentDate"
												type="date"
												value={paymentDate}
												onChange={(e) => setPaymentDate(e.target.value)}
												required
											/>
										</div>

										<Alert>
											<AlertCircle className="h-4 w-4" />
											<AlertDescription>
												Please provide either a receipt number or transaction
												number to verify the payment.
											</AlertDescription>
										</Alert>
									</div>
								)}

								{/* Online Payment Info */}
								{(selectedPaymentMethod === "TELEBIRR" ||
									selectedPaymentMethod === "ONLINE") && (
									<Alert>
										<AlertCircle className="h-4 w-4" />
										<AlertDescription>
											You will be redirected to the payment gateway to complete
											your payment securely.
										</AlertDescription>
									</Alert>
								)}
							</CardContent>
						</Card>

						{/* Complete Payment Button */}
						<Card>
							<CardContent className="pt-6">
								<div className="flex flex-col sm:flex-row justify-between items-center gap-4">
									<div>
										<p className="text-lg font-semibold text-foreground">
											Total to Pay: ETB {finalAmount.toLocaleString()}
										</p>
										{discountAmount > 0 && (
											<p className="text-sm text-green-600">
												You save ETB {discountAmount.toLocaleString()}
											</p>
										)}
									</div>
									<Button
										onClick={handleCompletePayment}
										disabled={!selectedPaymentMethod || processing}
										size="lg"
										className="min-w-[200px]">
										{processing ? (
											<>
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
												Processing...
											</>
										) : (
											<>
												<CreditCard className="h-4 w-4 mr-2" />
												Complete Payment
											</>
										)}
									</Button>
								</div>
							</CardContent>
						</Card>
					</>
				)}

				{/* Payment Completed Message */}
				{isPaymentCompleted && (
					<Card>
						<CardContent className="pt-6">
							<div className="text-center space-y-4">
								<CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
								<div>
									<h3 className="text-xl font-semibold text-green-700">
										Payment Completed Successfully!
									</h3>
									<p className="text-muted-foreground">
										Registration #{registration.registrationNumber} has been
										paid and processed.
									</p>
								</div>
								<Button
									onClick={() => router.push("/dashboard/students")}
									className="mt-4">
									Return to Dashboard
								</Button>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}

// "use client";

// import { useState, useEffect } from "react";
// import { useParams, useRouter } from "next/navigation";
// import {
// 	Card,
// 	CardContent,
// 	CardDescription,
// 	CardHeader,
// 	CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import {
// 	CreditCard,
// 	Banknote,
// 	Smartphone,
// 	Building,
// 	AlertCircle,
// 	Calculator,
// 	Receipt,
// 	CheckCircle,
// } from "lucide-react";
// import { toast } from "sonner";

// interface Registration {
// 	id: string;
// 	registrationNumber: string;
// 	status: string;
// 	paymentOption: string | null;
// 	registrationFee: number;
// 	additionalFee: number | null;
// 	totalAmount: number;
// 	paymentDueDate: string;
// 	student: {
// 		studentId: string;
// 		studentType: string;
// 		user: {
// 			firstName: string;
// 			lastName: string;
// 			email: string;
// 			phone?: string;
// 		};
// 		parents: Array<{
// 			parent: {
// 				user: {
// 					firstName: string;
// 					lastName: string;
// 					phone: string;
// 				};
// 			};
// 		}>;
// 	};
// 	branch: {
// 		name: string;
// 		code: string;
// 	};
// 	grade: {
// 		name: string;
// 		level: number;
// 	} | null;
// }

// export default function RegistrationPaymentPage() {
// 	const params = useParams();
// 	const router = useRouter();
// 	const [registration, setRegistration] = useState<Registration | null>(null);
// 	const [loading, setLoading] = useState(true);
// 	const [processing, setProcessing] = useState(false);
// 	const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
// 	const [discountPercentage, setDiscountPercentage] = useState(0);
// 	const [receiptNumber, setReceiptNumber] = useState("");
// 	const [transactionNumber, setTransactionNumber] = useState("");
// 	const [paidAmount, setPaidAmount] = useState("");
// 	const [notes, setNotes] = useState("");

// 	useEffect(() => {
// 		fetchRegistration();
// 	}, [params.id]);

// 	const fetchRegistration = async () => {
// 		try {
// 			const response = await fetch(
// 				`/api/registration/payment?registrationId=${params.id}`
// 			);
// 			const data = await response.json();

// 			if (response.ok) {
// 				setRegistration(data.registration);
// 				// Set default paid amount to calculated total amount (including additionalFee)
// 				const totalAmount = calculateTotalAmount(data.registration, 0);
// 				setPaidAmount(totalAmount.toString());
// 			} else {
// 				toast.error(data.error || "Failed to load registration");
// 			}
// 		} catch (error) {
// 			console.error("Failed to fetch registration:", error);
// 			toast.error("Failed to load registration");
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	const calculateTotalAmount = (
// 		reg: Registration | null,
// 		discount: number = discountPercentage
// 	) => {
// 		if (!reg) return 0;

// 		// Calculate base total including additionalFee
// 		const registrationFee = Number(reg.registrationFee) || 0;
// 		const additionalFee = Number(reg.additionalFee) || 0;
// 		const baseTotal = registrationFee + additionalFee;

// 		return baseTotal;
// 	};

// 	const calculateAmounts = () => {
// 		if (!registration)
// 			return {
// 				registrationFee: 0,
// 				additionalFee: 0,
// 				baseTotal: 0,
// 				discountAmount: 0,
// 				finalAmount: 0,
// 			};

// 		const registrationFee = Number(registration.registrationFee) || 0;
// 		const additionalFee = Number(registration.additionalFee) || 0;
// 		const baseTotal = registrationFee + additionalFee;
// 		const discountAmount = (baseTotal * discountPercentage) / 100;
// 		const finalAmount = baseTotal - discountAmount;

// 		return {
// 			registrationFee,
// 			additionalFee,
// 			baseTotal,
// 			discountAmount,
// 			finalAmount,
// 		};
// 	};

// 	const handleDiscountChange = (value: string) => {
// 		const percentage = Math.max(0, Math.min(100, Number(value) || 0));
// 		setDiscountPercentage(percentage);

// 		// Update paid amount for manual payment methods
// 		if (
// 			selectedPaymentMethod === "CASH" ||
// 			selectedPaymentMethod === "BANK_TRANSFER"
// 		) {
// 			const { finalAmount } = calculateAmounts();
// 			const newFinalAmount =
// 				calculateTotalAmount(registration, percentage) -
// 				(calculateTotalAmount(registration, percentage) * percentage) / 100;
// 			setPaidAmount(newFinalAmount.toString());
// 		}
// 	};

// 	const handlePaymentMethodChange = (method: string) => {
// 		setSelectedPaymentMethod(method);

// 		// Reset fields when changing payment method
// 		setReceiptNumber("");
// 		setTransactionNumber("");

// 		// Set paid amount for manual methods
// 		if (method === "CASH" || method === "BANK_TRANSFER") {
// 			const { finalAmount } = calculateAmounts();
// 			setPaidAmount(finalAmount.toString());
// 		}
// 	};

// 	const validateForm = () => {
// 		if (!selectedPaymentMethod) {
// 			toast.error("Please select a payment method");
// 			return false;
// 		}

// 		if (
// 			selectedPaymentMethod === "CASH" ||
// 			selectedPaymentMethod === "BANK_TRANSFER"
// 		) {
// 			if (!receiptNumber && !transactionNumber) {
// 				toast.error(
// 					"Please enter either a receipt number or transaction number"
// 				);
// 				return false;
// 			}

// 			if (!paidAmount || Number(paidAmount) <= 0) {
// 				toast.error("Please enter a valid paid amount");
// 				return false;
// 			}
// 		}

// 		return true;
// 	};

// 	const handleCompletePayment = async () => {
// 		if (!validateForm()) return;

// 		try {
// 			setProcessing(true);
// 			const response = await fetch("/api/registration/payment", {
// 				method: "POST",
// 				headers: {
// 					"Content-Type": "application/json",
// 				},
// 				body: JSON.stringify({
// 					registrationId: params.id,
// 					paymentMethod: selectedPaymentMethod,
// 					discountPercentage,
// 					receiptNumber: receiptNumber || undefined,
// 					transactionNumber: transactionNumber || undefined,
// 					paidAmount:
// 						selectedPaymentMethod === "CASH" ||
// 						selectedPaymentMethod === "BANK_TRANSFER"
// 							? Number(paidAmount)
// 							: undefined,
// 					notes: notes || undefined,
// 				}),
// 			});

// 			const data = await response.json();

// 			if (response.ok) {
// 				toast.success("Payment completed successfully!");
// 				router.push(`/registration/success/${data.registration.id}`);
// 			} else {
// 				toast.error(data.error || "Payment failed");
// 			}
// 		} catch (error) {
// 			console.error("Payment error:", error);
// 			toast.error("Payment failed. Please try again.");
// 		} finally {
// 			setProcessing(false);
// 		}
// 	};

// 	if (loading || !registration) {
// 		return (
// 			<div className="min-h-screen flex items-center justify-center">
// 				<div className="text-center">
// 					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
// 					<p>Loading registration details...</p>
// 				</div>
// 			</div>
// 		);
// 	}

// 	const {
// 		registrationFee,
// 		additionalFee,
// 		baseTotal,
// 		discountAmount,
// 		finalAmount,
// 	} = calculateAmounts();
// 	const isOverdue = new Date(registration.paymentDueDate) < new Date();
// 	const isPaymentCompleted =
// 		registration.status === "PAYMENT_COMPLETED" ||
// 		registration.status === "PAID";

// 	return (
// 		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
// 			<div className="max-w-4xl mx-auto space-y-6">
// 				{/* Header */}
// 				<div className="text-center">
// 					<h1 className="text-3xl font-bold text-gray-900 mb-2">
// 						Complete Registration Payment
// 					</h1>
// 					<p className="text-muted-foreground">
// 						Registration #{registration.registrationNumber}
// 					</p>
// 				</div>

// 				{/* Payment Completed Alert */}
// 				{isPaymentCompleted && (
// 					<Alert>
// 						<CheckCircle className="h-4 w-4" />
// 						<AlertDescription>
// 							<div className="space-y-2">
// 								<p className="font-medium">Payment Already Completed!</p>
// 								<p>
// 									This registration has been paid and is now complete. No
// 									further payment is required.
// 								</p>
// 							</div>
// 						</AlertDescription>
// 					</Alert>
// 				)}

// 				{/* Overdue Alert */}
// 				{isOverdue && !isPaymentCompleted && (
// 					<Alert variant="destructive">
// 						<AlertCircle className="h-4 w-4" />
// 						<AlertDescription>
// 							This payment is overdue. Due date was{" "}
// 							{new Date(registration.paymentDueDate).toLocaleDateString()}.
// 						</AlertDescription>
// 					</Alert>
// 				)}

// 				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// 					{/* Student Information */}
// 					<Card>
// 						<CardHeader>
// 							<CardTitle>Student Information</CardTitle>
// 						</CardHeader>
// 						<CardContent className="space-y-4">
// 							<div className="grid grid-cols-2 gap-4">
// 								<div>
// 									<Label className="text-sm font-medium text-muted-foreground">
// 										Student Name
// 									</Label>
// 									<p className="font-medium">
// 										{registration.student.user.firstName}{" "}
// 										{registration.student.user.lastName}
// 									</p>
// 								</div>
// 								<div>
// 									<Label className="text-sm font-medium text-muted-foreground">
// 										Student ID
// 									</Label>
// 									<p className="font-medium">
// 										{registration.student.studentId}
// 									</p>
// 								</div>
// 								<div>
// 									<Label className="text-sm font-medium text-muted-foreground">
// 										Branch
// 									</Label>
// 									<p className="font-medium">{registration.branch.name}</p>
// 								</div>
// 								<div>
// 									<Label className="text-sm font-medium text-muted-foreground">
// 										Grade
// 									</Label>
// 									<p className="font-medium">
// 										{registration.grade?.name || "Not Assigned"}
// 									</p>
// 								</div>
// 								<div>
// 									<Label className="text-sm font-medium text-muted-foreground">
// 										Student Type
// 									</Label>
// 									<Badge variant="outline">
// 										{registration.student.studentType.replace("_", " ")}
// 									</Badge>
// 								</div>
// 								<div>
// 									<Label className="text-sm font-medium text-muted-foreground">
// 										Status
// 									</Label>
// 									<Badge variant={isPaymentCompleted ? "default" : "secondary"}>
// 										{registration.status.replace("_", " ")}
// 									</Badge>
// 								</div>
// 							</div>
// 						</CardContent>
// 					</Card>

// 					{/* Payment Details */}
// 					<Card>
// 						<CardHeader>
// 							<CardTitle className="flex items-center gap-2">
// 								<Calculator className="h-5 w-5" />
// 								Payment Summary
// 							</CardTitle>
// 						</CardHeader>
// 						<CardContent className="space-y-4">
// 							{/* Amount Breakdown */}
// 							<div className="space-y-2">
// 								<div className="flex justify-between">
// 									<span className="text-muted-foreground">
// 										Registration Fee
// 									</span>
// 									<span>ETB {registrationFee.toLocaleString()}</span>
// 								</div>
// 								{additionalFee > 0 && (
// 									<div className="flex justify-between">
// 										<span className="text-muted-foreground">
// 											Additional Fee
// 										</span>
// 										<span>ETB {additionalFee.toLocaleString()}</span>
// 									</div>
// 								)}
// 								<div className="flex justify-between font-medium">
// 									<span>Total Amount</span>
// 									<span>ETB {baseTotal.toLocaleString()}</span>
// 								</div>
// 								{isPaymentCompleted && (
// 									<div className="flex justify-between text-green-600 font-medium">
// 										<span>Status</span>
// 										<span>PAID</span>
// 									</div>
// 								)}
// 							</div>
// 						</CardContent>
// 					</Card>
// 				</div>

// 				{/* Payment Form - Only show if payment not completed */}
// 				{!isPaymentCompleted && (
// 					<>
// 						{/* Discount Input */}
// 						<Card>
// 							<CardHeader>
// 								<CardTitle className="flex items-center gap-2">
// 									<Calculator className="h-5 w-5" />
// 									Payment Calculation
// 								</CardTitle>
// 							</CardHeader>
// 							<CardContent className="space-y-4">
// 								<div>
// 									<Label htmlFor="discount">Discount Percentage (%)</Label>
// 									<Input
// 										id="discount"
// 										type="number"
// 										min="0"
// 										max="100"
// 										value={discountPercentage}
// 										onChange={(e) => handleDiscountChange(e.target.value)}
// 										placeholder="Enter discount percentage"
// 									/>
// 								</div>

// 								<Separator />

// 								{/* Amount Breakdown with Discount */}
// 								<div className="space-y-2">
// 									<div className="flex justify-between">
// 										<span className="text-muted-foreground">
// 											Registration Fee
// 										</span>
// 										<span>ETB {registrationFee.toLocaleString()}</span>
// 									</div>
// 									{additionalFee > 0 && (
// 										<div className="flex justify-between">
// 											<span className="text-muted-foreground">
// 												Additional Fee
// 											</span>
// 											<span>ETB {additionalFee.toLocaleString()}</span>
// 										</div>
// 									)}
// 									<div className="flex justify-between font-medium">
// 										<span>Subtotal</span>
// 										<span>ETB {baseTotal.toLocaleString()}</span>
// 									</div>
// 									{discountAmount > 0 && (
// 										<div className="flex justify-between text-green-600">
// 											<span>Discount ({discountPercentage}%)</span>
// 											<span>- ETB {discountAmount.toLocaleString()}</span>
// 										</div>
// 									)}
// 									<Separator />
// 									<div className="flex justify-between text-lg font-bold">
// 										<span>Total Amount</span>
// 										<span>ETB {finalAmount.toLocaleString()}</span>
// 									</div>
// 								</div>
// 							</CardContent>
// 						</Card>

// 						{/* Payment Method Selection */}
// 						<Card>
// 							<CardHeader>
// 								<CardTitle>Payment Method</CardTitle>
// 								<CardDescription>
// 									Select how you want to complete the payment
// 								</CardDescription>
// 							</CardHeader>
// 							<CardContent className="space-y-6">
// 								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
// 									<Button
// 										variant={
// 											selectedPaymentMethod === "CASH" ? "default" : "outline"
// 										}
// 										className="h-20 flex-col"
// 										onClick={() => handlePaymentMethodChange("CASH")}>
// 										<Banknote className="h-6 w-6 mb-2" />
// 										Cash Payment
// 									</Button>
// 									<Button
// 										variant={
// 											selectedPaymentMethod === "BANK_TRANSFER"
// 												? "default"
// 												: "outline"
// 										}
// 										className="h-20 flex-col"
// 										onClick={() => handlePaymentMethodChange("BANK_TRANSFER")}>
// 										<Building className="h-6 w-6 mb-2" />
// 										Bank Transfer
// 									</Button>
// 									<Button
// 										variant={
// 											selectedPaymentMethod === "TELEBIRR"
// 												? "default"
// 												: "outline"
// 										}
// 										className="h-20 flex-col"
// 										onClick={() => handlePaymentMethodChange("TELEBIRR")}>
// 										<Smartphone className="h-6 w-6 mb-2" />
// 										TeleBirr
// 									</Button>
// 									<Button
// 										variant={
// 											selectedPaymentMethod === "ONLINE" ? "default" : "outline"
// 										}
// 										className="h-20 flex-col"
// 										onClick={() => handlePaymentMethodChange("ONLINE")}>
// 										<CreditCard className="h-6 w-6 mb-2" />
// 										Online Payment
// 									</Button>
// 								</div>

// 								{/* Additional Fields for Cash/Bank Transfer */}
// 								{(selectedPaymentMethod === "CASH" ||
// 									selectedPaymentMethod === "BANK_TRANSFER") && (
// 									<div className="space-y-4 p-4 bg-gray-50 rounded-lg">
// 										<h4 className="font-medium flex items-center gap-2">
// 											<Receipt className="h-4 w-4" />
// 											Payment Verification Required
// 										</h4>

// 										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// 											<div>
// 												<Label htmlFor="receiptNumber">Receipt Number</Label>
// 												<Input
// 													id="receiptNumber"
// 													value={receiptNumber}
// 													onChange={(e) => setReceiptNumber(e.target.value)}
// 													placeholder="Enter receipt number"
// 												/>
// 											</div>
// 											<div>
// 												<Label htmlFor="transactionNumber">
// 													Transaction Number
// 												</Label>
// 												<Input
// 													id="transactionNumber"
// 													value={transactionNumber}
// 													onChange={(e) => setTransactionNumber(e.target.value)}
// 													placeholder="Enter transaction number"
// 												/>
// 											</div>
// 										</div>

// 										<div>
// 											<Label htmlFor="paidAmount">Paid Amount (ETB) *</Label>
// 											<Input
// 												id="paidAmount"
// 												type="number"
// 												value={paidAmount}
// 												onChange={(e) => setPaidAmount(e.target.value)}
// 												placeholder="Enter actual paid amount"
// 												required
// 											/>
// 											<p className="text-sm text-muted-foreground mt-1">
// 												Expected amount: ETB {finalAmount.toLocaleString()}
// 											</p>
// 										</div>

// 										<div>
// 											<Label htmlFor="notes">Notes (Optional)</Label>
// 											<Textarea
// 												id="notes"
// 												value={notes}
// 												onChange={(e) => setNotes(e.target.value)}
// 												placeholder="Additional notes about the payment"
// 												rows={3}
// 											/>
// 										</div>

// 										<Alert>
// 											<AlertCircle className="h-4 w-4" />
// 											<AlertDescription>
// 												Please provide either a receipt number or transaction
// 												number to verify the payment.
// 											</AlertDescription>
// 										</Alert>
// 									</div>
// 								)}

// 								{/* Online Payment Info */}
// 								{(selectedPaymentMethod === "TELEBIRR" ||
// 									selectedPaymentMethod === "ONLINE") && (
// 									<Alert>
// 										<AlertCircle className="h-4 w-4" />
// 										<AlertDescription>
// 											You will be redirected to the payment gateway to complete
// 											your payment securely.
// 										</AlertDescription>
// 									</Alert>
// 								)}
// 							</CardContent>
// 						</Card>

// 						{/* Complete Payment Button */}
// 						<Card>
// 							<CardContent className="pt-6">
// 								<div className="flex justify-between items-center">
// 									<div>
// 										<p className="text-lg font-semibold">
// 											Total to Pay: ETB {finalAmount.toLocaleString()}
// 										</p>
// 										{discountAmount > 0 && (
// 											<p className="text-sm text-green-600">
// 												You save ETB {discountAmount.toLocaleString()}
// 											</p>
// 										)}
// 									</div>
// 									<Button
// 										onClick={handleCompletePayment}
// 										disabled={!selectedPaymentMethod || processing}
// 										size="lg"
// 										className="min-w-[200px]">
// 										{processing ? (
// 											<>
// 												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
// 												Processing...
// 											</>
// 										) : (
// 											<>
// 												<CreditCard className="h-4 w-4 mr-2" />
// 												Complete Payment
// 											</>
// 										)}
// 									</Button>
// 								</div>
// 							</CardContent>
// 						</Card>
// 					</>
// 				)}

// 				{/* Payment Completed Message */}
// 				{isPaymentCompleted && (
// 					<Card>
// 						<CardContent className="pt-6">
// 							<div className="text-center space-y-4">
// 								<CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
// 								<div>
// 									<h3 className="text-xl font-semibold text-green-700">
// 										Payment Completed Successfully!
// 									</h3>
// 									<p className="text-muted-foreground">
// 										Registration #{registration.registrationNumber} has been
// 										paid and processed.
// 									</p>
// 								</div>
// 								<Button
// 									onClick={() => router.push("/dashboard/students")}
// 									className="mt-4">
// 									Return to Dashboard
// 								</Button>
// 							</div>
// 						</CardContent>
// 					</Card>
// 				)}
// 			</div>
// 		</div>
// 	);
// }
// "use client";

// import { useState, useEffect } from "react";
// import { useParams, useRouter } from "next/navigation";
// import {
// 	Card,
// 	CardContent,
// 	CardDescription,
// 	CardHeader,
// 	CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import {
// 	CreditCard,
// 	Banknote,
// 	Smartphone,
// 	Building,
// 	AlertCircle,
// 	Calculator,
// 	Receipt,
// } from "lucide-react";
// import { toast } from "sonner";

// interface Registration {
// 	id: string;
// 	registrationNumber: string;
// 	status: string;
// 	paymentOption: string | null;
// 	registrationFee: number;
// 	additionalFee: number | null;
// 	totalAmount: number;
// 	paymentDueDate: string;
// 	student: {
// 		studentId: string;
// 		studentType: string;
// 		user: {
// 			firstName: string;
// 			lastName: string;
// 			email: string;
// 			phone?: string;
// 		};
// 		parents: Array<{
// 			parent: {
// 				user: {
// 					firstName: string;
// 					lastName: string;
// 					phone: string;
// 				};
// 			};
// 		}>;
// 	};
// 	branch: {
// 		name: string;
// 		code: string;
// 	};
// 	grade: {
// 		name: string;
// 		level: number;
// 	} | null;
// }

// export default function RegistrationPaymentPage() {
// 	const params = useParams();
// 	const router = useRouter();
// 	const [registration, setRegistration] = useState<Registration | null>(null);
// 	const [loading, setLoading] = useState(true);
// 	const [processing, setProcessing] = useState(false);
// 	const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
// 	const [discountPercentage, setDiscountPercentage] = useState(0);
// 	const [receiptNumber, setReceiptNumber] = useState("");
// 	const [transactionNumber, setTransactionNumber] = useState("");
// 	const [paidAmount, setPaidAmount] = useState("");
// 	const [notes, setNotes] = useState("");

// 	useEffect(() => {
// 		fetchRegistration();
// 	}, [params.id]);

// 	const fetchRegistration = async () => {
// 		try {
// 			const response = await fetch(
// 				`/api/registration/payment?registrationId=${params.id}`
// 			);
// 			const data = await response.json();

// 			if (response.ok) {
// 				setRegistration(data.registration);
// 				// Set default paid amount to calculated total amount (including additionalFee)
// 				const totalAmount = calculateTotalAmount(data.registration, 0);
// 				setPaidAmount(totalAmount.toString());
// 			} else {
// 				toast.error(data.error || "Failed to load registration");
// 			}
// 		} catch (error) {
// 			console.error("Failed to fetch registration:", error);
// 			toast.error("Failed to load registration");
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	const calculateTotalAmount = (
// 		reg: Registration | null,
// 		discount: number = discountPercentage
// 	) => {
// 		if (!reg) return 0;

// 		// Calculate base total including additionalFee
// 		const registrationFee = Number(reg.registrationFee) || 0;
// 		const additionalFee = Number(reg.additionalFee) || 0;
// 		const baseTotal = registrationFee + additionalFee;

// 		return baseTotal;
// 	};

// 	const calculateAmounts = () => {
// 		if (!registration)
// 			return {
// 				registrationFee: 0,
// 				additionalFee: 0,
// 				baseTotal: 0,
// 				discountAmount: 0,
// 				finalAmount: 0,
// 			};

// 		const registrationFee = Number(registration.registrationFee) || 0;
// 		const additionalFee = Number(registration.additionalFee) || 0;
// 		const baseTotal = registrationFee + additionalFee;
// 		const discountAmount = (baseTotal * discountPercentage) / 100;
// 		const finalAmount = baseTotal - discountAmount;

// 		return {
// 			registrationFee,
// 			additionalFee,
// 			baseTotal,
// 			discountAmount,
// 			finalAmount,
// 		};
// 	};

// 	const handleDiscountChange = (value: string) => {
// 		const percentage = Math.max(0, Math.min(100, Number(value) || 0));
// 		setDiscountPercentage(percentage);

// 		// Update paid amount for manual payment methods
// 		if (
// 			selectedPaymentMethod === "CASH" ||
// 			selectedPaymentMethod === "BANK_TRANSFER"
// 		) {
// 			const { finalAmount } = calculateAmounts();
// 			const newFinalAmount =
// 				calculateTotalAmount(registration, percentage) -
// 				(calculateTotalAmount(registration, percentage) * percentage) / 100;
// 			setPaidAmount(newFinalAmount.toString());
// 		}
// 	};

// 	const handlePaymentMethodChange = (method: string) => {
// 		setSelectedPaymentMethod(method);

// 		// Reset fields when changing payment method
// 		setReceiptNumber("");
// 		setTransactionNumber("");

// 		// Set paid amount for manual methods
// 		if (method === "CASH" || method === "BANK_TRANSFER") {
// 			const { finalAmount } = calculateAmounts();
// 			setPaidAmount(finalAmount.toString());
// 		}
// 	};

// 	const validateForm = () => {
// 		if (!selectedPaymentMethod) {
// 			toast.error("Please select a payment method");
// 			return false;
// 		}

// 		if (
// 			selectedPaymentMethod === "CASH" ||
// 			selectedPaymentMethod === "BANK_TRANSFER"
// 		) {
// 			if (!receiptNumber && !transactionNumber) {
// 				toast.error(
// 					"Please enter either a receipt number or transaction number"
// 				);
// 				return false;
// 			}

// 			if (!paidAmount || Number(paidAmount) <= 0) {
// 				toast.error("Please enter a valid paid amount");
// 				return false;
// 			}
// 		}

// 		return true;
// 	};

// 	const handleCompletePayment = async () => {
// 		if (!validateForm()) return;

// 		try {
// 			setProcessing(true);
// 			const response = await fetch("/api/registration/payment", {
// 				method: "POST",
// 				headers: {
// 					"Content-Type": "application/json",
// 				},
// 				body: JSON.stringify({
// 					registrationId: params.id,
// 					paymentMethod: selectedPaymentMethod,
// 					discountPercentage,
// 					receiptNumber: receiptNumber || undefined,
// 					transactionNumber: transactionNumber || undefined,
// 					paidAmount:
// 						selectedPaymentMethod === "CASH" ||
// 						selectedPaymentMethod === "BANK_TRANSFER"
// 							? Number(paidAmount)
// 							: undefined,
// 					notes: notes || undefined,
// 				}),
// 			});

// 			const data = await response.json();

// 			if (response.ok) {
// 				// If payment is successful, redirect to success page
// 				console.log("Payment successful:", data);
// 				toast.success("Payment completed successfully!");
// 				router.push(
// 					data.redirectTo || `/registration/success/${data.registration.id}`
// 				);

// 				// router.push(`/registration/success/${data.registration.id}`);
// 			} else {
// 				toast.error(data.error || "Payment failed");
// 			}
// 		} catch (error) {
// 			console.error("Payment error:", error);
// 			toast.error("Payment failed. Please try again.");
// 		} finally {
// 			setProcessing(false);
// 		}
// 	};

// 	if (loading || !registration) {
// 		return (
// 			<div className="min-h-screen flex items-center justify-center">
// 				<div className="text-center">
// 					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
// 					<p>Loading registration details...</p>
// 				</div>
// 			</div>
// 		);
// 	}

// 	const {
// 		registrationFee,
// 		additionalFee,
// 		baseTotal,
// 		discountAmount,
// 		finalAmount,
// 	} = calculateAmounts();
// 	const isOverdue = new Date(registration.paymentDueDate) < new Date();

// 	return (
// 		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
// 			<div className="max-w-4xl mx-auto space-y-6">
// 				{/* Header */}
// 				<div className="text-center">
// 					<h1 className="text-3xl font-bold text-gray-900 mb-2">
// 						Complete Registration Payment
// 					</h1>
// 					<p className="text-muted-foreground">
// 						Registration #{registration.registrationNumber}
// 					</p>
// 				</div>

// 				{/* Overdue Alert */}
// 				{isOverdue && (
// 					<Alert variant="destructive">
// 						<AlertCircle className="h-4 w-4" />
// 						<AlertDescription>
// 							This payment is overdue. Due date was{" "}
// 							{new Date(registration.paymentDueDate).toLocaleDateString()}.
// 						</AlertDescription>
// 					</Alert>
// 				)}

// 				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// 					{/* Student Information */}
// 					<Card>
// 						<CardHeader>
// 							<CardTitle>Student Information</CardTitle>
// 						</CardHeader>
// 						<CardContent className="space-y-4">
// 							<div className="grid grid-cols-2 gap-4">
// 								<div>
// 									<Label className="text-sm font-medium text-muted-foreground">
// 										Student Name
// 									</Label>
// 									<p className="font-medium">
// 										{registration.student.user.firstName}{" "}
// 										{registration.student.user.lastName}
// 									</p>
// 								</div>
// 								<div>
// 									<Label className="text-sm font-medium text-muted-foreground">
// 										Student ID
// 									</Label>
// 									<p className="font-medium">
// 										{registration.student.studentId}
// 									</p>
// 								</div>
// 								<div>
// 									<Label className="text-sm font-medium text-muted-foreground">
// 										Branch
// 									</Label>
// 									<p className="font-medium">{registration.branch.name}</p>
// 								</div>
// 								<div>
// 									<Label className="text-sm font-medium text-muted-foreground">
// 										Grade
// 									</Label>
// 									<p className="font-medium">
// 										{registration.grade?.name || "Not Assigned"}
// 									</p>
// 								</div>
// 								<div>
// 									<Label className="text-sm font-medium text-muted-foreground">
// 										Student Type
// 									</Label>
// 									<Badge variant="outline">
// 										{registration.student.studentType.replace("_", " ")}
// 									</Badge>
// 								</div>
// 								<div>
// 									<Label className="text-sm font-medium text-muted-foreground">
// 										Payment Option
// 									</Label>
// 									<Badge variant="secondary">
// 										{registration.paymentOption
// 											?.replace("REGISTRATION_", "")
// 											.replace("_", " ") || "Registration Only"}
// 									</Badge>
// 								</div>
// 							</div>
// 						</CardContent>
// 					</Card>

// 					{/* Payment Details */}
// 					<Card>
// 						<CardHeader>
// 							<CardTitle className="flex items-center gap-2">
// 								<Calculator className="h-5 w-5" />
// 								Payment Calculation
// 							</CardTitle>
// 						</CardHeader>
// 						<CardContent className="space-y-4">
// 							{/* Discount Input */}
// 							<div>
// 								<Label htmlFor="discount">Discount Percentage (%)</Label>
// 								<Input
// 									id="discount"
// 									type="number"
// 									min="0"
// 									max="100"
// 									value={discountPercentage}
// 									onChange={(e) => handleDiscountChange(e.target.value)}
// 									placeholder="Enter discount percentage"
// 								/>
// 							</div>

// 							<Separator />

// 							{/* Amount Breakdown */}
// 							<div className="space-y-2">
// 								<div className="flex justify-between">
// 									<span className="text-muted-foreground">
// 										Registration Fee
// 									</span>
// 									<span>ETB {registrationFee.toLocaleString()}</span>
// 								</div>
// 								{additionalFee > 0 && (
// 									<div className="flex justify-between">
// 										<span className="text-muted-foreground">
// 											{registration.paymentOption === "REGISTRATION_MONTHLY"
// 												? "Monthly Fee"
// 												: registration.paymentOption ===
// 												  "REGISTRATION_QUARTERLY"
// 												? "Quarterly Fee"
// 												: "Additional Fee"}
// 										</span>
// 										<span>ETB {additionalFee.toLocaleString()}</span>
// 									</div>
// 								)}
// 								<div className="flex justify-between font-medium">
// 									<span>Subtotal</span>
// 									<span>ETB {baseTotal.toLocaleString()}</span>
// 								</div>
// 								{discountAmount > 0 && (
// 									<div className="flex justify-between text-green-600">
// 										<span>Discount ({discountPercentage}%)</span>
// 										<span>- ETB {discountAmount.toLocaleString()}</span>
// 									</div>
// 								)}
// 								<Separator />
// 								<div className="flex justify-between text-lg font-bold">
// 									<span>Total Amount</span>
// 									<span>ETB {finalAmount.toLocaleString()}</span>
// 								</div>
// 							</div>
// 						</CardContent>
// 					</Card>
// 				</div>

// 				{/* Payment Method Selection */}
// 				<Card>
// 					<CardHeader>
// 						<CardTitle>Payment Method</CardTitle>
// 						<CardDescription>
// 							Select how you want to complete the payment
// 						</CardDescription>
// 					</CardHeader>
// 					<CardContent className="space-y-6">
// 						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
// 							<Button
// 								variant={
// 									selectedPaymentMethod === "CASH" ? "default" : "outline"
// 								}
// 								className="h-20 flex-col"
// 								onClick={() => handlePaymentMethodChange("CASH")}>
// 								<Banknote className="h-6 w-6 mb-2" />
// 								Cash Payment
// 							</Button>
// 							<Button
// 								variant={
// 									selectedPaymentMethod === "BANK_TRANSFER"
// 										? "default"
// 										: "outline"
// 								}
// 								className="h-20 flex-col"
// 								onClick={() => handlePaymentMethodChange("BANK_TRANSFER")}>
// 								<Building className="h-6 w-6 mb-2" />
// 								Bank Transfer
// 							</Button>
// 							<Button
// 								variant={
// 									selectedPaymentMethod === "TELEBIRR" ? "default" : "outline"
// 								}
// 								className="h-20 flex-col"
// 								onClick={() => handlePaymentMethodChange("TELEBIRR")}>
// 								<Smartphone className="h-6 w-6 mb-2" />
// 								TeleBirr
// 							</Button>
// 							<Button
// 								variant={
// 									selectedPaymentMethod === "ONLINE" ? "default" : "outline"
// 								}
// 								className="h-20 flex-col"
// 								onClick={() => handlePaymentMethodChange("ONLINE")}>
// 								<CreditCard className="h-6 w-6 mb-2" />
// 								Online Payment
// 							</Button>
// 						</div>

// 						{/* Additional Fields for Cash/Bank Transfer */}
// 						{(selectedPaymentMethod === "CASH" ||
// 							selectedPaymentMethod === "BANK_TRANSFER") && (
// 							<div className="space-y-4 p-4 bg-gray-50 rounded-lg">
// 								<h4 className="font-medium flex items-center gap-2">
// 									<Receipt className="h-4 w-4" />
// 									Payment Verification Required
// 								</h4>

// 								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// 									<div>
// 										<Label htmlFor="receiptNumber">Receipt Number</Label>
// 										<Input
// 											id="receiptNumber"
// 											value={receiptNumber}
// 											onChange={(e) => setReceiptNumber(e.target.value)}
// 											placeholder="Enter receipt number"
// 										/>
// 									</div>
// 									<div>
// 										<Label htmlFor="transactionNumber">
// 											Transaction Number
// 										</Label>
// 										<Input
// 											id="transactionNumber"
// 											value={transactionNumber}
// 											onChange={(e) => setTransactionNumber(e.target.value)}
// 											placeholder="Enter transaction number"
// 										/>
// 									</div>
// 								</div>

// 								<div>
// 									<Label htmlFor="paidAmount">Paid Amount (ETB) *</Label>
// 									<Input
// 										id="paidAmount"
// 										type="number"
// 										value={paidAmount}
// 										onChange={(e) => setPaidAmount(e.target.value)}
// 										placeholder="Enter actual paid amount"
// 										required
// 									/>
// 									<p className="text-sm text-muted-foreground mt-1">
// 										Expected amount: ETB {finalAmount.toLocaleString()}
// 									</p>
// 								</div>

// 								<div>
// 									<Label htmlFor="notes">Notes (Optional)</Label>
// 									<Textarea
// 										id="notes"
// 										value={notes}
// 										onChange={(e) => setNotes(e.target.value)}
// 										placeholder="Additional notes about the payment"
// 										rows={3}
// 									/>
// 								</div>

// 								<Alert>
// 									<AlertCircle className="h-4 w-4" />
// 									<AlertDescription>
// 										Please provide either a receipt number or transaction number
// 										to verify the payment.
// 									</AlertDescription>
// 								</Alert>
// 							</div>
// 						)}

// 						{/* Online Payment Info */}
// 						{(selectedPaymentMethod === "TELEBIRR" ||
// 							selectedPaymentMethod === "ONLINE") && (
// 							<Alert>
// 								<AlertCircle className="h-4 w-4" />
// 								<AlertDescription>
// 									You will be redirected to the payment gateway to complete your
// 									payment securely.
// 								</AlertDescription>
// 							</Alert>
// 						)}
// 					</CardContent>
// 				</Card>

// 				{/* Complete Payment Button */}
// 				<Card>
// 					<CardContent className="pt-6">
// 						<div className="flex justify-between items-center">
// 							<div>
// 								<p className="text-lg font-semibold">
// 									Total to Pay: ETB {finalAmount.toLocaleString()}
// 								</p>
// 								{discountAmount > 0 && (
// 									<p className="text-sm text-green-600">
// 										You save ETB {discountAmount.toLocaleString()}
// 									</p>
// 								)}
// 							</div>
// 							<Button
// 								onClick={handleCompletePayment}
// 								disabled={!selectedPaymentMethod || processing}
// 								size="lg"
// 								className="min-w-[200px]">
// 								{processing ? (
// 									<>
// 										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
// 										Processing...
// 									</>
// 								) : (
// 									<>
// 										<CreditCard className="h-4 w-4 mr-2" />
// 										Complete Payment
// 									</>
// 								)}
// 							</Button>
// 						</div>
// 					</CardContent>
// 				</Card>
// 			</div>
// 		</div>
// 	);
// }

// "use client";

// import { useState, useEffect } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import {
// 	Card,
// 	CardContent,
// 	CardDescription,
// 	CardHeader,
// 	CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import {
// 	CreditCard,
// 	Banknote,
// 	Smartphone,
// 	Building,
// 	AlertCircle,
// 	Calculator,
// 	Receipt,
// } from "lucide-react";
// import { toast } from "sonner";

// interface Registration {
// 	id: string;
// 	registrationNumber: string;
// 	status: string;
// 	paymentOption: string | null;
// 	registrationFee: number;
// 	additionalFee: number | null;
// 	totalAmount: number;
// 	paymentDueDate: string;
// 	student: {
// 		studentId: string;
// 		studentType: string;
// 		user: {
// 			firstName: string;
// 			lastName: string;
// 			email: string;
// 			phone?: string;
// 		};
// 		parents: Array<{
// 			parent: {
// 				user: {
// 					firstName: string;
// 					lastName: string;
// 					phone: string;
// 				};
// 			};
// 		}>;
// 	};
// 	branch: {
// 		name: string;
// 		code: string;
// 	};
// 	grade: {
// 		name: string;
// 		level: number;
// 	} | null;
// }

// export default function RegistrationPaymentPage() {
// 	const params = useParams();
// 	const router = useRouter();
// 	const [registration, setRegistration] = useState<Registration | null>(null);
// 	const [loading, setLoading] = useState(true);
// 	const [processing, setProcessing] = useState(false);
// 	const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
// 	const [discountPercentage, setDiscountPercentage] = useState(0);
// 	const [receiptNumber, setReceiptNumber] = useState("");
// 	const [transactionNumber, setTransactionNumber] = useState("");
// 	const [paidAmount, setPaidAmount] = useState("");
// 	const [notes, setNotes] = useState("");
// 	const [paymentOption, setPaymentOption] = useState<string>("");

// 	useEffect(() => {
// 		fetchRegistration();
// 	}, [params.id]);

// 	useEffect(() => {
// 		if (!registration) return; // read from closure

// 		const registrationFee = Number(registration.registrationFee);
// 		let newTotal = registrationFee;

// 		if (paymentOption === "REGISTRATION_MONTHLY") {
// 			newTotal += 8000;
// 		} else if (paymentOption === "REGISTRATION_QUARTERLY") {
// 			newTotal += 10000;
// 		}

// 		setRegistration((prev) =>
// 			prev ? { ...prev, totalAmount: newTotal } : prev
// 		);

// 		const discountAmount = (newTotal * discountPercentage) / 100;
// 		const finalAmount = newTotal - discountAmount;
// 		setPaidAmount(finalAmount.toString());
// 	}, [paymentOption, discountPercentage]);

// 	const calculateTotalAmount = () => {
// 		if (!registration) return 0;

// 		const registrationFee = Number(registration.registrationFee);

// 		if (paymentOption === "REGISTRATION_MONTHLY") {
// 			return registrationFee + 8000; // Registration + 1st and last month (4000 each)
// 		} else if (paymentOption === "REGISTRATION_QUARTERLY") {
// 			return registrationFee + 10000; // Registration + quarterly fee
// 		}

// 		return registrationFee;
// 	};

// 	const fetchRegistration = async () => {
// 		try {
// 			const response = await fetch(
// 				`/api/registration/payment?registrationId=${params.id}`
// 			);
// 			const data = await response.json();

// 			if (response.ok) {
// 				setRegistration(data.registration);
// 				// Set default paid amount to calculated amount
// 				const originalAmount = Number(data.registration.totalAmount);
// 				setPaidAmount(originalAmount.toString());
// 			} else {
// 				toast.error(data.error || "Failed to load registration");
// 			}
// 		} catch (error) {
// 			console.error("Failed to fetch registration:", error);
// 			toast.error("Failed to load registration");
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	const calculateAmounts = () => {
// 		if (!registration)
// 			return { originalAmount: 0, discountAmount: 0, finalAmount: 0 };

// 		const originalAmount = Number(registration.totalAmount);
// 		const discountAmount = (originalAmount * discountPercentage) / 100;
// 		const finalAmount = originalAmount - discountAmount;

// 		return { originalAmount, discountAmount, finalAmount };
// 	};

// 	const handleDiscountChange = (value: string) => {
// 		const percentage = Math.max(0, Math.min(100, Number(value) || 0));
// 		setDiscountPercentage(percentage);

// 		// Update paid amount for manual payment methods
// 		if (
// 			selectedPaymentMethod === "CASH" ||
// 			selectedPaymentMethod === "BANK_TRANSFER"
// 		) {
// 			const { finalAmount } = calculateAmounts();
// 			const newFinalAmount =
// 				Number(registration?.totalAmount || 0) -
// 				(Number(registration?.totalAmount || 0) * percentage) / 100;
// 			setPaidAmount(newFinalAmount.toString());
// 		}
// 	};

// 	const handlePaymentMethodChange = (method: string) => {
// 		setSelectedPaymentMethod(method);

// 		// Reset fields when changing payment method
// 		setReceiptNumber("");
// 		setTransactionNumber("");

// 		// Set paid amount for manual methods
// 		if (method === "CASH" || method === "BANK_TRANSFER") {
// 			const { finalAmount } = calculateAmounts();
// 			setPaidAmount(finalAmount.toString());
// 		}
// 	};

// 	const validateForm = () => {
// 		if (!selectedPaymentMethod) {
// 			toast.error("Please select a payment method");
// 			return false;
// 		}

// 		if (
// 			selectedPaymentMethod === "CASH" ||
// 			selectedPaymentMethod === "BANK_TRANSFER"
// 		) {
// 			if (!receiptNumber && !transactionNumber) {
// 				toast.error(
// 					"Please enter either a receipt number or transaction number"
// 				);
// 				return false;
// 			}

// 			if (!paidAmount || Number(paidAmount) <= 0) {
// 				toast.error("Please enter a valid paid amount");
// 				return false;
// 			}
// 		}

// 		return true;
// 	};

// 	const handleCompletePayment = async () => {
// 		if (!validateForm()) return;

// 		try {
// 			setProcessing(true);
// 			const response = await fetch("/api/registration/payment", {
// 				method: "POST",
// 				headers: {
// 					"Content-Type": "application/json",
// 				},
// 				body: JSON.stringify({
// 					registrationId: params.id,
// 					paymentMethod: selectedPaymentMethod,
// 					discountPercentage,
// 					receiptNumber: receiptNumber || undefined,
// 					transactionNumber: transactionNumber || undefined,
// 					paidAmount:
// 						selectedPaymentMethod === "CASH" ||
// 						selectedPaymentMethod === "BANK_TRANSFER"
// 							? Number(paidAmount)
// 							: undefined,
// 					notes: notes || undefined,
// 				}),
// 			});

// 			const data = await response.json();

// 			if (response.ok) {
// 				toast.success("Payment completed successfully!");
// 				router.push(`/registration/success/${data.registration.id}`);
// 			} else {
// 				toast.error(data.error || "Payment failed");
// 			}
// 		} catch (error) {
// 			console.error("Payment error:", error);
// 			toast.error("Payment failed. Please try again.");
// 		} finally {
// 			setProcessing(false);
// 		}
// 	};

// 	if (loading || !registration) {
// 		return (
// 			<div className="min-h-screen flex items-center justify-center">
// 				<div className="text-center">
// 					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
// 					<p>Loading registration details...</p>
// 				</div>
// 			</div>
// 		);
// 	}

// 	const { originalAmount, discountAmount, finalAmount } = calculateAmounts();
// 	const isOverdue = new Date(registration.paymentDueDate) < new Date();

// 	return (
// 		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
// 			<div className="max-w-4xl mx-auto space-y-6">
// 				{/* Header */}
// 				<div className="text-center">
// 					<h1 className="text-3xl font-bold text-gray-900 mb-2">
// 						Complete Registration Payment
// 					</h1>
// 					<p className="text-muted-foreground">
// 						Registration #{registration.registrationNumber}
// 					</p>
// 				</div>

// 				{/* Overdue Alert */}
// 				{isOverdue && (
// 					<Alert variant="destructive">
// 						<AlertCircle className="h-4 w-4" />
// 						<AlertDescription>
// 							This payment is overdue. Due date was{" "}
// 							{new Date(registration.paymentDueDate).toLocaleDateString()}.
// 						</AlertDescription>
// 					</Alert>
// 				)}

// 				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// 					{/* Student Information */}
// 					<Card>
// 						<CardHeader>
// 							<CardTitle>Student Information</CardTitle>
// 						</CardHeader>
// 						<CardContent className="space-y-4">
// 							<div className="grid grid-cols-2 gap-4">
// 								<div>
// 									<Label className="text-sm font-medium text-muted-foreground">
// 										Student Name
// 									</Label>
// 									<p className="font-medium">
// 										{registration.student.user.firstName}{" "}
// 										{registration.student.user.lastName}
// 									</p>
// 								</div>
// 								<div>
// 									<Label className="text-sm font-medium text-muted-foreground">
// 										Student ID
// 									</Label>
// 									<p className="font-medium">
// 										{registration.student.studentId}
// 									</p>
// 								</div>
// 								<div>
// 									<Label className="text-sm font-medium text-muted-foreground">
// 										Branch
// 									</Label>
// 									<p className="font-medium">{registration.branch.name}</p>
// 								</div>
// 								<div>
// 									<Label className="text-sm font-medium text-muted-foreground">
// 										Grade
// 									</Label>
// 									<p className="font-medium">
// 										{registration.grade?.name || "Not Assigned"}
// 									</p>
// 								</div>
// 								<div>
// 									<Label className="text-sm font-medium text-muted-foreground">
// 										Student Type
// 									</Label>
// 									<Badge variant="outline">
// 										{registration.student.studentType.replace("_", " ")}
// 									</Badge>
// 								</div>
// 								<div>
// 									<Label className="text-sm font-medium text-muted-foreground">
// 										Payment Option
// 									</Label>
// 									<Badge variant="secondary">
// 										{registration.paymentOption
// 											?.replace("REGISTRATION_", "")
// 											.replace("_", " ") || "Registration Only"}
// 									</Badge>
// 								</div>
// 							</div>
// 						</CardContent>
// 					</Card>

// 					{/* Payment Options */}
// 					<Card>
// 						<CardHeader>
// 							<CardTitle>Payment Options</CardTitle>
// 							<CardDescription>
// 								Choose your preferred payment plan
// 							</CardDescription>
// 						</CardHeader>
// 						<CardContent>
// 							<RadioGroup
// 								value={paymentOption}
// 								onValueChange={setPaymentOption}>
// 								<div className="space-y-4">
// 									<div className="flex items-center space-x-2 p-4 border rounded-lg">
// 										<RadioGroupItem value="REGISTRATION_MONTHLY" id="monthly" />
// 										<div className="flex-1">
// 											<Label htmlFor="monthly" className="font-medium">
// 												Registration + Monthly (1st & Last Month)
// 											</Label>
// 											<p className="text-sm text-muted-foreground">
// 												Pay registration fee + first and last month tuition
// 											</p>
// 											<p className="text-sm font-medium text-green-600">
// 												ETB{" "}
// 												{(
// 													Number(registration.registrationFee) + 8000
// 												).toLocaleString()}
// 											</p>
// 										</div>
// 									</div>
// 									<div className="flex items-center space-x-2 p-4 border rounded-lg">
// 										<RadioGroupItem
// 											value="REGISTRATION_QUARTERLY"
// 											id="quarterly"
// 										/>
// 										<div className="flex-1">
// 											<Label htmlFor="quarterly" className="font-medium">
// 												Registration + Quarterly (2.5 Months)
// 											</Label>
// 											<p className="text-sm text-muted-foreground">
// 												Pay registration fee + quarterly tuition fee
// 											</p>
// 											<p className="text-sm font-medium text-green-600">
// 												ETB{" "}
// 												{(
// 													Number(registration.registrationFee) + 10000
// 												).toLocaleString()}
// 											</p>
// 										</div>
// 									</div>
// 								</div>
// 							</RadioGroup>
// 						</CardContent>
// 					</Card>

// 					{/* Payment Details */}
// 					<Card>
// 						<CardHeader>
// 							<CardTitle className="flex items-center gap-2">
// 								<Calculator className="h-5 w-5" />
// 								Payment Calculation
// 							</CardTitle>
// 						</CardHeader>
// 						<CardContent className="space-y-4">
// 							{/* Discount Input */}
// 							<div>
// 								<Label htmlFor="discount">Discount Percentage (%)</Label>
// 								<Input
// 									id="discount"
// 									type="number"
// 									min="0"
// 									max="100"
// 									value={discountPercentage}
// 									onChange={(e) => handleDiscountChange(e.target.value)}
// 									placeholder="Enter discount percentage"
// 								/>
// 							</div>

// 							<Separator />

// 							{/* Amount Breakdown */}
// 							<div className="space-y-2">
// 								<div className="flex justify-between">
// 									<span className="text-muted-foreground">
// 										Registration Fee
// 									</span>
// 									<span>
// 										ETB {Number(registration.registrationFee).toLocaleString()}
// 									</span>
// 								</div>
// 								{paymentOption === "REGISTRATION_MONTHLY" && (
// 									<div className="flex justify-between">
// 										<span className="text-muted-foreground">
// 											Monthly Fee (1st & Last)
// 										</span>
// 										<span className="font-medium">ETB 8,000</span>
// 									</div>
// 								)}

// 								{paymentOption === "REGISTRATION_QUARTERLY" && (
// 									<div className="flex justify-between">
// 										<span className="text-muted-foreground">Quarterly Fee</span>
// 										<span className="font-medium">ETB 10,000</span>
// 									</div>
// 								)}

// 								{paymentOption && (
// 									<>
// 										<Separator />
// 										<div className="flex justify-between font-semibold text-lg">
// 											<span>Total Amount</span>
// 											<span>ETB {calculateTotalAmount().toLocaleString()}</span>
// 										</div>
// 									</>
// 								)}
// 								{registration.additionalFee &&
// 									Number(registration.additionalFee) > 0 && (
// 										<div className="flex justify-between">
// 											<span className="text-muted-foreground">
// 												Additional Fee
// 											</span>
// 											<span>
// 												ETB{" "}
// 												{Number(registration.additionalFee).toLocaleString()}
// 											</span>
// 										</div>
// 									)}
// 								<div className="flex justify-between font-medium">
// 									<span>Subtotal</span>
// 									<span>ETB {originalAmount.toLocaleString()}</span>
// 								</div>
// 								{discountAmount > 0 && (
// 									<div className="flex justify-between text-green-600">
// 										<span>Discount ({discountPercentage}%)</span>
// 										<span>- ETB {discountAmount.toLocaleString()}</span>
// 									</div>
// 								)}
// 								<Separator />
// 								<div className="flex justify-between text-lg font-bold">
// 									<span>Total Amount</span>
// 									<span>ETB {finalAmount.toLocaleString()}</span>
// 								</div>
// 							</div>
// 						</CardContent>
// 					</Card>
// 				</div>

// 				{/* <div className="space-y-6">
// 					<Card>
// 						<CardHeader>
// 							<CardTitle>Payment Summary</CardTitle>
// 						</CardHeader>
// 						<CardContent className="space-y-4">
// 							<div className="flex justify-between">
// 								<span className="text-muted-foreground">Registration Fee</span>
// 								<span className="font-medium">
// 									ETB {Number(registration.registrationFee).toLocaleString()}
// 								</span>
// 							</div>
// 							{paymentOption === "REGISTRATION_MONTHLY" && (
// 								<div className="flex justify-between">
// 									<span className="text-muted-foreground">
// 										Monthly Fee (1st & Last)
// 									</span>
// 									<span className="font-medium">ETB 8,000</span>
// 								</div>
// 							)}

// 							{paymentOption === "REGISTRATION_QUARTERLY" && (
// 								<div className="flex justify-between">
// 									<span className="text-muted-foreground">Quarterly Fee</span>
// 									<span className="font-medium">ETB 10,000</span>
// 								</div>
// 							)}

// 							{paymentOption && (
// 								<>
// 									<Separator />
// 									<div className="flex justify-between font-semibold text-lg">
// 										<span>Total Amount</span>
// 										<span>ETB {calculateTotalAmount().toLocaleString()}</span>
// 									</div>
// 								</>
// 							)}
// 						</CardContent>
// 					</Card>
// 				</div> */}
// 				{/* Payment Method Selection */}
// 				<Card>
// 					<CardHeader>
// 						<CardTitle>Payment Method</CardTitle>
// 						<CardDescription>
// 							Select how you want to complete the payment
// 						</CardDescription>
// 					</CardHeader>
// 					<CardContent className="space-y-6">
// 						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
// 							<Button
// 								variant={
// 									selectedPaymentMethod === "CASH" ? "default" : "outline"
// 								}
// 								className="h-20 flex-col"
// 								onClick={() => handlePaymentMethodChange("CASH")}>
// 								<Banknote className="h-6 w-6 mb-2" />
// 								Cash Payment
// 							</Button>
// 							<Button
// 								variant={
// 									selectedPaymentMethod === "BANK_TRANSFER"
// 										? "default"
// 										: "outline"
// 								}
// 								className="h-20 flex-col"
// 								onClick={() => handlePaymentMethodChange("BANK_TRANSFER")}>
// 								<Building className="h-6 w-6 mb-2" />
// 								Bank Transfer
// 							</Button>
// 							<Button
// 								variant={
// 									selectedPaymentMethod === "TELEBIRR" ? "default" : "outline"
// 								}
// 								className="h-20 flex-col"
// 								onClick={() => handlePaymentMethodChange("TELEBIRR")}>
// 								<Smartphone className="h-6 w-6 mb-2" />
// 								TeleBirr
// 							</Button>
// 							<Button
// 								variant={
// 									selectedPaymentMethod === "ONLINE" ? "default" : "outline"
// 								}
// 								className="h-20 flex-col"
// 								onClick={() => handlePaymentMethodChange("ONLINE")}>
// 								<CreditCard className="h-6 w-6 mb-2" />
// 								Online Payment
// 							</Button>
// 						</div>

// 						{/* Additional Fields for Cash/Bank Transfer */}
// 						{(selectedPaymentMethod === "CASH" ||
// 							selectedPaymentMethod === "BANK_TRANSFER") && (
// 							<div className="space-y-4 p-4 bg-gray-50 rounded-lg">
// 								<h4 className="font-medium flex items-center gap-2">
// 									<Receipt className="h-4 w-4" />
// 									Payment Verification Required
// 								</h4>

// 								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// 									<div>
// 										<Label htmlFor="receiptNumber">Receipt Number</Label>
// 										<Input
// 											id="receiptNumber"
// 											value={receiptNumber}
// 											onChange={(e) => setReceiptNumber(e.target.value)}
// 											placeholder="Enter receipt number"
// 										/>
// 									</div>
// 									<div>
// 										<Label htmlFor="transactionNumber">
// 											Transaction Number
// 										</Label>
// 										<Input
// 											id="transactionNumber"
// 											value={transactionNumber}
// 											onChange={(e) => setTransactionNumber(e.target.value)}
// 											placeholder="Enter transaction number"
// 										/>
// 									</div>
// 								</div>

// 								<div>
// 									<Label htmlFor="paidAmount">Paid Amount (ETB) *</Label>
// 									<Input
// 										id="paidAmount"
// 										type="number"
// 										value={paidAmount}
// 										onChange={(e) => setPaidAmount(e.target.value)}
// 										placeholder="Enter actual paid amount"
// 										required
// 									/>
// 									<p className="text-sm text-muted-foreground mt-1">
// 										Expected amount: ETB {finalAmount.toLocaleString()}
// 									</p>
// 								</div>

// 								<div>
// 									<Label htmlFor="notes">Notes (Optional)</Label>
// 									<Textarea
// 										id="notes"
// 										value={notes}
// 										onChange={(e) => setNotes(e.target.value)}
// 										placeholder="Additional notes about the payment"
// 										rows={3}
// 									/>
// 								</div>

// 								<Alert>
// 									<AlertCircle className="h-4 w-4" />
// 									<AlertDescription>
// 										Please provide either a receipt number or transaction number
// 										to verify the payment.
// 									</AlertDescription>
// 								</Alert>
// 							</div>
// 						)}

// 						{/* Online Payment Info */}
// 						{(selectedPaymentMethod === "TELEBIRR" ||
// 							selectedPaymentMethod === "ONLINE") && (
// 							<Alert>
// 								<AlertCircle className="h-4 w-4" />
// 								<AlertDescription>
// 									You will be redirected to the payment gateway to complete your
// 									payment securely.
// 								</AlertDescription>
// 							</Alert>
// 						)}
// 					</CardContent>
// 				</Card>

// 				{/* Complete Payment Button */}
// 				<Card>
// 					<CardContent className="pt-6">
// 						<div className="flex justify-between items-center">
// 							<div>
// 								<p className="text-lg font-semibold">
// 									Total to Pay: ETB {finalAmount.toLocaleString()}
// 								</p>
// 								{discountAmount > 0 && (
// 									<p className="text-sm text-green-600">
// 										You save ETB {discountAmount.toLocaleString()}
// 									</p>
// 								)}
// 							</div>
// 							<Button
// 								onClick={handleCompletePayment}
// 								disabled={!selectedPaymentMethod || processing}
// 								size="lg"
// 								className="min-w-[200px]">
// 								{processing ? (
// 									<>
// 										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
// 										Processing...
// 									</>
// 								) : (
// 									<>
// 										<CreditCard className="h-4 w-4 mr-2" />
// 										Complete Payment
// 									</>
// 								)}
// 							</Button>
// 						</div>
// 					</CardContent>
// 				</Card>
// 			</div>
// 		</div>
// 	);
// }
