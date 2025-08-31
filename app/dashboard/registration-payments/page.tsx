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
	CreditCard,
	Clock,
	CheckCircle,
	AlertCircle,
	XCircle,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface RegistrationPayment {
	id: string;
	registrationNumber: string;
	status: string;
	paymentOption: string | null;
	registrationFee: number;
	additionalFee: number;
	discountAmount: number;
	totalAmount: number;
	paymentDueDate: string;
	completedAt: string | null;
	createdAt: string;
	student: {
		id: string;
		studentId: string;
		studentType: string;
		user: {
			firstName: string;
			lastName: string;
			email: string;
			phone: string | null;
		};
	};
	branch: {
		id: string;
		name: string;
		code: string;
	};
	grade: {
		id: string;
		name: string;
		level: number;
	} | null;
	latestInvoice: {
		id: string;
		invoiceNumber: string;
		status: string;
		totalAmount: number;
		paidAmount: number;
	} | null;
	latestPayment: {
		id: string;
		paymentNumber: string;
		paymentMethod: string;
		status: string;
		amount: number;
		createdAt: string;
	} | null;
}

interface RegistrationPaymentsResponse {
	registrations: RegistrationPayment[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		pages: number;
	};
}

export default function RegistrationPaymentsPage() {
	const [registrations, setRegistrations] = useState<RegistrationPayment[]>([]);
	const [loading, setLoading] = useState(true);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 10,
		total: 0,
		pages: 0,
	});
	const [filters, setFilters] = useState({
		search: "",
		status: "ALL",
		paymentOption: "ALL",
		branchId: "ALL",
	});
	const [branches, setBranches] = useState<
		Array<{ id: string; name: string; code: string }>
	>([]);
	const { toast } = useToast();

	const fetchRegistrations = async () => {
		try {
			setLoading(true);
			const params = new URLSearchParams({
				page: pagination.page.toString(),
				limit: pagination.limit.toString(),
				...(filters.search && { search: filters.search }),
				...(filters.status !== "ALL" && { status: filters.status }),
				...(filters.paymentOption !== "ALL" && {
					paymentOption: filters.paymentOption,
				}),
				...(filters.branchId !== "ALL" && { branchId: filters.branchId }),
			});

			const response = await fetch(`/api/registration-payments?${params}`);
			if (!response.ok)
				throw new Error("Failed to fetch registration payments");

			const data: RegistrationPaymentsResponse = await response.json();
			setRegistrations(data.registrations);
			setPagination(data.pagination);
		} catch (error) {
			console.error("Error fetching registration payments:", error);
			toast({
				title: "Error",
				description: "Failed to fetch registration payments",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const fetchBranches = async () => {
		try {
			const response = await fetch("/api/branches");
			if (!response.ok) throw new Error("Failed to fetch branches");

			const data = await response.json();
			setBranches(data.branches);
		} catch (error) {
			console.error("Error fetching branches:", error);
		}
	};

	useEffect(() => {
		fetchBranches();
	}, []);

	useEffect(() => {
		fetchRegistrations();
	}, [pagination.page, filters]);

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			PENDING_PAYMENT: {
				color: "bg-yellow-100 text-yellow-800",
				icon: Clock,
				label: "Pending Payment",
			},
			PAYMENT_COMPLETED: {
				color: "bg-green-100 text-green-800",
				icon: CheckCircle,
				label: "Payment Completed",
			},
			ENROLLED: {
				color: "bg-blue-100 text-blue-800",
				icon: Users,
				label: "Enrolled",
			},
			CANCELLED: {
				color: "bg-red-100 text-red-800",
				icon: XCircle,
				label: "Cancelled",
			},
			EXPIRED: {
				color: "bg-gray-100 text-gray-800",
				icon: AlertCircle,
				label: "Expired",
			},
		};

		const config =
			statusConfig[status as keyof typeof statusConfig] ||
			statusConfig.PENDING_PAYMENT;
		const Icon = config.icon;

		return (
			<Badge className={`${config.color} flex items-center gap-1`}>
				<Icon className="h-3 w-3" />
				{config.label}
			</Badge>
		);
	};

	const getPaymentOptionBadge = (option: string | null) => {
		if (!option) return <Badge variant="outline">Not Selected</Badge>;

		const colors = {
			REGISTRATION_MONTHLY: "bg-blue-100 text-blue-800",
			REGISTRATION_QUARTERLY: "bg-purple-100 text-purple-800",
		};

		const labels = {
			REGISTRATION_MONTHLY: "Monthly Plan",
			REGISTRATION_QUARTERLY: "Quarterly Plan",
		};

		return (
			<Badge
				className={
					colors[option as keyof typeof colors] || "bg-gray-100 text-gray-800"
				}>
				{labels[option as keyof typeof labels] || option}
			</Badge>
		);
	};

	const getStudentTypeBadge = (type: string) => {
		const colors = {
			NEW_STUDENT: "bg-green-100 text-green-800",
			REGULAR_STUDENT: "bg-blue-100 text-blue-800",
		};

		const labels = {
			NEW_STUDENT: "New Student",
			REGULAR_STUDENT: "Regular Student",
		};

		return (
			<Badge
				className={
					colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
				}>
				{labels[type as keyof typeof labels] || type}
			</Badge>
		);
	};

	const handleSearch = (value: string) => {
		setFilters((prev) => ({ ...prev, search: value }));
		setPagination((prev) => ({ ...prev, page: 1 }));
	};

	const handleStatusFilter = (value: string) => {
		setFilters((prev) => ({ ...prev, status: value }));
		setPagination((prev) => ({ ...prev, page: 1 }));
	};

	const handlePaymentOptionFilter = (value: string) => {
		setFilters((prev) => ({ ...prev, paymentOption: value }));
		setPagination((prev) => ({ ...prev, page: 1 }));
	};

	const handleBranchFilter = (value: string) => {
		setFilters((prev) => ({ ...prev, branchId: value }));
		setPagination((prev) => ({ ...prev, page: 1 }));
	};

	const isOverdue = (dueDate: string, status: string) => {
		if (status === "PAYMENT_COMPLETED" || status === "ENROLLED") return false;
		return new Date(dueDate) < new Date();
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Registration Payments
					</h1>
					<p className="text-muted-foreground">
						Manage student registration payments and track payment status
					</p>
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Registrations
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{pagination.total}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Pending Payments
						</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{
								registrations.filter((r) => r.status === "PENDING_PAYMENT")
									.length
							}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Completed Payments
						</CardTitle>
						<CheckCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{
								registrations.filter(
									(r) =>
										r.status === "PAYMENT_COMPLETED" || r.status === "ENROLLED"
								).length
							}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Overdue Payments
						</CardTitle>
						<AlertCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{
								registrations.filter((r) =>
									isOverdue(r.paymentDueDate, r.status)
								).length
							}
						</div>
					</CardContent>
				</Card>
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
									placeholder="Search by registration number, student name, or ID..."
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
								<SelectItem value="PENDING_PAYMENT">Pending Payment</SelectItem>
								<SelectItem value="PAYMENT_COMPLETED">
									Payment Completed
								</SelectItem>
								<SelectItem value="ENROLLED">Enrolled</SelectItem>
								<SelectItem value="CANCELLED">Cancelled</SelectItem>
								<SelectItem value="EXPIRED">Expired</SelectItem>
							</SelectContent>
						</Select>
						<Select
							value={filters.paymentOption}
							onValueChange={handlePaymentOptionFilter}>
							<SelectTrigger className="w-full sm:w-[200px]">
								<SelectValue placeholder="Filter by payment option" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="ALL">All Payment Options</SelectItem>
								<SelectItem value="REGISTRATION_MONTHLY">
									Monthly Plan
								</SelectItem>
								<SelectItem value="REGISTRATION_QUARTERLY">
									Quarterly Plan
								</SelectItem>
							</SelectContent>
						</Select>
						<Select value={filters.branchId} onValueChange={handleBranchFilter}>
							<SelectTrigger className="w-full sm:w-[200px]">
								<SelectValue placeholder="Filter by branch" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="ALL">All Branches</SelectItem>
								{branches.map((branch) => (
									<SelectItem key={branch.id} value={branch.id}>
										{branch.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Registration Payments Table */}
			<Card>
				<CardHeader>
					<CardTitle>Registration Payments</CardTitle>
					<CardDescription>
						{pagination.total} total registration payments
					</CardDescription>
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
										<TableHead>Registration #</TableHead>
										<TableHead>Student</TableHead>
										<TableHead>Branch & Grade</TableHead>
										{/* <TableHead>Payment Plan</TableHead> */}
										<TableHead>Amount</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Due Date</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{registrations.map((registration) => (
										<TableRow key={registration.id}>
											<TableCell className="font-medium">
												{registration.registrationNumber}
											</TableCell>
											<TableCell>
												<div>
													<div className="font-medium">
														{registration.student.user.firstName}{" "}
														{registration.student.user.lastName}
													</div>
													<div className="text-sm text-muted-foreground">
														ID: {registration.student.studentId}
													</div>
													<div className="mt-1">
														{getStudentTypeBadge(
															registration.student.studentType
														)}
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div>
													<div className="font-medium">
														{registration.branch.name}
													</div>
													{registration.grade && (
														<div className="text-sm text-muted-foreground">
															{registration.grade.name}
														</div>
													)}
												</div>
											</TableCell>
											{/* <TableCell>
												{getPaymentOptionBadge(registration.paymentOption)}
											</TableCell> */}
											<TableCell>
												<div>
													{/* <div className="font-medium">
														ETB {registration.totalAmount.toLocaleString()}
													</div> */}
													<div className="font-medium">
														ETB{" "}
														{(
															registration.totalAmount -
															(registration.discountAmount || 0)
														).toLocaleString()}
													</div>
													{registration.additionalFee > 0 && (
														<div className="text-sm text-muted-foreground">
															Reg: ETB{" "}
															{registration.registrationFee.toLocaleString()} +
															Additional: ETB{" "}
															{registration.additionalFee.toLocaleString()}
														</div>
													)}
												</div>
											</TableCell>
											<TableCell>
												<div className="space-y-1">
													{getStatusBadge(registration.status)}
													{isOverdue(
														registration.paymentDueDate,
														registration.status
													) && (
														<Badge variant="destructive" className="text-xs">
															Overdue
														</Badge>
													)}
												</div>
											</TableCell>
											<TableCell>
												<div className="text-sm">
													{new Date(
														registration.paymentDueDate
													).toLocaleDateString()}
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													{registration.latestInvoice ? (
														<Button asChild size="sm" variant="outline">
															<Link
																href={`/dashboard/invoices/${registration.latestInvoice.id}`}>
																<Eye className="h-4 w-4" />
															</Link>
														</Button>
													) : (
														<Button asChild size="sm" variant="outline">
															<Link
																href={`/registration/payment/${registration.id}`}>
																<CreditCard className="h-4 w-4" />
															</Link>
														</Button>
													)}
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
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
