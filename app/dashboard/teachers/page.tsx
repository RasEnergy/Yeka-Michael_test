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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Plus, Search, Edit, Trash2, Mail, Phone } from "lucide-react";
import Link from "next/link";

interface Teacher {
	id: string;
	employeeId: string;
	user: {
		firstName: string;
		lastName: string;
		email: string;
		phone?: string;
		avatar?: string;
	};
	branch: { name: string };
	qualification?: string;
	experience?: number;
	subjects: Array<{
		subject: { name: string; code: string };
	}>;
	isActive: boolean;
}

export default function TeachersPage() {
	const { user } = useAuth();
	const [teachers, setTeachers] = useState<Teacher[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		fetchTeachers();
	}, [user]);

	const fetchTeachers = async () => {
		console.log({
			userTeacher: user,
		});
		if (user?.role === "SUPER_ADMIN") {
			setTeachers([]); // or fetch all teachers if that's required
			setLoading(false);
			return;
		}

		if (!user?.branchId) {
			setLoading(false);
			return;
		}

		try {
			const response = await apiClient.get(`/teachers/branch/${user.branchId}`);
			if (response.success) {
				setTeachers(response.data.teachers);
			}
		} catch (error) {
			console.error("Failed to fetch teachers:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			const response = await apiClient.delete(`/teachers/${id}`);
			if (response.success) {
				setTeachers(teachers.filter((t) => t.id !== id));
			}
		} catch (error) {
			console.error("Failed to delete teacher:", error);
		}
	};

	const filteredTeachers = teachers.filter(
		(teacher) =>
			teacher.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			teacher.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			teacher.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
			teacher.user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
							Teachers
						</h1>
						<p className="text-muted-foreground">Manage your teaching staff</p>
					</div>
					<Button
						asChild
						className="bg-primary text-primary-foreground hover:bg-primary/90">
						<Link href="/dashboard/teachers/new">
							<Plus className="h-4 w-4 mr-2" />
							Add Teacher
						</Link>
					</Button>
				</div>

				<Card className="bg-card border-border">
					<CardHeader>
						<CardTitle className="text-card-foreground">All Teachers</CardTitle>
						<CardDescription>
							View and manage all teachers in your branch
						</CardDescription>
						<div className="flex items-center space-x-2">
							<Search className="h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search teachers..."
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
										Teacher
									</TableHead>
									<TableHead className="text-card-foreground">
										Employee ID
									</TableHead>
									<TableHead className="text-card-foreground">
										Contact
									</TableHead>
									<TableHead className="text-card-foreground">
										Qualification
									</TableHead>
									<TableHead className="text-card-foreground">
										Experience
									</TableHead>
									<TableHead className="text-card-foreground">
										Subjects
									</TableHead>
									<TableHead className="text-card-foreground">Status</TableHead>
									<TableHead className="text-card-foreground">
										Actions
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredTeachers.map((teacher) => (
									<TableRow key={teacher.id} className="hover:bg-muted/50">
										<TableCell className="text-card-foreground">
											<div className="flex items-center gap-3">
												<Avatar className="h-8 w-8">
													<AvatarImage
														src={teacher.user.avatar || "/placeholder.svg"}
													/>
													<AvatarFallback className="bg-primary text-primary-foreground">
														{teacher.user.firstName[0]}
														{teacher.user.lastName[0]}
													</AvatarFallback>
												</Avatar>
												<div>
													<div className="font-medium">
														{teacher.user.firstName} {teacher.user.lastName}
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell className="text-card-foreground">
											{teacher.employeeId}
										</TableCell>
										<TableCell className="text-card-foreground">
											<div className="flex flex-col gap-1">
												<div className="flex items-center gap-1 text-sm">
													<Mail className="h-3 w-3" />
													{teacher.user.email}
												</div>
												{teacher.user.phone && (
													<div className="flex items-center gap-1 text-sm">
														<Phone className="h-3 w-3" />
														{teacher.user.phone}
													</div>
												)}
											</div>
										</TableCell>
										<TableCell className="text-card-foreground">
											{teacher.qualification || "N/A"}
										</TableCell>
										<TableCell className="text-card-foreground">
											{teacher.experience
												? `${teacher.experience} years`
												: "N/A"}
										</TableCell>
										<TableCell className="text-card-foreground">
											{teacher.subjects.length > 0 ? (
												<div className="flex flex-wrap gap-1">
													{teacher.subjects.slice(0, 2).map((ts, index) => (
														<Badge
															key={index}
															variant="outline"
															className="text-xs">
															{ts.subject.code}
														</Badge>
													))}
													{teacher.subjects.length > 2 && (
														<Badge variant="outline" className="text-xs">
															+{teacher.subjects.length - 2}
														</Badge>
													)}
												</div>
											) : (
												<span className="text-muted-foreground">
													No subjects
												</span>
											)}
										</TableCell>
										<TableCell>
											<Badge
												variant={teacher.isActive ? "default" : "secondary"}>
												{teacher.isActive ? "Active" : "Inactive"}
											</Badge>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Button asChild variant="outline" size="sm">
													<Link href={`/dashboard/teachers/${teacher.id}/edit`}>
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
																Delete Teacher
															</AlertDialogTitle>
															<AlertDialogDescription>
																Are you sure you want to delete "
																{teacher.user.firstName} {teacher.user.lastName}
																"? This action cannot be undone.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Cancel</AlertDialogCancel>
															<AlertDialogAction
																onClick={() => handleDelete(teacher.id)}
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
