"use client";

import { useEffect } from "react";
import { useState } from "react";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Search,
	UserCheck,
	Clock,
	CheckCircle,
	AlertCircle,
	Users,
	GraduationCap,
	UserMinus,
	Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface Registration {
	id: string;
	registrationNumber: string;
	status: string;
	paymentOption: string;
	totalAmount: number;
	completedAt?: string;
	student: {
		studentId: string;
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
		grade: {
			id: string;
			name: string;
		};
	};
	branch: {
		name: string;
		code: string;
	};
}

interface Class {
	id: string;
	name: string;
	section?: string;
	capacity: number;
	grade: {
		name: string;
	};
	_count: {
		enrollments: number;
	};
}

interface Grade {
	id: string;
	name: string;
}

interface Stats {
	pendingPayment: number;
	readyForEnrollment: number;
	enrolled: number;
	totalRegistrations: number;
}

// Helper functions
const getPaymentOptionLabel = (paymentOption: string) => {
	switch (paymentOption) {
		case "ONLINE":
			return "Online Payment";
		case "OFFLINE":
			return "Offline Payment";
		default:
			return "Unknown Payment Option";
	}
};

const getStatusBadge = (status: string) => {
	switch (status) {
		case "PENDING_PAYMENT":
			return <Badge variant="destructive">Pending Payment</Badge>;
		case "PAYMENT_COMPLETED":
			return <Badge variant="default">Ready for Enrollment</Badge>;
		case "ENROLLED":
			return <Badge variant="default">Enrolled</Badge>;
		case "CANCELLED":
			return <Badge variant="destructive">Cancelled</Badge>;
		default:
			return <Badge variant="default">Unknown Status</Badge>;
	}
};

