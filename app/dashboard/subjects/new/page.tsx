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

export default function NewSubjectPage() {
	const router = useRouter();
	const { user } = useAuth();
	const [loading, setLoading] = useState(false);
	const [grades, setGrades] = useState<Grade[]>([]);
	const [formData, setFormData] = useState({
		name: "",
		code: "",
		// gradeId: "all", // Updated default value to "all"
		description: "",
		credits: "",
	});

	useEffect(() => {
		fetchGrades();
	}, []);

	const fetchGrades = async () => {
		try {
			const response = await apiClient.get(`/schools/${user?.schoolId}/grades`);
			if (response.success) {
				setGrades(response.data.grades || []);
			}
		} catch (error) {
			console.error("Failed to fetch grades:", error);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user?.schoolId) return;

		setLoading(true);
		try {
			const response = await apiClient.post("/subjects", {
				...formData,
				// schoolId: user.schoolId,
				// gradeId: formData.gradeId === "all" ? undefined : formData.gradeId, // Updated condition to handle "all" value
				credits: formData.credits
					? Number.parseInt(formData.credits)
					: undefined,
			});

			if (response.success) {
				router.push("/dashboard/subjects");
			}
		} catch (error) {
			console.error("Failed to create subject:", error);
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
						<Link href="/dashboard/subjects">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Subjects
						</Link>
					</Button>
					<div>
						<h1 className="text-3xl font-bold text-foreground">
							Add New Subject
						</h1>
						<p className="text-muted-foreground">
							Create a new subject for your school
						</p>
					</div>
				</div>

				<Card className="max-w-2xl bg-card border-border">
					<CardHeader>
						<CardTitle className="text-card-foreground">
							Subject Information
						</CardTitle>
						<CardDescription>
							Fill in the details for the new subject
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="name" className="text-card-foreground">
										Subject Name *
									</Label>
									<Input
										id="name"
										value={formData.name}
										onChange={(e) => handleChange("name", e.target.value)}
										placeholder="e.g., Mathematics"
										required
										className="bg-input border-border"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="code" className="text-card-foreground">
										Subject Code *
									</Label>
									<Input
										id="code"
										value={formData.code}
										onChange={(e) => handleChange("code", e.target.value)}
										placeholder="e.g., MATH"
										required
										className="bg-input border-border"
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* <div className="space-y-2">
									<Label htmlFor="gradeId" className="text-card-foreground">
										Grade (Optional)
									</Label>
									<Select
										value={formData.gradeId}
										onValueChange={(value) => handleChange("gradeId", value)}>
										<SelectTrigger className="bg-input border-border">
											<SelectValue placeholder="Select grade (leave empty for all grades)" />
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
								</div> */}
								{/* <div className="space-y-2">
									<Label htmlFor="credits" className="text-card-foreground">
										Credits
									</Label>
									<Input
										id="credits"
										type="number"
										value={formData.credits}
										onChange={(e) => handleChange("credits", e.target.value)}
										placeholder="Credit hours"
										className="bg-input border-border"
									/>
								</div> */}
							</div>

							<div className="space-y-2">
								<Label htmlFor="description" className="text-card-foreground">
									Description
								</Label>
								<Textarea
									id="description"
									value={formData.description}
									onChange={(e) => handleChange("description", e.target.value)}
									placeholder="Optional description for the subject"
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
									{loading ? "Creating..." : "Create Subject"}
								</Button>
								<Button asChild type="button" variant="outline">
									<Link href="/dashboard/subjects">Cancel</Link>
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
