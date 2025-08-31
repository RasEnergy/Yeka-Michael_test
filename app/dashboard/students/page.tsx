"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
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
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Search,
	Plus,
	Download,
	Upload,
	Eye,
	Users,
	GraduationCap,
	Building2,
	Calendar,
	Phone,
	Mail,
	MapPin,
	Filter,
	RefreshCw,
	FileText,
	AlertCircle,
	CheckCircle,
	Save,
	Edit,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

interface Student {
	id: string;
	studentId: string;
	photo?: string;
	admissionDate?: string;
	dateOfBirth?: string;
	gender?: string;
	nationality?: string;
	address?: string;
	emergencyContact?: string;
	user: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		phone?: string;
		isActive: boolean;
	};
	branch: {
		id: string;
		name: string;
		code: string;
	};
	enrollments: Array<{
		class: {
			name: string;
			section?: string;
			grade: {
				name: string;
			};
		};
		academicYear: {
			name: string;
		};
	}>;
	parents?: Array<{
		parent: {
			user: {
				firstName: string;
				lastName: string;
				email: string;
				phone?: string;
			};
		};
	}>;
	isActive: boolean;
}

interface PaginationInfo {
	page: number;
	limit: number;
	total: number;
	pages: number;
}

export default function StudentsPage() {
	const [students, setStudents] = useState<Student[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [search, setSearch] = useState("");
	const [selectedBranch, setSelectedBranch] = useState("");
	const [selectedClass, setSelectedClass] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [pagination, setPagination] = useState<PaginationInfo>({
		page: 1,
		limit: 10,
		total: 0,
		pages: 1,
	});
	const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
	const [showImportDialog, setShowImportDialog] = useState(false);
	const [importFile, setImportFile] = useState<File | null>(null);
	const [importing, setImporting] = useState(false);
	const [importResults, setImportResults] = useState<any>(null);
	const [exporting, setExporting] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [editingStudent, setEditingStudent] = useState<Student | null>(null);
	const [saving, setSaving] = useState(false);

	const { toast } = useToast();

	const [user, setUser] = useState<any | null>(null);

	useEffect(() => {
		const userData = localStorage.getItem("user");
		if (userData) {
			setUser(JSON.parse(userData));
		} else {
			console.error("User data not found in localStorage");
		}
	}, []);

	useEffect(() => {
		fetchStudents();
	}, [currentPage, searchTerm, selectedBranch, selectedClass]);

	const fetchStudents = async (showRefreshing = false) => {
		try {
			if (showRefreshing) setRefreshing(true);

			const params = new URLSearchParams({
				page: currentPage.toString(),
				limit: pagination.limit.toString(),
				...(searchTerm && { search: searchTerm }),
				...(selectedBranch &&
					selectedBranch !== "all" && { branchId: selectedBranch }),
				...(selectedClass &&
					selectedClass !== "all" && { classId: selectedClass }),
			});

			const response = await apiClient.get(`/students?${params}`);
			// const data = await response.json();
			console.log("Students response:", response);

			if (response.success) {
				setStudents(response.data.students);
				setPagination(response.data.pagination);
			} else {
				toast({
					title: "Error",
					description: response.data.error || "Failed to fetch students",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to fetch students",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
			if (showRefreshing) setRefreshing(false);
		}
	};

	const handleSearch = (value: string) => {
		setSearchTerm(value);
		setCurrentPage(1);
	};

	const handlePageSizeChange = (newLimit: string) => {
		setPagination((prev) => ({ ...prev, limit: Number.parseInt(newLimit) }));
		setCurrentPage(1);
	};

	const handleRefresh = () => {
		fetchStudents(true);
	};

	const clearFilters = () => {
		setSearchTerm("");
		setSelectedBranch("");
		setSelectedClass("");
		setCurrentPage(1);
	};

	const handleExport = async () => {
		try {
			setExporting(true);

			const params = new URLSearchParams({
				format: "csv",
				...(searchTerm && { search: searchTerm }),
				...(selectedBranch &&
					selectedBranch !== "all" && { branchId: selectedBranch }),
				...(selectedClass &&
					selectedClass !== "all" && { classId: selectedClass }),
			});

			const response = await fetch(`/api/students/export?${params}`);

			if (response.ok) {
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `students-export-${
					new Date().toISOString().split("T")[0]
				}.csv`;
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
				document.body.removeChild(a);

				toast({
					title: "Success",
					description: "Students data exported successfully",
				});
			} else {
				const data = await response.json();
				toast({
					title: "Error",
					description: data.error || "Failed to export students",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to export students",
				variant: "destructive",
			});
		} finally {
			setExporting(false);
		}
	};

	const handleImport = async () => {
		if (!importFile) {
			toast({
				title: "Error",
				description: "Please select a file to import",
				variant: "destructive",
			});
			return;
		}

		if (!selectedBranch || selectedBranch === "all") {
			toast({
				title: "Error",
				description: "Please select a branch for import",
				variant: "destructive",
			});
			return;
		}

		try {
			setImporting(true);

			const formData = new FormData();
			formData.append("file", importFile);
			formData.append("branchId", selectedBranch);

			const response = await fetch("/api/students/import", {
				method: "POST",
				body: formData,
			});

			const data = await response.json();

			if (response.ok) {
				setImportResults(data.results);
				toast({
					title: "Import Completed",
					description: data.message,
				});
				fetchStudents(); // Refresh the list
			} else {
				toast({
					title: "Error",
					description: data.error || "Failed to import students",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to import students",
				variant: "destructive",
			});
		} finally {
			setImporting(false);
		}
	};

	const downloadTemplate = () => {
		// 		const template = `firstName,lastName,email,phone,dateOfBirth,gender,nationality,address,emergencyContact,admissionDate
		// John,Doe,john.doe@example.com,+1234567890,1995-01-15,MALE,American,123 Main St,+1987654321,2024-01-15
		// Jane,Smith,jane.smith@example.com,+1234567891,1996-02-20,FEMALE,Canadian,456 Oak Ave,+1987654322,2024-01-15`;
		// 		const blob = new Blob([template], { type: "text/csv" });
		// 		const url = window.URL.createObjectURL(blob);
		// 		const a = document.createElement("a");
		// 		a.href = url;
		// 		a.download = "students-import-template.csv";
		// 		document.body.appendChild(a);
		// 		a.click();
		// 		window.URL.revokeObjectURL(url);
		// 		document.body.removeChild(a);
	};

	const getStatusBadge = (isActive: boolean) => {
		return (
			<Badge
				variant={isActive ? "default" : "secondary"}
				className={
					isActive ? "bg-green-100 text-green-800 hover:bg-green-200" : ""
				}>
				{isActive ? "Active" : "Inactive"}
			</Badge>
		);
	};

	const filteredStudents = students.filter((student) => {
		const fullName =
			`${student.user.firstName} ${student.user.lastName}`.toLowerCase();
		return (
			fullName.includes(search.toLowerCase()) ||
			student.studentId.toLowerCase().includes(search.toLowerCase())
		);
	});

	const handleSaveStudent = async (updatedStudent: Partial<Student>) => {
		try {
			setSaving(true);

			const response = await fetch(`/api/students/${editingStudent?.id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(updatedStudent),
			});

			const data = await response.json();

			if (response.ok) {
				toast({
					title: "Success",
					description: "Student information updated successfully",
				});

				// Update the student in the local state
				setStudents((prev) =>
					prev.map((student) =>
						student.id === editingStudent?.id
							? { ...student, ...data.student }
							: student
					)
				);

				setEditingStudent(null);
			} else {
				toast({
					title: "Error",
					description: data.error || "Failed to update student",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to update student",
				variant: "destructive",
			});
		} finally {
			setSaving(false);
		}
	};

	const EditStudentDialog = ({
		student,
		onClose,
		onSave,
	}: {
		student: Student;
		onClose: () => void;
		onSave: (data: any) => void;
	}) => {
		const [currentStep, setCurrentStep] = useState<"edit" | "preview">("edit");
		const [formData, setFormData] = useState({
			// Student data
			firstName: student.user.firstName,
			lastName: student.user.lastName,
			email: student.user.email,
			phone: student.user.phone || "",
			dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split("T")[0] : "",
			gender: student.gender || "",
			nationality: student.nationality || "",
			address: student.address || "",
			emergencyContact: student.emergencyContact || "",
			// gradeId: student.gradeId || "",
			// Parent data
			parents:
				student.parents?.map((sp: any) => ({
					id: sp.id,
					parentId: sp.parent.id,
					userId: sp.parent.userId,
					relationship: sp.relationship,
					firstName: sp.parent.user.firstName,
					lastName: sp.parent.user.lastName,
					email: sp.parent.user.email,
					phone: sp.parent.user.phone || "",
					occupation: sp.parent.occupation || "",
					workplace: sp.parent.workplace || "",
					address: sp.parent.address || "",
				})) || [],
		});

		const [errors, setErrors] = useState<Record<string, string>>({});
		const [saving, setSaving] = useState(false);

		const validateEthiopianPhone = (phone: string): boolean => {
			if (!phone) return true; // Optional field
			const cleanPhone = phone.replace(/\s/g, "");

			// Must start with +251 or 0, and be max 13 digits
			const ethiopianPhoneRegex = /^(\+251|0)[0-9]{8,9}$/;
			return ethiopianPhoneRegex.test(cleanPhone) && cleanPhone.length <= 13;
		};

		const validateForm = () => {
			const newErrors: Record<string, string> = {};

			// Student validation
			if (!formData.firstName.trim()) {
				newErrors.firstName = "First name is required";
			}

			if (!formData.lastName.trim()) {
				newErrors.lastName = "Last name is required";
			}

			if (formData.phone && !validateEthiopianPhone(formData.phone)) {
				newErrors.phone =
					"Phone must start with +251 or 0 and be max 13 digits";
			}

			// Parent validation
			formData.parents.forEach((parent, index) => {
				if (!parent.firstName.trim()) {
					newErrors[`parent_${index}_firstName`] =
						"Parent first name is required";
				}
				if (!parent.lastName.trim()) {
					newErrors[`parent_${index}_lastName`] =
						"Parent last name is required";
				}
				if (parent.phone && !validateEthiopianPhone(parent.phone)) {
					newErrors[`parent_${index}_phone`] =
						"Phone must start with +251 or 0 and be max 13 digits";
				}
				if (!parent.relationship.trim()) {
					newErrors[`parent_${index}_relationship`] =
						"Relationship is required";
				}
			});

			setErrors(newErrors);
			return Object.keys(newErrors).length === 0;
		};

		const handleSubmit = (e: React.FormEvent) => {
			e.preventDefault();

			if (!validateForm()) {
				return;
			}

			if (currentStep === "edit") {
				setCurrentStep("preview");
			} else {
				onSave(formData);
			}
		};

		const handleInputChange = (field: string, value: string) => {
			setFormData((prev) => ({ ...prev, [field]: value }));

			// Clear error when user starts typing
			if (errors[field]) {
				setErrors((prev) => ({ ...prev, [field]: "" }));
			}
		};

		const handleParentChange = (
			index: number,
			field: string,
			value: string
		) => {
			setFormData((prev) => ({
				...prev,
				parents: prev.parents.map((parent, i) =>
					i === index ? { ...parent, [field]: value } : parent
				),
			}));

			// Clear error when user starts typing
			const errorKey = `parent_${index}_${field}`;
			if (errors[errorKey]) {
				setErrors((prev) => ({ ...prev, [errorKey]: "" }));
			}
		};

		const addParent = () => {
			setFormData((prev) => ({
				...prev,
				parents: [
					...prev.parents,
					{
						id: "",
						parentId: "",
						userId: "",
						relationship: "",
						firstName: "",
						lastName: "",
						email: "",
						phone: "",
						occupation: "",
						workplace: "",
						address: "",
					},
				],
			}));
		};

		const removeParent = (index: number) => {
			setFormData((prev) => ({
				...prev,
				parents: prev.parents.filter((_, i) => i !== index),
			}));
		};

		if (currentStep === "preview") {
			return (
				<DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-3">
							<Avatar className="h-12 w-12">
								<AvatarImage
									src={student.photo || "/user.png"}
									alt={`${student.user.firstName} ${student.user.lastName}`}
								/>
								<AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white">
									{getInitials(student.user.firstName, student.user.lastName)}
								</AvatarFallback>
							</Avatar>
							<div>
								<h3 className="text-xl font-semibold">Preview Changes</h3>
								<p className="text-sm text-muted-foreground">
									Review your changes before saving
								</p>
							</div>
						</DialogTitle>
					</DialogHeader>

					<div className="space-y-6">
						{/* Student Information Preview */}
						<div>
							<h4 className="font-semibold mb-3 flex items-center gap-2">
								<Users className="h-4 w-4" />
								Student Information
							</h4>
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<span className="text-muted-foreground">First Name:</span>
									<p className="font-medium">{formData.firstName}</p>
								</div>
								<div>
									<span className="text-muted-foreground">Last Name:</span>
									<p className="font-medium">{formData.lastName}</p>
								</div>
								<div>
									<span className="text-muted-foreground">Email:</span>
									<p className="font-medium">{formData.email}</p>
								</div>
								<div>
									<span className="text-muted-foreground">Phone:</span>
									<p className="font-medium">{formData.phone || "N/A"}</p>
								</div>
								<div>
									<span className="text-muted-foreground">Date of Birth:</span>
									<p className="font-medium">{formData.dateOfBirth || "N/A"}</p>
								</div>
								<div>
									<span className="text-muted-foreground">Gender:</span>
									<p className="font-medium">{formData.gender || "N/A"}</p>
								</div>
								<div>
									<span className="text-muted-foreground">Nationality:</span>
									<p className="font-medium">{formData.nationality || "N/A"}</p>
								</div>
							</div>
							{formData.address && (
								<div className="mt-4">
									<span className="text-muted-foreground">Address:</span>
									<p className="font-medium">{formData.address}</p>
								</div>
							)}
							{formData.emergencyContact && (
								<div className="mt-2">
									<span className="text-muted-foreground">
										Emergency Contact:
									</span>
									<p className="font-medium">{formData.emergencyContact}</p>
								</div>
							)}
						</div>

						<Separator />

						{/* Parents Information Preview */}
						{formData.parents.length > 0 && (
							<div>
								<h4 className="font-semibold mb-3 flex items-center gap-2">
									<Users className="h-4 w-4" />
									Parent Information
								</h4>
								<div className="space-y-4">
									{formData.parents.map((parent, index) => (
										<div key={index} className="bg-muted p-4 rounded-lg">
											<div className="grid grid-cols-2 gap-4 text-sm">
												<div>
													<span className="text-muted-foreground">Name:</span>
													<p className="font-medium">
														{parent.firstName} {parent.lastName}
													</p>
												</div>
												<div>
													<span className="text-muted-foreground">
														Relationship:
													</span>
													<p className="font-medium">{parent.relationship}</p>
												</div>
												<div>
													<span className="text-muted-foreground">Email:</span>
													<p className="font-medium">{parent.email}</p>
												</div>
												<div>
													<span className="text-muted-foreground">Phone:</span>
													<p className="font-medium">{parent.phone || "N/A"}</p>
												</div>
												<div>
													<span className="text-muted-foreground">
														Occupation:
													</span>
													<p className="font-medium">
														{parent.occupation || "N/A"}
													</p>
												</div>
												<div>
													<span className="text-muted-foreground">
														Workplace:
													</span>
													<p className="font-medium">
														{parent.workplace || "N/A"}
													</p>
												</div>
											</div>
											{parent.address && (
												<div className="mt-2">
													<span className="text-muted-foreground">
														Address:
													</span>
													<p className="font-medium">{parent.address}</p>
												</div>
											)}
										</div>
									))}
								</div>
							</div>
						)}
					</div>

					<div className="flex justify-end gap-2 pt-4 border-t">
						<Button
							type="button"
							variant="outline"
							onClick={() => setCurrentStep("edit")}>
							Back to Edit
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={saving}>
							Cancel
						</Button>
						<Button onClick={() => onSave(formData)} disabled={saving}>
							{saving ? (
								<>
									<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
									Saving...
								</>
							) : (
								<>
									<Save className="h-4 w-4 mr-2" />
									Confirm & Save
								</>
							)}
						</Button>
					</div>
				</DialogContent>
			);
		}

		return (
			<DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-3">
						<Avatar className="h-12 w-12">
							<AvatarImage
								src={student.photo || "/user.png"}
								alt={`${student.user.firstName} ${student.user.lastName}`}
							/>
							<AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white">
								{getInitials(student.user.firstName, student.user.lastName)}
							</AvatarFallback>
						</Avatar>
						<div>
							<h3 className="text-xl font-semibold">Edit Student</h3>
							<p className="text-sm text-muted-foreground">
								ID: {student.studentId}
							</p>
						</div>
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Student Information */}
					<div>
						<h4 className="font-semibold mb-3 flex items-center gap-2">
							<Users className="h-4 w-4" />
							Student Information
						</h4>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="firstName">First Name *</Label>
								<Input
									id="firstName"
									value={formData.firstName}
									onChange={(e) =>
										handleInputChange("firstName", e.target.value)
									}
									className={errors.firstName ? "border-red-500" : ""}
								/>
								{errors.firstName && (
									<p className="text-sm text-red-500 mt-1">
										{errors.firstName}
									</p>
								)}
							</div>
							<div>
								<Label htmlFor="lastName">Last Name *</Label>
								<Input
									id="lastName"
									value={formData.lastName}
									onChange={(e) =>
										handleInputChange("lastName", e.target.value)
									}
									className={errors.lastName ? "border-red-500" : ""}
								/>
								{errors.lastName && (
									<p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
								)}
							</div>
							<div>
								<Label htmlFor="email">Email (Read-only)</Label>
								<Input
									id="email"
									type="email"
									value={formData.email}
									readOnly
									disabled
									className="bg-muted"
								/>
								<p className="text-xs text-muted-foreground mt-1">
									Email cannot be changed
								</p>
							</div>
							<div>
								<Label htmlFor="phone">Phone (+251 or 0, max 13 digits)</Label>
								<Input
									id="phone"
									value={formData.phone}
									onChange={(e) => handleInputChange("phone", e.target.value)}
									className={errors.phone ? "border-red-500" : ""}
									placeholder="+251912345678 or 0912345678"
								/>
								{errors.phone && (
									<p className="text-sm text-red-500 mt-1">{errors.phone}</p>
								)}
							</div>
							<div>
								<Label htmlFor="dateOfBirth">Date of Birth</Label>
								<Input
									id="dateOfBirth"
									type="date"
									value={formData.dateOfBirth}
									onChange={(e) =>
										handleInputChange("dateOfBirth", e.target.value)
									}
								/>
							</div>
							<div>
								<Label htmlFor="gender">Gender</Label>
								<Select
									value={formData.gender}
									onValueChange={(value) => handleInputChange("gender", value)}>
									<SelectTrigger>
										<SelectValue placeholder="Select gender" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="MALE">Male</SelectItem>
										<SelectItem value="FEMALE">Female</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="nationality">Nationality</Label>
								<Input
									id="nationality"
									value={formData.nationality}
									onChange={(e) =>
										handleInputChange("nationality", e.target.value)
									}
								/>
							</div>
						</div>
						<div className="mt-4 space-y-4">
							<div>
								<Label htmlFor="address">Address</Label>
								<Textarea
									id="address"
									value={formData.address}
									onChange={(e) => handleInputChange("address", e.target.value)}
									rows={3}
								/>
							</div>
							<div>
								<Label htmlFor="emergencyContact">Emergency Contact</Label>
								<Input
									id="emergencyContact"
									value={formData.emergencyContact}
									onChange={(e) =>
										handleInputChange("emergencyContact", e.target.value)
									}
									placeholder="+251912345678 or 0912345678"
								/>
							</div>
						</div>
					</div>

					<Separator />

					{/* Parent Information */}
					<div>
						<div className="flex items-center justify-between mb-3">
							<h4 className="font-semibold flex items-center gap-2">
								<Users className="h-4 w-4" />
								Parent Information
							</h4>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={addParent}>
								<Plus className="h-4 w-4 mr-2" />
								Add Parent
							</Button>
						</div>

						{formData.parents.length === 0 ? (
							<div className="text-center py-8 text-muted-foreground">
								<Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
								<p>No parent information added</p>
								<p className="text-sm">
									Click "Add Parent" to add parent details
								</p>
							</div>
						) : (
							<div className="space-y-4">
								{formData.parents.map((parent, index) => (
									<div key={index} className="border rounded-lg p-4 space-y-4">
										<div className="flex items-center justify-between">
											<h5 className="font-medium">Parent {index + 1}</h5>
											{formData.parents.length > 1 && (
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => removeParent(index)}
													className="text-red-600 hover:text-red-700">
													Remove
												</Button>
											)}
										</div>

										<div className="grid grid-cols-2 gap-4">
											<div>
												<Label>First Name *</Label>
												<Input
													value={parent.firstName}
													onChange={(e) =>
														handleParentChange(
															index,
															"firstName",
															e.target.value
														)
													}
													className={
														errors[`parent_${index}_firstName`]
															? "border-red-500"
															: ""
													}
												/>
												{errors[`parent_${index}_firstName`] && (
													<p className="text-sm text-red-500 mt-1">
														{errors[`parent_${index}_firstName`]}
													</p>
												)}
											</div>
											<div>
												<Label>Last Name *</Label>
												<Input
													value={parent.lastName}
													onChange={(e) =>
														handleParentChange(
															index,
															"lastName",
															e.target.value
														)
													}
													className={
														errors[`parent_${index}_lastName`]
															? "border-red-500"
															: ""
													}
												/>
												{errors[`parent_${index}_lastName`] && (
													<p className="text-sm text-red-500 mt-1">
														{errors[`parent_${index}_lastName`]}
													</p>
												)}
											</div>
											<div>
												<Label>Email (Read-only)</Label>
												<Input
													value={parent.email}
													readOnly
													disabled
													className="bg-muted"
												/>
												<p className="text-xs text-muted-foreground mt-1">
													Email cannot be changed
												</p>
											</div>
											<div>
												<Label>Phone (+251 or 0, max 13 digits)</Label>
												<Input
													value={parent.phone}
													onChange={(e) =>
														handleParentChange(index, "phone", e.target.value)
													}
													className={
														errors[`parent_${index}_phone`]
															? "border-red-500"
															: ""
													}
													placeholder="+251912345678 or 0912345678"
												/>
												{errors[`parent_${index}_phone`] && (
													<p className="text-sm text-red-500 mt-1">
														{errors[`parent_${index}_phone`]}
													</p>
												)}
											</div>
											<div>
												<Label>Relationship *</Label>
												<Select
													value={parent.relationship}
													onValueChange={(value) =>
														handleParentChange(index, "relationship", value)
													}>
													<SelectTrigger
														className={
															errors[`parent_${index}_relationship`]
																? "border-red-500"
																: ""
														}>
														<SelectValue placeholder="Select relationship" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="father">Father</SelectItem>
														<SelectItem value="mother">Mother</SelectItem>
														<SelectItem value="guardian">Guardian</SelectItem>
														<SelectItem value="stepfather">
															Step Father
														</SelectItem>
														<SelectItem value="stepmother">
															Step Mother
														</SelectItem>
														<SelectItem value="grandfather">
															Grandfather
														</SelectItem>
														<SelectItem value="grandmother">
															Grandmother
														</SelectItem>
														<SelectItem value="uncle">Uncle</SelectItem>
														<SelectItem value="aunt">Aunt</SelectItem>
														<SelectItem value="other">Other</SelectItem>
													</SelectContent>
												</Select>
												{errors[`parent_${index}_relationship`] && (
													<p className="text-sm text-red-500 mt-1">
														{errors[`parent_${index}_relationship`]}
													</p>
												)}
											</div>
											<div>
												<Label>Occupation</Label>
												<Input
													value={parent.occupation}
													onChange={(e) =>
														handleParentChange(
															index,
															"occupation",
															e.target.value
														)
													}
												/>
											</div>
											<div>
												<Label>Workplace</Label>
												<Input
													value={parent.workplace}
													onChange={(e) =>
														handleParentChange(
															index,
															"workplace",
															e.target.value
														)
													}
												/>
											</div>
										</div>

										<div>
											<Label>Address</Label>
											<Textarea
												value={parent.address}
												onChange={(e) =>
													handleParentChange(index, "address", e.target.value)
												}
												rows={2}
											/>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					<div className="flex justify-end gap-2 pt-4 border-t">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={saving}>
							Cancel
						</Button>
						<Button type="submit" disabled={saving}>
							Preview Changes
						</Button>
					</div>
				</form>
			</DialogContent>
		);
	};

	const getInitials = (firstName: string, lastName: string) => {
		return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleDateString();
	};

	const StudentDetailsDialog = ({ student }: { student: Student }) => (
		<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
			<DialogHeader>
				<DialogTitle className="flex items-center gap-3">
					<Avatar className="h-12 w-12">
						<AvatarImage
							src={student.photo || "/user.png"}
							alt={`${student.user.firstName} ${student.user.lastName}`}
						/>
						<AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
							{getInitials(student.user.firstName, student.user.lastName)}
						</AvatarFallback>
					</Avatar>
					<div>
						<h3 className="text-xl font-semibold">
							{student.user.firstName} {student.user.lastName}
						</h3>
						<p className="text-sm text-muted-foreground">
							ID: {student.studentId}
						</p>
					</div>
				</DialogTitle>
			</DialogHeader>

			<div className="space-y-6">
				{/* Basic Information */}
				<div>
					<h4 className="font-semibold mb-3 flex items-center gap-2">
						<Users className="h-4 w-4" />
						Basic Information
					</h4>
					<div className="grid grid-cols-2 gap-4 text-sm">
						<div>
							<span className="text-muted-foreground">Email:</span>
							<p className="font-medium flex items-center gap-1">
								<Mail className="h-3 w-3" />
								{student.user.email}
							</p>
						</div>
						<div>
							<span className="text-muted-foreground">Phone:</span>
							<p className="font-medium flex items-center gap-1">
								<Phone className="h-3 w-3" />
								{student.user.phone || "N/A"}
							</p>
						</div>
						<div>
							<span className="text-muted-foreground">Date of Birth:</span>
							<p className="font-medium">{formatDate(student.dateOfBirth)}</p>
						</div>
						<div>
							<span className="text-muted-foreground">Gender:</span>
							<p className="font-medium">{student.gender || "N/A"}</p>
						</div>
						<div>
							<span className="text-muted-foreground">Nationality:</span>
							<p className="font-medium">{student.nationality || "N/A"}</p>
						</div>
						<div>
							<span className="text-muted-foreground">Admission Date:</span>
							<p className="font-medium">{formatDate(student.admissionDate)}</p>
						</div>
					</div>
				</div>

				<Separator />

				{/* Academic Information */}
				<div>
					<h4 className="font-semibold mb-3 flex items-center gap-2">
						<GraduationCap className="h-4 w-4" />
						Academic Information
					</h4>
					<div className="space-y-3">
						<div>
							<span className="text-muted-foreground">Branch:</span>
							<p className="font-medium flex items-center gap-1">
								<Building2 className="h-3 w-3" />
								{student.branch.name} ({student.branch.code})
							</p>
						</div>
						{student.enrollments.length > 0 && (
							<div>
								<span className="text-muted-foreground">
									Current Enrollment:
								</span>
								<div className="mt-1">
									{student.enrollments.map((enrollment, index) => (
										<div key={index} className="bg-muted p-3 rounded-lg">
											<p className="font-medium">
												{enrollment.class.name}
												{enrollment.class.section &&
													` - Section ${enrollment.class.section}`}
											</p>
											<p className="text-sm text-muted-foreground">
												Grade: {enrollment.class.grade.name}
											</p>
											<p className="text-sm text-muted-foreground">
												Academic Year: {enrollment.academicYear.name}
											</p>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Contact Information */}
				{(student.address || student.emergencyContact) && (
					<>
						<Separator />
						<div>
							<h4 className="font-semibold mb-3 flex items-center gap-2">
								<MapPin className="h-4 w-4" />
								Contact Information
							</h4>
							<div className="space-y-2 text-sm">
								{student.address && (
									<div>
										<span className="text-muted-foreground">Address:</span>
										<p className="font-medium">{student.address}</p>
									</div>
								)}
								{student.emergencyContact && (
									<div>
										<span className="text-muted-foreground">
											Emergency Contact:
										</span>
										<p className="font-medium">{student.emergencyContact}</p>
									</div>
								)}
							</div>
						</div>
					</>
				)}

				{/* Parent Information */}
				{student.parents && student.parents.length > 0 && (
					<>
						<Separator />
						<div>
							<h4 className="font-semibold mb-3 flex items-center gap-2">
								<Users className="h-4 w-4" />
								Parent Information
							</h4>
							<div className="space-y-3">
								{student.parents.map((parentRel, index) => (
									<div key={index} className="bg-muted p-3 rounded-lg">
										<p className="font-medium">
											{parentRel.parent.user.firstName}{" "}
											{parentRel.parent.user.lastName}
										</p>
										<p className="text-sm text-muted-foreground">
											{parentRel.parent.user.email}
										</p>
										{parentRel.parent.user.phone && (
											<p className="text-sm text-muted-foreground">
												{parentRel.parent.user.phone}
											</p>
										)}
									</div>
								))}
							</div>
						</div>
					</>
				)}
			</div>
		</DialogContent>
	);

	const ImportDialog = () => (
		<Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Upload className="h-5 w-5" />
						Import Students
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					{!importResults ? (
						<>
							<div className="space-y-4">
								<div>
									<Label htmlFor="branch-select">Select Branch *</Label>
									<Select
										value={selectedBranch}
										onValueChange={setSelectedBranch}>
										<SelectTrigger>
											<SelectValue placeholder="Select a branch" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="cmcvs90rv0002udzmd0asbdx6">
												Abado
											</SelectItem>
											<SelectItem value="cmcvs90rx0004udzmd0asbdx8">
												Wossen
											</SelectItem>
											<SelectItem value="cmcvs90rw0003udzmd0asbdx7">
												Kotebe
											</SelectItem>
											<SelectItem value="cmcvs90rw0003udsmd0asbd99">
												Shola
											</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label htmlFor="file-upload">Upload CSV File *</Label>
									<div className="mt-2">
										<Input
											ref={fileInputRef}
											type="file"
											accept=".csv"
											onChange={(e) =>
												setImportFile(e.target.files?.[0] || null)
											}
											disabled={importing}
										/>
									</div>
									{importFile && (
										<p className="text-sm text-muted-foreground mt-1">
											Selected: {importFile.name} (
											{(importFile.size / 1024).toFixed(1)} KB)
										</p>
									)}
								</div>

								<div className="bg-blue-50 p-4 rounded-lg">
									<h4 className="font-medium mb-2 flex items-center gap-2">
										<FileText className="h-4 w-4" />
										CSV Format Requirements
									</h4>
									<ul className="text-sm text-muted-foreground space-y-1">
										<li>• Required fields: firstName, lastName, email</li>
										<li>
											• Optional fields: phone, dateOfBirth, gender,
											nationality, address, emergencyContact, admissionDate
										</li>
										<li>• Date format: YYYY-MM-DD</li>
										<li>• Gender values: MALE, FEMALE, OTHER</li>
									</ul>
									<Button
										variant="outline"
										size="sm"
										onClick={downloadTemplate}
										className="mt-3 bg-transparent">
										<Download className="h-4 w-4 mr-2" />
										Download Template
									</Button>
								</div>
							</div>

							<div className="flex justify-end gap-2">
								<Button
									variant="outline"
									onClick={() => setShowImportDialog(false)}
									disabled={importing}>
									Cancel
								</Button>
								<Button
									onClick={handleImport}
									disabled={importing || !importFile || !selectedBranch}>
									{importing ? (
										<>
											<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
											Importing...
										</>
									) : (
										<>
											<Upload className="h-4 w-4 mr-2" />
											Import Students
										</>
									)}
								</Button>
							</div>
						</>
					) : (
						<div className="space-y-4">
							<div className="text-center">
								<div className="flex items-center justify-center gap-2 mb-4">
									<CheckCircle className="h-8 w-8 text-green-600" />
									<h3 className="text-lg font-semibold">Import Completed</h3>
								</div>

								<div className="grid grid-cols-2 gap-4 mb-4">
									<div className="bg-green-50 p-4 rounded-lg">
										<p className="text-2xl font-bold text-green-600">
											{importResults.success}
										</p>
										<p className="text-sm text-green-700">
											Successfully Imported
										</p>
									</div>
									<div className="bg-red-50 p-4 rounded-lg">
										<p className="text-2xl font-bold text-red-600">
											{importResults.failed}
										</p>
										<p className="text-sm text-red-700">Failed</p>
									</div>
								</div>
							</div>

							{importResults.errors.length > 0 && (
								<div>
									<h4 className="font-medium mb-2 flex items-center gap-2 text-red-600">
										<AlertCircle className="h-4 w-4" />
										Errors ({importResults.errors.length})
									</h4>
									<div className="max-h-40 overflow-y-auto">
										<Textarea
											value={importResults.errors.join("\n")}
											readOnly
											className="text-sm"
										/>
									</div>
								</div>
							)}

							<div className="flex justify-end gap-2">
								<Button
									onClick={() => {
										setShowImportDialog(false);
										setImportResults(null);
										setImportFile(null);
										if (fileInputRef.current) {
											fileInputRef.current.value = "";
										}
									}}>
									Close
								</Button>
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold">Students</h1>
						<p className="text-muted-foreground">Manage student records</p>
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="h-24 bg-gray-100 rounded-lg animate-pulse"
						/>
					))}
				</div>
				<div className="space-y-4">
					{[1, 2, 3, 4, 5].map((i) => (
						<div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Students</h1>
					<p className="text-muted-foreground">
						Manage and view student records
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handleRefresh}
						disabled={refreshing}>
						<RefreshCw
							className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
						/>
						Refresh
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowImportDialog(true)}>
						<Upload className="h-4 w-4 mr-2" />
						Import
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={handleExport}
						disabled={exporting}>
						<Download
							className={`h-4 w-4 mr-2 ${exporting ? "animate-spin" : ""}`}
						/>
						Export
					</Button>
					<Link href="/dashboard/students/register">
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							Add Student
						</Button>
					</Link>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Total Students
								</p>
								<p className="text-2xl font-bold">{pagination.total}</p>
							</div>
							<Users className="h-8 w-8 text-blue-600" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Active Students
								</p>
								<p className="text-2xl font-bold text-green-600">
									{students.filter((s) => s.isActive).length}
								</p>
							</div>
							<GraduationCap className="h-8 w-8 text-green-600" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Current Page
								</p>
								<p className="text-2xl font-bold">{pagination.page}</p>
							</div>
							<Calendar className="h-8 w-8 text-purple-600" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Total Pages
								</p>
								<p className="text-2xl font-bold">{pagination.pages}</p>
							</div>
							<Building2 className="h-8 w-8 text-orange-600" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="text-lg flex items-center gap-2">
							<Filter className="h-5 w-5" />
							Search & Filter
						</CardTitle>
						{(searchTerm || selectedBranch || selectedClass) && (
							<Button variant="ghost" size="sm" onClick={clearFilters}>
								Clear Filters
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col lg:flex-row gap-4">
						<div className="flex-1">
							<div className="relative">
								<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search by name, email, or student ID..."
									value={searchTerm}
									onChange={(e) => handleSearch(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>
						{/* <Select value={selectedBranch} onValueChange={setSelectedBranch}>
							<SelectTrigger className="w-full lg:w-48">
								<SelectValue placeholder="All Branches" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Branches</SelectItem>
								<SelectItem value="1">Main Campus</SelectItem>
								<SelectItem value="2">Secondary Campus</SelectItem>
							</SelectContent>
						</Select> */}
						<Select value={selectedClass} onValueChange={setSelectedClass}>
							<SelectTrigger className="w-full lg:w-48">
								<SelectValue placeholder="All Classes" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Classes</SelectItem>
								<SelectItem value="1">Grade 1 - A</SelectItem>
								<SelectItem value="2">Grade 1 - B</SelectItem>
								<SelectItem value="3">Grade 2 - A</SelectItem>
							</SelectContent>
						</Select>
						<Select
							value={pagination.limit.toString()}
							onValueChange={handlePageSizeChange}>
							<SelectTrigger className="w-full lg:w-32">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="5">5 per page</SelectItem>
								<SelectItem value="10">10 per page</SelectItem>
								<SelectItem value="25">25 per page</SelectItem>
								<SelectItem value="50">50 per page</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Students Table */}
			<Card>
				<CardHeader>
					<CardTitle>Student Directory</CardTitle>
					<CardDescription>
						Showing {students.length} of {pagination.total} students
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow className="bg-muted/50">
									<TableHead className="font-semibold">Student</TableHead>
									<TableHead className="font-semibold">Student ID</TableHead>
									<TableHead className="font-semibold">Class</TableHead>
									<TableHead className="font-semibold">Branch</TableHead>
									<TableHead className="font-semibold">Status</TableHead>
									<TableHead className="font-semibold text-center">
										Actions
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{students.map((student) => (
									<TableRow
										key={student.id}
										className="hover:bg-muted/30 transition-colors">
										<TableCell>
											<div className="flex items-center gap-3">
												<Avatar className="h-10 w-10 border-2 border-background shadow-sm">
													<AvatarImage
														src={student.photo || "/user.png"}
														alt={`${student.user.firstName} ${student.user.lastName}`}
													/>
													<AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
														{getInitials(
															student.user.firstName,
															student.user.lastName
														)}
													</AvatarFallback>
												</Avatar>
												<div>
													<div className="font-semibold">
														{student.user.firstName} {student.user.lastName}
													</div>
													<div className="text-sm text-muted-foreground flex items-center gap-1">
														<Mail className="h-3 w-3" />
														{student.user.email}
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<code className="bg-muted px-2 py-1 rounded text-sm font-mono">
												{student.studentId}
											</code>
										</TableCell>
										<TableCell>
											{student.enrollments.length > 0 ? (
												<div>
													<div className="font-medium">
														{student.enrollments[0].class.name}
														{student.enrollments[0].class.section &&
															` - ${student.enrollments[0].class.section}`}
													</div>
													<div className="text-sm text-muted-foreground">
														{student.enrollments[0].class.grade.name} •{" "}
														{student.enrollments[0].academicYear.name}
													</div>
												</div>
											) : (
												<Badge
													variant="outline"
													className="text-muted-foreground">
													Not enrolled
												</Badge>
											)}
										</TableCell>
										<TableCell>
											<div>
												<div className="font-medium flex items-center gap-1">
													<Building2 className="h-3 w-3" />
													{student.branch.name}
												</div>
												<div className="text-sm text-muted-foreground">
													{student.branch.code}
												</div>
											</div>
										</TableCell>
										<TableCell>{getStatusBadge(student.isActive)}</TableCell>
										<TableCell>
											<div className="flex items-center justify-center">
												<Dialog>
													<DialogTrigger asChild>
														<Button
															variant="ghost"
															size="sm"
															className="hover:bg-blue-50 hover:text-blue-600"
															onClick={() => setSelectedStudent(student)}>
															<Eye className="h-4 w-4" />
														</Button>
													</DialogTrigger>
													{selectedStudent && (
														<StudentDetailsDialog student={selectedStudent} />
													)}
												</Dialog>
												{user.role === "SUPER_ADMIN" && (
													<Dialog>
														<DialogTrigger asChild>
															<Button
																variant="ghost"
																size="sm"
																className="hover:bg-green-50 hover:text-green-600"
																onClick={() => setEditingStudent(student)}>
																<Edit className="h-4 w-4" />
															</Button>
														</DialogTrigger>
														{editingStudent && (
															<EditStudentDialog
																student={editingStudent}
																onClose={() => setEditingStudent(null)}
																onSave={handleSaveStudent}
															/>
														)}
													</Dialog>
												)}
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					{students.length === 0 && (
						<div className="text-center py-12">
							<Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<p className="text-lg font-medium text-muted-foreground">
								No students found
							</p>
							<p className="text-sm text-muted-foreground">
								Try adjusting your search criteria or add a new student
							</p>
						</div>
					)}

					{/* Enhanced Pagination */}
					{pagination.pages > 1 && (
						<div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t">
							<div className="text-sm text-muted-foreground">
								Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
								{Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
								of {pagination.total} students
							</div>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setCurrentPage(1)}
									disabled={currentPage === 1}>
									First
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() =>
										setCurrentPage((prev) => Math.max(1, prev - 1))
									}
									disabled={currentPage === 1}>
									Previous
								</Button>
								<div className="flex items-center gap-1">
									{Array.from(
										{ length: Math.min(5, pagination.pages) },
										(_, i) => {
											const pageNum =
												Math.max(
													1,
													Math.min(pagination.pages - 4, currentPage - 2)
												) + i;
											return (
												<Button
													key={pageNum}
													variant={
														currentPage === pageNum ? "default" : "outline"
													}
													size="sm"
													onClick={() => setCurrentPage(pageNum)}
													className="w-8 h-8 p-0">
													{pageNum}
												</Button>
											);
										}
									)}
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() =>
										setCurrentPage((prev) =>
											Math.min(pagination.pages, prev + 1)
										)
									}
									disabled={currentPage === pagination.pages}>
									Next
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setCurrentPage(pagination.pages)}
									disabled={currentPage === pagination.pages}>
									Last
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			<ImportDialog />
		</div>
	);
}
