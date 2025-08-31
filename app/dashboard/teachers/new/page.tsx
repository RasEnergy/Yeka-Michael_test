"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewTeacherPage() {
	const router = useRouter();
	const { user } = useAuth();
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		// User information
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		password: "",
		// Teacher specific information
		employeeId: "",
		dateOfBirth: "",
		gender: "",
		qualification: "",
		experience: "",
		joinDate: "",
		salary: "",
		address: "",
		emergencyContact: "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user?.branchId || !user?.schoolId) return;

		setLoading(true);
		try {
			// First create the user
			const userResponse = await apiClient.post("/users", {
				firstName: formData.firstName,
				lastName: formData.lastName,
				email: formData.email,
				phone: formData.phone,
				password: formData.password,
				role: "TEACHER",
				schoolId: user.schoolId,
				branchId: user.branchId,
			});

			if (userResponse.success) {
				// Then create the teacher profile
				const teacherResponse = await apiClient.post("/teachers", {
					userId: userResponse.data.user.id,
					employeeId: formData.employeeId,
					branchId: user.branchId,
					dateOfBirth: formData.dateOfBirth
						? new Date(formData.dateOfBirth)
						: undefined,
					gender: formData.gender || undefined,
					qualification: formData.qualification || undefined,
					experience: formData.experience
						? Number.parseInt(formData.experience)
						: undefined,
					joinDate: formData.joinDate ? new Date(formData.joinDate) : undefined,
					salary: formData.salary
						? Number.parseFloat(formData.salary)
						: undefined,
					address: formData.address || undefined,
					emergencyContact: formData.emergencyContact || undefined,
				});

				if (teacherResponse.success) {
					router.push("/dashboard/teachers");
				}
			}
		} catch (error) {
			console.error("Failed to create teacher:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center gap-4 mb-8">
					<Button asChild variant="outline" size="sm">
						<Link href="/dashboard/teachers">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Teachers
						</Link>
					</Button>
					<div>
						<h1 className="text-3xl font-bold text-foreground">
							Add New Teacher
						</h1>
						<p className="text-muted-foreground">
							Create a new teacher profile
						</p>
					</div>
				</div>

				<Card className="max-w-4xl bg-card border-border">
					<CardHeader>
						<CardTitle className="text-card-foreground">
							Teacher Information
						</CardTitle>
						<CardDescription>
							Fill in the details for the new teacher
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-8">
							{/* Personal Information */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-card-foreground">
									Personal Information
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="firstName" className="text-card-foreground">
											First Name *
										</Label>
										<Input
											id="firstName"
											value={formData.firstName}
											onChange={(e) =>
												handleChange("firstName", e.target.value)
											}
											required
											className="bg-input border-border"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="lastName" className="text-card-foreground">
											Last Name *
										</Label>
										<Input
											id="lastName"
											value={formData.lastName}
											onChange={(e) => handleChange("lastName", e.target.value)}
											required
											className="bg-input border-border"
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="email" className="text-card-foreground">
											Email *
										</Label>
										<Input
											id="email"
											type="email"
											value={formData.email}
											onChange={(e) => handleChange("email", e.target.value)}
											required
											className="bg-input border-border"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="phone" className="text-card-foreground">
											Phone
										</Label>
										<Input
											id="phone"
											value={formData.phone}
											onChange={(e) => handleChange("phone", e.target.value)}
											className="bg-input border-border"
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="password" className="text-card-foreground">
											Password *
										</Label>
										<Input
											id="password"
											type="password"
											value={formData.password}
											onChange={(e) => handleChange("password", e.target.value)}
											required
											className="bg-input border-border"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="gender" className="text-card-foreground">
											Gender
										</Label>
										<Select
											value={formData.gender}
											onValueChange={(value) => handleChange("gender", value)}>
											<SelectTrigger className="bg-input border-border">
												<SelectValue placeholder="Select gender" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="MALE">Male</SelectItem>
												<SelectItem value="FEMALE">Female</SelectItem>
												<SelectItem value="OTHER">Other</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							</div>

							{/* Professional Information */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-card-foreground">
									Professional Information
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label
											htmlFor="employeeId"
											className="text-card-foreground">
											Employee ID *
										</Label>
										<Input
											id="employeeId"
											value={formData.employeeId}
											onChange={(e) =>
												handleChange("employeeId", e.target.value)
											}
											required
											className="bg-input border-border"
										/>
									</div>
									<div className="space-y-2">
										<Label
											htmlFor="qualification"
											className="text-card-foreground">
											Qualification
										</Label>
										<Input
											id="qualification"
											value={formData.qualification}
											onChange={(e) =>
												handleChange("qualification", e.target.value)
											}
											placeholder="e.g., M.Ed, B.Sc"
											className="bg-input border-border"
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="space-y-2">
										<Label
											htmlFor="experience"
											className="text-card-foreground">
											Experience (Years)
										</Label>
										<Input
											id="experience"
											type="number"
											value={formData.experience}
											onChange={(e) =>
												handleChange("experience", e.target.value)
											}
											className="bg-input border-border"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="joinDate" className="text-card-foreground">
											Joining Date
										</Label>
										<Input
											id="joinDate"
											type="date"
											value={formData.joinDate}
											onChange={(e) => handleChange("joinDate", e.target.value)}
											className="bg-input border-border"
										/>
									</div>
									<div className="space-y-2">
										<Label
											htmlFor="dateOfBirth"
											className="text-card-foreground">
											Date of Birth
										</Label>
										<Input
											id="dateOfBirth"
											type="date"
											value={formData.dateOfBirth}
											onChange={(e) =>
												handleChange("dateOfBirth", e.target.value)
											}
											className="bg-input border-border"
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="salary" className="text-card-foreground">
										Salary
									</Label>
									<Input
										id="salary"
										type="number"
										step="0.01"
										value={formData.salary}
										onChange={(e) => handleChange("salary", e.target.value)}
										className="bg-input border-border"
									/>
								</div>
							</div>

							{/* Contact Information */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-card-foreground">
									Contact Information
								</h3>
								<div className="space-y-2">
									<Label htmlFor="address" className="text-card-foreground">
										Address
									</Label>
									<Textarea
										id="address"
										value={formData.address}
										onChange={(e) => handleChange("address", e.target.value)}
										className="bg-input border-border"
										rows={2}
									/>
								</div>
								<div className="space-y-2">
									<Label
										htmlFor="emergencyContact"
										className="text-card-foreground">
										Emergency Contact
									</Label>
									<Input
										id="emergencyContact"
										value={formData.emergencyContact}
										onChange={(e) =>
											handleChange("emergencyContact", e.target.value)
										}
										placeholder="Emergency contact number"
										className="bg-input border-border"
									/>
								</div>
							</div>

							<div className="flex gap-4 pt-4">
								<Button
									type="submit"
									disabled={loading}
									className="bg-primary text-primary-foreground hover:bg-primary/90">
									<Save className="h-4 w-4 mr-2" />
									{loading ? "Creating..." : "Create Teacher"}
								</Button>
								<Button asChild type="button" variant="outline">
									<Link href="/dashboard/teachers">Cancel</Link>
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
