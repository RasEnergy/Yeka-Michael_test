"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	Loader2,
	ArrowLeft,
	Upload,
	X,
	User,
	Users,
	CheckCircle,
	AlertCircle,
	Search,
	UserCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface Branch {
	id: string;
	name: string;
	code: string;
	address?: string;
	phone?: string;
	email?: string;
}

interface Grade {
	id: string;
	name: string;
	level: number;
	description?: string;
}

interface ParentInfo {
	id: string;
	user: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
	};
	occupation: string | null;
	workplace: string | null;
	address: string | null;
	photo: string | null;
	children: Array<{
		id: string;
		studentId: string;
		name: string;
		relationship: string;
	}>;
}

interface ExistingParent {
	id: string;
	user: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
	};
	occupation?: string;
	workplace?: string;
	address?: string;
	photo?: string;
	children: Array<{
		id: string;
		name: string;
		relationship: string;
	}>;
}

interface ExistingStudent {
	id: string;
	studentId: string;
	studentType: string;
	academicYear: string;
	user: {
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
	};
	branch: {
		name: string;
		code: string;
	};
	grade: {
		name: string;
		level: number;
	};
	parents: Array<{
		relationship: string;
		isPrimary: boolean;
		parent: {
			user: {
				firstName: string;
				lastName: string;
				phone: string;
			};
			occupation: string;
		};
	}>;
	recentRegistrations: Array<{
		registrationNumber: string;
		status: string;
		createdAt: string;
		grade: {
			name: string;
		};
	}>;
	hasCurrentYearRegistration: boolean;
}