export default function EnrollmentPage() {
	const { user } = useAuth();
	const [registrations, setRegistrations] = useState<Registration[]>([]);
	const [classes, setClasses] = useState<Class[]>([]);
	const [grades, setGrades] = useState<Grade[]>([]);
	const [stats, setStats] = useState<Stats>({
		pendingPayment: 0,
		readyForEnrollment: 0,
		enrolled: 0,
		totalRegistrations: 0,
	});
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedStatus, setSelectedStatus] = useState("PAYMENT_COMPLETED");
	const [selectedBranch, setSelectedBranch] = useState("all");
	const [selectedGrade, setSelectedGrade] = useState("all");
	const [enrollingStudent, setEnrollingStudent] = useState<string | null>(null);
	const [unenrollingStudent, setUnenrollingStudent] = useState<string | null>(
		null
	);
	const [selectedClass, setSelectedClass] = useState("");
	const [exportGrade, setExportGrade] = useState("all");
	const [isExporting, setIsExporting] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const { toast } = useToast();

	useEffect(() => {
		fetchRegistrations();
		fetchClasses();
		fetchGrades();
		fetchStats();
	}, [currentPage, searchTerm, selectedStatus, selectedBranch, selectedGrade]);

	const fetchRegistrations = async () => {
		try {
			const params = new URLSearchParams({
				page: currentPage.toString(),
				limit: "10",
				...(selectedStatus !== "all" && { status: selectedStatus }),
				...(selectedBranch !== "all" && { branchId: selectedBranch }),
				...(selectedGrade !== "all" && { gradeId: selectedGrade }),
			});

			const response: any = await apiClient.get(`/enrollments?${params}`);
			console.log({
				"enrollment-Response": response,
			});

			if (response) {
				setRegistrations(response.registrations);
				setTotalPages(response.pagination.pages);
			} else {
				toast({
					title: "Error",
					description: response.data.error || "Failed to fetch registrations",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to fetch registrations",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const fetchStats = async () => {
		try {
			const response = await apiClient.get("/enrollments/stats");
			if (response.success) {
				setStats(response.data.stats);
			}
		} catch (error) {
			console.error("Failed to fetch stats:", error);
		}
	};

	const fetchClasses = async () => {
		try {
			const response = await apiClient.get(`/classes/branch/${user?.branchId}`);
			console.log({
				classesData: response.data.classes,
			});
			if (response.success) {
				setClasses(response.data.classes);
			}
		} catch (error) {
			console.error("Failed to fetch classes:", error);
		}
	};

	const fetchGrades = async () => {
		try {
			const response = await apiClient.get(`/classes/grades/${user?.branchId}`);
			console.log({
				response,
			});
			if (response.success) {
				setGrades(response.data.grades || []);
			}
		} catch (error) {
			console.error("Failed to fetch grades:", error);
		}
	};

	const handleEnrollment = async () => {
		if (!enrollingStudent || !selectedClass) {
			toast({
				title: "Error",
				description: "Please select a class",
				variant: "destructive",
			});
			return;
		}

		try {
			const response = await fetch("/api/enrollment", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					registrationId: enrollingStudent,
					classId: selectedClass,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Enrollment failed");
			}

			toast({
				title: "Enrollment Successful",
				description:
					"Student has been enrolled and SMS notification sent to parent.",
			});

			setEnrollingStudent(null);
			setSelectedClass("");
			fetchRegistrations();
			fetchStats();
		} catch (err) {
			toast({
				title: "Error",
				description: err instanceof Error ? err.message : "An error occurred",
				variant: "destructive",
			});
		}
	};

	const handleUnenrollment = async () => {
		if (!unenrollingStudent) {
			toast({
				title: "Error",
				description: "No student selected for unenrollment",
				variant: "destructive",
			});
			return;
		}

		try {
			const response = await fetch("/api/enrollment/unenroll", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					registrationId: unenrollingStudent,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Unenrollment failed");
			}

			toast({
				title: "Unenrollment Successful",
				description: "Student has been unenrolled successfully.",
			});

			setUnenrollingStudent(null);
			fetchRegistrations();
			fetchStats();
		} catch (err) {
			toast({
				title: "Error",
				description: err instanceof Error ? err.message : "An error occurred",
				variant: "destructive",
			});
		}
	};

	const handleExport = async () => {
		setIsExporting(true);
		try {
			const params = new URLSearchParams({
				...(exportGrade !== "all" && { gradeId: exportGrade }),
			});

			const response = await fetch(`/api/enrollment/export?${params}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error("Export failed");
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.style.display = "none";
			a.href = url;
			a.download = `enrolled-students-${
				exportGrade !== "all"
					? grades.find((g) => g.id === exportGrade)?.name
					: "all-grades"
			}-${new Date().toISOString().split("T")[0]}.csv`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			toast({
				title: "Export Successful",
				description: "Enrolled students data has been exported successfully.",
			});
		} catch (err) {
			toast({
				title: "Error",
				description: err instanceof Error ? err.message : "Export failed",
				variant: "destructive",
			});
		} finally {
			setIsExporting(false);
		}
	};

	const filteredRegistrations = registrations.filter(
		(reg) =>
			reg.student.user.firstName
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			reg.student.user.lastName
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			reg.student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
			reg.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
	);

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold">Student Enrollment</h1>
						<p className="text-muted-foreground">
							Manage student registrations and enrollments
						</p>
					</div>
				</div>
				<div className="space-y-4">
					{[1, 2, 3, 4, 5].map((i) => (
						<div
							key={i}
							className="h-16 bg-gray-100 rounded animate-pulse"></div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Student Enrollment</h1>
					<p className="text-muted-foreground">
						Manage student registrations and enrollments
					</p>
				</div>
				<div className="flex gap-2">
					<Dialog>
						<DialogTrigger asChild>
							<Button variant="outline">
								<Download className="h-4 w-4 mr-2" />
								Export Students
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Export Enrolled Students</DialogTitle>
								<DialogDescription>
									Export enrolled students data filtered by grade
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4">
								<div className="space-y-2">
									<Label>Select Grade (Optional)</Label>
									<Select value={exportGrade} onValueChange={setExportGrade}>
										<SelectTrigger>
											<SelectValue placeholder="Choose a grade" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All Grades</SelectItem>
											{grades.map((grade) => (
												<SelectItem key={grade.id} value={grade.id}>
													{grade.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="flex justify-end gap-2">
									<Button
										variant="outline"
										onClick={() => setExportGrade("all")}>
										Cancel
									</Button>
									<Button onClick={handleExport} disabled={isExporting}>
										{isExporting ? "Exporting..." : "Export CSV"}
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Pending Payment
						</CardTitle>
						<Clock className="h-4 w-4 text-yellow-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.pendingPayment}</div>
						<p className="text-xs text-muted-foreground">Awaiting payment</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Ready for Enrollment
						</CardTitle>
						<UserCheck className="h-4 w-4 text-blue-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.readyForEnrollment}</div>
						<p className="text-xs text-muted-foreground">Payment completed</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Enrolled</CardTitle>
						<CheckCircle className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.enrolled}</div>
						<p className="text-xs text-muted-foreground">
							Successfully enrolled
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Registrations
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalRegistrations}</div>
						<p className="text-xs text-muted-foreground">All time</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Search & Filter</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex-1">
							<div className="relative">
								<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search by name, student ID, or registration number..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>
						<Select value={selectedStatus} onValueChange={setSelectedStatus}>
							<SelectTrigger className="w-full md:w-48">
								<SelectValue placeholder="All Statuses" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Statuses</SelectItem>
								<SelectItem value="PENDING_PAYMENT">Pending Payment</SelectItem>
								<SelectItem value="PAYMENT_COMPLETED">
									Ready for Enrollment
								</SelectItem>
								<SelectItem value="ENROLLED">Enrolled</SelectItem>
								<SelectItem value="CANCELLED">Cancelled</SelectItem>
							</SelectContent>
						</Select>
						<Select value={selectedBranch} onValueChange={setSelectedBranch}>
							<SelectTrigger className="w-full md:w-48">
								<SelectValue placeholder="All Branches" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Branches</SelectItem>
								<SelectItem value="1">Main Campus</SelectItem>
								<SelectItem value="2">Secondary Campus</SelectItem>
							</SelectContent>
						</Select>
						<Select value={selectedGrade} onValueChange={setSelectedGrade}>
							<SelectTrigger className="w-full md:w-48">
								<SelectValue placeholder="All Grades" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Grades</SelectItem>
								{grades.map((grade) => (
									<SelectItem key={grade.id} value={grade.id}>
										{grade.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Registration List</CardTitle>
					<CardDescription>
						{filteredRegistrations.length} registrations found
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Student</TableHead>
								<TableHead>Registration #</TableHead>
								<TableHead>Payment Option</TableHead>
								<TableHead>Payment Duration</TableHead>
								<TableHead>Amount</TableHead>
								<TableHead>Grade</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredRegistrations.map((registration) => (
								<TableRow key={registration.id}>
									<TableCell>
										<div className="flex items-center gap-3">
											<Avatar className="h-8 w-8">
												<AvatarImage
													src="/user.png"
													alt={`${registration.student.user.firstName} ${registration.student.user.lastName}`}
												/>
												<AvatarFallback>
													{registration.student.user.firstName[0]}
													{registration.student.user.lastName[0]}
												</AvatarFallback>
											</Avatar>
											<div>
												<div className="font-medium">
													{registration.student.user.firstName}{" "}
													{registration.student.user.lastName}
												</div>
												<div className="text-sm text-muted-foreground">
													ID: {registration.student.studentId}
												</div>
											</div>
										</div>
									</TableCell>
									<TableCell className="font-mono text-sm">
										{registration.registrationNumber}
									</TableCell>
									<TableCell>
										<div>
											<div className="font-medium">
												{getPaymentOptionLabel(registration.paymentOption)}
											</div>
											<div className="text-sm text-muted-foreground">
												{registration.branch.name}
											</div>
										</div>
									</TableCell>
									<TableCell>{(registration as any).paymentDuration}</TableCell>
									<TableCell>
										ETB {registration.totalAmount.toLocaleString()}
									</TableCell>
									<TableCell>
										{registration.student.grade?.name || "N/A"}
									</TableCell>
									<TableCell>{getStatusBadge(registration.status)}</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											{registration.status === "PAYMENT_COMPLETED" && (
												<Dialog>
													<DialogTrigger asChild>
														<Button
															size="sm"
															onClick={() =>
																setEnrollingStudent(registration.id)
															}>
															<GraduationCap className="h-4 w-4 mr-1" />
															Enroll
														</Button>
													</DialogTrigger>
													<DialogContent>
														<DialogHeader>
															<DialogTitle>Enroll Student</DialogTitle>
															<DialogDescription>
																Select a class to enroll{" "}
																{registration.student.user.firstName}{" "}
																{registration.student.user.lastName}
															</DialogDescription>
														</DialogHeader>
														<div className="space-y-4">
															<div className="space-y-2">
																<Label>Select Class</Label>
																<Select
																	value={selectedClass}
																	onValueChange={setSelectedClass}>
																	<SelectTrigger>
																		<SelectValue placeholder="Choose a class" />
																	</SelectTrigger>
																	<SelectContent>
																		{classes.map((cls) => (
																			<SelectItem key={cls.id} value={cls.id}>
																				<div className="flex justify-between items-center w-full">
																					<span>
																						{cls.name}{" "}
																						{cls.section &&
																							`- Section ${cls.section}`}
																					</span>
																					<span className="text-sm text-muted-foreground ml-2">
																						({cls._count.enrollments}/
																						{cls.capacity})
																					</span>
																				</div>
																			</SelectItem>
																		))}
																	</SelectContent>
																</Select>
															</div>

															{selectedClass && (
																<Alert>
																	<AlertCircle className="h-4 w-4" />
																	<AlertDescription>
																		This action will officially enroll the
																		student and send an SMS notification to the
																		parent.
																	</AlertDescription>
																</Alert>
															)}

															<div className="flex justify-end gap-2">
																<Button
																	variant="outline"
																	onClick={() => {
																		setEnrollingStudent(null);
																		setSelectedClass("");
																	}}>
																	Cancel
																</Button>
																<Button
																	onClick={handleEnrollment}
																	disabled={!selectedClass}>
																	Confirm Enrollment
																</Button>
															</div>
														</div>
													</DialogContent>
												</Dialog>
											)}
											{registration.status === "ENROLLED" && (
												<Dialog>
													<DialogTrigger asChild>
														<Button
															size="sm"
															variant="destructive"
															onClick={() =>
																setUnenrollingStudent(registration.id)
															}>
															<UserMinus className="h-4 w-4 mr-1" />
															Unenroll
														</Button>
													</DialogTrigger>
													<DialogContent>
														<DialogHeader>
															<DialogTitle>Unenroll Student</DialogTitle>
															<DialogDescription>
																Are you sure you want to unenroll{" "}
																{registration.student.user.firstName}{" "}
																{registration.student.user.lastName}? This
																action will change their status back to "Ready
																for Enrollment".
															</DialogDescription>
														</DialogHeader>
														<div className="space-y-4">
															<Alert>
																<AlertCircle className="h-4 w-4" />
																<AlertDescription>
																	This action will remove the student from their
																	current class and change their registration
																	status back to "Payment Completed".
																</AlertDescription>
															</Alert>

															<div className="flex justify-end gap-2">
																<Button
																	variant="outline"
																	onClick={() => setUnenrollingStudent(null)}>
																	Cancel
																</Button>
																<Button
																	variant="destructive"
																	onClick={handleUnenrollment}>
																	Confirm Unenrollment
																</Button>
															</div>
														</div>
													</DialogContent>
												</Dialog>
											)}
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>

					{filteredRegistrations.length === 0 && (
						<div className="text-center py-8">
							<p className="text-muted-foreground">No registrations found</p>
						</div>
					)}

					{totalPages > 1 && (
						<div className="flex justify-center gap-2 mt-4">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
								disabled={currentPage === 1}>
								Previous
							</Button>
							<span className="flex items-center px-3 text-sm">
								Page {currentPage} of {totalPages}
							</span>
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									setCurrentPage((prev) => Math.min(totalPages, prev + 1))
								}
								disabled={currentPage === totalPages}>
								Next
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

// "use client";

// import { Label } from "@/components/ui/label";

// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
// 	Card,
// 	CardContent,
// 	CardDescription,
// 	CardHeader,
// 	CardTitle,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
// 	Table,
// 	TableBody,
// 	TableCell,
// 	TableHead,
// 	TableHeader,
// 	TableRow,
// } from "@/components/ui/table";
// import {
// 	Select,
// 	SelectContent,
// 	SelectItem,
// 	SelectTrigger,
// 	SelectValue,
// } from "@/components/ui/select";
// import {
// 	Dialog,
// 	DialogContent,
// 	DialogDescription,
// 	DialogHeader,
// 	DialogTitle,
// 	DialogTrigger,
// } from "@/components/ui/dialog";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import {
// 	Search,
// 	UserCheck,
// 	Clock,
// 	CheckCircle,
// 	AlertCircle,
// 	Users,
// 	GraduationCap,
// } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { apiClient } from "@/lib/api";
// import { useAuth } from "@/hooks/useAuth";

// interface Registration {
// 	id: string;
// 	registrationNumber: string;
// 	status: string;
// 	paymentOption: string;
// 	totalAmount: number;
// 	completedAt?: string;
// 	student: {
// 		studentId: string;
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
// }

// interface Class {
// 	id: string;
// 	name: string;
// 	section?: string;
// 	capacity: number;
// 	grade: {
// 		name: string;
// 	};
// 	_count: {
// 		enrollments: number;
// 	};
// }

// export default function EnrollmentPage() {
// 	const { user } = useAuth();
// 	const [registrations, setRegistrations] = useState<Registration[]>([]);
// 	const [classes, setClasses] = useState<Class[]>([]);
// 	const [loading, setLoading] = useState(true);
// 	const [searchTerm, setSearchTerm] = useState("");
// 	const [selectedStatus, setSelectedStatus] = useState("PAYMENT_COMPLETED");
// 	const [selectedBranch, setSelectedBranch] = useState("all");
// 	const [enrollingStudent, setEnrollingStudent] = useState<string | null>(null);
// 	const [selectedClass, setSelectedClass] = useState("");
// 	const [currentPage, setCurrentPage] = useState(1);
// 	const [totalPages, setTotalPages] = useState(1);
// 	const { toast } = useToast();

// 	useEffect(() => {
// 		fetchRegistrations();
// 		fetchClasses();
// 	}, [currentPage, searchTerm, selectedStatus, selectedBranch]);

// 	const fetchRegistrations = async () => {
// 		try {
// 			const params = new URLSearchParams({
// 				page: currentPage.toString(),
// 				limit: "10",
// 				...(selectedStatus !== "all" && { status: selectedStatus }),
// 				...(selectedBranch !== "all" && { branchId: selectedBranch }),
// 			});

// 			// const response = await fetch(`/api/enrollment?${params}`);
// 			const response: any = await apiClient.get(`/enrollments?${params}`);
// 			console.log({
// 				"enrollment-Response": response,
// 			});

// 			// const data = await response.json();

// 			if (response) {
// 				setRegistrations(response.registrations);
// 				setTotalPages(response.pagination.pages);
// 			} else {
// 				toast({
// 					title: "Error",
// 					description: response.data.error || "Failed to fetch registrations",
// 					variant: "destructive",
// 				});
// 			}
// 		} catch (error) {
// 			toast({
// 				title: "Error",
// 				description: "Failed to fetch registrations",
// 				variant: "destructive",
// 			});
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	const fetchClasses = async () => {
// 		try {
// 			const response = await apiClient.get(`/classes/branch/${user?.branchId}`);
// 			console.log({
// 				classesData: response.data.classes,
// 			});
// 			if (response.success) {
// 				setClasses(response.data.classes);
// 			}

// 			// if (response.ok) {
// 			// 	setClasses(data.classes);
// 			// }
// 		} catch (error) {
// 			console.error("Failed to fetch classes:", error);
// 		}
// 	};

// 	const handleEnrollment = async () => {
// 		if (!enrollingStudent || !selectedClass) {
// 			toast({
// 				title: "Error",
// 				description: "Please select a class",
// 				variant: "destructive",
// 			});
// 			return;
// 		}

// 		try {
// 			const response = await fetch("/api/enrollment", {
// 				method: "POST",
// 				headers: {
// 					"Content-Type": "application/json",
// 				},
// 				body: JSON.stringify({
// 					registrationId: enrollingStudent,
// 					classId: selectedClass,
// 				}),
// 			});

// 			const data = await response.json();

// 			if (!response.ok) {
// 				throw new Error(data.error || "Enrollment failed");
// 			}

// 			toast({
// 				title: "Enrollment Successful",
// 				description:
// 					"Student has been enrolled and SMS notification sent to parent.",
// 			});

// 			setEnrollingStudent(null);
// 			setSelectedClass("");
// 			fetchRegistrations();
// 		} catch (err) {
// 			toast({
// 				title: "Error",
// 				description: err instanceof Error ? err.message : "An error occurred",
// 				variant: "destructive",
// 			});
// 		}
// 	};

// 	const getStatusBadge = (status: string) => {
// 		switch (status) {
// 			case "PENDING_PAYMENT":
// 				return (
// 					<Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
// 						Pending Payment
// 					</Badge>
// 				);
// 			case "PAYMENT_COMPLETED":
// 				return (
// 					<Badge variant="secondary" className="bg-blue-100 text-blue-800">
// 						Ready for Enrollment
// 					</Badge>
// 				);
// 			case "ENROLLED":
// 				return (
// 					<Badge variant="default" className="bg-green-100 text-green-800">
// 						Enrolled
// 					</Badge>
// 				);
// 			case "CANCELLED":
// 				return <Badge variant="destructive">Cancelled</Badge>;
// 			default:
// 				return <Badge variant="outline">{status}</Badge>;
// 		}
// 	};

// 	const getPaymentOptionLabel = (option: string) => {
// 		switch (option) {
// 			case "REGISTRATION_MONTHLY":
// 				return "Registration + Monthly";
// 			case "REGISTRATION_QUARTERLY":
// 				return "Registration + Quarterly";
// 			default:
// 				return "Registration Only";
// 		}
// 	};

// 	const filteredRegistrations = registrations.filter(
// 		(reg) =>
// 			reg.student.user.firstName
// 				.toLowerCase()
// 				.includes(searchTerm.toLowerCase()) ||
// 			reg.student.user.lastName
// 				.toLowerCase()
// 				.includes(searchTerm.toLowerCase()) ||
// 			reg.student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
// 			reg.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
// 	);

// 	if (loading) {
// 		return (
// 			<div className="space-y-6">
// 				<div className="flex justify-between items-center">
// 					<div>
// 						<h1 className="text-3xl font-bold">Student Enrollment</h1>
// 						<p className="text-muted-foreground">
// 							Manage student registrations and enrollments
// 						</p>
// 					</div>
// 				</div>
// 				<div className="space-y-4">
// 					{[1, 2, 3, 4, 5].map((i) => (
// 						<div
// 							key={i}
// 							className="h-16 bg-gray-100 rounded animate-pulse"></div>
// 					))}
// 				</div>
// 			</div>
// 		);
// 	}

// 	const stats = {
// 		pendingPayment: registrations.filter((r) => r.status === "PENDING_PAYMENT")
// 			.length,
// 		readyForEnrollment: registrations.filter(
// 			(r) => r.status === "PAYMENT_COMPLETED"
// 		).length,
// 		enrolled: registrations.filter((r) => r.status === "ENROLLED").length,
// 		totalRegistrations: registrations.length,
// 	};

// 	return (
// 		<div className="space-y-6">
// 			<div className="flex justify-between items-center">
// 				<div>
// 					<h1 className="text-3xl font-bold">Student Enrollment</h1>
// 					<p className="text-muted-foreground">
// 						Manage student registrations and enrollments
// 					</p>
// 				</div>
// 			</div>

// 			{/* Summary Cards */}
// 			<div className="grid gap-4 md:grid-cols-4">
// 				<Card>
// 					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
// 						<CardTitle className="text-sm font-medium">
// 							Pending Payment
// 						</CardTitle>
// 						<Clock className="h-4 w-4 text-yellow-600" />
// 					</CardHeader>
// 					<CardContent>
// 						<div className="text-2xl font-bold">{stats.pendingPayment}</div>
// 						<p className="text-xs text-muted-foreground">Awaiting payment</p>
// 					</CardContent>
// 				</Card>
// 				<Card>
// 					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
// 						<CardTitle className="text-sm font-medium">
// 							Ready for Enrollment
// 						</CardTitle>
// 						<UserCheck className="h-4 w-4 text-blue-600" />
// 					</CardHeader>
// 					<CardContent>
// 						<div className="text-2xl font-bold">{stats.readyForEnrollment}</div>
// 						<p className="text-xs text-muted-foreground">Payment completed</p>
// 					</CardContent>
// 				</Card>
// 				<Card>
// 					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
// 						<CardTitle className="text-sm font-medium">Enrolled</CardTitle>
// 						<CheckCircle className="h-4 w-4 text-green-600" />
// 					</CardHeader>
// 					<CardContent>
// 						<div className="text-2xl font-bold">{stats.enrolled}</div>
// 						<p className="text-xs text-muted-foreground">
// 							Successfully enrolled
// 						</p>
// 					</CardContent>
// 				</Card>
// 				<Card>
// 					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
// 						<CardTitle className="text-sm font-medium">
// 							Total Registrations
// 						</CardTitle>
// 						<Users className="h-4 w-4 text-muted-foreground" />
// 					</CardHeader>
// 					<CardContent>
// 						<div className="text-2xl font-bold">{stats.totalRegistrations}</div>
// 						<p className="text-xs text-muted-foreground">All time</p>
// 					</CardContent>
// 				</Card>
// 			</div>

// 			{/* Filters */}
// 			<Card>
// 				<CardHeader>
// 					<CardTitle className="text-lg">Search & Filter</CardTitle>
// 				</CardHeader>
// 				<CardContent>
// 					<div className="flex flex-col md:flex-row gap-4">
// 						<div className="flex-1">
// 							<div className="relative">
// 								<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
// 								<Input
// 									placeholder="Search by name, student ID, or registration number..."
// 									value={searchTerm}
// 									onChange={(e) => setSearchTerm(e.target.value)}
// 									className="pl-10"
// 								/>
// 							</div>
// 						</div>
// 						<Select value={selectedStatus} onValueChange={setSelectedStatus}>
// 							<SelectTrigger className="w-full md:w-48">
// 								<SelectValue placeholder="All Statuses" />
// 							</SelectTrigger>
// 							<SelectContent>
// 								<SelectItem value="all">All Statuses</SelectItem>
// 								<SelectItem value="PENDING_PAYMENT">Pending Payment</SelectItem>
// 								<SelectItem value="PAYMENT_COMPLETED">
// 									Ready for Enrollment
// 								</SelectItem>
// 								<SelectItem value="ENROLLED">Enrolled</SelectItem>
// 								<SelectItem value="CANCELLED">Cancelled</SelectItem>
// 							</SelectContent>
// 						</Select>
// 						<Select value={selectedBranch} onValueChange={setSelectedBranch}>
// 							<SelectTrigger className="w-full md:w-48">
// 								<SelectValue placeholder="All Branches" />
// 							</SelectTrigger>
// 							<SelectContent>
// 								<SelectItem value="all">All Branches</SelectItem>
// 								<SelectItem value="1">Main Campus</SelectItem>
// 								<SelectItem value="2">Secondary Campus</SelectItem>
// 							</SelectContent>
// 						</Select>
// 					</div>
// 				</CardContent>
// 			</Card>

// 			{/* Registrations Table */}
// 			<Card>
// 				<CardHeader>
// 					<CardTitle>Registration List</CardTitle>
// 					<CardDescription>
// 						{filteredRegistrations.length} registrations found
// 					</CardDescription>
// 				</CardHeader>
// 				<CardContent>
// 					<Table>
// 						<TableHeader>
// 							<TableRow>
// 								<TableHead>Student</TableHead>
// 								<TableHead>Registration #</TableHead>
// 								<TableHead>Payment Option</TableHead>
// 								<TableHead>Payment Duration</TableHead>
// 								<TableHead>Amount</TableHead>
// 								<TableHead>Grade</TableHead>
// 								<TableHead>Status</TableHead>
// 								<TableHead>Actions</TableHead>
// 							</TableRow>
// 						</TableHeader>
// 						<TableBody>
// 							{filteredRegistrations.map((registration) => (
// 								<TableRow key={registration.id}>
// 									<TableCell>
// 										<div className="flex items-center gap-3">
// 											<Avatar className="h-8 w-8">
// 												<AvatarImage
// 													src="/user.png"
// 													alt={`${registration.student.user.firstName} ${registration.student.user.lastName}`}
// 												/>
// 												<AvatarFallback>
// 													{registration.student.user.firstName[0]}
// 													{registration.student.user.lastName[0]}
// 												</AvatarFallback>
// 											</Avatar>
// 											<div>
// 												<div className="font-medium">
// 													{registration.student.user.firstName}{" "}
// 													{registration.student.user.lastName}
// 												</div>
// 												<div className="text-sm text-muted-foreground">
// 													ID: {registration.student.studentId}
// 												</div>
// 											</div>
// 										</div>
// 									</TableCell>
// 									<TableCell className="font-mono text-sm">
// 										{registration.registrationNumber}
// 									</TableCell>
// 									<TableCell>
// 										<div>
// 											<div className="font-medium">
// 												{getPaymentOptionLabel(registration.paymentOption)}
// 											</div>
// 											<div className="text-sm text-muted-foreground">
// 												{registration.branch.name}
// 											</div>
// 										</div>
// 									</TableCell>
// 									<TableCell>{(registration as any).paymentDuration}</TableCell>
// 									<TableCell>
// 										ETB {registration.totalAmount.toLocaleString()}
// 									</TableCell>
// 									<TableCell>
// 										{(registration as any).student?.grade?.name || "N/A"}
// 									</TableCell>
// 									<TableCell>{getStatusBadge(registration.status)}</TableCell>
// 									<TableCell>
// 										<div className="flex items-center gap-2">
// 											{registration.status === "PAYMENT_COMPLETED" && (
// 												<Dialog>
// 													<DialogTrigger asChild>
// 														<Button
// 															size="sm"
// 															onClick={() =>
// 																setEnrollingStudent(registration.id)
// 															}>
// 															<GraduationCap className="h-4 w-4 mr-1" />
// 															Enroll
// 														</Button>
// 													</DialogTrigger>
// 													<DialogContent>
// 														<DialogHeader>
// 															<DialogTitle>Enroll Student</DialogTitle>
// 															<DialogDescription>
// 																Select a class to enroll{" "}
// 																{registration.student.user.firstName}{" "}
// 																{registration.student.user.lastName}
// 															</DialogDescription>
// 														</DialogHeader>
// 														<div className="space-y-4">
// 															<div className="space-y-2">
// 																<Label>Select Class</Label>
// 																<Select
// 																	value={selectedClass}
// 																	onValueChange={setSelectedClass}>
// 																	<SelectTrigger>
// 																		<SelectValue placeholder="Choose a class" />
// 																	</SelectTrigger>
// 																	<SelectContent>
// 																		{classes.map((cls) => (
// 																			<SelectItem key={cls.id} value={cls.id}>
// 																				<div className="flex justify-between items-center w-full">
// 																					<span>
// 																						{cls.name}{" "}
// 																						{cls.section &&
// 																							`- Section ${cls.section}`}
// 																					</span>
// 																					<span className="text-sm text-muted-foreground ml-2">
// 																						({cls._count.enrollments}/
// 																						{cls.capacity})
// 																					</span>
// 																				</div>
// 																			</SelectItem>
// 																		))}
// 																	</SelectContent>
// 																</Select>
// 															</div>

// 															{selectedClass && (
// 																<Alert>
// 																	<AlertCircle className="h-4 w-4" />
// 																	<AlertDescription>
// 																		This action will officially enroll the
// 																		student and send an SMS notification to the
// 																		parent.
// 																	</AlertDescription>
// 																</Alert>
// 															)}

// 															<div className="flex justify-end gap-2">
// 																<Button
// 																	variant="outline"
// 																	onClick={() => {
// 																		setEnrollingStudent(null);
// 																		setSelectedClass("");
// 																	}}>
// 																	Cancel
// 																</Button>
// 																<Button
// 																	onClick={handleEnrollment}
// 																	disabled={!selectedClass}>
// 																	Confirm Enrollment
// 																</Button>
// 															</div>
// 														</div>
// 													</DialogContent>
// 												</Dialog>
// 											)}
// 										</div>
// 									</TableCell>
// 								</TableRow>
// 							))}
// 						</TableBody>
// 					</Table>

// 					{filteredRegistrations.length === 0 && (
// 						<div className="text-center py-8">
// 							<p className="text-muted-foreground">No registrations found</p>
// 						</div>
// 					)}

// 					{/* Pagination */}
// 					{totalPages > 1 && (
// 						<div className="flex justify-center gap-2 mt-4">
// 							<Button
// 								variant="outline"
// 								size="sm"
// 								onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
// 								disabled={currentPage === 1}>
// 								Previous
// 							</Button>
// 							<span className="flex items-center px-3 text-sm">
// 								Page {currentPage} of {totalPages}
// 							</span>
// 							<Button
// 								variant="outline"
// 								size="sm"
// 								onClick={() =>
// 									setCurrentPage((prev) => Math.min(totalPages, prev + 1))
// 								}
// 								disabled={currentPage === totalPages}>
// 								Next
// 							</Button>
// 						</div>
// 					)}
// 				</CardContent>
// 			</Card>
// 		</div>
// 	);
// }
