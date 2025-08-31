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
import { ArrowLeft, Save, Calendar, Clock } from "lucide-react";
import Link from "next/link";

interface Class {
	id: string;
	name: string;
	grade: { name: string };
}

interface Subject {
	id: string;
	name: string;
	code: string;
}

interface Teacher {
	id: string;
	user: {
		firstName: string;
		lastName: string;
	};
}

export default function NewLessonPage() {
	const router = useRouter();
	const { user } = useAuth();
	const [loading, setLoading] = useState(false);
	const [classes, setClasses] = useState<Class[]>([]);
	const [subjects, setSubjects] = useState<Subject[]>([]);
	const [teachers, setTeachers] = useState<Teacher[]>([]);
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		classId: "",
		subjectId: "",
		teacherId: "",
		startTime: "",
		endTime: "",
		duration: "",
		location: "",
		notes: "",
	});

	useEffect(() => {
		fetchClasses();
		fetchSubjects();
		fetchTeachers();
	}, []);

	const fetchClasses = async () => {
		try {
			const response = await apiClient.get(`/classes/branch/${user?.branchId}`);
			if (response.success) {
				setClasses(response.data.classes || []);
			}
		} catch (error) {
			console.error("Failed to fetch classes:", error);
		}
	};

	const fetchSubjects = async () => {
		try {
			// const response = await apiClient.get("/subjects");
			const response = await apiClient.get(
				`/subjects/school/${user?.branchId}`
			);
			if (response.success) {
				setSubjects(response.data.subjects || []);
			}
		} catch (error) {
			console.error("Failed to fetch subjects:", error);
		}
	};

	const fetchTeachers = async () => {
		try {
			// const response = await apiClient.get("/teachers");
			const response = await apiClient.get(
				`/teachers/branch/${user?.branchId}`
			);
			if (response.success) {
				setTeachers(response.data.teachers);
			}

			// if (response.success) {
			// 	setTeachers(response.data || []);
			// }
		} catch (error) {
			console.error("Failed to fetch teachers:", error);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const response = await apiClient.post("/lessons", {
				...formData,
				duration: formData.duration
					? Number.parseInt(formData.duration)
					: undefined,
			});

			if (response.success) {
				router.push("/dashboard/lessons");
			}
		} catch (error) {
			console.error("Failed to create lesson:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	// Calculate duration when start/end times change
	useEffect(() => {
		if (formData.startTime && formData.endTime) {
			const start = new Date(formData.startTime);
			const end = new Date(formData.endTime);
			const diffInMinutes = Math.round(
				(end.getTime() - start.getTime()) / (1000 * 60)
			);
			if (diffInMinutes > 0) {
				setFormData((prev) => ({
					...prev,
					duration: diffInMinutes.toString(),
				}));
			}
		}
	}, [formData.startTime, formData.endTime]);

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center gap-4 mb-8">
					<Button asChild variant="outline" size="sm">
						<Link href="/dashboard/lessons">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Lessons
						</Link>
					</Button>
					<div>
						<h1 className="text-3xl font-bold text-foreground">
							Add New Lesson
						</h1>
						<p className="text-muted-foreground">
							Create a new lesson for your curriculum
						</p>
					</div>
				</div>

				<Card className="max-w-4xl bg-card border-border">
					<CardHeader>
						<CardTitle className="text-card-foreground">
							Lesson Information
						</CardTitle>
						<CardDescription>
							Fill in the details for the new lesson
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="title" className="text-card-foreground">
										Lesson Title *
									</Label>
									<Input
										id="title"
										value={formData.title}
										onChange={(e) => handleChange("title", e.target.value)}
										placeholder="e.g., Introduction to Algebra"
										required
										className="bg-input border-border"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="location" className="text-card-foreground">
										Location
									</Label>
									<Input
										id="location"
										value={formData.location}
										onChange={(e) => handleChange("location", e.target.value)}
										placeholder="e.g., Room 101, Lab A"
										className="bg-input border-border"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="description" className="text-card-foreground">
									Description
								</Label>
								<Textarea
									id="description"
									value={formData.description}
									onChange={(e) => handleChange("description", e.target.value)}
									placeholder="Brief description of the lesson content and objectives"
									className="bg-input border-border"
									rows={3}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label htmlFor="classId" className="text-card-foreground">
										Class *
									</Label>
									<Select
										value={formData.classId}
										onValueChange={(value) => handleChange("classId", value)}>
										<SelectTrigger className="bg-input border-border">
											<SelectValue placeholder="Select class" />
										</SelectTrigger>
										<SelectContent>
											{classes.map((cls) => (
												<SelectItem key={cls.id} value={cls.id}>
													{cls.name} - {cls.grade.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="subjectId" className="text-card-foreground">
										Subject *
									</Label>
									<Select
										value={formData.subjectId}
										onValueChange={(value) => handleChange("subjectId", value)}>
										<SelectTrigger className="bg-input border-border">
											<SelectValue placeholder="Select subject" />
										</SelectTrigger>
										<SelectContent>
											{subjects.map((subject) => (
												<SelectItem key={subject.id} value={subject.id}>
													{subject.name} ({subject.code})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="teacherId" className="text-card-foreground">
										Teacher *
									</Label>
									<Select
										value={formData.teacherId}
										onValueChange={(value) => handleChange("teacherId", value)}>
										<SelectTrigger className="bg-input border-border">
											<SelectValue placeholder="Select teacher" />
										</SelectTrigger>
										<SelectContent>
											{teachers.map((teacher) => (
												<SelectItem key={teacher.id} value={teacher.id}>
													{teacher.user.firstName} {teacher.user.lastName}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label htmlFor="startTime" className="text-card-foreground">
										Start Time *
									</Label>
									<div className="relative">
										<Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
										<Input
											id="startTime"
											type="datetime-local"
											value={formData.startTime}
											onChange={(e) =>
												handleChange("startTime", e.target.value)
											}
											required
											className="bg-input border-border pl-10"
										/>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="endTime" className="text-card-foreground">
										End Time *
									</Label>
									<div className="relative">
										<Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
										<Input
											id="endTime"
											type="datetime-local"
											value={formData.endTime}
											onChange={(e) => handleChange("endTime", e.target.value)}
											required
											className="bg-input border-border pl-10"
										/>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="duration" className="text-card-foreground">
										Duration (minutes)
									</Label>
									<div className="relative">
										<Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
										<Input
											id="duration"
											type="number"
											value={formData.duration}
											onChange={(e) => handleChange("duration", e.target.value)}
											placeholder="Auto-calculated"
											className="bg-input border-border pl-10"
											readOnly
										/>
									</div>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="notes" className="text-card-foreground">
									Notes
								</Label>
								<Textarea
									id="notes"
									value={formData.notes}
									onChange={(e) => handleChange("notes", e.target.value)}
									placeholder="Additional notes or instructions for the lesson"
									className="bg-input border-border"
									rows={3}
								/>
							</div>

							<div className="flex gap-4 pt-4">
								<Button
									type="submit"
									disabled={loading}
									className="bg-primary text-primary-foreground hover:bg-primary/90">
									<Save className="h-4 w-4 mr-2" />
									{loading ? "Creating..." : "Create Lesson"}
								</Button>
								<Button asChild type="button" variant="outline">
									<Link href="/dashboard/lessons">Cancel</Link>
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
