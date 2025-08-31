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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
import {
	Plus,
	Search,
	Edit,
	Trash2,
	Clock,
	BookOpen,
	User,
	Calendar,
} from "lucide-react";
import Link from "next/link";

interface Lesson {
	id: string;
	title: string;
	description?: string;
	startTime: string;
	endTime: string;
	duration: number;
	status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "POSTPONED";
	location?: string;
	class: {
		name: string;
		grade: { name: string };
		branch: { name: string };
	};
	subject: {
		name: string;
		code: string;
	};
	teacher: {
		user: {
			firstName: string;
			lastName: string;
		};
	};
	modules: Array<{ id: string; title: string }>;
}

const statusColors = {
	SCHEDULED: "default",
	IN_PROGRESS: "secondary",
	COMPLETED: "outline",
	CANCELLED: "destructive",
	POSTPONED: "secondary",
} as const;

export default function LessonsPage() {
	const { user } = useAuth();
	const [lessons, setLessons] = useState<Lesson[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [deleteId, setDeleteId] = useState<string | null>(null);

	useEffect(() => {
		fetchLessons();
	}, [user]);

	const fetchLessons = async () => {
		try {
			const response = await apiClient.get("/lessons");
			if (response.success) {
				setLessons(response.data);
			}
		} catch (error) {
			console.error("Failed to fetch lessons:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			const response = await apiClient.delete(`/lessons/${id}`);
			if (response.success) {
				setLessons(lessons.filter((l) => l.id !== id));
				setDeleteId(null);
			}
		} catch (error) {
			console.error("Failed to delete lesson:", error);
		}
	};

	const formatDateTime = (dateString: string) => {
		return new Date(dateString).toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const filteredLessons = lessons.filter((lesson) => {
		const matchesSearch =
			lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			lesson.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			lesson.class.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			`${lesson.teacher.user.firstName} ${lesson.teacher.user.lastName}`
				.toLowerCase()
				.includes(searchTerm.toLowerCase());

		const matchesStatus =
			statusFilter === "all" || lesson.status === statusFilter;

		return matchesSearch && matchesStatus;
	});

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
						<h1 className="text-3xl font-bold text-foreground mb-2">Lessons</h1>
						<p className="text-muted-foreground">
							Manage your school lessons and curriculum
						</p>
					</div>
					<Button
						asChild
						className="bg-primary text-primary-foreground hover:bg-primary/90">
						<Link href="/dashboard/lessons/new">
							<Plus className="h-4 w-4 mr-2" />
							Add Lesson
						</Link>
					</Button>
				</div>

				<Card className="bg-card border-border">
					<CardHeader>
						<CardTitle className="text-card-foreground">All Lessons</CardTitle>
						<CardDescription>
							View and manage all lessons in your school
						</CardDescription>
						<div className="flex items-center space-x-4">
							<div className="flex items-center space-x-2">
								<Search className="h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search lessons..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="max-w-sm bg-input border-border"
								/>
							</div>
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger className="w-48">
									<SelectValue placeholder="Filter by status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Status</SelectItem>
									<SelectItem value="SCHEDULED">Scheduled</SelectItem>
									<SelectItem value="IN_PROGRESS">In Progress</SelectItem>
									<SelectItem value="COMPLETED">Completed</SelectItem>
									<SelectItem value="CANCELLED">Cancelled</SelectItem>
									<SelectItem value="POSTPONED">Postponed</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="text-card-foreground">
										Lesson Title
									</TableHead>
									<TableHead className="text-card-foreground">
										Subject
									</TableHead>
									<TableHead className="text-card-foreground">Class</TableHead>
									<TableHead className="text-card-foreground">
										Teacher
									</TableHead>
									<TableHead className="text-card-foreground">
										Schedule
									</TableHead>
									<TableHead className="text-card-foreground">
										Duration
									</TableHead>
									<TableHead className="text-card-foreground">
										Modules
									</TableHead>
									<TableHead className="text-card-foreground">Status</TableHead>
									<TableHead className="text-card-foreground">
										Actions
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredLessons.map((lesson) => (
									<TableRow key={lesson.id} className="hover:bg-muted/50">
										<TableCell className="font-medium text-card-foreground">
											<div>
												<div className="font-semibold">{lesson.title}</div>
												{lesson.description && (
													<div className="text-sm text-muted-foreground truncate max-w-xs">
														{lesson.description}
													</div>
												)}
											</div>
										</TableCell>
										<TableCell className="text-card-foreground">
											<div className="flex items-center gap-1">
												<BookOpen className="h-4 w-4" />
												<div>
													<div className="font-medium">
														{lesson.subject.name}
													</div>
													<div className="text-sm text-muted-foreground">
														{lesson.subject.code}
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell className="text-card-foreground">
											<div>
												<div className="font-medium">{lesson.class.name}</div>
												<div className="text-sm text-muted-foreground">
													{lesson.class.grade.name}
												</div>
											</div>
										</TableCell>
										<TableCell className="text-card-foreground">
											<div className="flex items-center gap-1">
												<User className="h-4 w-4" />
												{lesson.teacher.user.firstName}{" "}
												{lesson.teacher.user.lastName}
											</div>
										</TableCell>
										<TableCell className="text-card-foreground">
											<div className="flex items-center gap-1">
												<Calendar className="h-4 w-4" />
												<div>
													<div className="font-medium">
														{formatDateTime(lesson.startTime)}
													</div>
													<div className="text-sm text-muted-foreground">
														to {formatDateTime(lesson.endTime)}
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell className="text-card-foreground">
											<div className="flex items-center gap-1">
												<Clock className="h-4 w-4" />
												{lesson.duration} min
											</div>
										</TableCell>
										<TableCell className="text-card-foreground">
											<Badge variant="outline">
												{lesson.modules.length} modules
											</Badge>
										</TableCell>
										<TableCell>
											<Badge variant={statusColors[lesson.status]}>
												{lesson.status.replace("_", " ")}
											</Badge>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Button asChild variant="outline" size="sm">
													<Link href={`/dashboard/lessons/${lesson.id}`}>
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
															<AlertDialogTitle>Delete Lesson</AlertDialogTitle>
															<AlertDialogDescription>
																Are you sure you want to delete "{lesson.title}
																"? This action cannot be undone and will also
																delete all associated modules.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Cancel</AlertDialogCancel>
															<AlertDialogAction
																onClick={() => handleDelete(lesson.id)}
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
