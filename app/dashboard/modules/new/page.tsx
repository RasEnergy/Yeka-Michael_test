"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Plus, X, Clock, Target } from "lucide-react";
import Link from "next/link";

interface Lesson {
	id: string;
	title: string;
	class: {
		name: string;
		grade: { name: string };
	};
	subject: {
		name: string;
		code: string;
	};
}

export default function NewModulePage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const lessonId = searchParams.get("lessonId");

	const [loading, setLoading] = useState(false);
	const [lessons, setLessons] = useState<Lesson[]>([]);
	const [resources, setResources] = useState<string[]>([]);
	const [objectives, setObjectives] = useState<string[]>([]);
	const [newResource, setNewResource] = useState("");
	const [newObjective, setNewObjective] = useState("");
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		lessonId: lessonId || "",
		content: "",
		orderIndex: "",
		duration: "",
		status: "DRAFT" as "DRAFT" | "PUBLISHED" | "ARCHIVED",
	});

	useEffect(() => {
		fetchLessons();
		if (lessonId) {
			fetchNextOrderIndex(lessonId);
		}
	}, [lessonId]);

	const fetchLessons = async () => {
		try {
			const response = await apiClient.get("/lessons");
			if (response.success) {
				setLessons(response.data || []);
			}
		} catch (error) {
			console.error("Failed to fetch lessons:", error);
		}
	};

	const fetchNextOrderIndex = async (selectedLessonId: string) => {
		try {
			const response = await apiClient.get(
				`/modules/lesson/${selectedLessonId}`
			);
			if (response.success) {
				const modules = response.data || [];
				const nextIndex = modules.length + 1;
				setFormData((prev) => ({ ...prev, orderIndex: nextIndex.toString() }));
			}
		} catch (error) {
			console.error("Failed to fetch modules:", error);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const response = await apiClient.post("/modules", {
				...formData,
				orderIndex: Number.parseInt(formData.orderIndex),
				duration: formData.duration
					? Number.parseInt(formData.duration)
					: undefined,
				resources,
				objectives,
			});

			if (response.success) {
				router.push("/dashboard/modules");
			}
		} catch (error) {
			console.error("Failed to create module:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));

		// Auto-fetch order index when lesson changes
		if (field === "lessonId" && value) {
			fetchNextOrderIndex(value);
		}
	};

	const addResource = () => {
		if (newResource.trim()) {
			setResources([...resources, newResource.trim()]);
			setNewResource("");
		}
	};

	const removeResource = (index: number) => {
		setResources(resources.filter((_, i) => i !== index));
	};

	const addObjective = () => {
		if (newObjective.trim()) {
			setObjectives([...objectives, newObjective.trim()]);
			setNewObjective("");
		}
	};

	const removeObjective = (index: number) => {
		setObjectives(objectives.filter((_, i) => i !== index));
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center gap-4 mb-8">
					<Button asChild variant="outline" size="sm">
						<Link href="/dashboard/modules">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Modules
						</Link>
					</Button>
					<div>
						<h1 className="text-3xl font-bold text-foreground">
							Add New Module
						</h1>
						<p className="text-muted-foreground">
							Create a new learning module for a lesson
						</p>
					</div>
				</div>

				<Card className="max-w-4xl bg-card border-border">
					<CardHeader>
						<CardTitle className="text-card-foreground">
							Module Information
						</CardTitle>
						<CardDescription>
							Fill in the details for the new learning module
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="title" className="text-card-foreground">
										Module Title *
									</Label>
									<Input
										id="title"
										value={formData.title}
										onChange={(e) => handleChange("title", e.target.value)}
										placeholder="e.g., Basic Algebraic Operations"
										required
										className="bg-input border-border"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="lessonId" className="text-card-foreground">
										Lesson *
									</Label>
									<Select
										value={formData.lessonId}
										onValueChange={(value) => handleChange("lessonId", value)}>
										<SelectTrigger className="bg-input border-border">
											<SelectValue placeholder="Select lesson" />
										</SelectTrigger>
										<SelectContent>
											{lessons.map((lesson) => (
												<SelectItem key={lesson.id} value={lesson.id}>
													<div className="flex flex-col">
														<span>{lesson.title}</span>
														<span className="text-sm text-muted-foreground">
															{lesson.subject.name} - {lesson.class.name}
														</span>
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
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
									placeholder="Brief description of what this module covers"
									className="bg-input border-border"
									rows={3}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label htmlFor="orderIndex" className="text-card-foreground">
										Order Index *
									</Label>
									<Input
										id="orderIndex"
										type="number"
										value={formData.orderIndex}
										onChange={(e) => handleChange("orderIndex", e.target.value)}
										placeholder="1"
										required
										min="1"
										className="bg-input border-border"
									/>
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
											placeholder="30"
											className="bg-input border-border pl-10"
										/>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="status" className="text-card-foreground">
										Status
									</Label>
									<Select
										value={formData.status}
										onValueChange={(value: any) =>
											handleChange("status", value)
										}>
										<SelectTrigger className="bg-input border-border">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="DRAFT">Draft</SelectItem>
											<SelectItem value="PUBLISHED">Published</SelectItem>
											<SelectItem value="ARCHIVED">Archived</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="content" className="text-card-foreground">
									Content
								</Label>
								<Textarea
									id="content"
									value={formData.content}
									onChange={(e) => handleChange("content", e.target.value)}
									placeholder="Detailed content and instructions for this module"
									className="bg-input border-border"
									rows={6}
								/>
							</div>

							<div className="space-y-4">
								<div className="space-y-2">
									<Label className="text-card-foreground flex items-center gap-2">
										<Target className="h-4 w-4" />
										Learning Objectives
									</Label>
									<div className="flex gap-2">
										<Input
											value={newObjective}
											onChange={(e) => setNewObjective(e.target.value)}
											placeholder="Add a learning objective"
											className="bg-input border-border"
											onKeyPress={(e) =>
												e.key === "Enter" &&
												(e.preventDefault(), addObjective())
											}
										/>
										<Button
											type="button"
											onClick={addObjective}
											variant="outline"
											size="sm">
											<Plus className="h-4 w-4" />
										</Button>
									</div>
									<div className="flex flex-wrap gap-2">
										{objectives.map((objective, index) => (
											<Badge
												key={index}
												variant="secondary"
												className="flex items-center gap-1">
												{objective}
												<button
													type="button"
													onClick={() => removeObjective(index)}
													className="ml-1 hover:text-destructive">
													<X className="h-3 w-3" />
												</button>
											</Badge>
										))}
									</div>
								</div>

								<div className="space-y-2">
									<Label className="text-card-foreground">Resources</Label>
									<div className="flex gap-2">
										<Input
											value={newResource}
											onChange={(e) => setNewResource(e.target.value)}
											placeholder="Add a resource URL or file path"
											className="bg-input border-border"
											onKeyPress={(e) =>
												e.key === "Enter" && (e.preventDefault(), addResource())
											}
										/>
										<Button
											type="button"
											onClick={addResource}
											variant="outline"
											size="sm">
											<Plus className="h-4 w-4" />
										</Button>
									</div>
									<div className="flex flex-wrap gap-2">
										{resources.map((resource, index) => (
											<Badge
												key={index}
												variant="outline"
												className="flex items-center gap-1">
												{resource}
												<button
													type="button"
													onClick={() => removeResource(index)}
													className="ml-1 hover:text-destructive">
													<X className="h-3 w-3" />
												</button>
											</Badge>
										))}
									</div>
								</div>
							</div>

							<div className="flex gap-4 pt-4">
								<Button
									type="submit"
									disabled={loading}
									className="bg-primary text-primary-foreground hover:bg-primary/90">
									<Save className="h-4 w-4 mr-2" />
									{loading ? "Creating..." : "Create Module"}
								</Button>
								<Button asChild type="button" variant="outline">
									<Link href="/dashboard/modules">Cancel</Link>
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
