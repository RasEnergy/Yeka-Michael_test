"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	ArrowLeft,
	CheckCircle,
	Clock,
	AlertCircle,
	Phone,
	Printer,
	Send,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface InvoiceDetail {
	id: string;
	invoiceNumber: string;
	totalAmount: number;
	discountAmount?: number;
	finalAmount?: number;
	paidAmount: number;
	status: string;
	dueDate: string;
	createdAt: string;
	student: {
		user: {
			firstName: string;
			lastName: string;
			phone?: string;
		};
		studentId: string;
		parents: Array<{
			parent: {
				user: {
					firstName: string;
					lastName: string;
					phone?: string;
				};
			};
		}>;
	};
	branch: {
		name: string;
	};
	items: Array<{
		id: string;
		description: string;
		amount: number;
		quantity: number;
		feeType: {
			name: string;
		};
	}>;
	payments: Array<{
		id: string;
		paymentNumber: string;
		amount: number;
		paymentMethod: string;
		status: string;
		transactionId?: string;
		notes?: string;
		createdAt: string;
	}>;
	createdBy: {
		firstName: string;
		lastName: string;
	};
	Registration: any;
}

export default function InvoiceDetailPage() {
	const params = useParams();
	const router = useRouter();
	const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [confirmingPayment, setConfirmingPayment] = useState(false);
	const [resendingLink, setResendingLink] = useState(false);
	const [printingReceipt, setPrintingReceipt] = useState(false);
	const [transactionReference, setTransactionReference] = useState("");
	const [confirmationNotes, setConfirmationNotes] = useState("");

	const fetchInvoice = async () => {
		try {
			setLoading(true);
			const response = await fetch(`/api/invoices/${params.id}`);
			if (!response.ok) throw new Error("Failed to fetch invoice");

			const data = await response.json();
			setInvoice(data.invoice);
		} catch (error) {
			console.error("Error fetching invoice:", error);
			toast.error("Failed to load invoice");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (params.id) {
			fetchInvoice();
		}
	}, [params.id]);

	const handleConfirmPayment = async () => {
		if (!invoice) return;

		try {
			setConfirmingPayment(true);
			const response = await fetch(`/api/invoices/${invoice.id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					action: "confirm_payment",
					transactionReference,
					notes: confirmationNotes,
				}),
			});

			if (!response.ok) throw new Error("Failed to confirm payment");

			toast.success("Payment confirmed successfully");
			fetchInvoice(); // Refresh invoice data
			setTransactionReference("");
			setConfirmationNotes("");
		} catch (error) {
			console.error("Error confirming payment:", error);
			toast.error("Failed to confirm payment");
		} finally {
			setConfirmingPayment(false);
		}
	};

	const handleResendPaymentLink = async () => {
		if (!invoice) return;

		try {
			setResendingLink(true);
			const response = await fetch(`/api/invoices/${invoice.id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					action: "resend_payment_link",
				}),
			});

			if (!response.ok) throw new Error("Failed to resend payment link");

			toast.success("Payment link resent successfully");
		} catch (error) {
			console.error("Error resending payment link:", error);
			toast.error("Failed to resend payment link");
		} finally {
			setResendingLink(false);
		}
	};

	const handlePrintReceipt = async () => {
		if (!invoice) return;

		try {
			setPrintingReceipt(true);
			const response = await fetch(`/api/invoices/${invoice.id}/receipt`);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to generate receipt");
			}

			const receiptHTML = await response.text();

			// Create a new window for printing
			const printWindow = window.open("", "_blank");
			if (printWindow) {
				printWindow.document.write(receiptHTML);
				printWindow.document.close();

				// Wait for content to load then print
				printWindow.onload = () => {
					printWindow.print();
					// Close the window after printing (optional)
					printWindow.onafterprint = () => {
						printWindow.close();
					};
				};
			} else {
				// Fallback: create blob and open in new tab
				const blob = new Blob([receiptHTML], { type: "text/html" });
				const url = URL.createObjectURL(blob);
				const newTab = window.open(url, "_blank");
				if (newTab) {
					newTab.onload = () => {
						newTab.print();
					};
				}
				URL.revokeObjectURL(url);
			}

			toast.success("Receipt opened for printing");
		} catch (error) {
			console.error("Error printing receipt:", error);
			toast.error("Failed to print receipt");
		} finally {
			setPrintingReceipt(false);
		}
	};

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			PENDING: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
			PAID: { color: "bg-green-100 text-green-800", icon: CheckCircle },
			PARTIALLY_PAID: { color: "bg-blue-100 text-blue-800", icon: AlertCircle },
			OVERDUE: { color: "bg-red-100 text-red-800", icon: AlertCircle },
			CANCELLED: { color: "bg-gray-100 text-gray-800", icon: AlertCircle },
		};

		const config =
			statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
		const Icon = config.icon;

		return (
			<Badge className={`${config.color} flex items-center gap-1`}>
				<Icon className="h-3 w-3" />
				{status.replace("_", " ")}
			</Badge>
		);
	};

	const getPaymentMethodBadge = (method: string) => {
		const colors = {
			CASH: "bg-green-100 text-green-800",
			BANK_TRANSFER: "bg-blue-100 text-blue-800",
			TELEBIRR: "bg-purple-100 text-purple-800",
			ONLINE: "bg-orange-100 text-orange-800",
		};

		return (
			<Badge
				className={
					colors[method as keyof typeof colors] || "bg-gray-100 text-gray-800"
				}>
				{method.replace("_", " ")}
			</Badge>
		);
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-[400px]">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (!invoice) {
		return (
			<div className="text-center py-8">
				<p className="text-muted-foreground">Invoice not found</p>
				<Button asChild className="mt-4">
					<Link href="/dashboard/invoices">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Invoices
					</Link>
				</Button>
			</div>
		);
	}

	const pendingPayment = invoice.payments.find((p) => p.status === "PENDING");
	const isOnlinePayment =
		pendingPayment &&
		(pendingPayment.paymentMethod === "TELEBIRR" ||
			pendingPayment.paymentMethod === "ONLINE");
	const canConfirmPayment = invoice.status === "PENDING" && pendingPayment;
	const canResendLink = invoice.status === "PENDING" && isOnlinePayment;
	const canPrintReceipt =
		invoice.status === "PAID" &&
		invoice.payments.some((p) => p.status === "COMPLETED");

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button asChild variant="outline" size="sm">
						<Link href="/dashboard/invoices">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back
						</Link>
					</Button>
					<div>
						<h1 className="text-3xl font-bold tracking-tight">
							Invoice {invoice.invoiceNumber}
						</h1>
						<p className="text-muted-foreground">
							Created on {new Date(invoice.createdAt).toLocaleDateString()}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{getStatusBadge(invoice.status)}
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Invoice Details */}
				<div className="lg:col-span-2 space-y-6">
					{/* Student Information */}
					<Card>
						<CardHeader>
							<CardTitle>Student Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label className="text-sm font-medium text-muted-foreground">
										Student Name
									</Label>
									<p className="font-medium">
										{invoice.student.user.firstName}{" "}
										{invoice.student.user.lastName}
									</p>
								</div>
								<div>
									<Label className="text-sm font-medium text-muted-foreground">
										Student ID
									</Label>
									<p className="font-medium">{invoice.student.studentId}</p>
								</div>
								<div>
									<Label className="text-sm font-medium text-muted-foreground">
										Branch
									</Label>
									<p className="font-medium">{invoice.branch.name}</p>
								</div>
								<div>
									<Label className="text-sm font-medium text-muted-foreground">
										Parent Contact
									</Label>
									<div className="flex items-center gap-2">
										<Phone className="h-4 w-4 text-muted-foreground" />
										<p className="font-medium">
											{invoice.student.parents[0]?.parent.user.phone ||
												"Not provided"}
										</p>
									</div>
								</div>

								<div>
									<Label className="text-sm font-medium text-muted-foreground">
										Parent Contact
									</Label>
									<div className="flex items-center gap-2">
										<Phone className="h-4 w-4 text-muted-foreground" />
										<p className="font-medium">
											{invoice.student.parents[0]?.parent.user.phone ||
												"Not provided"}
										</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
					{invoice.Registration && invoice.Registration.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Registration Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label className="text-sm font-medium text-muted-foreground">
											Registration Number
										</Label>
										<p className="font-medium">
											{invoice.Registration[0].registrationNumber}
										</p>
									</div>
									<div>
										<Label className="text-sm font-medium text-muted-foreground">
											Academic Year
										</Label>
										<p className="font-medium">
											{invoice.Registration[0].academicYear || "Current"}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Invoice Items */}
					<Card>
						<CardHeader>
							<CardTitle>Invoice Items</CardTitle>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Description</TableHead>
										<TableHead>Fee Type</TableHead>
										<TableHead className="text-right">Quantity</TableHead>
										<TableHead className="text-right">Amount</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{invoice.items.map((item) => (
										<TableRow key={item.id}>
											<TableCell>{item.description}</TableCell>
											<TableCell>{item.feeType.name}</TableCell>
											<TableCell className="text-right">
												{item.quantity}
											</TableCell>
											<TableCell className="text-right">
												ETB {item.amount.toLocaleString()}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
							<Separator className="my-4" />
							<div className="space-y-2">
								<div className="flex justify-between items-center">
									<span>Subtotal</span>
									<span>ETB {invoice.totalAmount.toLocaleString()}</span>
								</div>
								{invoice.discountAmount && invoice.discountAmount > 0 && (
									<div className="flex justify-between items-center text-green-600">
										<span>Discount</span>
										<span>- ETB {invoice.discountAmount.toLocaleString()}</span>
									</div>
								)}
								<Separator />
								<div className="flex justify-between items-center font-semibold text-lg">
									<span>Total Amount</span>
									<span>
										ETB{" "}
										{(
											invoice.finalAmount || invoice.totalAmount
										).toLocaleString()}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Payment History */}
					<Card>
						<CardHeader>
							<CardTitle>Payment History</CardTitle>
						</CardHeader>
						<CardContent>
							{invoice.payments.length > 0 ? (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Payment #</TableHead>
											<TableHead>Method</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Transaction ID</TableHead>
											<TableHead className="text-right">Amount</TableHead>
											<TableHead>Date</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{invoice.payments.map((payment) => (
											<TableRow key={payment.id}>
												<TableCell className="font-medium">
													{payment.paymentNumber}
												</TableCell>
												<TableCell>
													{getPaymentMethodBadge(payment.paymentMethod)}
												</TableCell>
												<TableCell>{getStatusBadge(payment.status)}</TableCell>
												<TableCell>{payment.transactionId || "-"}</TableCell>
												<TableCell className="text-right">
													ETB {payment.amount.toLocaleString()}
												</TableCell>
												<TableCell>
													{new Date(payment.createdAt).toLocaleDateString()}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<p className="text-muted-foreground text-center py-4">
									No payments recorded
								</p>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Actions Sidebar */}
				<div className="space-y-6">
					{/* Payment Summary */}
					<Card>
						<CardHeader>
							<CardTitle>Payment Summary</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Total Amount</span>
								<span className="font-medium">
									ETB {invoice.totalAmount.toLocaleString()}
								</span>
							</div>
							{invoice.discountAmount && invoice.discountAmount > 0 && (
								<div className="flex justify-between text-green-600">
									<span className="text-muted-foreground">Discount</span>
									<span className="font-medium">
										- ETB {invoice.discountAmount.toLocaleString()}
									</span>
								</div>
							)}
							<div className="flex justify-between">
								<span className="text-muted-foreground">Paid Amount</span>
								<span className="font-medium">
									ETB {invoice.paidAmount.toLocaleString()}
								</span>
							</div>
							<Separator />
							<div className="flex justify-between font-semibold">
								<span>Balance Due</span>
								<span>
									ETB{" "}
									{(
										(invoice.finalAmount || invoice.totalAmount) -
										invoice.paidAmount
									).toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Due Date</span>
								<span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
							</div>
						</CardContent>
					</Card>

					{/* Actions */}
					<Card>
						<CardHeader>
							<CardTitle>Actions</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{canConfirmPayment && (
								<Dialog>
									<DialogTrigger asChild>
										<Button className="w-full">
											<CheckCircle className="h-4 w-4 mr-2" />
											Confirm Payment
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Confirm Payment</DialogTitle>
											<DialogDescription>
												Manually confirm the payment for this invoice. This
												action cannot be undone.
											</DialogDescription>
										</DialogHeader>
										<div className="space-y-4">
											<div>
												<Label htmlFor="transactionRef">
													Transaction Reference (Optional)
												</Label>
												<Input
													id="transactionRef"
													placeholder="Bank transaction number or reference"
													value={transactionReference}
													onChange={(e) =>
														setTransactionReference(e.target.value)
													}
												/>
											</div>
											<div>
												<Label htmlFor="notes">Notes (Optional)</Label>
												<Textarea
													id="notes"
													placeholder="Additional notes about the payment confirmation"
													value={confirmationNotes}
													onChange={(e) => setConfirmationNotes(e.target.value)}
												/>
											</div>
										</div>
										<DialogFooter>
											<Button
												onClick={handleConfirmPayment}
												disabled={confirmingPayment}>
												{confirmingPayment
													? "Confirming..."
													: "Confirm Payment"}
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							)}
							{canPrintReceipt && (
								<Button
									variant="outline"
									className="w-full bg-transparent"
									onClick={handlePrintReceipt}
									disabled={printingReceipt}>
									<Printer className="h-4 w-4 mr-2" />
									{printingReceipt ? "Preparing..." : "Print Receipt"}
								</Button>
							)}

							{canResendLink && (
								<Button
									variant="outline"
									className="w-full bg-transparent"
									onClick={handleResendPaymentLink}
									disabled={resendingLink}>
									<Send className="h-4 w-4 mr-2" />
									{resendingLink ? "Sending..." : "Resend Payment Link"}
								</Button>
							)}
						</CardContent>
					</Card>

					{/* Invoice Info */}
					<Card>
						<CardHeader>
							<CardTitle>Invoice Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Created By</span>
								<span>
									{invoice.createdBy.firstName} {invoice.createdBy.lastName}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Created Date</span>
								<span>{new Date(invoice.createdAt).toLocaleDateString()}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Due Date</span>
								<span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
// "use client";

// import { useState, useEffect } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import {
// 	Table,
// 	TableBody,
// 	TableCell,
// 	TableHead,
// 	TableHeader,
// 	TableRow,
// } from "@/components/ui/table";
// import {
// 	Dialog,
// 	DialogContent,
// 	DialogDescription,
// 	DialogFooter,
// 	DialogHeader,
// 	DialogTitle,
// 	DialogTrigger,
// } from "@/components/ui/dialog";
// import {
// 	ArrowLeft,
// 	Send,
// 	CheckCircle,
// 	Clock,
// 	AlertCircle,
// 	Download,
// 	Phone,
// 	Receipt,
// } from "lucide-react";
// import Link from "next/link";
// import { toast } from "sonner";

// interface InvoiceDetail {
// 	id: string;
// 	invoiceNumber: string;
// 	totalAmount: number;
// 	discountAmount?: number;
// 	finalAmount?: number;
// 	paidAmount: number;
// 	status: string;
// 	dueDate: string;
// 	createdAt: string;
// 	student: {
// 		user: {
// 			firstName: string;
// 			lastName: string;
// 			phone?: string;
// 		};
// 		studentId: string;
// 		parents: Array<{
// 			parent: {
// 				user: {
// 					firstName: string;
// 					lastName: string;
// 					phone?: string;
// 				};
// 			};
// 		}>;
// 	};
// 	branch: {
// 		name: string;
// 	};
// 	items: Array<{
// 		id: string;
// 		description: string;
// 		amount: number;
// 		quantity: number;
// 		feeType: {
// 			name: string;
// 		};
// 	}>;
// 	payments: Array<{
// 		id: string;
// 		paymentNumber: string;
// 		amount: number;
// 		paymentMethod: string;
// 		status: string;
// 		transactionId?: string;
// 		notes?: string;
// 		createdAt: string;
// 	}>;
// 	createdBy: {
// 		firstName: string;
// 		lastName: string;
// 	};
// }

// export default function InvoiceDetailPage() {
// 	const params = useParams();
// 	const router = useRouter();
// 	const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
// 	const [loading, setLoading] = useState(true);
// 	const [confirmingPayment, setConfirmingPayment] = useState(false);
// 	const [resendingLink, setResendingLink] = useState(false);
// 	const [downloadingReceipt, setDownloadingReceipt] = useState(false);
// 	const [transactionReference, setTransactionReference] = useState("");
// 	const [confirmationNotes, setConfirmationNotes] = useState("");

// 	const fetchInvoice = async () => {
// 		try {
// 			setLoading(true);
// 			const response = await fetch(`/api/invoices/${params.id}`);
// 			if (!response.ok) throw new Error("Failed to fetch invoice");

// 			const data = await response.json();
// 			setInvoice(data.invoice);
// 		} catch (error) {
// 			console.error("Error fetching invoice:", error);
// 			toast.error("Failed to load invoice");
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	useEffect(() => {
// 		if (params.id) {
// 			fetchInvoice();
// 		}
// 	}, [params.id]);

// 	const handleConfirmPayment = async () => {
// 		if (!invoice) return;

// 		try {
// 			setConfirmingPayment(true);
// 			const response = await fetch(`/api/invoices/${invoice.id}`, {
// 				method: "PATCH",
// 				headers: {
// 					"Content-Type": "application/json",
// 				},
// 				body: JSON.stringify({
// 					action: "confirm_payment",
// 					transactionReference,
// 					notes: confirmationNotes,
// 				}),
// 			});

// 			if (!response.ok) throw new Error("Failed to confirm payment");

// 			toast.success("Payment confirmed successfully");
// 			fetchInvoice(); // Refresh invoice data
// 			setTransactionReference("");
// 			setConfirmationNotes("");
// 		} catch (error) {
// 			console.error("Error confirming payment:", error);
// 			toast.error("Failed to confirm payment");
// 		} finally {
// 			setConfirmingPayment(false);
// 		}
// 	};

// 	const handleResendPaymentLink = async () => {
// 		if (!invoice) return;

// 		try {
// 			setResendingLink(true);
// 			const response = await fetch(`/api/invoices/${invoice.id}`, {
// 				method: "PATCH",
// 				headers: {
// 					"Content-Type": "application/json",
// 				},
// 				body: JSON.stringify({
// 					action: "resend_payment_link",
// 				}),
// 			});

// 			if (!response.ok) throw new Error("Failed to resend payment link");

// 			toast.success("Payment link resent successfully");
// 		} catch (error) {
// 			console.error("Error resending payment link:", error);
// 			toast.error("Failed to resend payment link");
// 		} finally {
// 			setResendingLink(false);
// 		}
// 	};

// 	const handleDownloadReceipt = async () => {
// 		if (!invoice) return;

// 		try {
// 			setDownloadingReceipt(true);
// 			const response = await fetch(`/api/invoices/${invoice.id}/receipt`);

// 			if (!response.ok) {
// 				const errorData = await response.json();
// 				throw new Error(errorData.error || "Failed to generate receipt");
// 			}

// 			const receiptHTML = await response.text();
// 			const blob = new Blob([receiptHTML], { type: "text/html" });
// 			const url = URL.createObjectURL(blob);

// 			const link = document.createElement("a");
// 			link.href = url;
// 			link.download = `Receipt_${invoice.invoiceNumber}_${invoice.student.studentId}.html`;
// 			document.body.appendChild(link);
// 			link.click();
// 			document.body.removeChild(link);
// 			URL.revokeObjectURL(url);

// 			toast.success("Receipt downloaded successfully");
// 		} catch (error) {
// 			console.error("Error downloading receipt:", error);
// 			toast.error("Failed to download receipt");
// 		} finally {
// 			setDownloadingReceipt(false);
// 		}
// 	};

// 	const getStatusBadge = (status: string) => {
// 		const statusConfig = {
// 			PENDING: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
// 			PAID: { color: "bg-green-100 text-green-800", icon: CheckCircle },
// 			PARTIALLY_PAID: { color: "bg-blue-100 text-blue-800", icon: AlertCircle },
// 			OVERDUE: { color: "bg-red-100 text-red-800", icon: AlertCircle },
// 			CANCELLED: { color: "bg-gray-100 text-gray-800", icon: AlertCircle },
// 		};

// 		const config =
// 			statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
// 		const Icon = config.icon;

// 		return (
// 			<Badge className={`${config.color} flex items-center gap-1`}>
// 				<Icon className="h-3 w-3" />
// 				{status.replace("_", " ")}
// 			</Badge>
// 		);
// 	};

// 	const getPaymentMethodBadge = (method: string) => {
// 		const colors = {
// 			CASH: "bg-green-100 text-green-800",
// 			BANK_TRANSFER: "bg-blue-100 text-blue-800",
// 			TELEBIRR: "bg-purple-100 text-purple-800",
// 			ONLINE: "bg-orange-100 text-orange-800",
// 		};

// 		return (
// 			<Badge
// 				className={
// 					colors[method as keyof typeof colors] || "bg-gray-100 text-gray-800"
// 				}>
// 				{method.replace("_", " ")}
// 			</Badge>
// 		);
// 	};

// 	if (loading) {
// 		return (
// 			<div className="flex justify-center items-center min-h-[400px]">
// 				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
// 			</div>
// 		);
// 	}

// 	if (!invoice) {
// 		return (
// 			<div className="text-center py-8">
// 				<p className="text-muted-foreground">Invoice not found</p>
// 				<Button asChild className="mt-4">
// 					<Link href="/dashboard/invoices">
// 						<ArrowLeft className="h-4 w-4 mr-2" />
// 						Back to Invoices
// 					</Link>
// 				</Button>
// 			</div>
// 		);
// 	}

// 	const pendingPayment = invoice.payments.find((p) => p.status === "PENDING");
// 	const isOnlinePayment =
// 		pendingPayment &&
// 		(pendingPayment.paymentMethod === "TELEBIRR" ||
// 			pendingPayment.paymentMethod === "ONLINE");
// 	const canConfirmPayment = invoice.status === "PENDING" && pendingPayment;
// 	const canResendLink = invoice.status === "PENDING" && isOnlinePayment;
// 	const canDownloadReceipt =
// 		invoice.status === "PAID" &&
// 		invoice.payments.some((p) => p.status === "COMPLETED");

// 	return (
// 		<div className="space-y-6">
// 			<div className="flex items-center justify-between">
// 				<div className="flex items-center gap-4">
// 					<Button asChild variant="outline" size="sm">
// 						<Link href="/dashboard/invoices">
// 							<ArrowLeft className="h-4 w-4 mr-2" />
// 							Back
// 						</Link>
// 					</Button>
// 					<div>
// 						<h1 className="text-3xl font-bold tracking-tight">
// 							Invoice {invoice.invoiceNumber}
// 						</h1>
// 						<p className="text-muted-foreground">
// 							Created on {new Date(invoice.createdAt).toLocaleDateString()}
// 						</p>
// 					</div>
// 				</div>
// 				<div className="flex items-center gap-2">
// 					{getStatusBadge(invoice.status)}
// 				</div>
// 			</div>

// 			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
// 				{/* Invoice Details */}
// 				<div className="lg:col-span-2 space-y-6">
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
// 										{invoice.student.user.firstName}{" "}
// 										{invoice.student.user.lastName}
// 									</p>
// 								</div>
// 								<div>
// 									<Label className="text-sm font-medium text-muted-foreground">
// 										Student ID
// 									</Label>
// 									<p className="font-medium">{invoice.student.studentId}</p>
// 								</div>
// 								<div>
// 									<Label className="text-sm font-medium text-muted-foreground">
// 										Branch
// 									</Label>
// 									<p className="font-medium">{invoice.branch.name}</p>
// 								</div>
// 								<div>
// 									<Label className="text-sm font-medium text-muted-foreground">
// 										Parent Contact
// 									</Label>
// 									<div className="flex items-center gap-2">
// 										<Phone className="h-4 w-4 text-muted-foreground" />
// 										<p className="font-medium">
// 											{invoice.student.parents[0]?.parent.user.phone ||
// 												"Not provided"}
// 										</p>
// 									</div>
// 								</div>
// 							</div>
// 						</CardContent>
// 					</Card>

// 					{/* Invoice Items */}
// 					<Card>
// 						<CardHeader>
// 							<CardTitle>Invoice Items</CardTitle>
// 						</CardHeader>
// 						<CardContent>
// 							<Table>
// 								<TableHeader>
// 									<TableRow>
// 										<TableHead>Description</TableHead>
// 										<TableHead>Fee Type</TableHead>
// 										<TableHead className="text-right">Quantity</TableHead>
// 										<TableHead className="text-right">Amount</TableHead>
// 									</TableRow>
// 								</TableHeader>
// 								<TableBody>
// 									{invoice.items.map((item) => (
// 										<TableRow key={item.id}>
// 											<TableCell>{item.description}</TableCell>
// 											<TableCell>{item.feeType.name}</TableCell>
// 											<TableCell className="text-right">
// 												{item.quantity}
// 											</TableCell>
// 											<TableCell className="text-right">
// 												ETB {item.amount.toLocaleString()}
// 											</TableCell>
// 										</TableRow>
// 									))}
// 								</TableBody>
// 							</Table>
// 							<Separator className="my-4" />
// 							<div className="space-y-2">
// 								<div className="flex justify-between items-center">
// 									<span>Subtotal</span>
// 									<span>ETB {invoice.totalAmount.toLocaleString()}</span>
// 								</div>
// 								{invoice.discountAmount && invoice.discountAmount > 0 && (
// 									<div className="flex justify-between items-center text-green-600">
// 										<span>Discount</span>
// 										<span>- ETB {invoice.discountAmount.toLocaleString()}</span>
// 									</div>
// 								)}
// 								<Separator />
// 								<div className="flex justify-between items-center font-semibold text-lg">
// 									<span>Total Amount</span>
// 									<span>
// 										ETB{" "}
// 										{(
// 											invoice.finalAmount || invoice.totalAmount
// 										).toLocaleString()}
// 									</span>
// 								</div>
// 							</div>
// 						</CardContent>
// 					</Card>

// 					{/* Payment History */}
// 					<Card>
// 						<CardHeader>
// 							<CardTitle>Payment History</CardTitle>
// 						</CardHeader>
// 						<CardContent>
// 							{invoice.payments.length > 0 ? (
// 								<Table>
// 									<TableHeader>
// 										<TableRow>
// 											<TableHead>Payment #</TableHead>
// 											<TableHead>Method</TableHead>
// 											<TableHead>Status</TableHead>
// 											<TableHead>Transaction ID</TableHead>
// 											<TableHead className="text-right">Amount</TableHead>
// 											<TableHead>Date</TableHead>
// 										</TableRow>
// 									</TableHeader>
// 									<TableBody>
// 										{invoice.payments.map((payment) => (
// 											<TableRow key={payment.id}>
// 												<TableCell className="font-medium">
// 													{payment.paymentNumber}
// 												</TableCell>
// 												<TableCell>
// 													{getPaymentMethodBadge(payment.paymentMethod)}
// 												</TableCell>
// 												<TableCell>{getStatusBadge(payment.status)}</TableCell>
// 												<TableCell>{payment.transactionId || "-"}</TableCell>
// 												<TableCell className="text-right">
// 													ETB {payment.amount.toLocaleString()}
// 												</TableCell>
// 												<TableCell>
// 													{new Date(payment.createdAt).toLocaleDateString()}
// 												</TableCell>
// 											</TableRow>
// 										))}
// 									</TableBody>
// 								</Table>
// 							) : (
// 								<p className="text-muted-foreground text-center py-4">
// 									No payments recorded
// 								</p>
// 							)}
// 						</CardContent>
// 					</Card>
// 				</div>

// 				{/* Actions Sidebar */}
// 				<div className="space-y-6">
// 					{/* Payment Summary */}
// 					<Card>
// 						<CardHeader>
// 							<CardTitle>Payment Summary</CardTitle>
// 						</CardHeader>
// 						<CardContent className="space-y-4">
// 							<div className="flex justify-between">
// 								<span className="text-muted-foreground">Total Amount</span>
// 								<span className="font-medium">
// 									ETB {invoice.totalAmount.toLocaleString()}
// 								</span>
// 							</div>
// 							{invoice.discountAmount && invoice.discountAmount > 0 && (
// 								<div className="flex justify-between text-green-600">
// 									<span className="text-muted-foreground">Discount</span>
// 									<span className="font-medium">
// 										- ETB {invoice.discountAmount.toLocaleString()}
// 									</span>
// 								</div>
// 							)}
// 							<div className="flex justify-between">
// 								<span className="text-muted-foreground">Paid Amount</span>
// 								<span className="font-medium">
// 									ETB {invoice.paidAmount.toLocaleString()}
// 								</span>
// 							</div>
// 							<Separator />
// 							<div className="flex justify-between font-semibold">
// 								<span>Balance Due</span>
// 								<span>
// 									ETB{" "}
// 									{(
// 										(invoice.finalAmount || invoice.totalAmount) -
// 										invoice.paidAmount
// 									).toLocaleString()}
// 								</span>
// 							</div>
// 							<div className="flex justify-between text-sm">
// 								<span className="text-muted-foreground">Due Date</span>
// 								<span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
// 							</div>
// 						</CardContent>
// 					</Card>

// 					{/* Actions */}
// 					<Card>
// 						<CardHeader>
// 							<CardTitle>Actions</CardTitle>
// 						</CardHeader>
// 						<CardContent className="space-y-3">
// 							{canConfirmPayment && (
// 								<Dialog>
// 									<DialogTrigger asChild>
// 										<Button className="w-full">
// 											<CheckCircle className="h-4 w-4 mr-2" />
// 											Confirm Payment
// 										</Button>
// 									</DialogTrigger>
// 									<DialogContent>
// 										<DialogHeader>
// 											<DialogTitle>Confirm Payment</DialogTitle>
// 											<DialogDescription>
// 												Manually confirm the payment for this invoice. This
// 												action cannot be undone.
// 											</DialogDescription>
// 										</DialogHeader>
// 										<div className="space-y-4">
// 											<div>
// 												<Label htmlFor="transactionRef">
// 													Transaction Reference (Optional)
// 												</Label>
// 												<Input
// 													id="transactionRef"
// 													placeholder="Bank transaction number or reference"
// 													value={transactionReference}
// 													onChange={(e) =>
// 														setTransactionReference(e.target.value)
// 													}
// 												/>
// 											</div>
// 											<div>
// 												<Label htmlFor="notes">Notes (Optional)</Label>
// 												<Textarea
// 													id="notes"
// 													placeholder="Additional notes about the payment confirmation"
// 													value={confirmationNotes}
// 													onChange={(e) => setConfirmationNotes(e.target.value)}
// 												/>
// 											</div>
// 										</div>
// 										<DialogFooter>
// 											<Button
// 												onClick={handleConfirmPayment}
// 												disabled={confirmingPayment}>
// 												{confirmingPayment
// 													? "Confirming..."
// 													: "Confirm Payment"}
// 											</Button>
// 										</DialogFooter>
// 									</DialogContent>
// 								</Dialog>
// 							)}

// 							{/* {canResendLink && (
// 								<Button
// 									variant="outline"
// 									className="w-full bg-transparent"
// 									onClick={handleResendPaymentLink}
// 									disabled={resendingLink}>
// 									<Send className="h-4 w-4 mr-2" />
// 									{resendingLink ? "Sending..." : "Resend Payment Link"}
// 								</Button>
// 							)} */}

// 							{canDownloadReceipt && (
// 								<Button
// 									variant="outline"
// 									className="w-full bg-transparent"
// 									onClick={handleDownloadReceipt}
// 									disabled={downloadingReceipt}>
// 									<Receipt className="h-4 w-4 mr-2" />
// 									{downloadingReceipt ? "Generating..." : "Download Receipt"}
// 								</Button>
// 							)}

// 							{/* <Button variant="outline" className="w-full bg-transparent">
// 								<Download className="h-4 w-4 mr-2" />
// 								Download Invoice
// 							</Button> */}
// 						</CardContent>
// 					</Card>

// 					{/* Invoice Info */}
// 					<Card>
// 						<CardHeader>
// 							<CardTitle>Invoice Information</CardTitle>
// 						</CardHeader>
// 						<CardContent className="space-y-2 text-sm">
// 							<div className="flex justify-between">
// 								<span className="text-muted-foreground">Created By</span>
// 								<span>
// 									{invoice.createdBy.firstName} {invoice.createdBy.lastName}
// 								</span>
// 							</div>
// 							<div className="flex justify-between">
// 								<span className="text-muted-foreground">Created Date</span>
// 								<span>{new Date(invoice.createdAt).toLocaleDateString()}</span>
// 							</div>
// 							<div className="flex justify-between">
// 								<span className="text-muted-foreground">Due Date</span>
// 								<span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
// 							</div>
// 						</CardContent>
// 					</Card>
// 				</div>
// 			</div>
// 		</div>
// 	);
// }
