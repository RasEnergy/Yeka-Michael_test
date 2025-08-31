"use client";

import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, GraduationCap, Plus } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
	const { user } = useAuth();

	if (!user) {
		return <div>Loading...</div>;
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-foreground mb-2">
						Welcome back, {user.firstName}
					</h1>
					<p className="text-muted-foreground">
						Manage your school's classes, subjects, and teachers
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Card className="bg-card border-border hover:shadow-lg transition-shadow">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-card-foreground">
								Classes
							</CardTitle>
							<GraduationCap className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-card-foreground mb-2">
								12
							</div>
							<p className="text-xs text-muted-foreground mb-4">
								Active classes this semester
							</p>
							<div className="flex gap-2">
								<Button
									asChild
									size="sm"
									className="bg-primary text-primary-foreground hover:bg-primary/90">
									<Link href="/dashboard/classes">
										<Plus className="h-4 w-4 mr-1" />
										Manage
									</Link>
								</Button>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-card border-border hover:shadow-lg transition-shadow">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-card-foreground">
								Subjects
							</CardTitle>
							<BookOpen className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-card-foreground mb-2">
								8
							</div>
							<p className="text-xs text-muted-foreground mb-4">
								Available subjects
							</p>
							<div className="flex gap-2">
								<Button
									asChild
									size="sm"
									className="bg-primary text-primary-foreground hover:bg-primary/90">
									<Link href="/dashboard/subjects">
										<Plus className="h-4 w-4 mr-1" />
										Manage
									</Link>
								</Button>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-card border-border hover:shadow-lg transition-shadow">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-card-foreground">
								Teachers
							</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-card-foreground mb-2">
								15
							</div>
							<p className="text-xs text-muted-foreground mb-4">
								Active teaching staff
							</p>
							<div className="flex gap-2">
								<Button
									asChild
									size="sm"
									className="bg-primary text-primary-foreground hover:bg-primary/90">
									<Link href="/dashboard/teachers">
										<Plus className="h-4 w-4 mr-1" />
										Manage
									</Link>
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
// "use client";

// import { useEffect, useState } from "react";
// import {
// 	Card,
// 	CardContent,
// 	CardDescription,
// 	CardHeader,
// 	CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import {
// 	Users,
// 	GraduationCap,
// 	FileText,
// 	CreditCard,
// 	TrendingUp,
// 	AlertCircle,
// 	RefreshCw,
// 	Calendar,
// 	BookOpen,
// 	DollarSign,
// 	Activity,
// } from "lucide-react";

// interface DashboardStats {
// 	totalStudents: number;
// 	totalTeachers: number;
// 	pendingInvoices: number;
// 	totalRevenue: number;
// 	recentEnrollments: number;
// 	overduePayments: number;
// 	activeClasses: number;
// 	monthlyGrowth: number;
// }

// interface RecentActivity {
// 	id: string;
// 	type: "enrollment" | "payment" | "invoice" | "meeting";
// 	title: string;
// 	description: string;
// 	timestamp: string;
// 	amount?: number;
// }

// interface Alert {
// 	id: string;
// 	type: "warning" | "error" | "info";
// 	title: string;
// 	description: string;
// 	priority: "high" | "medium" | "low";
// }

// export default function DashboardPage() {
// 	const [stats, setStats] = useState<DashboardStats | null>(null);
// 	const [activities, setActivities] = useState<RecentActivity[]>([]);
// 	const [alerts, setAlerts] = useState<Alert[]>([]);
// 	const [loading, setLoading] = useState(true);
// 	const [error, setError] = useState<string | null>(null);
// 	const [refreshing, setRefreshing] = useState(false);

// 	const fetchDashboardData = async () => {
// 		try {
// 			setError(null);

// 			// Replace these URLs with your actual API endpoints
// 			const [statsResponse, activitiesResponse, alertsResponse] =
// 				await Promise.all([
// 					fetch("/api/dashboard/stats"),
// 					fetch("/api/dashboard/activities"),
// 					fetch("/api/dashboard/alerts"),
// 				]);

// 			// Handle API errors
// 			if (!statsResponse.ok || !activitiesResponse.ok || !alertsResponse.ok) {
// 				throw new Error("Failed to fetch dashboard data");
// 			}

// 			const [statsData, activitiesData, alertsData] = await Promise.all([
// 				statsResponse.json(),
// 				activitiesResponse.json(),
// 				alertsResponse.json(),
// 			]);

// 			setStats(statsData);
// 			setActivities(activitiesData);
// 			setAlerts(alertsData);
// 		} catch (err) {
// 			// Fallback to mock data for demo purposes
// 			console.warn("API not available, using mock data:", err);

// 			// Mock data - remove this when you have real APIs
// 			setStats({
// 				totalStudents: 6,
// 				totalTeachers: 2,
// 				pendingInvoices: 23,
// 				totalRevenue: 12500,
// 				recentEnrollments: 2,
// 				overduePayments: 8,
// 				activeClasses: 45,
// 				monthlyGrowth: 12.5,
// 			});

// 			setActivities([
// 				{
// 					id: "1",
// 					type: "enrollment",
// 					title: "15 new student enrollments",
// 					description: "In the last 7 days",
// 					timestamp: "2024-01-10T10:00:00Z",
// 				},
// 				{
// 					id: "2",
// 					type: "payment",
// 					title: "Payment received",
// 					description: "Grade 10 tuition fees",
// 					timestamp: "2024-01-10T09:30:00Z",
// 					amount: 45000,
// 				},
// 				{
// 					id: "3",
// 					type: "invoice",
// 					title: "12 invoices generated",
// 					description: "Monthly fee invoices",
// 					timestamp: "2024-01-10T08:00:00Z",
// 				},
// 			]);

// 			setAlerts([
// 				{
// 					id: "1",
// 					type: "warning",
// 					title: "8 overdue payments",
// 					description: "Total: ETB 12,500",
// 					priority: "high",
// 				},
// 				{
// 					id: "2",
// 					type: "error",
// 					title: "Fee structure update needed",
// 					description: "For next academic year",
// 					priority: "high",
// 				},
// 				{
// 					id: "3",
// 					type: "info",
// 					title: "Parent-teacher meeting",
// 					description: "Scheduled for next week",
// 					priority: "medium",
// 				},
// 			]);
// 		} finally {
// 			setLoading(false);
// 			setRefreshing(false);
// 		}
// 	};

// 	useEffect(() => {
// 		fetchDashboardData();
// 	}, []);

// 	const handleRefresh = async () => {
// 		setRefreshing(true);
// 		await fetchDashboardData();
// 	};

// 	const statCards = stats
// 		? [
// 				{
// 					title: "Total Students",
// 					value: stats.totalStudents.toLocaleString(),
// 					description: `+${stats.recentEnrollments} new this month`,
// 					icon: Users,
// 					color: "from-blue-500 to-blue-600",
// 					textColor: "text-blue-600",
// 					bgColor: "bg-blue-50",
// 					change: `+${stats.monthlyGrowth}%`,
// 				},
// 				{
// 					title: "Total Teachers",
// 					value: stats.totalTeachers.toLocaleString(),
// 					description: "Active teaching staff",
// 					icon: GraduationCap,
// 					color: "from-green-500 to-green-600",
// 					textColor: "text-green-600",
// 					bgColor: "bg-green-50",
// 					change: "+2.1%",
// 				},
// 				{
// 					title: "Active Classes",
// 					value: stats.activeClasses.toLocaleString(),
// 					description: "Currently running",
// 					icon: BookOpen,
// 					color: "from-purple-500 to-purple-600",
// 					textColor: "text-purple-600",
// 					bgColor: "bg-purple-50",
// 					change: "+5.4%",
// 				},
// 				{
// 					title: "Total Revenue",
// 					value: `ETB ${stats.totalRevenue.toLocaleString()}`,
// 					description: "This academic year",
// 					icon: DollarSign,
// 					color: "from-orange-500 to-orange-600",
// 					textColor: "text-orange-600",
// 					bgColor: "bg-orange-50",
// 					change: "+18.2%",
// 				},
// 		  ]
// 		: [];

// 	const getActivityIcon = (type: RecentActivity["type"]) => {
// 		switch (type) {
// 			case "enrollment":
// 				return Users;
// 			case "payment":
// 				return CreditCard;
// 			case "invoice":
// 				return FileText;
// 			case "meeting":
// 				return Calendar;
// 			default:
// 				return Activity;
// 		}
// 	};

// 	const getAlertColor = (type: Alert["type"]) => {
// 		switch (type) {
// 			case "error":
// 				return "border-red-500 bg-red-50";
// 			case "warning":
// 				return "border-orange-500 bg-orange-50";
// 			case "info":
// 				return "border-blue-500 bg-blue-50";
// 			default:
// 				return "border-gray-500 bg-gray-50";
// 		}
// 	};

// 	if (loading) {
// 		return (
// 			<div className="space-y-8 p-6">
// 				<div className="space-y-2">
// 					<Skeleton className="h-8 w-64" />
// 					<Skeleton className="h-4 w-96" />
// 				</div>
// 				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
// 					{[1, 2, 3, 4].map((i) => (
// 						<Card key={i} className="overflow-hidden">
// 							<CardHeader className="pb-3">
// 								<div className="flex items-center justify-between">
// 									<Skeleton className="h-4 w-24" />
// 									<Skeleton className="h-4 w-4 rounded" />
// 								</div>
// 							</CardHeader>
// 							<CardContent>
// 								<Skeleton className="h-8 w-20 mb-2" />
// 								<Skeleton className="h-3 w-32" />
// 							</CardContent>
// 						</Card>
// 					))}
// 				</div>
// 			</div>
// 		);
// 	}

// 	return (
// 		<div className="space-y-8 p-6 bg-gradient-to-br min-h-screen">
// 			{/* Header */}
// 			<div className="flex items-center justify-between shadow-lg">
// 				<div className="space-y-1">
// 					<h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
// 						Dashboard
// 					</h1>
// 					<p className="text-lg text-muted-foreground">
// 						Welcome to Yeka Michael School Management System
// 					</p>
// 				</div>
// 				<Button
// 					onClick={handleRefresh}
// 					disabled={refreshing}
// 					variant="outline"
// 					className="gap-2 bg-transparent">
// 					<RefreshCw
// 						className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
// 					/>
// 					Refresh
// 				</Button>
// 			</div>

// 			{/* Stats Cards */}
// 			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
// 				{statCards.map((card, index) => (
// 					<Card
// 						key={index}
// 						className="overflow-hidden border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
// 						<div className={`h-2 bg-gradient-to-r ${card.color}`} />
// 						<CardHeader className="pb-3">
// 							<div className="flex items-center justify-between">
// 								<CardTitle className="text-sm font-medium text-muted-foreground">
// 									{card.title}
// 								</CardTitle>
// 								<div className={`p-2 rounded-lg ${card.bgColor}`}>
// 									<card.icon className={`h-5 w-5 ${card.textColor}`} />
// 								</div>
// 							</div>
// 						</CardHeader>
// 						<CardContent className="space-y-2">
// 							<div className="flex items-center justify-between">
// 								<div className="text-3xl font-bold">{card.value}</div>
// 								<Badge
// 									variant="secondary"
// 									className="text-green-600 bg-green-100">
// 									{card.change}
// 								</Badge>
// 							</div>
// 							<p className="text-sm text-muted-foreground">
// 								{card.description}
// 							</p>
// 						</CardContent>
// 					</Card>
// 				))}
// 			</div>

// 			{/* Main Content Grid */}
// 			<div className="grid gap-8 lg:grid-cols-3">
// 				{/* Recent Activity - Takes 2 columns */}
// 				<Card className="lg:col-span-2 border-0 shadow-lg">
// 					<CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
// 						<CardTitle className="flex items-center gap-2">
// 							<TrendingUp className="h-5 w-5" />
// 							Recent Activity
// 						</CardTitle>
// 						<CardDescription className="text-blue-100">
// 							Latest updates from your school
// 						</CardDescription>
// 					</CardHeader>
// 					<CardContent className="p-6">
// 						<div className="space-y-4">
// 							{activities.map((activity) => {
// 								const IconComponent = getActivityIcon(activity.type);
// 								return (
// 									<div
// 										key={activity.id}
// 										className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
// 										<div
// 											className={`p-3 rounded-full ${
// 												activity.type === "enrollment"
// 													? "bg-blue-100"
// 													: activity.type === "payment"
// 													? "bg-green-100"
// 													: activity.type === "invoice"
// 													? "bg-purple-100"
// 													: "bg-orange-100"
// 											}`}>
// 											<IconComponent
// 												className={`h-5 w-5 ${
// 													activity.type === "enrollment"
// 														? "text-blue-600"
// 														: activity.type === "payment"
// 														? "text-green-600"
// 														: activity.type === "invoice"
// 														? "text-purple-600"
// 														: "text-orange-600"
// 												}`}
// 											/>
// 										</div>
// 										<div className="flex-1">
// 											<div className="flex items-center justify-between">
// 												<p className="font-medium">{activity.title}</p>
// 												{activity.amount && (
// 													<Badge variant="outline" className="text-green-600">
// 														ETB {activity.amount.toLocaleString()}
// 													</Badge>
// 												)}
// 											</div>
// 											<p className="text-sm text-muted-foreground">
// 												{activity.description}
// 											</p>
// 										</div>
// 									</div>
// 								);
// 							})}
// 						</div>
// 					</CardContent>
// 				</Card>

// 				{/* Alerts & Reminders */}
// 				<Card className="border-0 shadow-lg">
// 					<CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
// 						<CardTitle className="flex items-center gap-2">
// 							<AlertCircle className="h-5 w-5" />
// 							Alerts & Reminders
// 						</CardTitle>
// 						<CardDescription className="text-orange-100">
// 							Items requiring attention
// 						</CardDescription>
// 					</CardHeader>
// 					<CardContent className="p-6">
// 						<div className="space-y-4">
// 							{alerts.map((alert) => (
// 								<div
// 									key={alert.id}
// 									className={`p-4 rounded-lg border-l-4 ${getAlertColor(
// 										alert.type
// 									)} hover:shadow-md transition-shadow`}>
// 									<div className="flex items-start justify-between">
// 										<div className="flex-1">
// 											<div className="flex items-center gap-2 mb-1">
// 												<p className="font-medium">{alert.title}</p>
// 												<Badge
// 													variant={
// 														alert.priority === "high"
// 															? "destructive"
// 															: "secondary"
// 													}
// 													className="text-xs">
// 													{alert.priority}
// 												</Badge>
// 											</div>
// 											<p className="text-sm text-muted-foreground">
// 												{alert.description}
// 											</p>
// 										</div>
// 									</div>
// 								</div>
// 							))}
// 						</div>
// 					</CardContent>
// 				</Card>
// 			</div>

// 			{/* Quick Stats Row */}
// 			<div className="grid gap-6 md:grid-cols-3">
// 				<Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
// 					<CardContent className="p-6">
// 						<div className="flex items-center justify-between">
// 							<div>
// 								<p className="text-indigo-100">Pending Invoices</p>
// 								<p className="text-3xl font-bold">{stats?.pendingInvoices}</p>
// 							</div>
// 							<FileText className="h-8 w-8 text-indigo-200" />
// 						</div>
// 					</CardContent>
// 				</Card>

// 				<Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-pink-600 text-white">
// 					<CardContent className="p-6">
// 						<div className="flex items-center justify-between">
// 							<div>
// 								<p className="text-red-100">Overdue Payments</p>
// 								<p className="text-3xl font-bold">{stats?.overduePayments}</p>
// 							</div>
// 							<AlertCircle className="h-8 w-8 text-red-200" />
// 						</div>
// 					</CardContent>
// 				</Card>

// 				<Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-teal-600 text-white">
// 					<CardContent className="p-6">
// 						<div className="flex items-center justify-between">
// 							<div>
// 								<p className="text-green-100">Monthly Growth</p>
// 								<p className="text-3xl font-bold">+{stats?.monthlyGrowth}%</p>
// 							</div>
// 							<TrendingUp className="h-8 w-8 text-green-200" />
// 						</div>
// 					</CardContent>
// 				</Card>
// 			</div>
// 		</div>
// 	);
// }
