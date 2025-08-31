import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PaymentForm from "@/components/PaymentForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	GraduationCap,
	CheckCircle,
	Building,
	Phone,
	Mail,
} from "lucide-react";

interface PaymentPageProps {
	params: {
		invoiceId: string;
	};
}

export default async function PaymentPage({ params }: PaymentPageProps) {
	const invoice = await prisma.invoice.findUnique({
		where: { id: params.invoiceId },
		include: {
			student: {
				include: {
					user: true,
					parents: {
						include: {
							parent: {
								include: {
									user: true,
								},
							},
						},
					},
				},
			},
			branch: true,
			items: {
				include: {
					feeType: true,
				},
			},
			payments: {
				where: {
					status: {
						in: ["COMPLETED", "PENDING", "FAILED"],
					},
				},
			},
		},
	});

	if (!invoice) {
		notFound();
	}

	if (invoice.status === "PAID") {
		return (
			<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
				<Card className="w-full max-w-md shadow-lg border-0">
					<CardHeader className="text-center bg-green-50 rounded-t-lg">
						<div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
							<CheckCircle className="h-8 w-8 text-green-600" />
						</div>
						<CardTitle className="text-green-700 text-xl">
							Payment Completed
						</CardTitle>
					</CardHeader>
					<CardContent className="text-center py-6">
						<p className="text-slate-600 mb-4">
							This invoice has already been paid.
						</p>
						<Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
							PAID
						</Badge>
					</CardContent>
				</Card>
			</div>
		);
	}

	const parent = invoice.student.parents[0]?.parent;
	const finalAmount = invoice.finalAmount || invoice.totalAmount;

	return (
		<div className="min-h-screen bg-slate-50">
			<div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
				{/* Header */}
				<div className="text-center bg-white rounded-lg shadow-sm border border-slate-200 py-8 px-6">
					<div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
						<GraduationCap className="h-8 w-8 text-blue-600" />
					</div>
					<h1 className="text-3xl font-bold text-slate-900 mb-2">
						Yeka Michael Schools
					</h1>
					<p className="text-slate-600 text-lg">Complete Your Payment</p>
				</div>

				<div className="grid md:grid-cols-2 gap-8">
					{/* Invoice Details */}
					<Card className="shadow-sm border-slate-200">
						<CardHeader className="bg-slate-50 border-b border-slate-200">
							<CardTitle className="flex items-center text-slate-900">
								<GraduationCap className="mr-2 h-5 w-5 text-blue-600" />
								Invoice Details
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 py-6 bg-white shadow-lg">
							<div className="space-y-3">
								<div className="flex justify-between items-center">
									<span className="text-slate-600 font-medium">
										Invoice Number:
									</span>
									<span className="font-semibold text-slate-900">
										{invoice.invoiceNumber}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-slate-600 font-medium">Student:</span>
									<span className="font-semibold text-slate-900">
										{invoice.student.user.firstName}{" "}
										{invoice.student.user.lastName}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-slate-600 font-medium">
										Student ID:
									</span>
									<span className="font-semibold text-slate-900">
										{invoice.student.studentId}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-slate-600 font-medium">Branch:</span>
									<span className="font-semibold text-slate-900">
										{invoice.branch.name}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-slate-600 font-medium">Due Date:</span>
									<span className="font-semibold text-slate-900">
										{invoice.dueDate
											? new Date(invoice.dueDate).toLocaleDateString()
											: "N/A"}
									</span>
								</div>
							</div>

							<Separator className="bg-slate-200" />

							{/* Fee Breakdown */}
							<div className="space-y-3">
								<h4 className="font-semibold text-slate-900 text-lg">
									Fee Breakdown
								</h4>
								<div className="space-y-2">
									{invoice.items.map((item) => (
										<div
											key={item.id}
											className="flex justify-between items-center py-2">
											<span className="text-slate-600">
												{item.description}{" "}
												{item.quantity > 1 && `(x${item.quantity})`}
											</span>
											<span className="font-medium text-slate-900">
												ETB {Number(item.amount).toLocaleString()}
											</span>
										</div>
									))}
								</div>
							</div>

							<Separator className="bg-slate-200" />

							<div className="space-y-3">
								<div className="flex justify-between items-center">
									<span className="text-slate-600 font-medium">Subtotal:</span>
									<span className="font-semibold text-slate-900">
										ETB {Number(invoice.totalAmount).toLocaleString()}
									</span>
								</div>
								{invoice.discountAmount &&
									Number(invoice.discountAmount) > 0 && (
										<div className="flex justify-between items-center">
											<span className="text-green-600 font-medium">
												Discount:
											</span>
											<span className="font-semibold text-green-600">
												-ETB {Number(invoice.discountAmount).toLocaleString()}
											</span>
										</div>
									)}
								<Separator className="bg-slate-200" />
								<div className="flex justify-between items-center py-2 bg-blue-50 rounded-lg px-4">
									<span className="text-lg font-bold text-slate-900">
										Total Amount:
									</span>
									<span className="text-xl font-bold text-blue-700">
										ETB {Number(finalAmount).toLocaleString()}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Payment Form */}
					<div>
						<PaymentForm
							invoiceId={invoice.id}
							totalAmount={Number(finalAmount)}
							parentId={parent?.id || ""}
							branchId={invoice.branchId}
						/>
					</div>
				</div>

				{/* Contact Information */}
				<Card className="shadow-sm border-slate-200 bg-white shadow-lg">
					<CardContent className="py-6">
						<div className="text-center space-y-4">
							<div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
								<Building className="h-6 w-6 text-slate-600" />
							</div>
							<div>
								<p className="text-slate-600 mb-2">
									For payment assistance, contact your branch office:
								</p>
								<p className="font-semibold text-slate-900 text-lg mb-3">
									{invoice.branch.name}
								</p>
								<div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
									{invoice.branch.phone && (
										<div className="flex items-center gap-2 text-slate-600">
											<Phone className="h-4 w-4" />
											<span>{invoice.branch.phone}</span>
										</div>
									)}
									{invoice.branch.email && (
										<div className="flex items-center gap-2 text-slate-600">
											<Mail className="h-4 w-4" />
											<span>{invoice.branch.email}</span>
										</div>
									)}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
// import { notFound } from "next/navigation";
// import { prisma } from "@/lib/prisma";
// import PaymentForm from "@/components/PaymentForm";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { GraduationCap } from "lucide-react";

// interface PaymentPageProps {
// 	params: {
// 		invoiceId: string;
// 	};
// }

// export default async function PaymentPage({ params }: PaymentPageProps) {
// 	const invoice = await prisma.invoice.findUnique({
// 		where: { id: params.invoiceId },
// 		include: {
// 			student: {
// 				include: {
// 					user: true,
// 					parents: {
// 						include: {
// 							parent: {
// 								include: {
// 									user: true,
// 								},
// 							},
// 						},
// 					},
// 				},
// 			},
// 			branch: true,
// 			items: {
// 				include: {
// 					feeType: true,
// 				},
// 			},
// 			payments: {
// 				where: {
// 					status: {
// 						in: ["COMPLETED", "PENDING", "FAILED"],
// 					},
// 				},
// 			},
// 		},
// 	});

// 	if (!invoice) {
// 		notFound();
// 	}

// 	if (invoice.status === "PAID") {
// 		return (
// 			<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
// 				<Card className="w-full max-w-md">
// 					<CardHeader className="text-center">
// 						<CardTitle className="text-green-600">Payment Completed</CardTitle>
// 					</CardHeader>
// 					<CardContent className="text-center">
// 						<p>This invoice has already been paid.</p>
// 						<Badge variant="secondary" className="mt-2">
// 							PAID
// 						</Badge>
// 					</CardContent>
// 				</Card>
// 			</div>
// 		);
// 	}

// 	const parent = invoice.student.parents[0]?.parent;
// 	const finalAmount = invoice.finalAmount || invoice.totalAmount;

// 	return (
// 		<div className="min-h-screen bg-gray-50 py-8 px-4">
// 			<div className="max-w-4xl mx-auto space-y-6">
// 				{/* Header */}
// 				<div className="text-center">
// 					<h1 className="text-3xl font-bold text-gray-900">
// 						Yeka Michael Schools
// 					</h1>
// 					<p className="text-gray-600 mt-2">Complete Your Payment</p>
// 				</div>

// 				<div className="grid md:grid-cols-2 gap-6">
// 					{/* Invoice Details */}
// 					<Card>
// 						<CardHeader>
// 							<CardTitle className="flex items-center">
// 								<GraduationCap className="mr-2 h-5 w-5" />
// 								Invoice Details
// 							</CardTitle>
// 						</CardHeader>
// 						<CardContent className="space-y-4">
// 							<div className="flex justify-between">
// 								<span className="text-gray-600">Invoice Number:</span>
// 								<span className="font-semibold">{invoice.invoiceNumber}</span>
// 							</div>

// 							<div className="flex justify-between">
// 								<span className="text-gray-600">Student:</span>
// 								<span className="font-semibold">
// 									{invoice.student.user.firstName}{" "}
// 									{invoice.student.user.lastName}
// 								</span>
// 							</div>

// 							<div className="flex justify-between">
// 								<span className="text-gray-600">Student ID:</span>
// 								<span className="font-semibold">
// 									{invoice.student.studentId}
// 								</span>
// 							</div>

// 							<div className="flex justify-between">
// 								<span className="text-gray-600">Branch:</span>
// 								<span className="font-semibold">{invoice.branch.name}</span>
// 							</div>

// 							<div className="flex justify-between">
// 								<span className="text-gray-600">Due Date:</span>
// 								<span className="font-semibold">
// 									{invoice.dueDate
// 										? new Date(invoice.dueDate).toLocaleDateString()
// 										: "N/A"}
// 								</span>
// 							</div>

// 							<Separator />

// 							{/* Fee Breakdown */}
// 							<div className="space-y-2">
// 								<h4 className="font-semibold text-gray-900">Fee Breakdown:</h4>
// 								{invoice.items.map((item) => (
// 									<div key={item.id} className="flex justify-between text-sm">
// 										<span className="text-gray-600">
// 											{item.description} (x{item.quantity})
// 										</span>
// 										<span>ETB {Number(item.amount).toLocaleString()}</span>
// 									</div>
// 								))}
// 							</div>

// 							<Separator />

// 							<div className="space-y-2">
// 								<div className="flex justify-between">
// 									<span className="text-gray-600">Subtotal:</span>
// 									<span>
// 										ETB {Number(invoice.totalAmount).toLocaleString()}
// 									</span>
// 								</div>

// 								{invoice.discountAmount &&
// 									Number(invoice.discountAmount) > 0 && (
// 										<div className="flex justify-between text-green-600">
// 											<span>Discount:</span>
// 											<span>
// 												-ETB {Number(invoice.discountAmount).toLocaleString()}
// 											</span>
// 										</div>
// 									)}

// 								<div className="flex justify-between text-lg font-bold">
// 									<span>Total Amount:</span>
// 									<span>ETB {Number(finalAmount).toLocaleString()}</span>
// 								</div>
// 							</div>
// 						</CardContent>
// 					</Card>

// 					{/* Payment Form */}
// 					<div>
// 						<PaymentForm
// 							invoiceId={invoice.id}
// 							totalAmount={Number(finalAmount)}
// 							parentId={parent?.id || ""}
// 							branchId={invoice.branchId}
// 						/>
// 					</div>
// 				</div>

// 				{/* Contact Information */}
// 				<Card>
// 					<CardContent className="pt-6">
// 						<div className="text-center text-sm text-gray-600">
// 							<p>For payment assistance, contact your branch office:</p>
// 							<p className="font-semibold mt-1">{invoice.branch.name}</p>
// 							{invoice.branch.phone && <p>Phone: {invoice.branch.phone}</p>}
// 							{invoice.branch.email && <p>Email: {invoice.branch.email}</p>}
// 						</div>
// 					</CardContent>
// 				</Card>
// 			</div>
// 		</div>
// 	);
// }
