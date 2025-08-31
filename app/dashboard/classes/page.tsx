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
import { Plus, Search, Edit, Trash2, Users } from "lucide-react";
import Link from "next/link";

interface Class {
	id: string;
	name: string;
	code: string;
	grade: { name: string; level: number };
	branch: { name: string };
	academicYear: { year: string };
	capacity?: number;
	_count: { enrollments: number };
	isActive: boolean;
}

export default function ClassesPage() {
	const { user } = useAuth();
	const [classes, setClasses] = useState<Class[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [deleteId, setDeleteId] = useState<string | null>(null);

	useEffect(() => {
		fetchClasses();
	}, [user]);

	const fetchClasses = async () => {
		if (!user?.branchId) return;

		try {
			const response = await apiClient.get(`/classes/branch/${user.branchId}`);
			console.log({
				classesData: response.data.classes,
			});
			if (response.success) {
				setClasses(response.data.classes);
			}
		} catch (error) {
			console.error("Failed to fetch classes:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			const response = await apiClient.delete(`/classes/${id}`);
			if (response.success) {
				setClasses(classes.filter((c) => c.id !== id));
				setDeleteId(null);
			}
		} catch (error) {
			console.error("Failed to delete class:", error);
		}
	};

	const filteredClasses = classes.filter(
		(cls) =>
			cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			cls.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
			cls.grade.name.toLowerCase().includes(searchTerm.toLowerCase())
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
						<h1 className="text-3xl font-bold text-foreground mb-2">Classes</h1>
						<p className="text-muted-foreground">Manage your school classes</p>
					</div>
					<Button
						asChild
						className="bg-primary text-primary-foreground hover:bg-primary/90">
						<Link href="/dashboard/classes/new">
							<Plus className="h-4 w-4 mr-2" />
							Add Class
						</Link>
					</Button>
				</div>

				<Card className="bg-card border-border">
					<CardHeader>
						<CardTitle className="text-card-foreground">All Classes</CardTitle>
						<CardDescription>
							View and manage all classes in your branch
						</CardDescription>
						<div className="flex items-center space-x-2">
							<Search className="h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search classes..."
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
										Class Name
									</TableHead>
									{/* <TableHead className="text-card-foreground">Code</TableHead> */}
									<TableHead className="text-card-foreground">Grade</TableHead>
									<TableHead className="text-card-foreground">
										Academic Year
									</TableHead>
									<TableHead className="text-card-foreground">
										Capacity
									</TableHead>
									<TableHead className="text-card-foreground">
										Enrolled
									</TableHead>
									<TableHead className="text-card-foreground">Status</TableHead>
									<TableHead className="text-card-foreground">
										Actions
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredClasses.map((cls) => (
									<TableRow key={cls.id} className="hover:bg-muted/50">
										<TableCell className="font-medium text-card-foreground">
											{cls.name} - Section {(cls as any).section}
										</TableCell>
										{/* <TableCell className="text-card-foreground">
											{cls.code}
										</TableCell> */}
										<TableCell className="text-card-foreground">
											{cls.grade.name}
										</TableCell>
										<TableCell className="text-card-foreground">
											{(cls as any).academicYear.name}
										</TableCell>
										<TableCell className="text-card-foreground">
											{cls.capacity || "N/A"}
										</TableCell>
										<TableCell className="text-card-foreground">
											<div className="flex items-center gap-1">
												<Users className="h-4 w-4" />
												{cls._count.enrollments}
											</div>
										</TableCell>
										<TableCell>
											<Badge variant={cls.isActive ? "default" : "secondary"}>
												{cls.isActive ? "Active" : "Inactive"}
											</Badge>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Button asChild variant="outline" size="sm">
													<Link href={`/dashboard/classes/${cls.id}/edit`}>
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
															<AlertDialogTitle>Delete Class</AlertDialogTitle>
															<AlertDialogDescription>
																Are you sure you want to delete "{cls.name}"?
																This action cannot be undone.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Cancel</AlertDialogCancel>
															<AlertDialogAction
																onClick={() => handleDelete(cls.id)}
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
