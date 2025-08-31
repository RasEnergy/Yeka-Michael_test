"use client";

import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Search,
	Filter,
	Eye,
	Send,
	CheckCircle,
	Clock,
	AlertCircle,
	Download,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
	id: string;
	invoiceNumber: string;
	totalAmount: number;
	paidAmount: number;
	status: string;
	dueDate: string;
	createdAt: string;
	student: {
		user: {
			firstName: string;
			lastName: string;
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
			relationship: string;
		}>;
	};
	branch: {
		name: string;
	};
	registration?: {
		registrationNumber: string;
	};
	payments: Array<{
		paymentMethod: string;
		status: string;
		transactionId?: string;
		paymentDate: string;
	}>;
	createdBy: {
		firstName: string;
		lastName: string;
	};
}

interface InvoicesResponse {
	invoices: Invoice[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		pages: number;
	};
}

export default function InvoicesPage() {
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [loading, setLoading] = useState(true);
	const [exporting, setExporting] = useState(false);
	const { toast } = useToast();
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 10,
		total: 0,
		pages: 0,
	});
	const [filters, setFilters] = useState({
		search: "",
		status: "ALL", // Updated default value to "ALL"
		paymentMethod: "ALL", // Updated default value to "ALL"
	});

	const fetchInvoices = async () => {
		try {
			setLoading(true);
			const params = new URLSearchParams({
				page: pagination.page.toString(),
				limit: pagination.limit.toString(),
				...(filters.search && { search: filters.search }),
				...(filters.status !== "ALL" && { status: filters.status }),
				...(filters.paymentMethod !== "ALL" && {
					paymentMethod: filters.paymentMethod,
				}),
			});

			const response = await fetch(`/api/invoices?${params}`);
			if (!response.ok) throw new Error("Failed to fetch invoices");

			const data: InvoicesResponse = await response.json();
			setInvoices(data.invoices);
			setPagination(data.pagination);
		} catch (error) {
			console.error("Error fetching invoices:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchInvoices();
	}, [pagination.page, filters]);

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

	const handleExportToExcel = async () => {
		try {
			setExporting(true);

			const params = new URLSearchParams({
				export: "excel",
				...(filters.search && { search: filters.search }),
				...(filters.status !== "ALL" && { status: filters.status }),
				...(filters.paymentMethod !== "ALL" && {
					paymentMethod: filters.paymentMethod,
				}),
			});

			const response = await fetch(`/api/invoices/export?${params}`);

			if (!response.ok) {
				throw new Error("Failed to export invoices");
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `invoices-export-${
				new Date().toISOString().split("T")[0]
			}.xlsx`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			toast({
				title: "Success",
				description: "Invoices exported successfully",
			});
		} catch (error) {
			console.error("Export error:", error);
			toast({
				title: "Error",
				description: "Failed to export invoices",
				variant: "destructive",
			});
		} finally {
			setExporting(false);
		}
	};

	const formatPaymentDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const handleSearch = (value: string) => {
		setFilters((prev) => ({ ...prev, search: value }));
		setPagination((prev) => ({ ...prev, page: 1 }));
	};

	const handleStatusFilter = (value: string) => {
		setFilters((prev) => ({ ...prev, status: value }));
		setPagination((prev) => ({ ...prev, page: 1 }));
	};

	const handlePaymentMethodFilter = (value: string) => {
		setFilters((prev) => ({ ...prev, paymentMethod: value }));
		setPagination((prev) => ({ ...prev, page: 1 }));
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Invoice Management
					</h1>
					<p className="text-muted-foreground">
						Manage all invoices, payments, and confirmations
					</p>
				</div>
				<Button
					onClick={handleExportToExcel}
					disabled={exporting}
					className="flex items-center gap-2">
					<Download className="h-4 w-4" />
					{exporting ? "Exporting..." : "Export to Excel"}
				</Button>
			</div>

			{/* Filters */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Filter className="h-5 w-5" />
						Filters
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="flex-1">
							<div className="relative">
								<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search by invoice number, student name, or ID..."
									value={filters.search}
									onChange={(e) => handleSearch(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>
						<Select value={filters.status} onValueChange={handleStatusFilter}>
							<SelectTrigger className="w-full sm:w-[200px]">
								<SelectValue placeholder="Filter by status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="ALL">All Statuses</SelectItem>
								<SelectItem value="PENDING">Pending</SelectItem>
								<SelectItem value="PAID">Paid</SelectItem>
								<SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
								<SelectItem value="OVERDUE">Overdue</SelectItem>
								<SelectItem value="CANCELLED">Cancelled</SelectItem>
							</SelectContent>
						</Select>
						<Select
							value={filters.paymentMethod}
							onValueChange={handlePaymentMethodFilter}>
							<SelectTrigger className="w-full sm:w-[200px]">
								<SelectValue placeholder="Filter by payment method" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="ALL">All Payment Methods</SelectItem>
								<SelectItem value="CASH">Cash</SelectItem>
								<SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
								<SelectItem value="TELEBIRR">Telebirr</SelectItem>
								<SelectItem value="ONLINE">Online</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Invoices Table */}
			<Card>
				<CardHeader>
					<CardTitle>Invoices</CardTitle>
					<CardDescription>{pagination.total} total invoices</CardDescription>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="flex justify-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
						</div>
					) : (
						<div className="space-y-4">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Transaction No</TableHead>
										<TableHead>Receipt No</TableHead>
										<TableHead>Student</TableHead>
										<TableHead>Parent Info</TableHead>
										<TableHead>Amount</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Payment Method</TableHead>
										<TableHead>Payment Date</TableHead>
										<TableHead>Created By</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{invoices.map((invoice) => (
										<TableRow key={invoice.id}>
											<TableCell className="font-medium">
												{invoice.payments.length > 0 &&
												invoice.payments[0].transactionId ? (
													<code className="bg-muted px-2 py-1 rounded text-sm font-mono">
														{invoice.payments[0].transactionId}
													</code>
												) : (
													<span className="text-muted-foreground">
														No transaction
													</span>
												)}
											</TableCell>
											<TableCell className="font-medium">
												{JSON.stringify(invoice.registration)}
												{invoice.registration?.registrationNumber ? (
													<code className="bg-blue-50 px-2 py-1 rounded text-sm font-mono text-blue-700">
														{invoice.registration.registrationNumber}
													</code>
												) : (
													<span className="text-muted-foreground">N/A</span>
												)}
											</TableCell>
											<TableCell>
												<div>
													<div className="font-medium">
														{invoice.student.user.firstName}{" "}
														{invoice.student.user.lastName}
													</div>
													<div className="text-sm text-muted-foreground">
														ID: {invoice.student.studentId}
													</div>
												</div>
											</TableCell>
											<TableCell>
												{invoice.student.parents &&
												invoice.student.parents.length > 0 ? (
													<div className="space-y-1">
														{invoice.student.parents
															.slice(0, 2)
															.map((parentRel, index) => (
																<div key={index} className="text-sm">
																	<div className="font-medium">
																		{parentRel.parent.user.firstName}{" "}
																		{parentRel.parent.user.lastName}
																	</div>
																	<div className="text-muted-foreground">
																		{parentRel.parent.user.phone || "No phone"}
																	</div>
																</div>
															))}
														{invoice.student.parents.length > 2 && (
															<div className="text-xs text-muted-foreground">
																+{invoice.student.parents.length - 2} more
															</div>
														)}
													</div>
												) : (
													<span className="text-muted-foreground">
														No parent info
													</span>
												)}
											</TableCell>
											<TableCell>
												<div>
													<div className="font-medium">
														ETB {invoice.totalAmount.toLocaleString()}
													</div>
													{invoice.paidAmount > 0 && (
														<div className="text-sm text-muted-foreground">
															Paid: ETB {invoice.paidAmount.toLocaleString()}
														</div>
													)}
												</div>
											</TableCell>
											<TableCell>{getStatusBadge(invoice.status)}</TableCell>
											<TableCell>
												{invoice.payments.length > 0 &&
													getPaymentMethodBadge(
														invoice.payments[0].paymentMethod
													)}
											</TableCell>
											<TableCell>
												{invoice.payments.length > 0 &&
												invoice.payments[0].paymentDate ? (
													<div className="font-medium">
														{new Date(
															invoice.payments[0].paymentDate
														).toLocaleDateString("en-US", {
															month: "short",
															day: "numeric",
															year: "numeric",
														})}
													</div>
												) : (
													<span className="text-muted-foreground">
														No payment date
													</span>
												)}
											</TableCell>
											<TableCell>
												<div className="text-sm">
													<div className="font-medium">
														{invoice.createdBy.firstName}{" "}
														{invoice.createdBy.lastName}
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<Button asChild size="sm" variant="outline">
														<Link href={`/dashboard/invoices/${invoice.id}`}>
															<Eye className="h-4 w-4" />
														</Link>
													</Button>
													{invoice.status === "PENDING" &&
														invoice.payments.some(
															(p) =>
																p.paymentMethod === "TELEBIRR" ||
																p.paymentMethod === "ONLINE"
														) && (
															<Button size="sm" variant="outline">
																<Send className="h-4 w-4" />
															</Button>
														)}
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
								{/* <TableBody>
									{invoices.map((invoice) => (
										<TableRow key={invoice.id}>
											<TableCell className="font-medium">
												{invoice.invoiceNumber}
											</TableCell>
											<TableCell>
												<div>
													<div className="font-medium">
														{invoice.student.user.firstName}{" "}
														{invoice.student.user.lastName}
													</div>
													<div className="text-sm text-muted-foreground">
														ID: {invoice.student.studentId}
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div>
													<div className="font-medium">
														ETB {invoice.totalAmount.toLocaleString()}
													</div>
													{invoice.paidAmount > 0 && (
														<div className="text-sm text-muted-foreground">
															Paid: ETB {invoice.paidAmount.toLocaleString()}
														</div>
													)}
												</div>
											</TableCell>
											<TableCell>{getStatusBadge(invoice.status)}</TableCell>
											<TableCell>
												{invoice.payments.length > 0 &&
													getPaymentMethodBadge(
														invoice.payments[0].paymentMethod
													)}
											</TableCell>
											<TableCell>
												{new Date(invoice.dueDate).toLocaleDateString()}
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<Button asChild size="sm" variant="outline">
														<Link href={`/dashboard/invoices/${invoice.id}`}>
															<Eye className="h-4 w-4" />
														</Link>
													</Button>
													{invoice.status === "PENDING" &&
														invoice.payments.some(
															(p) =>
																p.paymentMethod === "TELEBIRR" ||
																p.paymentMethod === "ONLINE"
														) && (
															<Button size="sm" variant="outline">
																<Send className="h-4 w-4" />
															</Button>
														)}
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody> */}
							</Table>

							{/* Pagination */}
							{pagination.pages > 1 && (
								<div className="flex items-center justify-between">
									<div className="text-sm text-muted-foreground">
										Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
										{Math.min(
											pagination.page * pagination.limit,
											pagination.total
										)}{" "}
										of {pagination.total} results
									</div>
									<div className="flex items-center gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												setPagination((prev) => ({
													...prev,
													page: prev.page - 1,
												}))
											}
											disabled={pagination.page === 1}>
											Previous
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												setPagination((prev) => ({
													...prev,
													page: prev.page + 1,
												}))
											}
											disabled={pagination.page === pagination.pages}>
											Next
										</Button>
									</div>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