export default function StudentRegisterPage() {
	const [formData, setFormData] = useState({
		// Student info
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		branchId: "",
		gradeId: "",
		studentType: "",
		admissionDate: new Date().toISOString().split("T")[0],
		dateOfBirth: "",
		placeOfBirth: "",
		gender: "",
		nationality: "Ethiopian",
		bloodGroup: "",
		address: "",
		emergencyContact: "",
		additionalFee: "",
		// Parent info
		parentFirstName: "",
		parentLastName: "",
		parentEmail: "",
		parentPhone: "",
		parentOccupation: "",
		parentWorkplace: "",
		parentAddress: "",
		relationship: "parent",
	});

	const [studentPhoto, setStudentPhoto] = useState<File | null>(null);
	const [studentPhotoPreview, setStudentPhotoPreview] = useState<string | null>(
		null
	);
	const [parentPhoto, setParentPhoto] = useState<File | null>(null);
	const [parentPhotoPreview, setParentPhotoPreview] = useState<string | null>(
		null
	);
	const [branches, setBranches] = useState<Branch[]>([]);
	const [grades, setGrades] = useState<Grade[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	// const [isLoadingData, setIsLoadingData] = useState(true);
	const [error, setError] = useState("");
	const [existingParent, setExistingParent] = useState<ExistingParent | null>(
		null
	);
	const [isSearchingParent, setIsSearchingParent] = useState(false);
	const studentFileInputRef = useRef<HTMLInputElement>(null);
	const parentFileInputRef = useRef<HTMLInputElement>(null);
	const router = useRouter();
	const { toast } = useToast();

	const [loading, setLoading] = useState(false);

	const [parentInfo, setParentInfo] = useState<ParentInfo | null>(null);
	const [existingStudent, setExistingStudent] =
		useState<ExistingStudent | null>(null);
	const [parentSearchLoading, setParentSearchLoading] = useState(false);
	const [studentSearchLoading, setStudentSearchLoading] = useState(false);

	const [success, setSuccess] = useState("");
	const [searchStudentId, setSearchStudentId] = useState("");

	const nationalities = [
		"Ethiopian",
		"American",
		"British",
		"Canadian",
		"German",
		"French",
		"Italian",
		"Spanish",
		"Dutch",
		"Swedish",
		"Norwegian",
		"Danish",
		"Finnish",
		"Belgian",
		"Swiss",
		"Austrian",
		"Kenyan",
		"Ugandan",
		"Tanzanian",
		"Rwandan",
		"Sudanese",
		"Egyptian",
		"South African",
		"Nigerian",
		"Ghanaian",
		"Indian",
		"Chinese",
		"Japanese",
		"Korean",
		"Australian",
		"Other",
	];

	// Fetch branches and grades on component mount
	// useEffect(() => {
	// 	const fetchInitialData = async () => {
	// 		try {
	// 			setIsLoadingData(true);

	// 			// Fetch branches
	// 			const branchesResponse = await fetch("/api/branches");
	// 			if (branchesResponse.ok) {
	// 				const branchesData = await branchesResponse.json();
	// 				setBranches(branchesData.branches);

	// 				// Auto-select branch if user has only one branch (for registrars)
	// 				if (branchesData.branches.length === 1) {
	// 					setFormData((prev) => ({
	// 						...prev,
	// 						branchId: branchesData.branches[0].id,
	// 					}));
	// 				}
	// 			}

	// 			// Fetch grades
	// 			const gradesResponse = await fetch("/api/grades");
	// 			console.log({ gradesResponse });
	// 			if (gradesResponse.ok) {
	// 				const gradesData = await gradesResponse.json();
	// 				setGrades(gradesData.grades);
	// 			}
	// 		} catch (error) {
	// 			console.error("Error fetching initial data:", error);
	// 			toast({
	// 				title: "Error",
	// 				description: "Failed to load form data. Please refresh the page.",
	// 				variant: "destructive",
	// 			});
	// 		} finally {
	// 			setIsLoadingData(false);
	// 		}
	// 	};

	// 	fetchInitialData();
	// }, [toast]);

	// const handleInputChange = (field: string, value: string) => {
	// 	setFormData((prev) => ({ ...prev, [field]: value }));
	// };
	const [files, setFiles] = useState({
		studentPhoto: null as File | null,
		parentPhoto: null as File | null,
	});

	useEffect(() => {
		fetchBranches();
		fetchGrades();
	}, []);

	useEffect(() => {
		if (formData.branchId) {
			fetchGrades(formData.branchId);
		}
	}, [formData.branchId]);

	const fetchBranches = async () => {
		try {
			const response = await fetch("/api/branches");
			if (response.ok) {
				const data = await response.json();
				setBranches(data.branches);

				console.log("Fetched branches:", data.branches);

				// Auto-select branch if user has only one branch (registrar case)
				if (data.branches.length === 1) {
					setFormData((prev) => ({ ...prev, branchId: data.branches[0].id }));
				}
			}
		} catch (error) {
			console.error("Failed to fetch branches:", error);
		}
	};

	const fetchGrades = async (branchId?: string) => {
		try {
			// const url = branchId ? `/api/grades?branchId=${branchId}` : "/api/grades";
			const url = branchId ? `/api/grades` : "/api/grades";
			const response = await fetch(url);
			if (response.ok) {
				const data = await response.json();
				setGrades(data.grades);
			}
		} catch (error) {
			console.error("Failed to fetch grades:", error);
		}
	};

	const searchStudent = async (studentId: string) => {
		if (!studentId || studentId.length < 8) {
			setExistingStudent(null);
			return;
		}

		setStudentSearchLoading(true);
		try {
			const response = await fetch(
				`/api/students/search?studentId=${encodeURIComponent(studentId)}`
			);
			const data = await response.json();

			if (response.ok && data.found) {
				setExistingStudent(data.student);

				// Pre-fill form with existing student data
				setFormData((prev) => ({
					...prev,
					firstName: data.student.user.firstName,
					lastName: data.student.user.lastName,
					email: data.student.user.email,
					phone: data.student.user.phone || "",
					branchId: data.student.branch.id || prev.branchId,
					studentType: "REGULAR_STUDENT",
				}));

				// Pre-fill parent information if available
				if (data.student.parents.length > 0) {
					const primaryParent =
						data.student.parents.find((p: any) => p.isPrimary) ||
						data.student.parents[0];
					setFormData((prev) => ({
						...prev,
						parentFirstName: primaryParent.parent.user.firstName,
						parentLastName: primaryParent.parent.user.lastName,
						parentPhone: primaryParent.parent.user.phone,
						parentOccupation: primaryParent.parent.occupation || "",
						relationship: primaryParent.relationship,
					}));
				}
			} else {
				setExistingStudent(null);
			}
		} catch (error) {
			console.error("Student search failed:", error);
			setExistingStudent(null);
		} finally {
			setStudentSearchLoading(false);
		}
	};

	const searchParent = async (phone: string) => {
		if (!phone || phone.length < 10) {
			setParentInfo(null);
			return;
		}

		setParentSearchLoading(true);
		try {
			const response = await fetch(
				`/api/parents/search?phone=${encodeURIComponent(phone)}`
			);
			if (response.ok) {
				const data = await response.json();
				if (data.found) {
					setParentInfo(data.parent);
					// Auto-fill parent information
					setFormData((prev) => ({
						...prev,
						parentFirstName: data.parent.user.firstName,
						parentLastName: data.parent.user.lastName,
						parentEmail: data.parent.user.email,
						parentOccupation: data.parent.occupation || "",
						parentWorkplace: data.parent.workplace || "",
						parentAddress: data.parent.address || "",
					}));
				} else {
					setParentInfo(null);
				}
			}
		} catch (error) {
			console.error("Parent search failed:", error);
		} finally {
			setParentSearchLoading(false);
		}
	};

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));

		// Search for parent when phone number changes
		if (field === "parentPhone") {
			const timeoutId = setTimeout(() => {
				searchParent(value);
			}, 500);
			return () => clearTimeout(timeoutId);
		}
	};

	const handleStudentSearch = () => {
		if (searchStudentId) {
			searchStudent(searchStudentId);
		}
	};

	const handlePhotoChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		type: "student" | "parent"
	) => {
		const file = e.target.files?.[0];
		if (file) {
			// Validate file type
			const allowedTypes = [
				"image/jpeg",
				"image/jpg",
				"image/png",
				"image/webp",
			];
			if (!allowedTypes.includes(file.type)) {
				setError("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
				return;
			}

			// Validate file size (max 5MB)
			const maxSize = 5 * 1024 * 1024; // 5MB
			if (file.size > maxSize) {
				setError("File size too large. Maximum size is 5MB.");
				return;
			}

			if (type === "student") {
				setStudentPhoto(file);
				// Create preview
				const reader = new FileReader();
				reader.onload = (e) => {
					setStudentPhotoPreview(e.target?.result as string);
				};
				reader.readAsDataURL(file);
			} else {
				setParentPhoto(file);
				// Create preview
				const reader = new FileReader();
				reader.onload = (e) => {
					setParentPhotoPreview(e.target?.result as string);
				};
				reader.readAsDataURL(file);
			}

			setError("");
		}
	};

	const removePhoto = (type: "student" | "parent") => {
		if (type === "student") {
			setStudentPhoto(null);
			setStudentPhotoPreview(null);
			if (studentFileInputRef.current) {
				studentFileInputRef.current.value = "";
			}
		} else {
			setParentPhoto(null);
			setParentPhotoPreview(null);
			if (parentFileInputRef.current) {
				parentFileInputRef.current.value = "";
			}
		}
	};

	const calculateAge = (dateOfBirth: string) => {
		if (!dateOfBirth) return "";
		const birthDate = new Date(dateOfBirth);
		const today = new Date();
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();

		if (
			monthDiff < 0 ||
			(monthDiff === 0 && today.getDate() < birthDate.getDate())
		) {
			age--;
		}

		return age > 0 ? `${age} years old` : "";
	};

	// Search for existing parent when phone number changes
	// const handleParentPhoneChange = async (phone: string) => {
	// 	handleInputChange("parentPhone", phone);

	// 	if (phone && phone.length >= 10) {
	// 		try {
	// 			setIsSearchingParent(true);
	// 			const response = await fetch(
	// 				`/api/parents/search?phone=${encodeURIComponent(phone)}`
	// 			);

	// 			if (response.ok) {
	// 				const data = await response.json();

	// 				if (data.found) {
	// 					setExistingParent(data.parent);
	// 					// Auto-fill parent information
	// 					setFormData((prev) => ({
	// 						...prev,
	// 						parentFirstName: data.parent.user.firstName,
	// 						parentLastName: data.parent.user.lastName,
	// 						parentEmail: data.parent.user.email,
	// 						parentOccupation: data.parent.occupation || "",
	// 						parentWorkplace: data.parent.workplace || "",
	// 						parentAddress: data.parent.address || "",
	// 					}));

	// 					// Set parent photo preview if available
	// 					if (data.parent.photo) {
	// 						setParentPhotoPreview(data.parent.photo);
	// 					}
	// 				} else {
	// 					setExistingParent(null);
	// 					// Clear auto-filled data if no parent found
	// 					setFormData((prev) => ({
	// 						...prev,
	// 						parentFirstName: "",
	// 						parentLastName: "",
	// 						parentEmail: "",
	// 						parentOccupation: "",
	// 						parentWorkplace: "",
	// 						parentAddress: "",
	// 					}));
	// 					setParentPhotoPreview(null);
	// 				}
	// 			}
	// 		} catch (error) {
	// 			console.error("Error searching for parent:", error);
	// 		} finally {
	// 			setIsSearchingParent(false);
	// 		}
	// 	} else {
	// 		setExistingParent(null);
	// 	}
	// };

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		const submitData = new FormData();

		// Add all form fields
		Object.entries(formData).forEach(([key, value]) => {
			if (value) {
				submitData.append(key, value);
			}
		});

		// Add existing student ID for regular student re-registration
		if (existingStudent && formData.studentType === "REGULAR_STUDENT") {
			submitData.append("existingStudentId", existingStudent.studentId);
		}

		// Add files
		// if (files.studentPhoto) {
		// 	submitData.append("studentPhoto", files.studentPhoto);
		// }
		// if (files.parentPhoto) {
		// 	submitData.append("parentPhoto", files.parentPhoto);
		// }

		// const {
		// 	phone,
		// 	parentPhone,
		// 	dateOfBirth,
		// 	placeOfBirth,
		// 	nationality,
		// 	gender,
		// 	studentType,
		// 	gradeId,
		// } = formData;

		// Validate required fields
		if (!formData.gradeId) {
			setError("Please select a grade");
			setIsLoading(false);
			return;
		}

		if (!formData.additionalFee) {
			setError("Please fill an additional Fee");
			setIsLoading(false);
			return;
		}

		if (!formData.studentType) {
			setError("Please select student type");
			setIsLoading(false);
			return;
		}

		// Validate required parent phone
		if (!formData.parentPhone) {
			setError("Parent phone number is required");
			setIsLoading(false);
			return;
		}

		// Validate Ethiopian phone format
		const ethiopianPhoneRegex = /^(\+251|0)[79]\d{8}$/;
		if (formData.phone && !ethiopianPhoneRegex.test(formData.phone)) {
			setError("Invalid phone number format. Use +251XXXXXXXXX or 09XXXXXXXX");
			setIsLoading(false);
			return;
		}

		if (
			formData.parentPhone &&
			!ethiopianPhoneRegex.test(formData.parentPhone)
		) {
			setError(
				"Invalid parent phone number format. Use +251XXXXXXXXX or 09XXXXXXXX"
			);
			setIsLoading(false);
			return;
		}

		// Validate date of birth
		if (formData.dateOfBirth) {
			const birthDate = new Date(formData.dateOfBirth);
			const today = new Date();

			if (birthDate > today) {
				setError("Date of birth cannot be in the future");
				setIsLoading(false);
				return;
			}

			const age = today.getFullYear() - birthDate.getFullYear();
			if (age < 3 || age > 25) {
				setError("Student age must be between 3 and 25 years");
				setIsLoading(false);
				return;
			}
		}

		// Validate place of birth
		if (
			formData.placeOfBirth &&
			(formData.placeOfBirth.length < 2 ||
				!/^[a-zA-Z\s,.-]+$/.test(formData.placeOfBirth))
		) {
			setError("Invalid place of birth format");
			setIsLoading(false);
			return;
		}

		try {
			const submitFormData = new FormData();

			// Add all form fields
			Object.entries(formData).forEach(([key, value]) => {
				if (value) submitFormData.append(key, value);
			});

			// Add photos if selected
			if (studentPhoto) {
				submitFormData.append("studentPhoto", studentPhoto);
			}
			if (parentPhoto) {
				submitFormData.append("parentPhoto", parentPhoto);
			}

			const response = await fetch("/api/students/register", {
				method: "POST",
				body: submitFormData,
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Registration failed");
			}

			toast({
				title: "Student registered successfully",
				description: `Student ID: ${data.student.studentId}`,
			});

			// Redirect to payment page
			if (data.redirectTo) {
				router.push(data.redirectTo);
			} else {
				router.push("/dashboard/students");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center space-y-4">
					<Loader2 className="h-8 w-8 animate-spin mx-auto" />
					<p className="text-muted-foreground">Loading form data...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Link href="/dashboard/students">
					<Button variant="ghost" size="icon">
						<ArrowLeft className="h-4 w-4" />
					</Button>
				</Link>
				<div>
					<h1 className="text-3xl font-bold">Register New Student</h1>
					<p className="text-muted-foreground">
						Add a new student to the system
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{success && (
					<Alert>
						<CheckCircle className="h-4 w-4" />
						<AlertDescription>{success}</AlertDescription>
					</Alert>
				)}

				{/* Student Search for Regular Students */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Search className="h-5 w-5" />
							Search Existing Student (Optional)
						</CardTitle>
						<CardDescription>
							For regular students returning for a new academic year, search by
							Student ID to avoid duplicate entries
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex gap-2">
							<div className="flex-1">
								<Label htmlFor="searchStudentId">Student ID</Label>
								<Input
									id="searchStudentId"
									value={searchStudentId}
									onChange={(e) => setSearchStudentId(e.target.value)}
									placeholder="Enter Student ID (e.g., RSYMAB1777)"
								/>
							</div>
							<div className="flex items-end">
								<Button
									type="button"
									onClick={handleStudentSearch}
									disabled={studentSearchLoading || !searchStudentId}>
									{studentSearchLoading ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Search className="h-4 w-4" />
									)}
									Search
								</Button>
							</div>
						</div>

						{existingStudent && (
							<Alert>
								<UserCheck className="h-4 w-4" />
								<AlertDescription>
									<div className="space-y-2">
										<p className="font-medium">Student Found!</p>
										<div className="text-sm space-y-1">
											<p>
												<strong>Name:</strong> {existingStudent.user.firstName}{" "}
												{existingStudent.user.lastName}
											</p>
											<p>
												<strong>Student ID:</strong> {existingStudent.studentId}
											</p>
											<p>
												<strong>Current Branch:</strong>{" "}
												{existingStudent.branch.name}
											</p>
											<p>
												<strong>Last Grade:</strong>{" "}
												{existingStudent.grade.name}
											</p>
											{existingStudent.hasCurrentYearRegistration && (
												<p className="text-orange-600">
													<strong>Note:</strong> Student already has a
													registration for this academic year
												</p>
											)}
										</div>
									</div>
								</AlertDescription>
							</Alert>
						)}
					</CardContent>
				</Card>

				{/* Student Information */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<User className="h-5 w-5" />
							Student Information
						</CardTitle>
						<CardDescription>Basic details about the student</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Student Photo Upload */}
						<div className="flex items-center gap-6">
							<div className="flex flex-col items-center gap-4">
								<Avatar className="h-24 w-24">
									<AvatarImage
										src={studentPhotoPreview || "/placeholder.svg"}
										alt="Student photo"
									/>
									<AvatarFallback className="text-lg">
										{formData.firstName[0]}
										{formData.lastName[0]}
									</AvatarFallback>
								</Avatar>
								<div className="flex gap-2">
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => studentFileInputRef.current?.click()}>
										<Upload className="h-4 w-4 mr-2" />
										Upload Photo
									</Button>
									{studentPhoto && (
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => removePhoto("student")}>
											<X className="h-4 w-4" />
										</Button>
									)}
								</div>
								<input
									ref={studentFileInputRef}
									type="file"
									accept="image/jpeg,image/jpg,image/png,image/webp"
									onChange={(e) => handlePhotoChange(e, "student")}
									className="hidden"
								/>
								<p className="text-xs text-muted-foreground text-center">
									Max 5MB. JPEG, PNG, WebP only.
								</p>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="firstName">First Name *</Label>
								<Input
									id="firstName"
									value={formData.firstName}
									onChange={(e) =>
										handleInputChange("firstName", e.target.value)
									}
									required
									disabled={isLoading}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="lastName">Last Name *</Label>
								<Input
									id="lastName"
									value={formData.lastName}
									onChange={(e) =>
										handleInputChange("lastName", e.target.value)
									}
									required
									disabled={isLoading}
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="email">Email *</Label>
								<Input
									id="email"
									type="email"
									value={formData.email}
									onChange={(e) => handleInputChange("email", e.target.value)}
									required
									disabled={isLoading}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="phone">Phone</Label>
								<Input
									id="phone"
									value={formData.phone}
									onChange={(e) => handleInputChange("phone", e.target.value)}
									placeholder="+251911234567 or 0911234567"
									disabled={isLoading}
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="space-y-2">
								<Label htmlFor="studentType">Student Type *</Label>
								<Select
									value={formData.studentType}
									onValueChange={(value) =>
										handleInputChange("studentType", value)
									}
									disabled={isLoading}>
									<SelectTrigger>
										<SelectValue placeholder="Select student type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="NEW_STUDENT">New Student</SelectItem>
										<SelectItem value="REGULAR_STUDENT">
											Regular Student
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="branchId">Branch *</Label>
								<Select
									value={formData.branchId}
									onValueChange={(value) =>
										handleInputChange("branchId", value)
									}
									disabled={isLoading}>
									<SelectTrigger>
										<SelectValue placeholder="Select branch" />
									</SelectTrigger>
									<SelectContent>
										{branches.map((branch) => (
											<SelectItem key={branch.id} value={branch.id}>
												{branch.name} ({branch.code})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="gradeId">Grade *</Label>
								<Select
									value={formData.gradeId}
									onValueChange={(value) => handleInputChange("gradeId", value)}
									disabled={isLoading}>
									<SelectTrigger>
										<SelectValue placeholder="Select grade" />
									</SelectTrigger>
									<SelectContent>
										{grades.map((grade) => (
											<SelectItem key={grade.id} value={grade.id}>
												{grade.name} (Level {grade.level})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="space-y-2">
								<Label htmlFor="dateOfBirth">Date of Birth</Label>
								<Input
									id="dateOfBirth"
									type="date"
									value={formData.dateOfBirth}
									onChange={(e) =>
										handleInputChange("dateOfBirth", e.target.value)
									}
									disabled={isLoading}
								/>
								{formData.dateOfBirth && (
									<p className="text-xs text-muted-foreground">
										{calculateAge(formData.dateOfBirth)}
									</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="gender">Gender</Label>
								<Select
									value={formData.gender}
									onValueChange={(value) => handleInputChange("gender", value)}
									disabled={isLoading}>
									<SelectTrigger>
										<SelectValue placeholder="Select gender" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="MALE">Male</SelectItem>
										<SelectItem value="FEMALE">Female</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="nationality">Nationality</Label>
								<Select
									value={formData.nationality}
									onValueChange={(value) =>
										handleInputChange("nationality", value)
									}
									disabled={isLoading}>
									<SelectTrigger>
										<SelectValue placeholder="Select nationality" />
									</SelectTrigger>
									<SelectContent>
										{nationalities.map((nationality) => (
											<SelectItem key={nationality} value={nationality}>
												{nationality}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="placeOfBirth">Place of Birth</Label>
								<Input
									id="placeOfBirth"
									value={formData.placeOfBirth}
									onChange={(e) =>
										handleInputChange("placeOfBirth", e.target.value)
									}
									placeholder="e.g., Addis Ababa, Ethiopia"
									disabled={isLoading}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="bloodGroup">Blood Group</Label>
								<Select
									value={formData.bloodGroup}
									onValueChange={(value) =>
										handleInputChange("bloodGroup", value)
									}
									disabled={isLoading}>
									<SelectTrigger>
										<SelectValue placeholder="Select blood group" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="A+">A+</SelectItem>
										<SelectItem value="A-">A-</SelectItem>
										<SelectItem value="B+">B+</SelectItem>
										<SelectItem value="B-">B-</SelectItem>
										<SelectItem value="AB+">AB+</SelectItem>
										<SelectItem value="AB-">AB-</SelectItem>
										<SelectItem value="O+">O+</SelectItem>
										<SelectItem value="O-">O-</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="emergencyContact">Emergency Contact</Label>
								<Input
									id="emergencyContact"
									value={formData.emergencyContact}
									onChange={(e) =>
										handleInputChange("emergencyContact", e.target.value)
									}
									placeholder="+251911234567"
									disabled={isLoading}
								/>
							</div>
						</div>

						<RadioGroup
							value={formData.additionalFee} // Now value is the additionalFee directly
							onValueChange={(value) => {
								setFormData((prev) => ({
									...prev,
									additionalFee: value, // value will be "8000" or "10000"
								}));
							}}>
							<div className="space-y-4">
								<div className="flex items-center space-x-2 p-4 border rounded-lg">
									<RadioGroupItem value="8000" id="monthly" />
									<div className="flex-1">
										<Label htmlFor="monthly" className="font-medium">
											Registration + Monthly (1st & Last Month)
										</Label>
										<p className="text-sm text-muted-foreground">
											Pay registration fee + first and last month tuition
										</p>
										<p className="text-sm font-medium text-green-600">
											ETB 8,000
										</p>
									</div>
								</div>
								<div className="flex items-center space-x-2 p-4 border rounded-lg">
									<RadioGroupItem value="10000" id="quarterly" />
									<div className="flex-1">
										<Label htmlFor="quarterly" className="font-medium">
											Registration + Quarterly (2.5 Months)
										</Label>
										<p className="text-sm text-muted-foreground">
											Pay registration fee + quarterly tuition fee
										</p>
										<p className="text-sm font-medium text-green-600">
											ETB 10,000
										</p>
									</div>
								</div>
							</div>
						</RadioGroup>

						<div className="space-y-2">
							<Label htmlFor="address">Address</Label>
							<Textarea
								id="address"
								value={formData.address}
								onChange={(e) => handleInputChange("address", e.target.value)}
								disabled={isLoading}
								rows={3}
								placeholder="Full address including city and region"
							/>
						</div>
					</CardContent>
				</Card>

				<Separator />

				{/* Parent Information */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							Parent/Guardian Information
						</CardTitle>
						<CardDescription>
							Details about the student's parent or guardian
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{parentInfo && (
							<Alert>
								<CheckCircle className="h-4 w-4" />
								<AlertDescription>
									<div className="space-y-2">
										<p className="font-medium">Parent Found!</p>
										<div className="text-sm space-y-1">
											<p>
												<strong>Name:</strong> {parentInfo.user.firstName}{" "}
												{parentInfo.user.lastName}
											</p>
											<p>
												<strong>Phone:</strong> {parentInfo.user.phone}
											</p>
											{parentInfo.occupation && (
												<p>
													<strong>Occupation:</strong> {parentInfo.occupation}
												</p>
											)}
											{parentInfo.children.length > 0 && (
												<div>
													<p>
														<strong>Other Children:</strong>
													</p>
													<ul className="list-disc list-inside ml-2">
														{parentInfo.children.map((child) => (
															<li key={child.id}>
																{child.name} ({child.studentId}) -{" "}
																{child.relationship}
															</li>
														))}
													</ul>
												</div>
											)}
										</div>
									</div>
								</AlertDescription>
							</Alert>
						)}

						<Separator />
						{/* {existingParent && (
							<Alert>
								<CheckCircle className="h-4 w-4" />
								<AlertDescription>
									<div className="flex items-center gap-2">
										<Badge variant="secondary">Existing Parent Found</Badge>
										<span className="text-sm">
											{existingParent.user.firstName}{" "}
											{existingParent.user.lastName} -{" "}
											{existingParent.user.phone}
										</span>
									</div>
									<p className="text-sm text-muted-foreground mt-1">
										Parent information has been automatically filled. You can
										update it if needed.
									</p>
									{existingParent.children.length > 0 && (
										<div className="mt-2">
											<p className="text-sm font-medium">Existing children:</p>
											<div className="flex flex-wrap gap-1 mt-1">
												{existingParent.children.map((child) => (
													<Badge
														key={child.id}
														variant="outline"
														className="text-xs">
														{child.name} ({child.relationship})
													</Badge>
												))}
											</div>
										</div>
									)}
								</AlertDescription>
							</Alert>
						)} */}

						{/* Parent Photo Upload */}
						<div className="flex items-center gap-6">
							<div className="flex flex-col items-center gap-4">
								<Avatar className="h-20 w-20">
									<AvatarImage
										src={parentPhotoPreview || "/placeholder.svg"}
										alt="Parent photo"
									/>
									<AvatarFallback className="text-sm">
										{formData.parentFirstName[0]}
										{formData.parentLastName[0]}
									</AvatarFallback>
								</Avatar>
								<div className="flex gap-2">
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => parentFileInputRef.current?.click()}>
										<Upload className="h-4 w-4 mr-2" />
										Upload Parent Photo
									</Button>
									{parentPhoto && (
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => removePhoto("parent")}>
											<X className="h-4 w-4" />
										</Button>
									)}
								</div>
								<input
									ref={parentFileInputRef}
									type="file"
									accept="image/jpeg,image/jpg,image/png,image/webp"
									onChange={(e) => handlePhotoChange(e, "parent")}
									className="hidden"
								/>
								<p className="text-xs text-muted-foreground text-center">
									Optional. Max 5MB. JPEG, PNG, WebP only.
								</p>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="parentPhone">Parent Phone Number *</Label>
									<div className="relative">
										<Input
											id="parentPhone"
											value={formData.parentPhone}
											onChange={(e) =>
												handleInputChange("parentPhone", e.target.value)
											}
											placeholder="+251912345678"
											required
										/>
										{parentSearchLoading && (
											<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
												<Loader2 className="h-4 w-4 animate-spin" />
											</div>
										)}
									</div>
									<p className="text-sm text-muted-foreground mt-1">
										We'll search for existing parent information
									</p>
								</div>
								<div>
									<Label htmlFor="relationship">Relationship *</Label>
									<Select
										value={formData.relationship}
										onValueChange={(value) =>
											handleInputChange("relationship", value)
										}
										required>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="FATHER">Father</SelectItem>
											<SelectItem value="MOTHER">Mother</SelectItem>
											<SelectItem value="GUARDIAN">Guardian</SelectItem>
											<SelectItem value="OTHER">Other</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
							{/* <div className="space-y-2">
								<Label htmlFor="parentPhone">Parent Phone *</Label>
								<div className="relative">
									<Input
										id="parentPhone"
										value={formData.parentPhone}
										onChange={(e) => handleParentPhoneChange(e.target.value)}
										placeholder="+251911234567 or 0911234567"
										required
										disabled={isLoading}
									/>
									{isSearchingParent && (
										<div className="absolute right-3 top-3">
											<Loader2 className="h-4 w-4 animate-spin" />
										</div>
									)}
								</div>
								<p className="text-xs text-muted-foreground">
									We'll check if this parent already exists in our system
								</p>
							</div> */}
							{/* <div className="space-y-2">
								<Label htmlFor="relationship">Relationship</Label>
								<Select
									value={formData.relationship}
									onValueChange={(value) =>
										handleInputChange("relationship", value)
									}
									disabled={isLoading}>
									<SelectTrigger>
										<SelectValue placeholder="Select relationship" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="father">Father</SelectItem>
										<SelectItem value="mother">Mother</SelectItem>
										<SelectItem value="guardian">Guardian</SelectItem>
										<SelectItem value="parent">Parent</SelectItem>
									</SelectContent>
								</Select>
							</div> */}
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="parentFirstName">Parent First Name</Label>
								<Input
									id="parentFirstName"
									value={formData.parentFirstName}
									onChange={(e) =>
										handleInputChange("parentFirstName", e.target.value)
									}
									disabled={isLoading}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="parentLastName">Parent Last Name</Label>
								<Input
									id="parentLastName"
									value={formData.parentLastName}
									onChange={(e) =>
										handleInputChange("parentLastName", e.target.value)
									}
									disabled={isLoading}
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="parentEmail">Parent Email</Label>
								<Input
									id="parentEmail"
									type="email"
									value={formData.parentEmail}
									onChange={(e) =>
										handleInputChange("parentEmail", e.target.value)
									}
									disabled={isLoading}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="parentOccupation">Occupation</Label>
								<Input
									id="parentOccupation"
									value={formData.parentOccupation}
									onChange={(e) =>
										handleInputChange("parentOccupation", e.target.value)
									}
									disabled={isLoading}
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="parentWorkplace">Workplace</Label>
								<Input
									id="parentWorkplace"
									value={formData.parentWorkplace}
									onChange={(e) =>
										handleInputChange("parentWorkplace", e.target.value)
									}
									disabled={isLoading}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="parentAddress">Parent Address</Label>
							<Textarea
								id="parentAddress"
								value={formData.parentAddress}
								onChange={(e) =>
									handleInputChange("parentAddress", e.target.value)
								}
								disabled={isLoading}
								rows={3}
								placeholder="Full address including city and region"
							/>
						</div>
					</CardContent>
				</Card>

				{/* Submit Button */}
				<div className="flex justify-end gap-4">
					<Link href="/dashboard/students">
						<Button type="button" variant="outline" disabled={isLoading}>
							Cancel
						</Button>
					</Link>
					<Button type="submit" disabled={isLoading}>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Registering...
							</>
						) : (
							"Register Student"
						)}
					</Button>
				</div>
			</form>
		</div>
	);
}

// "use client";

// import type React from "react";

// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
// 	Card,
// 	CardContent,
// 	CardDescription,
// 	CardHeader,
// 	CardTitle,
// } from "@/components/ui/card";
// import {
// 	Select,
// 	SelectContent,
// 	SelectItem,
// 	SelectTrigger,
// 	SelectValue,
// } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { Separator } from "@/components/ui/separator";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { Loader2, ArrowLeft, Upload, X, User, Users } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import Link from "next/link";

// interface Branch {
// 	id: string;
// 	name: string;
// 	code: string;
// }

// interface Grade {
// 	id: string;
// 	name: string;
// 	level: number;
// }

// export default function StudentRegisterPage() {
// 	const [formData, setFormData] = useState({
// 		// Student info
// 		firstName: "",
// 		lastName: "",
// 		email: "",
// 		phone: "",
// 		branchId: "",
// 		gradeId: "",
// 		studentType: "",
// 		admissionDate: new Date().toISOString().split("T")[0],
// 		dateOfBirth: "",
// 		placeOfBirth: "",
// 		gender: "",
// 		nationality: "Ethiopian",
// 		bloodGroup: "",
// 		address: "",
// 		emergencyContact: "",
// 		// Parent info
// 		parentFirstName: "",
// 		parentLastName: "",
// 		parentEmail: "",
// 		parentPhone: "",
// 		parentOccupation: "",
// 		parentWorkplace: "",
// 		parentAddress: "",
// 		relationship: "parent",
// 	});

// 	const [studentPhoto, setStudentPhoto] = useState<File | null>(null);
// 	const [studentPhotoPreview, setStudentPhotoPreview] = useState<string | null>(
// 		null
// 	);
// 	const [parentPhoto, setParentPhoto] = useState<File | null>(null);
// 	const [parentPhotoPreview, setParentPhotoPreview] = useState<string | null>(
// 		null
// 	);
// 	const [branches, setBranches] = useState<Branch[]>([]);
// 	const [grades, setGrades] = useState<Grade[]>([]);
// 	const [isLoading, setIsLoading] = useState(false);
// 	const [error, setError] = useState("");
// 	const [existingParentInfo, setExistingParentInfo] = useState<any>(null);
// 	const studentFileInputRef = useRef<HTMLInputElement>(null);
// 	const parentFileInputRef = useRef<HTMLInputElement>(null);
// 	const router = useRouter();
// 	const { toast } = useToast();

// 	const nationalities = [
// 		"Ethiopian",
// 		"American",
// 		"British",
// 		"Canadian",
// 		"German",
// 		"French",
// 		"Italian",
// 		"Spanish",
// 		"Dutch",
// 		"Swedish",
// 		"Norwegian",
// 		"Danish",
// 		"Finnish",
// 		"Belgian",
// 		"Swiss",
// 		"Austrian",
// 		"Kenyan",
// 		"Ugandan",
// 		"Tanzanian",
// 		"Rwandan",
// 		"Sudanese",
// 		"Egyptian",
// 		"South African",
// 		"Nigerian",
// 		"Ghanaian",
// 		"Indian",
// 		"Chinese",
// 		"Japanese",
// 		"Korean",
// 		"Australian",
// 		"Other",
// 	];

// 	useEffect(() => {
// 		setBranches([
// 			{ id: "cmcq6t33d0002ega0b08xzm18", name: "Abado", code: "MC" },
// 		]);

// 		setGrades([
// 			{ id: "cmcq6t389000mega08p0qhyii", name: "Grade 1", level: 1 },
// 			{ id: "2", name: "Grade 2", level: 2 },
// 			{ id: "3", name: "Grade 3", level: 3 },
// 			{ id: "4", name: "Grade 4", level: 4 },
// 			{ id: "5", name: "Grade 5", level: 5 },
// 			{ id: "6", name: "Grade 6", level: 6 },
// 			{ id: "7", name: "Grade 7", level: 7 },
// 			{ id: "8", name: "Grade 8", level: 8 },
// 		]);
// 	}, []);

// 	const handleInputChange = (field: string, value: string) => {
// 		setFormData((prev) => ({ ...prev, [field]: value }));
// 	};

// 	const handlePhotoChange = (
// 		e: React.ChangeEvent<HTMLInputElement>,
// 		type: "student" | "parent"
// 	) => {
// 		const file = e.target.files?.[0];
// 		if (file) {
// 			// Validate file type
// 			const allowedTypes = [
// 				"image/jpeg",
// 				"image/jpg",
// 				"image/png",
// 				"image/webp",
// 			];
// 			if (!allowedTypes.includes(file.type)) {
// 				setError("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
// 				return;
// 			}

// 			// Validate file size (max 5MB)
// 			const maxSize = 5 * 1024 * 1024; // 5MB
// 			if (file.size > maxSize) {
// 				setError("File size too large. Maximum size is 5MB.");
// 				return;
// 			}

// 			if (type === "student") {
// 				setStudentPhoto(file);
// 				// Create preview
// 				const reader = new FileReader();
// 				reader.onload = (e) => {
// 					setStudentPhotoPreview(e.target?.result as string);
// 				};
// 				reader.readAsDataURL(file);
// 			} else {
// 				setParentPhoto(file);
// 				// Create preview
// 				const reader = new FileReader();
// 				reader.onload = (e) => {
// 					setParentPhotoPreview(e.target?.result as string);
// 				};
// 				reader.readAsDataURL(file);
// 			}

// 			setError("");
// 		}
// 	};

// 	const removePhoto = (type: "student" | "parent") => {
// 		if (type === "student") {
// 			setStudentPhoto(null);
// 			setStudentPhotoPreview(null);
// 			if (studentFileInputRef.current) {
// 				studentFileInputRef.current.value = "";
// 			}
// 		} else {
// 			setParentPhoto(null);
// 			setParentPhotoPreview(null);
// 			if (parentFileInputRef.current) {
// 				parentFileInputRef.current.value = "";
// 			}
// 		}
// 	};

// 	const calculateAge = (dateOfBirth: string) => {
// 		if (!dateOfBirth) return "";
// 		const birthDate = new Date(dateOfBirth);
// 		const today = new Date();
// 		let age = today.getFullYear() - birthDate.getFullYear();
// 		const monthDiff = today.getMonth() - birthDate.getMonth();

// 		if (
// 			monthDiff < 0 ||
// 			(monthDiff === 0 && today.getDate() < birthDate.getDate())
// 		) {
// 			age--;
// 		}

// 		return age > 0 ? `${age} years old` : "";
// 	};

// 	// Check for existing parent when phone number changes
// 	const handleParentPhoneChange = async (phone: string) => {
// 		handleInputChange("parentPhone", phone);

// 		if (phone && phone.length >= 10) {
// 			try {
// 				// Simulate API call to check existing parent
// 				// In real implementation, you would call an API endpoint
// 				const mockExistingParent = {
// 					firstName: "John",
// 					lastName: "Doe",
// 					email: "john.doe@example.com",
// 					occupation: "Engineer",
// 					workplace: "Tech Company",
// 				};

// 				// For demo purposes, show existing parent info if phone starts with "091"
// 				if (phone.startsWith("091")) {
// 					setExistingParentInfo(mockExistingParent);
// 					setFormData((prev) => ({
// 						...prev,
// 						parentFirstName: mockExistingParent.firstName,
// 						parentLastName: mockExistingParent.lastName,
// 						parentEmail: mockExistingParent.email,
// 						parentOccupation: mockExistingParent.occupation,
// 						parentWorkplace: mockExistingParent.workplace,
// 					}));
// 				} else {
// 					setExistingParentInfo(null);
// 				}
// 			} catch (error) {
// 				console.error("Error checking existing parent:", error);
// 			}
// 		} else {
// 			setExistingParentInfo(null);
// 		}
// 	};

// 	const handleSubmit = async (e: React.FormEvent) => {
// 		e.preventDefault();
// 		setIsLoading(true);
// 		setError("");

// 		const {
// 			phone,
// 			parentPhone,
// 			dateOfBirth,
// 			placeOfBirth,
// 			nationality,
// 			gender,
// 			studentType,
// 			gradeId,
// 		} = formData;

// 		// Validate required fields
// 		if (!gradeId) {
// 			setError("Please select a grade");
// 			setIsLoading(false);
// 			return;
// 		}

// 		if (!studentType) {
// 			setError("Please select student type");
// 			setIsLoading(false);
// 			return;
// 		}

// 		// Validate required parent phone
// 		if (!parentPhone) {
// 			setError("Parent phone number is required");
// 			setIsLoading(false);
// 			return;
// 		}

// 		// Validate Ethiopian phone format
// 		const ethiopianPhoneRegex = /^(\+251|0)[79]\d{8}$/;
// 		if (phone && !ethiopianPhoneRegex.test(phone)) {
// 			setError("Invalid phone number format. Use +251XXXXXXXXX or 09XXXXXXXX");
// 			setIsLoading(false);
// 			return;
// 		}

// 		if (parentPhone && !ethiopianPhoneRegex.test(parentPhone)) {
// 			setError(
// 				"Invalid parent phone number format. Use +251XXXXXXXXX or 09XXXXXXXX"
// 			);
// 			setIsLoading(false);
// 			return;
// 		}

// 		// Validate date of birth
// 		if (dateOfBirth) {
// 			const birthDate = new Date(dateOfBirth);
// 			const today = new Date();

// 			if (birthDate > today) {
// 				setError("Date of birth cannot be in the future");
// 				setIsLoading(false);
// 				return;
// 			}

// 			const age = today.getFullYear() - birthDate.getFullYear();
// 			if (age < 3 || age > 25) {
// 				setError("Student age must be between 3 and 25 years");
// 				setIsLoading(false);
// 				return;
// 			}
// 		}

// 		// Validate place of birth
// 		if (
// 			placeOfBirth &&
// 			(placeOfBirth.length < 2 || !/^[a-zA-Z\s,.-]+$/.test(placeOfBirth))
// 		) {
// 			setError("Invalid place of birth format");
// 			setIsLoading(false);
// 			return;
// 		}

// 		try {
// 			const submitFormData = new FormData();

// 			// Add all form fields
// 			Object.entries(formData).forEach(([key, value]) => {
// 				if (value) submitFormData.append(key, value);
// 			});

// 			// Add photos if selected
// 			if (studentPhoto) {
// 				submitFormData.append("studentPhoto", studentPhoto);
// 			}
// 			if (parentPhoto) {
// 				submitFormData.append("parentPhoto", parentPhoto);
// 			}

// 			const response = await fetch("/api/students/register", {
// 				method: "POST",
// 				body: submitFormData,
// 			});

// 			const data = await response.json();

// 			if (!response.ok) {
// 				throw new Error(data.error || "Registration failed");
// 			}

// 			toast({
// 				title: "Student registered successfully",
// 				description: `Student ID: ${data.student.studentId}`,
// 			});

// 			// Redirect to payment page
// 			if (data.redirectTo) {
// 				router.push(data.redirectTo);
// 			} else {
// 				router.push("/dashboard/students");
// 			}
// 		} catch (err) {
// 			setError(err instanceof Error ? err.message : "An error occurred");
// 		} finally {
// 			setIsLoading(false);
// 		}
// 	};

// 	return (
// 		<div className="space-y-6">
// 			<div className="flex items-center gap-4">
// 				<Link href="/dashboard/students">
// 					<Button variant="ghost" size="icon">
// 						<ArrowLeft className="h-4 w-4" />
// 					</Button>
// 				</Link>
// 				<div>
// 					<h1 className="text-3xl font-bold">Register New Student</h1>
// 					<p className="text-muted-foreground">
// 						Add a new student to the system
// 					</p>
// 				</div>
// 			</div>

// 			<form onSubmit={handleSubmit} className="space-y-6">
// 				{error && (
// 					<Alert variant="destructive">
// 						<AlertDescription>{error}</AlertDescription>
// 					</Alert>
// 				)}

// 				{/* Student Information */}
// 				<Card>
// 					<CardHeader>
// 						<CardTitle className="flex items-center gap-2">
// 							<User className="h-5 w-5" />
// 							Student Information
// 						</CardTitle>
// 						<CardDescription>Basic details about the student</CardDescription>
// 					</CardHeader>
// 					<CardContent className="space-y-6">
// 						{/* Student Photo Upload */}
// 						<div className="flex items-center gap-6">
// 							<div className="flex flex-col items-center gap-4">
// 								<Avatar className="h-24 w-24">
// 									<AvatarImage
// 										src={studentPhotoPreview || "/placeholder.svg"}
// 										alt="Student photo"
// 									/>
// 									<AvatarFallback className="text-lg">
// 										{formData.firstName[0]}
// 										{formData.lastName[0]}
// 									</AvatarFallback>
// 								</Avatar>
// 								<div className="flex gap-2">
// 									<Button
// 										type="button"
// 										variant="outline"
// 										size="sm"
// 										onClick={() => studentFileInputRef.current?.click()}>
// 										<Upload className="h-4 w-4 mr-2" />
// 										Upload Photo
// 									</Button>
// 									{studentPhoto && (
// 										<Button
// 											type="button"
// 											variant="outline"
// 											size="sm"
// 											onClick={() => removePhoto("student")}>
// 											<X className="h-4 w-4" />
// 										</Button>
// 									)}
// 								</div>
// 								<input
// 									ref={studentFileInputRef}
// 									type="file"
// 									accept="image/jpeg,image/jpg,image/png,image/webp"
// 									onChange={(e) => handlePhotoChange(e, "student")}
// 									className="hidden"
// 								/>
// 								<p className="text-xs text-muted-foreground text-center">
// 									Max 5MB. JPEG, PNG, WebP only.
// 								</p>
// 							</div>
// 						</div>

// 						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// 							<div className="space-y-2">
// 								<Label htmlFor="firstName">First Name *</Label>
// 								<Input
// 									id="firstName"
// 									value={formData.firstName}
// 									onChange={(e) =>
// 										handleInputChange("firstName", e.target.value)
// 									}
// 									required
// 									disabled={isLoading}
// 								/>
// 							</div>
// 							<div className="space-y-2">
// 								<Label htmlFor="lastName">Last Name *</Label>
// 								<Input
// 									id="lastName"
// 									value={formData.lastName}
// 									onChange={(e) =>
// 										handleInputChange("lastName", e.target.value)
// 									}
// 									required
// 									disabled={isLoading}
// 								/>
// 							</div>
// 						</div>

// 						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// 							<div className="space-y-2">
// 								<Label htmlFor="email">Email *</Label>
// 								<Input
// 									id="email"
// 									type="email"
// 									value={formData.email}
// 									onChange={(e) => handleInputChange("email", e.target.value)}
// 									required
// 									disabled={isLoading}
// 								/>
// 							</div>
// 							<div className="space-y-2">
// 								<Label htmlFor="phone">Phone</Label>
// 								<Input
// 									id="phone"
// 									value={formData.phone}
// 									onChange={(e) => handleInputChange("phone", e.target.value)}
// 									placeholder="+251911234567 or 0911234567"
// 									disabled={isLoading}
// 								/>
// 							</div>
// 						</div>

// 						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// 							<div className="space-y-2">
// 								<Label htmlFor="studentType">Student Type *</Label>
// 								<Select
// 									value={formData.studentType}
// 									onValueChange={(value) =>
// 										handleInputChange("studentType", value)
// 									}
// 									disabled={isLoading}>
// 									<SelectTrigger>
// 										<SelectValue placeholder="Select student type" />
// 									</SelectTrigger>
// 									<SelectContent>
// 										<SelectItem value="NEW_STUDENT">New Student</SelectItem>
// 										<SelectItem value="REGULAR_STUDENT">
// 											Regular Student
// 										</SelectItem>
// 									</SelectContent>
// 								</Select>
// 							</div>
// 							<div className="space-y-2">
// 								<Label htmlFor="branchId">Branch *</Label>
// 								<Select
// 									value={formData.branchId}
// 									onValueChange={(value) =>
// 										handleInputChange("branchId", value)
// 									}
// 									disabled={isLoading}>
// 									<SelectTrigger>
// 										<SelectValue placeholder="Select branch" />
// 									</SelectTrigger>
// 									<SelectContent>
// 										{branches.map((branch) => (
// 											<SelectItem key={branch.id} value={branch.id}>
// 												{branch.name}
// 											</SelectItem>
// 										))}
// 									</SelectContent>
// 								</Select>
// 							</div>
// 							<div className="space-y-2">
// 								<Label htmlFor="gradeId">Grade *</Label>
// 								<Select
// 									value={formData.gradeId}
// 									onValueChange={(value) => handleInputChange("gradeId", value)}
// 									disabled={isLoading}>
// 									<SelectTrigger>
// 										<SelectValue placeholder="Select grade" />
// 									</SelectTrigger>
// 									<SelectContent>
// 										{grades.map((grade) => (
// 											<SelectItem key={grade.id} value={grade.id}>
// 												{grade.name}
// 											</SelectItem>
// 										))}
// 									</SelectContent>
// 								</Select>
// 							</div>
// 						</div>

// 						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// 							<div className="space-y-2">
// 								<Label htmlFor="dateOfBirth">Date of Birth</Label>
// 								<Input
// 									id="dateOfBirth"
// 									type="date"
// 									value={formData.dateOfBirth}
// 									onChange={(e) =>
// 										handleInputChange("dateOfBirth", e.target.value)
// 									}
// 									disabled={isLoading}
// 								/>
// 								{formData.dateOfBirth && (
// 									<p className="text-xs text-muted-foreground">
// 										{calculateAge(formData.dateOfBirth)}
// 									</p>
// 								)}
// 							</div>
// 							<div className="space-y-2">
// 								<Label htmlFor="gender">Gender</Label>
// 								<Select
// 									value={formData.gender}
// 									onValueChange={(value) => handleInputChange("gender", value)}
// 									disabled={isLoading}>
// 									<SelectTrigger>
// 										<SelectValue placeholder="Select gender" />
// 									</SelectTrigger>
// 									<SelectContent>
// 										<SelectItem value="MALE">Male</SelectItem>
// 										<SelectItem value="FEMALE">Female</SelectItem>
// 									</SelectContent>
// 								</Select>
// 							</div>
// 							<div className="space-y-2">
// 								<Label htmlFor="nationality">Nationality</Label>
// 								<Select
// 									value={formData.nationality}
// 									onValueChange={(value) =>
// 										handleInputChange("nationality", value)
// 									}
// 									disabled={isLoading}>
// 									<SelectTrigger>
// 										<SelectValue placeholder="Select nationality" />
// 									</SelectTrigger>
// 									<SelectContent>
// 										{nationalities.map((nationality) => (
// 											<SelectItem key={nationality} value={nationality}>
// 												{nationality}
// 											</SelectItem>
// 										))}
// 									</SelectContent>
// 								</Select>
// 							</div>
// 						</div>

// 						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// 							<div className="space-y-2">
// 								<Label htmlFor="placeOfBirth">Place of Birth</Label>
// 								<Input
// 									id="placeOfBirth"
// 									value={formData.placeOfBirth}
// 									onChange={(e) =>
// 										handleInputChange("placeOfBirth", e.target.value)
// 									}
// 									placeholder="e.g., Addis Ababa, Ethiopia"
// 									disabled={isLoading}
// 								/>
// 							</div>
// 							<div className="space-y-2">
// 								<Label htmlFor="bloodGroup">Blood Group</Label>
// 								<Select
// 									value={formData.bloodGroup}
// 									onValueChange={(value) =>
// 										handleInputChange("bloodGroup", value)
// 									}
// 									disabled={isLoading}>
// 									<SelectTrigger>
// 										<SelectValue placeholder="Select blood group" />
// 									</SelectTrigger>
// 									<SelectContent>
// 										<SelectItem value="A+">A+</SelectItem>
// 										<SelectItem value="A-">A-</SelectItem>
// 										<SelectItem value="B+">B+</SelectItem>
// 										<SelectItem value="B-">B-</SelectItem>
// 										<SelectItem value="AB+">AB+</SelectItem>
// 										<SelectItem value="AB-">AB-</SelectItem>
// 										<SelectItem value="O+">O+</SelectItem>
// 										<SelectItem value="O-">O-</SelectItem>
// 									</SelectContent>
// 								</Select>
// 							</div>
// 						</div>

// 						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// 							<div className="space-y-2">
// 								<Label htmlFor="emergencyContact">Emergency Contact</Label>
// 								<Input
// 									id="emergencyContact"
// 									value={formData.emergencyContact}
// 									onChange={(e) =>
// 										handleInputChange("emergencyContact", e.target.value)
// 									}
// 									placeholder="+251911234567"
// 									disabled={isLoading}
// 								/>
// 							</div>
// 						</div>

// 						<div className="space-y-2">
// 							<Label htmlFor="address">Address</Label>
// 							<Textarea
// 								id="address"
// 								value={formData.address}
// 								onChange={(e) => handleInputChange("address", e.target.value)}
// 								disabled={isLoading}
// 								rows={3}
// 								placeholder="Full address including city and region"
// 							/>
// 						</div>
// 					</CardContent>
// 				</Card>

// 				<Separator />

// 				{/* Parent Information */}
// 				<Card>
// 					<CardHeader>
// 						<CardTitle className="flex items-center gap-2">
// 							<Users className="h-5 w-5" />
// 							Parent/Guardian Information
// 						</CardTitle>
// 						<CardDescription>
// 							Details about the student's parent or guardian
// 						</CardDescription>
// 					</CardHeader>
// 					<CardContent className="space-y-6">
// 						{existingParentInfo && (
// 							<Alert>
// 								<User className="h-4 w-4" />
// 								<AlertDescription>
// 									<div className="flex items-center gap-2">
// 										<Badge variant="secondary">Existing Parent Found</Badge>
// 										<span className="text-sm">
// 											{existingParentInfo.firstName}{" "}
// 											{existingParentInfo.lastName} - {existingParentInfo.phone}
// 										</span>
// 									</div>
// 									<p className="text-sm text-muted-foreground mt-1">
// 										Parent information has been automatically filled. You can
// 										update it if needed.
// 									</p>
// 								</AlertDescription>
// 							</Alert>
// 						)}

// 						{/* Parent Photo Upload */}
// 						<div className="flex items-center gap-6">
// 							<div className="flex flex-col items-center gap-4">
// 								<Avatar className="h-20 w-20">
// 									<AvatarImage
// 										src={parentPhotoPreview || "/placeholder.svg"}
// 										alt="Parent photo"
// 									/>
// 									<AvatarFallback className="text-sm">
// 										{formData.parentFirstName[0]}
// 										{formData.parentLastName[0]}
// 									</AvatarFallback>
// 								</Avatar>
// 								<div className="flex gap-2">
// 									<Button
// 										type="button"
// 										variant="outline"
// 										size="sm"
// 										onClick={() => parentFileInputRef.current?.click()}>
// 										<Upload className="h-4 w-4 mr-2" />
// 										Upload Parent Photo
// 									</Button>
// 									{parentPhoto && (
// 										<Button
// 											type="button"
// 											variant="outline"
// 											size="sm"
// 											onClick={() => removePhoto("parent")}>
// 											<X className="h-4 w-4" />
// 										</Button>
// 									)}
// 								</div>
// 								<input
// 									ref={parentFileInputRef}
// 									type="file"
// 									accept="image/jpeg,image/jpg,image/png,image/webp"
// 									onChange={(e) => handlePhotoChange(e, "parent")}
// 									className="hidden"
// 								/>
// 								<p className="text-xs text-muted-foreground text-center">
// 									Optional. Max 5MB. JPEG, PNG, WebP only.
// 								</p>
// 							</div>
// 						</div>

// 						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// 							<div className="space-y-2">
// 								<Label htmlFor="parentPhone">Parent Phone *</Label>
// 								<Input
// 									id="parentPhone"
// 									value={formData.parentPhone}
// 									onChange={(e) => handleParentPhoneChange(e.target.value)}
// 									placeholder="+251911234567 or 0911234567"
// 									required
// 									disabled={isLoading}
// 								/>
// 								<p className="text-xs text-muted-foreground">
// 									We'll check if this parent already exists in our system
// 								</p>
// 							</div>
// 							<div className="space-y-2">
// 								<Label htmlFor="relationship">Relationship</Label>
// 								<Select
// 									value={formData.relationship}
// 									onValueChange={(value) =>
// 										handleInputChange("relationship", value)
// 									}
// 									disabled={isLoading}>
// 									<SelectTrigger>
// 										<SelectValue placeholder="Select relationship" />
// 									</SelectTrigger>
// 									<SelectContent>
// 										<SelectItem value="father">Father</SelectItem>
// 										<SelectItem value="mother">Mother</SelectItem>
// 										<SelectItem value="guardian">Guardian</SelectItem>
// 										<SelectItem value="parent">Parent</SelectItem>
// 									</SelectContent>
// 								</Select>
// 							</div>
// 						</div>

// 						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// 							<div className="space-y-2">
// 								<Label htmlFor="parentFirstName">Parent First Name</Label>
// 								<Input
// 									id="parentFirstName"
// 									value={formData.parentFirstName}
// 									onChange={(e) =>
// 										handleInputChange("parentFirstName", e.target.value)
// 									}
// 									disabled={isLoading}
// 								/>
// 							</div>
// 							<div className="space-y-2">
// 								<Label htmlFor="parentLastName">Parent Last Name</Label>
// 								<Input
// 									id="parentLastName"
// 									value={formData.parentLastName}
// 									onChange={(e) =>
// 										handleInputChange("parentLastName", e.target.value)
// 									}
// 									disabled={isLoading}
// 								/>
// 							</div>
// 						</div>

// 						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// 							<div className="space-y-2">
// 								<Label htmlFor="parentEmail">Parent Email</Label>
// 								<Input
// 									id="parentEmail"
// 									type="email"
// 									value={formData.parentEmail}
// 									onChange={(e) =>
// 										handleInputChange("parentEmail", e.target.value)
// 									}
// 									disabled={isLoading}
// 								/>
// 							</div>
// 							<div className="space-y-2">
// 								<Label htmlFor="parentOccupation">Occupation</Label>
// 								<Input
// 									id="parentOccupation"
// 									value={formData.parentOccupation}
// 									onChange={(e) =>
// 										handleInputChange("parentOccupation", e.target.value)
// 									}
// 									disabled={isLoading}
// 								/>
// 							</div>
// 						</div>

// 						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// 							<div className="space-y-2">
// 								<Label htmlFor="parentWorkplace">Workplace</Label>
// 								<Input
// 									id="parentWorkplace"
// 									value={formData.parentWorkplace}
// 									onChange={(e) =>
// 										handleInputChange("parentWorkplace", e.target.value)
// 									}
// 									disabled={isLoading}
// 								/>
// 							</div>
// 						</div>

// 						<div className="space-y-2">
// 							<Label htmlFor="parentAddress">Parent Address</Label>
// 							<Textarea
// 								id="parentAddress"
// 								value={formData.parentAddress}
// 								onChange={(e) =>
// 									handleInputChange("parentAddress", e.target.value)
// 								}
// 								disabled={isLoading}
// 								rows={3}
// 								placeholder="Full address including city and region"
// 							/>
// 						</div>
// 					</CardContent>
// 				</Card>

// 				{/* Submit Button */}
// 				<div className="flex justify-end gap-4">
// 					<Link href="/dashboard/students">
// 						<Button type="button" variant="outline" disabled={isLoading}>
// 							Cancel
// 						</Button>
// 					</Link>
// 					<Button type="submit" disabled={isLoading}>
// 						{isLoading ? (
// 							<>
// 								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
// 								Registering...
// 							</>
// 						) : (
// 							"Register Student"
// 						)}
// 					</Button>
// 				</div>
// 			</form>
// 		</div>
// 	);
// }
