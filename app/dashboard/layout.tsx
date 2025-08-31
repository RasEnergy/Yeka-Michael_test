"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Menu,
	Home,
	Users,
	GraduationCap,
	BookOpen,
	CreditCard,
	FileText,
	MessageSquare,
	BarChart3,
	Settings,
	LogOut,
	School,
	Building2,
	Calendar,
	Layers,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	role: string;
	schoolId: string;
	branchId?: string;
}

const navigation = [
	{ name: "Dashboard", href: "/dashboard", icon: Home },
	{ name: "Students", href: "/dashboard/students", icon: Users },
	{ name: "Classes", href: "/dashboard/classes", icon: BookOpen },
	{
		name: "Registration",
		href: "/dashboard/registration-payments",
		icon: CreditCard,
	},
	{ name: "Invoices", href: "/dashboard/invoices", icon: FileText },
	{ name: "Enrollment", href: "/dashboard/enrollment", icon: Users },
	{ name: "Teachers", href: "/dashboard/teachers", icon: GraduationCap },
	{ name: "Subjects", href: "/dashboard/subjects", icon: GraduationCap },
	{ name: "Lessons", href: "/dashboard/lessons", icon: Calendar },
	{ name: "Modules", href: "/dashboard/modules", icon: Layers },

	// { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
	// { name: "SMS", href: "/dashboard/sms", icon: MessageSquare },
	// { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
	// { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [user, setUser] = useState<User | null>(null);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const router = useRouter();
	const { toast } = useToast();

	useEffect(() => {
		const userData = localStorage.getItem("user");
		if (userData) {
			setUser(JSON.parse(userData));
		} else {
			router.push("/login");
		}
	}, [router]);

	const handleLogout = async () => {
		try {
			await fetch("/api/auth/logout", { method: "POST" });
			localStorage.removeItem("user");
			toast({
				title: "Logged out",
				description: "You have been successfully logged out.",
			});
			router.push("/login");
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	if (!user) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				Loading...
			</div>
		);
	}

	const Sidebar = ({ className = "" }: { className?: string }) => {
		const role = user?.role;

		const getAccessibleLinks = () => {
			if (role === "SUPER_ADMIN" || role === "BRANCH_ADMIN") {
				return navigation;
			}

			if (role === "REGISTRAR") {
				return navigation;
				// return navigation.filter(
				// 	(item) => !["Classes", "Teachers", "Enrollment"].includes(item.name)
				// );
			}

			if (role === "CASHIER") {
				return navigation.filter((item) => item.name === "Invoices");
			}

			// Default: no access
			return [];
		};

		const filteredNavigation = getAccessibleLinks();

		return (
			<div className={`flex flex-col h-full ${className}`}>
				<div className="flex items-center gap-2 px-6 py-4 border-b">
					<Image
						src="/logo2.jpg"
						alt="Yeka Michael Schools Logo"
						width={40}
						height={40}
					/>
					<div>
						<h1 className="font-bold text-lg">Yeka Michael</h1>
						<p className="text-sm text-muted-foreground">School Management</p>
					</div>
				</div>

				<nav className="flex-1 px-4 py-6 space-y-2">
					{filteredNavigation.map((item) => (
						<Link
							key={item.name}
							href={item.href}
							className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
							onClick={() => setSidebarOpen(false)}>
							<item.icon className="h-4 w-4" />
							{item.name}
						</Link>
					))}
				</nav>
			</div>
		);
	};

	return (
		<div className="flex h-screen bg-background">
			{/* Desktop Sidebar */}
			<div className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r">
				<Sidebar />
			</div>

			{/* Mobile Sidebar */}
			<Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
				<SheetContent side="left" className="p-0 w-64">
					<Sidebar />
				</SheetContent>
			</Sheet>

			{/* Main Content */}
			<div className="flex-1 flex flex-col overflow-hidden">
				{/* Header */}
				<header className="flex items-center justify-between px-6 py-4 border-b bg-background">
					<div className="flex items-center gap-4">
						<Sheet>
							<SheetTrigger asChild>
								<Button variant="ghost" size="icon" className="lg:hidden">
									<Menu className="h-5 w-5" />
								</Button>
							</SheetTrigger>
						</Sheet>

						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Building2 className="h-4 w-4" />
							<span className="capitalize">
								{user.role.toLowerCase().replace("_", " ")}
							</span>
						</div>
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="relative h-8 w-8 rounded-full">
								<Avatar className="h-8 w-8">
									<AvatarImage
										src="/user.png"
										alt={`${user.firstName} ${user.lastName}`}
									/>
									<AvatarFallback>
										{user.firstName[0]}
										{user.lastName[0]}
									</AvatarFallback>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-56" align="end" forceMount>
							<DropdownMenuLabel className="font-normal">
								<div className="flex flex-col space-y-1">
									<p className="text-sm font-medium leading-none">
										{user.firstName} {user.lastName}
									</p>
									<p className="text-xs leading-none text-muted-foreground">
										{user.email}
									</p>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={handleLogout}>
								<LogOut className="mr-2 h-4 w-4" />
								<span>Log out</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</header>

				{/* Page Content */}
				<main className="flex-1 overflow-auto p-6">{children}</main>
			</div>
		</div>
	);
}
