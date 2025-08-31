"use client";

import { useState, useEffect } from "react";
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Edit, Trash2, BookOpen } from "lucide-react";
import Link from "next/link";

interface Subject {
	id: string;
	name: string;
	code: string;
	description?: string;
	credits?: number;
	grade?: { name: string; level: number };
	school: { name: string };
	teachers: Array<{
		teacher: {
			user: { firstName: string; lastName: string };
		};
	}>;
	isActive: boolean;
}

export default function SubjectsPage() {
	const { user } = useAuth();
	const [subjects, setSubjects] = useState<Subject[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		fetchSubjects();
	}, [user]);

	const fetchSubjects = async () => {
		if (!user?.schoolId) return;

		try {
			const response = await apiClient.get(`/subjects/school/${user.schoolId}`);
			if (response.success) {
				setSubjects(response.data.subjects);
			}
		} catch (error) {
			console.error("Failed to fetch subjects:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			const response = await apiClient.delete(`/subjects/${id}`);
			if (response.success) {
				setSubjects(subjects.filter((s) => s.id !== id));
			}
		} catch (error) {
			console.error("Failed to delete subject:", error);
		}
	};

	const filteredSubjects = subjects.filter(
		(subject) =>
			subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
			subject.grade?.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				Loading...
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8">
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-3xl font-bold text-foreground mb-2">
							Subjects
						</h1>
						<p className="text-muted-foreground">Manage your school subjects</p>
					</div>
					<Button
						asChild
						className="bg-primary text-primary-foreground hover:bg-primary/90">
						<Link href="/dashboard/subjects/new">
							<Plus className="h-4 w-4 mr-2" />
							Add Subject
						</Link>
					</Button>
				</div>

				<Card className="bg-card border-border">
					<CardHeader>
						<CardTitle className="text-card-foreground">All Subjects</CardTitle>
						<CardDescription>
							View and manage all subjects in your school
						</CardDescription>
						<div className="flex items-center space-x-2">
							<Search className="h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search subjects..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="max-w-sm bg-input border-border"
							/>
						</div>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="text-card-foreground">
										Subject Name
									</TableHead>
									<TableHead className="text-card-foreground">Code</TableHead>
									<TableHead className="text-card-foreground">Grade</TableHead>
									<TableHead className="text-card-foreground">
										Credits
									</TableHead>
									<TableHead className="text-card-foreground">
										Teachers
									</TableHead>
									<TableHead className="text-card-foreground">Status</TableHead>
									<TableHead className="text-card-foreground">
										Actions
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredSubjects.map((subject) => (
									<TableRow key={subject.id} className="hover:bg-muted/50">
										<TableCell className="font-medium text-card-foreground">
											<div className="flex items-center gap-2">
												<BookOpen className="h-4 w-4 text-muted-foreground" />
												{subject.name}
											</div>
										</TableCell>
										<TableCell className="text-card-foreground">
											{subject.code}
										</TableCell>
										<TableCell className="text-card-foreground">
											{subject.grade?.name || "All Grades"}
										</TableCell>
										<TableCell className="text-card-foreground">
											{subject.credits || "N/A"}
										</TableCell>
										<TableCell className="text-card-foreground">
											{subject.teachers.length > 0 ? (
												<div className="flex flex-col gap-1">
													{subject.teachers.slice(0, 2).map((ts, index) => (
														<span key={index} className="text-sm">
															{ts.teacher.user.firstName}{" "}
															{ts.teacher.user.lastName}
														</span>
													))}
													{subject.teachers.length > 2 && (
														<span className="text-xs text-muted-foreground">
															+{subject.teachers.length - 2} more
														</span>
													)}
												</div>
											) : (
												<span className="text-muted-foreground">
													No teachers assigned
												</span>
											)}
										</TableCell>
										<TableCell>
											<Badge
												variant={subject.isActive ? "default" : "secondary"}>
												{subject.isActive ? "Active" : "Inactive"}
											</Badge>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Button asChild variant="outline" size="sm">
													<Link href={`/dashboard/subjects/${subject.id}/edit`}>
														<Edit className="h-4 w-4" />
													</Link>
												</Button>
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<Button
															variant="outline"
															size="sm"
															className="text-destructive hover:text-destructive bg-transparent">
															<Trash2 className="h-4 w-4" />
														</Button>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>
																Delete Subject
															</AlertDialogTitle>
															<AlertDialogDescription>
																Are you sure you want to delete "{subject.name}
																"? This action cannot be undone.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Cancel</AlertDialogCancel>
															<AlertDialogAction
																onClick={() => handleDelete(subject.id)}
																className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
																Delete
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
