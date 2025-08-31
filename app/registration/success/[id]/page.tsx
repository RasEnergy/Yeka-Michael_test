"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	CheckCircle,
	Download,
	MessageSquare,
	User,
	Phone,
	Mail,
	School,
	Calendar,
	FileText,
} from "lucide-react";

interface Registration {
	id: string;
	registrationNumber: string;
	status: string;
	paymentOption: string;
	totalAmount: number;
	completedAt: string;
	student: {
		studentId: string;
		user: {
			firstName: string;
			lastName: string;
			email: string;
			phone?: string;
		};
		parents: Array<{
			parent: {
				user: {
					firstName: string;
					lastName: string;
					phone: string;
				};
			};
		}>;
	};
	branch: {
		name: string;
		code: string;
	};
}

export default function RegistrationSuccessPage({
	params,
}: {
	params: { id: string };
}) {
	const [registration, setRegistration] = useState<Registration | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchRegistration();
	}, [params.id]);

	const fetchRegistration = async () => {
		try {
			const response = await fetch(
				`/api/registration/payment?registrationId=${params.id}`
			);
			const data = await response.json();

			if (response.ok) {
				setRegistration(data.registration);
			}
		} catch (error) {
			console.error("Failed to fetch registration:", error);
		} finally {
			setLoading(false);
		}
	};

	const getPaymentOptionLabel = (option: string) => {
		switch (option) {
			case "REGISTRATION_MONTHLY":
				return "Registration + Monthly Fee";
			case "REGISTRATION_QUARTERLY":
				return "Registration + Quarterly Fee";
			default:
				return "Registration Fee";
		}
	};

	if (loading || !registration) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<p>Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
			<div className="max-w-2xl mx-auto space-y-6">
				{/* Success Header */}
				<div className="text-center">
					<div className="flex justify-center mb-4">
						<div className="p-4 bg-green-100 rounded-full">
							<CheckCircle className="h-12 w-12 text-green-600" />
						</div>
					</div>
					<h1 className="text-3xl font-bold text-green-800 mb-2">
						Registration Successful!
					</h1>
					<p className="text-muted-foreground">
						Payment completed and SMS notification sent to parent
					</p>
				</div>

				{/* Registration Details */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<School className="h-5 w-5" />
							Registration Details
						</CardTitle>
						<CardDescription>
							Registration completed on{" "}
							{new Date(registration.completedAt).toLocaleDateString()}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Student Info */}
						<div className="flex items-center gap-4">
							<Avatar className="h-16 w-16">
								<AvatarImage src="/user.png" alt="Student" />
								<AvatarFallback className="text-lg">
									{registration.student.user.firstName[0]}
									{registration.student.user.lastName[0]}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1">
								<h3 className="font-semibold text-lg">
									{registration.student.user.firstName}{" "}
									{registration.student.user.lastName}
								</h3>
								<p className="text-sm text-muted-foreground">
									Student ID: {registration.student.studentId}
								</p>
								<div className="flex gap-2 mt-1">
									<Badge variant="outline">{registration.branch.name}</Badge>
									<Badge variant="default" className="bg-green-600">
										Registered
									</Badge>
								</div>
							</div>
						</div>

						<Separator />

						{/* Registration Information */}
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-3">
								<h4 className="font-medium">Registration Information</h4>
								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span className="text-muted-foreground">
											Registration #:
										</span>
										<span className="font-mono">
											{registration.registrationNumber}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Branch:</span>
										<span>{registration.branch.name}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Status:</span>
										<Badge variant="default" className="bg-green-600">
											{registration.status.replace("_", " ")}
										</Badge>
									</div>
								</div>
							</div>

							<div className="space-y-3">
								<h4 className="font-medium">Payment Information</h4>
								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span className="text-muted-foreground">
											Payment Option:
										</span>
										<span>
											{getPaymentOptionLabel(registration.paymentOption)}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Amount Paid:</span>
										<span className="font-semibold">
											ETB {registration.totalAmount.toLocaleString()}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Payment Date:</span>
										<span>
											{new Date(registration.completedAt).toLocaleDateString()}
										</span>
									</div>
								</div>
							</div>
						</div>

						<Separator />

						{/* Contact Information */}
						<div className="space-y-3">
							<h4 className="font-medium">Contact Information</h4>
							<div className="grid gap-3 md:grid-cols-2">
								<div className="space-y-2">
									<p className="text-sm font-medium">Student</p>
									<div className="space-y-1 text-sm">
										<div className="flex items-center gap-2">
											<Mail className="h-3 w-3 text-muted-foreground" />
											<span>{registration.student.user.email}</span>
										</div>
										{registration.student.user.phone && (
											<div className="flex items-center gap-2">
												<Phone className="h-3 w-3 text-muted-foreground" />
												<span>{registration.student.user.phone}</span>
											</div>
										)}
									</div>
								</div>

								{registration.student.parents.length > 0 && (
									<div className="space-y-2">
										<p className="text-sm font-medium">Parent/Guardian</p>
										<div className="space-y-1 text-sm">
											<p>
												{registration.student.parents[0].parent.user.firstName}{" "}
												{registration.student.parents[0].parent.user.lastName}
											</p>
											<div className="flex items-center gap-2">
												<Phone className="h-3 w-3 text-muted-foreground" />
												<span>
													{registration.student.parents[0].parent.user.phone}
												</span>
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Next Steps */}
				<Card>
					<CardHeader>
						<CardTitle>Next Steps</CardTitle>
						<CardDescription>
							What happens next in the enrollment process
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-start gap-3">
							<div className="p-2 bg-blue-100 rounded-full">
								<MessageSquare className="h-4 w-4 text-blue-600" />
							</div>
							<div>
								<h4 className="font-medium">SMS Notification Sent</h4>
								<p className="text-sm text-muted-foreground">
									A confirmation SMS has been sent to the parent's phone number
									with registration details.
								</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<div className="p-2 bg-orange-100 rounded-full">
								<User className="h-4 w-4 text-orange-600" />
							</div>
							<div>
								<h4 className="font-medium">Awaiting Enrollment</h4>
								<p className="text-sm text-muted-foreground">
									The registrar will now officially enroll the student in the
									selected class. You will receive another notification once
									enrollment is complete.
								</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<div className="p-2 bg-green-100 rounded-full">
								<Calendar className="h-4 w-4 text-green-600" />
							</div>
							<div>
								<h4 className="font-medium">Class Schedule</h4>
								<p className="text-sm text-muted-foreground">
									Once enrolled, you will receive the class schedule and
									important dates for the academic year.
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row gap-4">
					<Button className="flex-1 bg-transparent" variant="outline">
						<Download className="mr-2 h-4 w-4" />
						Download Receipt
					</Button>
					<Button className="flex-1 bg-transparent" variant="outline">
						<FileText className="mr-2 h-4 w-4" />
						View Invoice
					</Button>
					<Link href="/dashboard" className="flex-1">
						<Button className="w-full">
							<School className="mr-2 h-4 w-4" />
							Go to Dashboard
						</Button>
					</Link>
				</div>

				{/* Important Notice */}
				<Card className="border-blue-200 bg-blue-50">
					<CardContent className="pt-6">
						<div className="flex items-start gap-3">
							<div className="p-2 bg-blue-100 rounded-full">
								<School className="h-4 w-4 text-blue-600" />
							</div>
							<div>
								<h4 className="font-medium text-blue-800">Important Notice</h4>
								<p className="text-sm text-blue-700 mt-1">
									Please keep this registration number for your records. You may
									need it for future reference. If you have any questions,
									please contact the school administration.
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
