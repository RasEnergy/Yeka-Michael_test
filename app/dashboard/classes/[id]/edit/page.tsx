"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
	name: string;
	isActive: boolean;
}

interface ClassData {
	id: string;
	name: string;
	section: string;
	gradeId: string;
	academicYearId: string;
	capacity: number | null;
	grade: Grade;
	academicYear: AcademicYear;
}

export default function EditClassPage() {
	const router = useRouter();
	const params = useParams();
	const { user } = useAuth();
	const [loading, setLoading] = useState(false);
	const [fetchingClass, setFetchingClass] = useState(true);
	const [grades, setGrades] = useState<Grade[]>([]);
	const [selectedGrade, setSelectedGrade] = useState<string>("");
	const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
	const [classData, setClassData] = useState<ClassData | null>(null);
	const [formData, setFormData] = useState({
		name: "",
		section: "",
		gradeId: "",
		academicYearId: "",
		capacity: "",
	});

	const classId = params.id as string;

	useEffect(() => {
		if (classId) {
			fetchClass();
			fetchGrades();
			fetchAcademicYears();
		}
	}, [classId]);

	const fetchClass = async () => {
		try {
			setFetchingClass(true);
			const response = await apiClient.get(`/classes/${classId}`);
			if (response.success) {
				const data = response.data.class;
				setClassData(data);
				setFormData({
					name: data.name,
					section: data.section,
					gradeId: data.gradeId,
					academicYearId: data.academicYearId,
					capacity: data.capacity?.toString() || "",
				});
				setSelectedGrade(data.grade.name);
			}
		} catch (error) {
			console.error("Failed to fetch class:", error);
		} finally {
			setFetchingClass(false);
		}
	};

	const fetchGrades = async () => {
		try {
			const response = await apiClient.get(`/classes/grades/${user?.branchId}`);
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
			if (response.success) {
				setAcademicYears(response.data.academicYears || []);
			}
		} catch (error) {
			console.error("Failed to fetch academic years:", error);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user?.branchId || !classId) return;

		setLoading(true);
		try {
			const response = await apiClient.put(`/classes/${classId}`, {
				...formData,
				name: `${selectedGrade} ${formData.section}`,
				section: formData.section.toUpperCase(),
				capacity: formData.capacity ? Number.parseInt(formData.capacity) : null,
			});

			if (response.success) {
				router.push("/dashboard/classes");
			}
		} catch (error) {
			console.error("Failed to update class:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (field === "gradeId") {
			const grade = grades.find((grade) => grade.id === value);
			setSelectedGrade(grade?.name || "");
		}
	};

	if (fetchingClass) {
		return (
			<div className="min-h-screen bg-background">
				<div className="container mx-auto px-4 py-8">
					<div className="flex items-center justify-center">
						<p className="text-muted-foreground">Loading class data...</p>
					</div>
				</div>
			</div>
		);
	}

	if (!classData) {
		return (
			<div className="min-h-screen bg-background">
				<div className="container mx-auto px-4 py-8">
					<div className="flex items-center justify-center">
						<p className="text-muted-foreground">Class not found</p>
					</div>
				</div>
			</div>
		);
	}

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
						<h1 className="text-3xl font-bold text-foreground">Edit Class</h1>
						<p className="text-muted-foreground">Update class information</p>
					</div>
				</div>

				<Card className="max-w-2xl bg-card border-border">
					<CardHeader>
						<CardTitle className="text-card-foreground">
							Class Information
						</CardTitle>
						<CardDescription>Update the details for this class</CardDescription>
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
									<Label htmlFor="section" className="text-card-foreground">
										Class Section *
									</Label>
									<Input
										id="section"
										value={formData.section}
										onChange={(e) => handleChange("section", e.target.value)}
										placeholder="e.g., A"
										required
										className="bg-input border-border"
									/>
								</div>
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
													{year.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
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
							</div>

							<div className="flex gap-4 pt-4">
								<Button
									type="submit"
									disabled={loading}
									className="bg-primary text-primary-foreground hover:bg-primary/90">
									<Save className="h-4 w-4 mr-2" />
									{loading ? "Updating..." : "Update Class"}
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
