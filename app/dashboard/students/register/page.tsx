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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	Loader2,
	ArrowLeft,
	X,
	User,
	Users,
	CheckCircle,
	AlertCircle,
	Search,
	UserCheck,
	Camera,
	Mail,
	Phone,
	MapPin,
	Calendar,
	GraduationCap,
	Building2,
	CreditCard,
	FileText,
	Info,
	Star,
	ArrowRight,
	ChevronUp,
	ChevronDown,
	DollarSign,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Separator } from "@radix-ui/react-select";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface Branch {
	id: string;
	name: string;
	code: string;
	address?: string;
	phone?: string;
	email?: string;
	isActive: boolean;
}

interface Grade {
	id: string;
	name: string;
	level: number;
	description?: string;
	isActive: boolean;
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
		id: string;
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

interface PaymentOption {
	duration: string;
	label: string;
	months: number;
	additionalFee: number;
}

interface PricingSchema {
	id: string;
	registrationFee: number;
	monthlyFee: number;
	serviceFee: number;
	branch: {
		id: string;
		name: string;
		code: string;
	};
	grade: {
		id: string;
		name: string;
		level: number;
	};
}

// Function to generate random phone number starting with 07
const generateRandomPhone = () => {
	const randomDigits = Math.floor(Math.random() * 100000000)
		.toString()
		.padStart(8, "0");
	return `07${randomDigits}`;
};

export default function StudentRegisterPage() {
	const { user } = useAuth();
	const [currentStep, setCurrentStep] = useState(1);
	const totalSteps = 3;
	const [formData, setFormData] = useState({
		// Student info
		firstName: "",
		lastName: "",
		emailUsername: "",
		phone: generateRandomPhone(),
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
		paymentDuration: "",
		// Parent info
		parentFirstName: "",
		parentLastName: "",
		parentEmail: "",
		parentPhone: "",
		parentOccupation: "",
		parentWorkplace: "",
		parentAddress: "",
		relationship: "FATHER",
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
	const [error, setError] = useState("");
	const [parentInfo, setParentInfo] = useState<ParentInfo | null>(null);
	const [existingStudent, setExistingStudent] =
		useState<ExistingStudent | null>(null);
	const [parentSearchLoading, setParentSearchLoading] = useState(false);
	const [studentSearchLoading, setStudentSearchLoading] = useState(false);
	const [success, setSuccess] = useState("");
	const [searchStudentId, setSearchStudentId] = useState("");
	const studentFileInputRef = useRef<HTMLInputElement>(null);
	const parentFileInputRef = useRef<HTMLInputElement>(null);
	// Pricing related states
	const [pricingSchema, setPricingSchema] = useState<PricingSchema | null>(
		null
	);
	const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
	const [loadingPricing, setLoadingPricing] = useState(false);
	const [selectedPaymentOption, setSelectedPaymentOption] =
		useState<PaymentOption | null>(null);
	const router = useRouter();
	const { toast } = useToast();

	const [showMore, setShowMore] = useState(false);

	const visibleOptions = showMore ? paymentOptions : paymentOptions.slice(0, 3);

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

	useEffect(() => {
		fetchBranches();
		fetchGrades();
	}, []);

	useEffect(() => {
		if (formData.branchId) {
			fetchGrades();
		}
	}, [formData.branchId]);

	// Fetch pricing when both branch and grade are selected
	useEffect(() => {
		if (formData.branchId && formData.gradeId) {
			fetchPricing(formData.branchId, formData.gradeId);
		} else {
			setPricingSchema(null);
			setPaymentOptions([]);
			setSelectedPaymentOption(null);
			setFormData((prev) => ({ ...prev, paymentDuration: "" }));
		}
	}, [formData.branchId, formData.gradeId]);

	const fetchBranches = async () => {
		try {
			// const response = await fetch("/api/branches");
			const response = await apiClient.get(
				`/classes/get-branches/${user?.branchId}`
			);
			console.log({
				responseBranch: response,
			});
			if (response.success) {
				// const data = await response.json();
				setBranches(response.data.branches);
				if (response.data.branches.length === 1) {
					setFormData((prev) => ({
						...prev,
						branchId: response.data.branches[0].id,
					}));
				}
			}
		} catch (error) {
			console.error("Failed to fetch branches:", error);
		}
	};

	const fetchGrades = async () => {
		try {
			const response = await apiClient.get(`/classes/grades/${user?.branchId}`);
			console.log({
				responseGrade: response,
			});
			if (response.success) {
				setGrades(response.data.grades || []);
			}
		} catch (error) {
			console.error("Failed to fetch grades:", error);
		}
	};

	// const fetchGrades = async (branchId?: string) => {
	// 	try {
	// 		const response = await fetch("/api/grades");
	// 		if (response.ok) {
	// 			const data = await response.json();
	// 			setGrades(data.grades);
	// 		}
	// 	} catch (error) {
	// 		console.error("Failed to fetch grades:", error);
	// 	}
	// };

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
			console.log({
				data,
			});
			if (response.ok && data.found) {
				setExistingStudent(data.student);
				setFormData((prev) => ({
					...prev,
					firstName: data.student.user.firstName,
					lastName: data.student.user.lastName,
					emailUsername: data.student.user.email.split("@")[0],
					phone: data.student.user.phone || generateRandomPhone(),
					branchId: data.student.branch.id || prev.branchId,
					studentType: "REGULAR_STUDENT",
				}));
				if (data.student.parents.length > 0) {
					const primaryParent =
						data.student.parents.find((p: any) => p.isPrimary) ||
						data.student.parents[0];
					setFormData((prev) => ({
						...prev,
						parentFirstName: primaryParent.parent.user.firstName,
						parentEmail: primaryParent.parent.user.email || "",
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

	const fetchPricing = async (branchId: string, gradeId: string) => {
		setLoadingPricing(true);
		try {
			// const response = await fetch(
			// 	`/api/pricing?branchId=${branchId}&gradeId=${gradeId}`
			// );
			const response = await apiClient.get(
				`/pricing?branchId=${branchId}&gradeId=${gradeId}`
			);
			console.log({
				pricingSchema: response,
			});

			console.log("Pricing response:", response);
			if (response) {
				// const data = await response.json();
				setPricingSchema((response as any).pricingSchema);
				setPaymentOptions((response as any).paymentOptions);
				// Reset selected payment option when pricing changes
				setSelectedPaymentOption(null);
				setFormData((prev) => ({ ...prev, paymentDuration: "" }));
			} else {
				// const errorData = await response.json();
				// setError(zerrorData.error || "Failed to fetch pricing information");
				setPricingSchema(null);
				setPaymentOptions([]);
			}
		} catch (error) {
			console.error("Failed to fetch pricing:", error);
			setError("Failed to fetch pricing information");
			setPricingSchema(null);
			setPaymentOptions([]);
		} finally {
			setLoadingPricing(false);
		}
	};

	const searchParent = async (phone: string) => {
		if (!phone || phone.length < 10) {
			setParentInfo(null);
			return;
		}
		setParentSearchLoading(true);
		try {
			const response = await apiClient.get(
				`/parents/search?phone=${encodeURIComponent(phone)}`
			);
			if (response) {
				const data: any = await response;
				console.log({ dataParentSearch: data });
				if (data.found) {
					setParentInfo(data.parent);
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
		setFormData((prev) => {
			const updated = { ...prev, [field]: value };

			// Auto-generate emailUsername if firstName is updated and there's no existing student
			if (field === "firstName") {
				const randomDigits = Math.floor(1000 + Math.random() * 9000); // random 3-digit number
				const generatedUsername = `${value.toLowerCase()}${randomDigits}`;
				updated.emailUsername = generatedUsername;
			}

			// Generate parent email from parentFirstName
			if (field === "parentFirstName") {
				const randomDigits = Math.floor(100 + Math.random() * 900);
				const parentEmail = `${value.toLowerCase()}${randomDigits}@yekamichael.com`;
				updated.parentEmail = parentEmail;
			}

			return updated;
		});
		// setFormData((prev) => ({ ...prev, [field]: value }));
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

	const handlePaymentDurationChange = (duration: string) => {
		const option = paymentOptions.find((opt) => opt.duration === duration);
		setSelectedPaymentOption(option || null);
		setFormData((prev) => ({ ...prev, paymentDuration: duration }));
	};

	const calculateTotalAmount = () => {
		if (!pricingSchema || !selectedPaymentOption) return 0;
		return (
			pricingSchema.registrationFee +
			selectedPaymentOption.additionalFee +
			pricingSchema.serviceFee
		);
	};

	const handlePhotoChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		type: "student" | "parent"
	) => {
		const file = e.target.files?.[0];
		if (file) {
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
			const maxSize = 5 * 1024 * 1024;
			if (file.size > maxSize) {
				setError("File size too large. Maximum size is 5MB.");
				return;
			}

			if (type === "student") {
				setStudentPhoto(file);
				const reader = new FileReader();
				reader.onload = (e) => {
					setStudentPhotoPreview(e.target?.result as string);
				};
				reader.readAsDataURL(file);
			} else {
				setParentPhoto(file);
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

	const validateStep = (step: number) => {
		switch (step) {
			case 1:
				if (
					!formData.firstName ||
					!formData.lastName ||
					!formData.emailUsername
				) {
					setError("Please fill in all required fields in Step 1");
					return false;
				}
				if (!formData.branchId || !formData.gradeId || !formData.studentType) {
					setError("Please select branch, grade, and student type");
					return false;
				}
				if (!formData.dateOfBirth || !formData.bloodGroup) {
					setError("Please select dateOfBirth, and bloodGroup");
					return false;
				}
				break;
			case 2:
				if (!formData.parentPhone) {
					setError("Parent phone number is required");
					return false;
				}
				if (!formData.relationship) {
					setError("Please select relationship");
					return false;
				}
				if (!formData.parentEmail) {
					setError("Please select parent Email");
					return false;
				}
				break;
			case 3:
				if (!formData.paymentDuration) {
					setError("Please select an additional fee option");
					return false;
				}
				break;
		}
		setError("");
		return true;
	};

	const nextStep = () => {
		if (validateStep(currentStep)) {
			setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
		}
	};

	const prevStep = () => {
		setCurrentStep((prev) => Math.max(prev - 1, 1));
		setError("");
	};

	//THIS WILL BE ROLLBACK AFTER SUBMITION
	// const handleSubmit = async (e: React.FormEvent) => {
	// 	e.preventDefault();
	// 	setIsLoading(true);
	// 	setError("");

	// 	if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
	// 		setIsLoading(false);
	// 		return;
	// 	}

	// 	const ethiopianPhoneRegex = /^(\+251|0)[79]\d{8}$/;
	// 	if (
	// 		formData.parentPhone &&
	// 		!ethiopianPhoneRegex.test(formData.parentPhone)
	// 	) {
	// 		setError(
	// 			"Invalid parent phone number format. Use +251XXXXXXXXX or 09XXXXXXXX"
	// 		);
	// 		setIsLoading(false);
	// 		return;
	// 	}

	// 	if (formData.dateOfBirth) {
	// 		const birthDate = new Date(formData.dateOfBirth);
	// 		const today = new Date();
	// 		if (birthDate > today) {
	// 			setError("Date of birth cannot be in the future");
	// 			setIsLoading(false);
	// 			return;
	// 		}
	// 		const age = today.getFullYear() - birthDate.getFullYear();
	// 		if (age < 3 || age > 25) {
	// 			setError("Student age must be between 3 and 25 years");
	// 			setIsLoading(false);
	// 			return;
	// 		}
	// 	}

	// 	if (
	// 		formData.placeOfBirth &&
	// 		(formData.placeOfBirth.length < 2 ||
	// 			!/^[a-zA-Z\s,.-]+$/.test(formData.placeOfBirth))
	// 	) {
	// 		setError("Invalid place of birth format");
	// 		setIsLoading(false);
	// 		return;
	// 	}

	// 	try {
	// 		const submitFormData = new FormData();
	// 		Object.entries(formData).forEach(([key, value]) => {
	// 			if (key === "emailUsername") {
	// 				submitFormData.append("email", `${value}@yekamichael.com`);
	// 			} else if (value) {
	// 				submitFormData.append(key, value);
	// 			}
	// 		});

	// 		submitFormData.append(
	// 			"registrationFee",
	// 			pricingSchema?.registrationFee?.toString() ?? "0"
	// 		);

	// 		submitFormData.append(
	// 			"additionalFee",
	// 			selectedPaymentOption?.additionalFee?.toString() ?? "0"
	// 		);

	// 		submitFormData.append(
	// 			"serviceFee",
	// 			pricingSchema?.serviceFee?.toString() ?? "0"
	// 		);
	// 		submitFormData.append("totalAmount", calculateTotalAmount().toString());

	// 		if (existingStudent && formData.studentType === "REGULAR_STUDENT") {
	// 			submitFormData.append("existingStudentId", existingStudent.studentId);
	// 		}

	// 		if (studentPhoto) {
	// 			submitFormData.append("studentPhoto", studentPhoto);
	// 		}
	// 		if (parentPhoto) {
	// 			submitFormData.append("parentPhoto", parentPhoto);
	// 		}

	// 		const response: any = await apiClient.postFormData(
	// 			"/students/register",
	// 			submitFormData
	// 		);

	// 		console.log({ responseSubmit: response });
	// 		// const response = await fetch("/api/students/register", {
	// 		// 	method: "POST",
	// 		// 	body: submitFormData,
	// 		// });

	// 		if (!response) {
	// 			throw new Error(response.error || "Registration failed");
	// 		}

	// 		toast({
	// 			title: "Student registered successfully",
	// 			description: `Student ID: ${response.student.studentId}`,
	// 		});

	// 		if (response.redirectTo) {
	// 			router.push(response.redirectTo);
	// 		} else {
	// 			router.push("/dashboard/students");
	// 		}
	// 	} catch (err) {
	// 		setError(err instanceof Error ? err.message : "An error occurred");
	// 	} finally {
	// 		setIsLoading(false);
	// 	}
	// };

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
			setIsLoading(false);
			return;
		}

		const ethiopianPhoneRegex = /^(\+251|0)[79]\d{8}$/;
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
			Object.entries(formData).forEach(([key, value]) => {
				if (key === "emailUsername") {
					submitFormData.append("email", `${value}@yekamichael.com`);
				} else if (value) {
					submitFormData.append(key, value);
				}
			});

			// // Add pricing information
			// submitFormData.append(
			// 	"registrationFee",
			// 	(pricingSchema)?.registrationFee.toString()
			// );
			// submitFormData.append(
			// 	"additionalFee",
			// 	(selectedPaymentOption)?.additionalFee.toString()
			// );
			// submitFormData.append(
			// 	"serviceFee",
			// 	(pricingSchema)?.serviceFee.toString()
			// );
			submitFormData.append(
				"registrationFee",
				pricingSchema?.registrationFee?.toString() ?? "0"
			);

			submitFormData.append(
				"additionalFee",
				selectedPaymentOption?.additionalFee?.toString() ?? "0"
			);

			// toast({
			// 	title: "Student Info",
			// 	description: `${selectedPaymentOption?.additionalFee?.toString()} Username: ${
			// 		formData.emailUsername
			// 	}`,
			// });

			submitFormData.append(
				"serviceFee",
				pricingSchema?.serviceFee?.toString() ?? "0"
			);
			submitFormData.append("totalAmount", calculateTotalAmount().toString());

			if (existingStudent && formData.studentType === "REGULAR_STUDENT") {
				submitFormData.append("existingStudentId", existingStudent.studentId);
			}

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

	const getStepIcon = (step: number) => {
		switch (step) {
			case 1:
				return <User className="h-5 w-5" />;
			case 2:
				return <Users className="h-5 w-5" />;
			case 3:
				return <CreditCard className="h-5 w-5" />;
			default:
				return <FileText className="h-5 w-5" />;
		}
	};

	const getStepTitle = (step: number) => {
		switch (step) {
			case 1:
				return "Student Information";
			case 2:
				return "Parent/Guardian Details";
			case 3:
				return "Payment & Review";
			default:
				return "Step";
		}
	};

	const progressPercentage = (currentStep / totalSteps) * 100;

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8 max-w-4xl">
				{/* Header */}
				<div className="flex items-center gap-4 mb-8">
					<Link href="/dashboard/students">
						<Button variant="ghost" size="icon">
							<ArrowLeft className="h-4 w-4" />
						</Button>
					</Link>
					<div>
						<h1 className="text-3xl font-bold text-foreground">
							Register New Student
						</h1>
						<p className="text-muted-foreground">
							Complete the registration process in 3 simple steps
						</p>
					</div>
				</div>

				{/* Progress Indicator */}
				<Card className="mb-8">
					<CardContent className="p-6">
						<div className="flex items-center justify-between mb-4">
							<div className="text-sm font-medium text-muted-foreground">
								Step {currentStep} of {totalSteps}
							</div>
							<div className="text-sm font-medium text-primary">
								{Math.round(progressPercentage)}% Complete
							</div>
						</div>
						<Progress value={progressPercentage} className="h-2 mb-6" />
						<div className="flex justify-between">
							{[1, 2, 3].map((step) => (
								<div key={step} className="flex items-center gap-3">
									<div
										className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
											step < currentStep
												? "bg-primary text-primary-foreground border-primary"
												: step === currentStep
												? "bg-primary/10 text-primary border-primary"
												: "bg-background text-muted-foreground border-border"
										}`}>
										{step < currentStep ? (
											<CheckCircle className="h-5 w-5" />
										) : (
											getStepIcon(step)
										)}
									</div>
									<div className="hidden sm:block">
										<div className="font-medium text-foreground">
											{getStepTitle(step)}
										</div>
										<div className="text-xs text-muted-foreground">
											{step === 1 && "Basic details"}
											{step === 2 && "Contact information"}
											{step === 3 && "Payment options"}
										</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				<form onSubmit={handleSubmit} className="space-y-6">
					{error && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription className="font-medium">
								{error}
							</AlertDescription>
						</Alert>
					)}

					{success && (
						<Alert className="border-green-200 bg-green-50 text-green-800">
							<CheckCircle className="h-4 w-4" />
							<AlertDescription className="font-medium">
								{success}
							</AlertDescription>
						</Alert>
					)}

					{/* Step 1: Student Information */}
					{currentStep === 1 && (
						<div className="space-y-6">
							{/* Student Search */}
							<Card>
								<CardHeader className="bg-blue-50 border-b">
									<CardTitle className="flex items-center gap-2 text-blue-700">
										<Search className="h-5 w-5" />
										Search Existing Student
									</CardTitle>
									<CardDescription className="text-blue-600">
										For returning students, search by Student ID to avoid
										duplicate entries
									</CardDescription>
								</CardHeader>
								<CardContent className="p-6 space-y-4">
									<div className="flex gap-3">
										<div className="flex-1">
											<Label
												htmlFor="searchStudentId"
												className="text-sm font-medium">
												Student ID
											</Label>
											<Input
												id="searchStudentId"
												value={searchStudentId}
												onChange={(e) => setSearchStudentId(e.target.value)}
												placeholder="Enter Student ID (e.g., RSYMAB1777)"
												className="mt-1"
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
											</Button>
										</div>
									</div>

									{existingStudent && (
										<Alert className="border-green-200 bg-green-50">
											<UserCheck className="h-4 w-4 text-green-600" />
											<AlertDescription>
												<div className="space-y-2">
													<p className="font-medium text-green-800">
														Student Found!
													</p>
													<div className="grid grid-cols-2 gap-4 text-sm text-green-700">
														<div>
															<span className="font-medium">Name:</span>{" "}
															{existingStudent.user.firstName}{" "}
															{existingStudent.user.lastName}
														</div>
														<div>
															<span className="font-medium">Student ID:</span>{" "}
															{existingStudent.studentId}
														</div>
														<div>
															<span className="font-medium">Branch:</span>{" "}
															{existingStudent.branch.name}
														</div>
														<div>
															<span className="font-medium">Last Grade:</span>{" "}
															{existingStudent?.grade &&
																existingStudent.grade.name}
														</div>
													</div>
													{existingStudent.hasCurrentYearRegistration && (
														<Badge
															variant="secondary"
															className="bg-yellow-100 text-yellow-800">
															Already registered for current year
														</Badge>
													)}
												</div>
											</AlertDescription>
										</Alert>
									)}
								</CardContent>
							</Card>

							{/* Student Details */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<User className="h-5 w-5" />
										Student Information
									</CardTitle>
									<CardDescription>
										Enter the student's basic information and academic details
									</CardDescription>
								</CardHeader>
								<CardContent className="p-6 space-y-6">
									{/* Photo Upload */}
									<div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-muted/50 border">
										<Avatar className="h-32 w-32 border-4 border-background shadow-md">
											<AvatarImage
												src={studentPhotoPreview || "/user.png"}
												alt="Student photo"
											/>
											<AvatarFallback className="text-2xl bg-primary text-primary-foreground">
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
												<Camera className="h-4 w-4 mr-2" />
												{studentPhoto ? "Change Photo" : "Upload Photo"}
											</Button>
											{studentPhoto && (
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => removePhoto("student")}
													className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
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
										<p className="text-xs text-center text-muted-foreground">
											Maximum 5MB • JPEG, PNG, WebP formats only
										</p>
									</div>

									{/* Basic Information */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-2">
											<Label
												htmlFor="firstName"
												className="flex items-center gap-2">
												<Star className="h-3 w-3 text-destructive" />
												First Name
											</Label>
											<Input
												id="firstName"
												value={formData.firstName}
												onChange={(e) =>
													handleInputChange("firstName", e.target.value)
												}
												required
												disabled={isLoading}
												className="h-11"
											/>
										</div>
										<div className="space-y-2">
											<Label
												htmlFor="lastName"
												className="flex items-center gap-2">
												<Star className="h-3 w-3 text-destructive" />
												Last Name
											</Label>
											<Input
												id="lastName"
												value={formData.lastName}
												onChange={(e) =>
													handleInputChange("lastName", e.target.value)
												}
												required
												disabled={isLoading}
												className="h-11"
											/>
										</div>
									</div>

									{/* Email Username */}
									<div className="space-y-2">
										<Label
											htmlFor="emailUsername"
											className="flex items-center gap-2">
											<Star className="h-3 w-3 text-destructive" />
											<Mail className="h-4 w-4" />
											Email Username (Unique)
										</Label>
										<div className="flex">
											<Input
												id="emailUsername"
												value={formData.emailUsername}
												readOnly
												onChange={(e) =>
													handleInputChange("emailUsername", e.target.value)
												}
												placeholder="Enter username"
												required
												disabled={isLoading || !!existingStudent}
												className="rounded-r-none h-11"
											/>
											<div className="flex items-center px-4 border border-l-0 rounded-r-md text-sm font-medium bg-blue-50 text-blue-700 border-input">
												@yekamichael.com
											</div>
										</div>
										<p className="text-xs flex items-center gap-1 text-muted-foreground">
											<Info className="h-3 w-3" />
											Full email: {formData.emailUsername}@yekamichael.com
										</p>
									</div>

									{/* Academic Information */}
									<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
										<div className="space-y-2">
											<Label
												htmlFor="studentType"
												className="flex items-center gap-2">
												<Star className="h-3 w-3 text-destructive" />
												<GraduationCap className="h-4 w-4" />
												Student Type
											</Label>
											<Select
												value={formData.studentType}
												onValueChange={(value) =>
													handleInputChange("studentType", value)
												}
												required
												disabled={isLoading}>
												<SelectTrigger className="h-11">
													<SelectValue placeholder="Select student type" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="NEW_STUDENT">
														New Student
													</SelectItem>
													<SelectItem value="REGULAR_STUDENT">
														Regular Student
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-2">
											<Label
												htmlFor="branchId"
												className="flex items-center gap-2">
												<Star className="h-3 w-3 text-destructive" />
												<Building2 className="h-4 w-4" />
												Branch
											</Label>
											<Select
												value={formData.branchId}
												onValueChange={(value) =>
													handleInputChange("branchId", value)
												}
												disabled={isLoading}>
												<SelectTrigger className="h-11">
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
											<Label
												htmlFor="gradeId"
												className="flex items-center gap-2">
												<Star className="h-3 w-3 text-destructive" />
												<GraduationCap className="h-4 w-4" />
												Grade
											</Label>
											<Select
												value={formData.gradeId}
												onValueChange={(value) =>
													handleInputChange("gradeId", value)
												}
												disabled={isLoading}>
												<SelectTrigger className="h-11">
													<SelectValue placeholder="Select grade" />
												</SelectTrigger>
												<SelectContent>
													{grades.map((grade) => (
														<SelectItem key={grade.id} value={grade.id}>
															{grade.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									</div>

									{/* Personal Details */}
									<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
										<div className="space-y-2">
											<Label
												htmlFor="dateOfBirth"
												className="flex items-center gap-2">
												<Star className="h-3 w-3 text-destructive" />
												<Calendar className="h-4 w-4" />
												Date of Birth
											</Label>
											<Input
												id="dateOfBirth"
												type="date"
												value={formData.dateOfBirth}
												onChange={(e) =>
													handleInputChange("dateOfBirth", e.target.value)
												}
												disabled={isLoading}
												className="h-11"
											/>
											{formData.dateOfBirth && (
												<p className="text-xs font-medium text-green-600">
													{calculateAge(formData.dateOfBirth)}
												</p>
											)}
										</div>
										<div className="space-y-2">
											<Label
												htmlFor="gender"
												className="flex items-center gap-2">
												<Star className="h-3 w-3 text-destructive" />
												Gender
											</Label>
											<Select
												value={formData.gender}
												onValueChange={(value) =>
													handleInputChange("gender", value)
												}
												disabled={isLoading}>
												<SelectTrigger className="h-11">
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
												disabled={isLoading || !!existingStudent}>
												<SelectTrigger className="h-11">
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

									{/* Additional Details */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-2">
											<Label
												htmlFor="placeOfBirth"
												className="flex items-center gap-2">
												<MapPin className="h-4 w-4" />
												Place of Birth
											</Label>
											<Input
												id="placeOfBirth"
												value={formData.placeOfBirth}
												onChange={(e) =>
													handleInputChange("placeOfBirth", e.target.value)
												}
												placeholder="e.g., Addis Ababa, Ethiopia"
												disabled={isLoading}
												className="h-11"
											/>
										</div>
										<div className="space-y-2">
											<Label
												htmlFor="bloodGroup"
												className="flex items-center gap-2">
												<Star className="h-3 w-3 text-destructive" />
												Blood Group
											</Label>
											<Select
												value={formData.bloodGroup}
												onValueChange={(value) =>
													handleInputChange("bloodGroup", value)
												}
												disabled={isLoading}>
												<SelectTrigger className="h-11">
													<SelectValue placeholder="Select blood group" />
												</SelectTrigger>
												<SelectContent>
													{[
														"A+",
														"A-",
														"B+",
														"B-",
														"AB+",
														"AB-",
														"O+",
														"O-",
														"Not Known",
													].map((type) => (
														<SelectItem key={type} value={type}>
															{type}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									</div>

									<div className="space-y-2">
										<Label
											htmlFor="emergencyContact"
											className="flex items-center gap-2">
											<Phone className="h-4 w-4" />
											Emergency Contact
										</Label>
										<Input
											id="emergencyContact"
											value={formData.emergencyContact}
											onChange={(e) =>
												handleInputChange("emergencyContact", e.target.value)
											}
											placeholder="+251911234567"
											disabled={isLoading}
											className="h-11"
										/>
									</div>

									<div className="space-y-2">
										<Label
											htmlFor="address"
											className="flex items-center gap-2">
											<MapPin className="h-4 w-4" />
											Address
										</Label>
										<Textarea
											id="address"
											value={formData.address}
											onChange={(e) =>
												handleInputChange("address", e.target.value)
											}
											disabled={isLoading}
											rows={3}
											placeholder="Full address including city and region"
											className="resize-none"
										/>
									</div>
								</CardContent>
							</Card>
						</div>
					)}

					{/* Step 2: Parent Information */}
					{currentStep === 2 && (
						<Card>
							<CardHeader className="bg-green-50 border-b">
								<CardTitle className="flex items-center gap-2 text-green-700">
									<Users className="h-5 w-5" />
									Parent/Guardian Information
								</CardTitle>
								<CardDescription className="text-green-600">
									Enter details about the student's parent or guardian
								</CardDescription>
							</CardHeader>
							<CardContent className="p-6 space-y-6">
								{parentInfo && (
									<Alert className="border-green-200 bg-green-50">
										<CheckCircle className="h-4 w-4 text-green-600" />
										<AlertDescription>
											<div className="space-y-2">
												<p className="font-medium text-green-800">
													Parent Found!
												</p>
												<div className="grid grid-cols-2 gap-4 text-sm text-green-700">
													<div>
														<span className="font-medium">Name:</span>{" "}
														{parentInfo.user.firstName}{" "}
														{parentInfo.user.lastName}
													</div>
													<div>
														<span className="font-medium">Phone:</span>{" "}
														{parentInfo.user.phone}
													</div>
													{parentInfo.occupation && (
														<div>
															<span className="font-medium">Occupation:</span>{" "}
															{parentInfo.occupation}
														</div>
													)}
													{parentInfo.children.length > 0 && (
														<div className="col-span-2">
															<span className="font-medium">
																Other Children:
															</span>
															<div className="flex flex-wrap gap-1 mt-1">
																{parentInfo.children.map((child) => (
																	<Badge
																		key={child.id}
																		variant="secondary"
																		className="text-xs bg-green-100 text-green-800">
																		{child.name} ({child.studentId})
																	</Badge>
																))}
															</div>
														</div>
													)}
												</div>
											</div>
										</AlertDescription>
									</Alert>
								)}

								{/* Parent Photo Upload */}
								<div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-muted/50 border">
									<Avatar className="h-24 w-24 border-4 border-background shadow-md">
										<AvatarImage
											src={parentPhotoPreview || "/user.png"}
											alt="Parent photo"
										/>
										<AvatarFallback className="text-lg bg-green-600 text-white">
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
											<Camera className="h-4 w-4 mr-2" />
											{parentPhoto ? "Change Photo" : "Upload Photo"}
										</Button>
										{parentPhoto && (
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => removePhoto("parent")}
												className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
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
									<p className="text-xs text-center text-muted-foreground">
										Optional • Maximum 5MB • JPEG, PNG, WebP formats only
									</p>
								</div>

								{/* Contact Information */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-2">
										<Label
											htmlFor="parentPhone"
											className="flex items-center gap-2">
											<Star className="h-3 w-3 text-destructive" />
											<Phone className="h-4 w-4" />
											Parent Phone Number
										</Label>
										<div className="relative">
											<Input
												id="parentPhone"
												value={formData.parentPhone}
												onChange={(e) =>
													handleInputChange("parentPhone", e.target.value)
												}
												placeholder="+251912345678"
												required
												className="h-11"
											/>
											{parentSearchLoading && (
												<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
													<Loader2 className="h-4 w-4 animate-spin text-primary" />
												</div>
											)}
										</div>
										<p className="text-xs flex items-center gap-1 text-muted-foreground">
											<Info className="h-3 w-3" />
											We'll search for existing parent information
										</p>
									</div>
									<div className="space-y-2">
										<Label
											htmlFor="relationship"
											className="flex items-center gap-2">
											<Star className="h-3 w-3 text-destructive" />
											Relationship
										</Label>
										<Select
											value={formData.relationship}
											onValueChange={(value) =>
												handleInputChange("relationship", value)
											}
											required>
											<SelectTrigger className="h-11">
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

								{/* Personal Information */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-2">
										<Label htmlFor="parentFirstName">First Name</Label>
										<Input
											id="parentFirstName"
											value={formData.parentFirstName}
											onChange={(e) =>
												handleInputChange("parentFirstName", e.target.value)
											}
											disabled={isLoading}
											className="h-11"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="parentLastName">Last Name</Label>
										<Input
											id="parentLastName"
											value={formData.parentLastName}
											onChange={(e) =>
												handleInputChange("parentLastName", e.target.value)
											}
											disabled={isLoading}
											className="h-11"
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-2">
										<Label
											htmlFor="parentEmail"
											className="flex items-center gap-2">
											<Mail className="h-4 w-4" />
											Email Address
										</Label>
										<Input
											id="parentEmail"
											type="email"
											value={formData.parentEmail}
											readOnly
											onChange={(e) =>
												handleInputChange("parentEmail", e.target.value)
											}
											disabled={isLoading}
											className="h-11"
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
											className="h-11"
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="parentWorkplace">Workplace</Label>
									<Input
										id="parentWorkplace"
										value={formData.parentWorkplace}
										onChange={(e) =>
											handleInputChange("parentWorkplace", e.target.value)
										}
										disabled={isLoading}
										className="h-11"
									/>
								</div>

								<div className="space-y-2">
									<Label
										htmlFor="parentAddress"
										className="flex items-center gap-2">
										<MapPin className="h-4 w-4" />
										Address
									</Label>
									<Textarea
										id="parentAddress"
										value={formData.parentAddress}
										onChange={(e) =>
											handleInputChange("parentAddress", e.target.value)
										}
										disabled={isLoading}
										rows={3}
										placeholder="Full address including city and region"
										className="resize-none"
									/>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Step 3: Payment & Review */}
					{currentStep === 3 && (
						<div className="space-y-6">
							{/* Payment Options */}
							<Card>
								<CardHeader className="bg-purple-50 border-b">
									<CardTitle className="flex items-center gap-2 text-purple-700">
										<CreditCard className="h-5 w-5" />
										Payment Options
									</CardTitle>
									<CardDescription className="text-purple-600">
										Choose your preferred payment plan
									</CardDescription>
								</CardHeader>
								<CardContent className="p-6">
									{formData.branchId && formData.gradeId && (
										<Card>
											<CardHeader>
												<CardTitle className="flex items-center gap-2">
													<DollarSign className="h-5 w-5" />
													Payment Options
												</CardTitle>
												<CardDescription>
													Select your preferred payment duration. Fees are
													calculated based on selected branch and grade.
												</CardDescription>
											</CardHeader>
											<CardContent className="space-y-6">
												{loadingPricing ? (
													<div className="flex items-center justify-center py-8">
														<Loader2 className="h-6 w-6 animate-spin mr-2" />
														<span>Loading pricing information...</span>
													</div>
												) : pricingSchema ? (
													<>
														{/* Pricing Summary */}
														<div className="bg-gray-50 p-4 rounded-lg">
															<h4 className="font-medium mb-2">
																Fee Structure for {pricingSchema.grade.name} -{" "}
																{pricingSchema.branch.name}
															</h4>
															<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
																<div>
																	<span className="text-muted-foreground">
																		Registration Fee:
																	</span>
																	<p className="font-medium">
																		ETB{" "}
																		{pricingSchema.registrationFee.toLocaleString()}
																	</p>
																</div>
																<div>
																	<span className="text-muted-foreground">
																		Monthly Fee:
																	</span>
																	<p className="font-medium">
																		ETB{" "}
																		{pricingSchema.monthlyFee.toLocaleString()}
																	</p>
																</div>
																<div>
																	<span className="text-muted-foreground">
																		Service Fee:
																	</span>
																	<p className="font-medium">
																		ETB{" "}
																		{pricingSchema.serviceFee.toLocaleString()}
																	</p>
																</div>
															</div>
														</div>

														{/* Payment Duration Selection */}
														<div className="space-y-2">
															<Label className="text-base font-medium">
																Payment Duration *
															</Label>
															<RadioGroup
																value={formData.paymentDuration}
																onValueChange={handlePaymentDurationChange}
																required>
																<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
																	{paymentOptions.map((option) => (
																		<div
																			key={option.duration}
																			className="flex items-center space-x-2 p-4 border rounded-lg">
																			<RadioGroupItem
																				value={option.duration}
																				id={option.duration}
																			/>
																			<div className="flex-1">
																				<Label
																					htmlFor={option.duration}
																					className="font-medium cursor-pointer">
																					{option.label}
																				</Label>
																				<p className="text-sm text-muted-foreground">
																					{option.months} month
																					{option.months !== 1 ? "s" : ""}{" "}
																					tuition
																				</p>
																				<p className="text-sm font-medium text-green-600">
																					Additional Fee: ETB{" "}
																					{option.additionalFee.toLocaleString()}
																				</p>
																			</div>
																		</div>
																	))}
																</div>
															</RadioGroup>
															{!formData.paymentDuration && (
																<p className="text-sm text-red-500">
																	Please select a payment duration
																</p>
															)}
														</div>

														{/* Total Amount Display */}
														{selectedPaymentOption && (
															<div className="bg-blue-50 p-4 rounded-lg">
																<h4 className="font-medium mb-2">
																	Payment Summary
																</h4>
																<div className="space-y-2 text-sm">
																	<div className="flex justify-between">
																		<span>Registration Fee:</span>
																		<span>
																			ETB{" "}
																			{pricingSchema.registrationFee.toLocaleString()}
																		</span>
																	</div>
																	<div className="flex justify-between">
																		<span>
																			Additional Fee (
																			{selectedPaymentOption.label}):
																		</span>
																		<span>
																			ETB{" "}
																			{selectedPaymentOption.additionalFee.toLocaleString()}
																		</span>
																	</div>
																	<div className="flex justify-between">
																		<span>Service Fee:</span>
																		<span>
																			ETB{" "}
																			{pricingSchema.serviceFee.toLocaleString()}
																		</span>
																	</div>
																	<Separator />
																	<div className="flex justify-between font-medium text-base">
																		<span>Total Amount:</span>
																		<span>
																			ETB{" "}
																			{calculateTotalAmount().toLocaleString()}
																		</span>
																	</div>
																</div>
															</div>
														)}
													</>
												) : (
													<Alert>
														<AlertCircle className="h-4 w-4" />
														<AlertDescription>
															No pricing information available for the selected
															branch and grade. Please contact administration.
														</AlertDescription>
													</Alert>
												)}
											</CardContent>
										</Card>
									)}
								</CardContent>
							</Card>

							{/* Registration Summary */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<FileText className="h-5 w-5" />
										Registration Summary
									</CardTitle>
									<CardDescription>
										Review the information before submitting
									</CardDescription>
								</CardHeader>
								<CardContent className="p-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-4">
											<h4 className="font-semibold flex items-center gap-2 text-blue-600">
												<User className="h-4 w-4" />
												Student Information
											</h4>
											<div className="space-y-2 text-sm">
												<div className="flex justify-between">
													<span className="text-muted-foreground">Name:</span>
													<span className="font-medium">
														{formData.firstName} {formData.lastName}
													</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">Email:</span>
													<span className="font-medium">
														{formData.emailUsername}@yekamichael.com
													</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">
														Student Type:
													</span>
													<Badge variant="secondary">
														{formData.studentType?.replace("_", " ")}
													</Badge>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">Branch:</span>
													<span className="font-medium">
														{
															branches.find((b) => b.id === formData.branchId)
																?.name
														}
													</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">Grade:</span>
													<span className="font-medium">
														{
															grades.find((g) => g.id === formData.gradeId)
																?.name
														}
													</span>
												</div>
											</div>
										</div>

										<div className="space-y-4">
											<h4 className="font-semibold flex items-center gap-2 text-green-600">
												<Users className="h-4 w-4" />
												Parent Information
											</h4>
											<div className="space-y-2 text-sm">
												<div className="flex justify-between">
													<span className="text-muted-foreground">Name:</span>
													<span className="font-medium">
														{formData.parentFirstName} {formData.parentLastName}
													</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">Phone:</span>
													<span className="font-medium">
														{formData.parentPhone}
													</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">
														Relationship:
													</span>
													<Badge
														variant="secondary"
														className="bg-green-100 text-green-800">
														{formData.relationship}
													</Badge>
												</div>
												{formData.parentEmail && (
													<div className="flex justify-between">
														<span className="text-muted-foreground">
															Email:
														</span>
														<span className="font-medium">
															{formData.parentEmail}
														</span>
													</div>
												)}
												{formData.parentOccupation && (
													<div className="flex justify-between">
														<span className="text-muted-foreground">
															Occupation:
														</span>
														<span className="font-medium">
															{formData.parentOccupation}
														</span>
													</div>
												)}
											</div>
										</div>
									</div>

									{formData.additionalFee && (
										<div className="mt-6 p-4 rounded-lg bg-purple-50 border border-purple-200">
											<h4 className="font-semibold flex items-center gap-2 mb-2 text-purple-700">
												<CreditCard className="h-4 w-4" />
												Payment Summary
											</h4>
											<div className="flex justify-between items-center">
												<span>
													{formData.additionalFee === "8000"
														? "Registration + Monthly (1st & Last Month)"
														: "Registration + Quarterly (2.5 Months)"}
												</span>
												<Badge className="text-lg px-3 py-1 bg-purple-100 text-purple-700 hover:bg-purple-100">
													ETB{" "}
													{formData.additionalFee === "8000"
														? "8,000"
														: "10,000"}
												</Badge>
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						</div>
					)}

					{/* Navigation Buttons */}
					<div className="flex justify-between items-center pt-6">
						<div>
							{currentStep > 1 && (
								<Button
									type="button"
									variant="outline"
									onClick={prevStep}
									disabled={isLoading}
									className="px-6 bg-transparent">
									<ArrowLeft className="h-4 w-4 mr-2" />
									Previous
								</Button>
							)}
						</div>
						<div className="flex gap-3">
							<Link href="/dashboard/students">
								<Button type="button" variant="ghost" disabled={isLoading}>
									Cancel
								</Button>
							</Link>
							{currentStep < totalSteps ? (
								<Button
									type="button"
									onClick={nextStep}
									disabled={isLoading}
									className="px-6">
									Next Step
									<ArrowRight className="h-4 w-4 ml-2" />
								</Button>
							) : (
								<Button
									type="submit"
									disabled={isLoading}
									className="px-8 bg-green-600 hover:bg-green-700">
									{isLoading ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Registering...
										</>
									) : (
										<>
											<CheckCircle className="mr-2 h-4 w-4" />
											Complete Registration
										</>
									)}
								</Button>
							)}
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}
