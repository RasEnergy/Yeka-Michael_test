"use client";

import type React from "react";

import { useState, useEffect } from "react";
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

interface Grade {
	id: string;
	name: string;
	level: number;
}

interface AcademicYear {
	id: string;
	year: string;
	isActive: boolean;
}

export default function NewClassPage() {
	const router = useRouter();
	const { user } = useAuth();
	const [loading, setLoading] = useState(false);
	const [grades, setGrades] = useState<Grade[]>([]);
	const [selectedGrade, setSelectedGrades] = useState<any>("");
	const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
	const [formData, setFormData] = useState({
		name: "",
		section: "",
		// code: "",
		gradeId: "",
		academicYearId: "",
		capacity: "",
		// description: "",
	});

	useEffect(() => {
		fetchGrades();
		fetchAcademicYears();
	}, []);

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

	const fetchAcademicYears = async () => {
		try {
			const response = await apiClient.get(`/classes/academic-years`);
			console.log({
				response: response.data.academicYears,
			});
			if (response.success) {
				setAcademicYears(response.data.academicYears || []);
			}
		} catch (error) {
			console.error("Failed to fetch academic years:", error);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user?.branchId) return;

		setLoading(true);
		try {
			const response = await apiClient.post("/classes", {
				...formData,
				name: `${selectedGrade} ${formData.section}`,
				section: formData.section.toUpperCase(),
				branchId: user.branchId,
				capacity: formData.capacity
					? Number.parseInt(formData.capacity)
					: undefined,
			});

			if (response.success) {
				router.push("/dashboard/classes");
			}
		} catch (error) {
			console.error("Failed to create class:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (field === "gradeId") {
			let grade = grades.find((grade) => grade.id === value);
			setSelectedGrades(grade?.name);
		}
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center gap-4 mb-8">
					<Button asChild variant="outline" size="sm">
						<Link href="/dashboard/classes">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Classes
						</Link>
					</Button>
					<div>
						<h1 className="text-3xl font-bold text-foreground">
							Add New Class
						</h1>
						<p className="text-muted-foreground">
							Create a new class for your school
						</p>
					</div>
				</div>

				<Card className="max-w-2xl bg-card border-border">
					<CardHeader>
						<CardTitle className="text-card-foreground">
							Class Information
						</CardTitle>
						<CardDescription>
							Fill in the details for the new class
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="gradeId" className="text-card-foreground">
										Grade *
									</Label>
									<Select
										value={formData.gradeId}
										onValueChange={(value) => handleChange("gradeId", value)}>
										<SelectTrigger className="bg-input border-border">
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
								<div className="space-y-2">
									<Label htmlFor="name" className="text-card-foreground">
										Class Section *
									</Label>
									<Input
										id="name"
										value={formData.section}
										onChange={(e) => handleChange("section", e.target.value)}
										placeholder="e.g., A"
										required
										className="bg-input border-border"
									/>
								</div>
								{/* <div className="space-y-2">
									<Label htmlFor="code" className="text-card-foreground">
										Class Code *
									</Label>
									<Input
										id="code"
										value={formData.code}
										onChange={(e) => handleChange("code", e.target.value)}
										placeholder="e.g., G10A"
										required
										className="bg-input border-border"
									/>
								</div> */}
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label
										htmlFor="academicYearId"
										className="text-card-foreground">
										Academic Year *
									</Label>
									<Select
										value={formData.academicYearId}
										onValueChange={(value) =>
											handleChange("academicYearId", value)
										}>
										<SelectTrigger className="bg-input border-border">
											<SelectValue placeholder="Select academic year" />
										</SelectTrigger>
										<SelectContent>
											{academicYears.map((year) => (
												<SelectItem key={year.id} value={year.id}>
													{(year as any).name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="capacity" className="text-card-foreground">
									Capacity
								</Label>
								<Input
									id="capacity"
									type="number"
									value={formData.capacity}
									onChange={(e) => handleChange("capacity", e.target.value)}
									placeholder="Maximum number of students"
									className="bg-input border-border"
								/>
							</div>

							{/* <div className="space-y-2">
								<Label htmlFor="description" className="text-card-foreground">
									Description
								</Label>
								<Textarea
									id="description"
									value={formData.description}
									onChange={(e) => handleChange("description", e.target.value)}
									placeholder="Optional description for the class"
									className="bg-input border-border"
									rows={3}
								/>
							</div> */}

							<div className="flex gap-4 pt-4">
								<Button
									type="submit"
									disabled={loading}
									className="bg-primary text-primary-foreground hover:bg-primary/90">
									<Save className="h-4 w-4 mr-2" />
									{loading ? "Creating..." : "Create Class"}
								</Button>
								<Button asChild type="button" variant="outline">
									<Link href="/dashboard/classes">Cancel</Link>
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
