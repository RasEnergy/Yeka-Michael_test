"use client";

import type React from "react";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { login, isLoading } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsSubmitting(true);

		try {
			await login({ email, password });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Login failed");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>School Management System</CardTitle>
					<CardDescription>Sign in to your account</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={isSubmitting || isLoading}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								disabled={isSubmitting || isLoading}
							/>
						</div>
						{error && (
							<Alert variant="destructive">
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}
						<Button
							type="submit"
							className="w-full"
							disabled={isSubmitting || isLoading}>
							{isSubmitting ? "Signing in..." : "Sign in"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

// "use client";

// import type React from "react";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
// 	Card,
// 	CardContent,
// 	CardDescription,
// 	CardHeader,
// 	CardTitle,
// } from "@/components/ui/card";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Loader2, School } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import Image from "next/image";

// export default function LoginPage() {
// 	const [email, setEmail] = useState("");
// 	const [password, setPassword] = useState("");
// 	const [isLoading, setIsLoading] = useState(false);
// 	const [error, setError] = useState("");
// 	const router = useRouter();
// 	const { toast } = useToast();

// 	const handleSubmit = async (e: React.FormEvent) => {
// 		e.preventDefault();
// 		setIsLoading(true);
// 		setError("");

// 		try {
// 			const response = await fetch("/api/auth/login", {
// 				method: "POST",
// 				headers: {
// 					"Content-Type": "application/json",
// 				},
// 				body: JSON.stringify({ email, password }),
// 			});

// 			const data = await response.json();

// 			if (!response.ok) {
// 				throw new Error(data.error || "Login failed");
// 			}

// 			toast({
// 				title: "Login successful",
// 				description: "Welcome back!",
// 			});

// 			// Store user data in localStorage for client-side access
// 			localStorage.setItem("user", JSON.stringify(data.user));

// 			router.push("/dashboard");
// 		} catch (err) {
// 			setError(err instanceof Error ? err.message : "An error occurred");
// 		} finally {
// 			setIsLoading(false);
// 		}
// 	};

// 	return (
// 		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
// 			<Card className="w-full max-w-md">
// 				<CardHeader className="text-center">
// 					<div className="flex justify-center mb-4">
// 						<Image
// 							src="/logo2.jpg"
// 							alt="Yeka Michael Schools Logo"
// 							width={64}
// 							height={64}
// 							// className="rounded-full"
// 						/>
// 					</div>
// 					<CardTitle className="text-2xl font-bold">
// 						Yeka Michael Schools
// 					</CardTitle>
// 					<CardDescription>
// 						Sign in to your school management account
// 					</CardDescription>
// 				</CardHeader>
// 				<CardContent>
// 					<form onSubmit={handleSubmit} className="space-y-4">
// 						{error && (
// 							<Alert variant="destructive">
// 								<AlertDescription>{error}</AlertDescription>
// 							</Alert>
// 						)}

// 						<div className="space-y-2">
// 							<Label htmlFor="email">Email</Label>
// 							<Input
// 								id="email"
// 								type="email"
// 								placeholder="Enter your email"
// 								value={email}
// 								onChange={(e) => setEmail(e.target.value)}
// 								required
// 								disabled={isLoading}
// 							/>
// 						</div>

// 						<div className="space-y-2">
// 							<Label htmlFor="password">Password</Label>
// 							<Input
// 								id="password"
// 								type="password"
// 								placeholder="Enter your password"
// 								value={password}
// 								onChange={(e) => setPassword(e.target.value)}
// 								required
// 								disabled={isLoading}
// 							/>
// 						</div>

// 						<Button type="submit" className="w-full" disabled={isLoading}>
// 							{isLoading ? (
// 								<>
// 									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
// 									Signing in...
// 								</>
// 							) : (
// 								"Sign In"
// 							)}
// 						</Button>
// 					</form>
// 				</CardContent>
// 			</Card>
// 		</div>
// 	);
// }
