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
	Copy,
	ArrowUpDown,
} from "lucide-react";
import Link from "next/link";

interface Module {
	id: string;
	title: string;
	description?: string;
	orderIndex: number;
	duration?: number;
	status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
	resources: string[];
	objectives: string[];
	lesson: {
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
		teacher: {
			user: {
				firstName: string;
				lastName: string;
			};
		};
	};
}

const statusColors = {
	DRAFT: "secondary",
	PUBLISHED: "default",
	ARCHIVED: "outline",
} as const;

export default function ModulesPage() {
	const { user } = useAuth();
	const [modules, setModules] = useState<Module[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [deleteId, setDeleteId] = useState<string | null>(null);

	useEffect(() => {
		fetchModules();
	}, [user]);

	const fetchModules = async () => {
		try {
			const response = await apiClient.get("/modules");
			if (response.success) {
				setModules(response.data);
			}
		} catch (error) {
			console.error("Failed to fetch modules:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			const response = await apiClient.delete(`/modules/${id}`);
			if (response.success) {
				setModules(modules.filter((m) => m.id !== id));
				setDeleteId(null);
			}
		} catch (error) {
			console.error("Failed to delete module:", error);
		}
	};

	const handleDuplicate = async (id: string) => {
		try {
			const response = await apiClient.post(`/modules/${id}/duplicate`);
			if (response.success) {
				fetchModules(); // Refresh the list
			}
		} catch (error) {
			console.error("Failed to duplicate module:", error);
		}
	};

	const filteredModules = modules.filter((module) => {
		const matchesSearch =
			module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			module.lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			module.lesson.subject.name
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			module.lesson.class.name.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesStatus =
			statusFilter === "all" || module.status === statusFilter;

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
						<h1 className="text-3xl font-bold text-foreground mb-2">Modules</h1>
						<p className="text-muted-foreground">
							Manage lesson modules and learning content
						</p>
					</div>
					<Button
						asChild
						className="bg-primary text-primary-foreground hover:bg-primary/90">
						<Link href="/dashboard/modules/new">
							<Plus className="h-4 w-4 mr-2" />
							Add Module
						</Link>
					</Button>
				</div>

				<Card className="bg-card border-border">
					<CardHeader>
						<CardTitle className="text-card-foreground">All Modules</CardTitle>
						<CardDescription>
							View and manage all learning modules
						</CardDescription>
						<div className="flex items-center space-x-4">
							<div className="flex items-center space-x-2">
								<Search className="h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search modules..."
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
									<SelectItem value="DRAFT">Draft</SelectItem>
									<SelectItem value="PUBLISHED">Published</SelectItem>
									<SelectItem value="ARCHIVED">Archived</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="text-card-foreground">
										Module Title
									</TableHead>
									<TableHead className="text-card-foreground">Lesson</TableHead>
									<TableHead className="text-card-foreground">
										Subject & Class
									</TableHead>
									<TableHead className="text-card-foreground">Order</TableHead>
									<TableHead className="text-card-foreground">
										Duration
									</TableHead>
									<TableHead className="text-card-foreground">
										Resources
									</TableHead>
									<TableHead className="text-card-foreground">Status</TableHead>
									<TableHead className="text-card-foreground">
										Actions
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredModules.map((module) => (
									<TableRow key={module.id} className="hover:bg-muted/50">
										<TableCell className="font-medium text-card-foreground">
											<div>
												<div className="font-semibold">{module.title}</div>
												{module.description && (
													<div className="text-sm text-muted-foreground truncate max-w-xs">
														{module.description}
													</div>
												)}
											</div>
										</TableCell>
										<TableCell className="text-card-foreground">
											<div className="flex items-center gap-1">
												<BookOpen className="h-4 w-4" />
												<Link
													href={`/dashboard/lessons/${module.lesson.id}`}
													className="font-medium hover:underline text-primary">
													{module.lesson.title}
												</Link>
											</div>
										</TableCell>
										<TableCell className="text-card-foreground">
											<div>
												<div className="font-medium">
													{module.lesson.subject.name}
												</div>
												<div className="text-sm text-muted-foreground">
													{module.lesson.class.name} -{" "}
													{module.lesson.class.grade.name}
												</div>
											</div>
										</TableCell>
										<TableCell className="text-card-foreground">
											<div className="flex items-center gap-1">
												<ArrowUpDown className="h-4 w-4" />#{module.orderIndex}
											</div>
										</TableCell>
										<TableCell className="text-card-foreground">
											{module.duration ? (
												<div className="flex items-center gap-1">
													<Clock className="h-4 w-4" />
													{module.duration} min
												</div>
											) : (
												<span className="text-muted-foreground">Not set</span>
											)}
										</TableCell>
										<TableCell className="text-card-foreground">
											<Badge variant="outline">
												{module.resources.length} resources
											</Badge>
										</TableCell>
										<TableCell>
											<Badge variant={statusColors[module.status]}>
												{module.status}
											</Badge>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Button asChild variant="outline" size="sm">
													<Link href={`/dashboard/modules/${module.id}`}>
														<Edit className="h-4 w-4" />
													</Link>
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleDuplicate(module.id)}>
													<Copy className="h-4 w-4" />
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
															<AlertDialogTitle>Delete Module</AlertDialogTitle>
															<AlertDialogDescription>
																Are you sure you want to delete "{module.title}
																"? This action cannot be undone.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Cancel</AlertDialogCancel>
															<AlertDialogAction
																onClick={() => handleDelete(module.id)}
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
