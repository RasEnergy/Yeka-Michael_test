import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, Receipt } from "lucide-react";

export default function PaymentSuccessPage() {
	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<Card className="w-full max-w-md text-center">
				<CardHeader>
					<div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
						<CheckCircle className="w-8 h-8 text-green-600" />
					</div>
					<CardTitle className="text-2xl text-green-600">
						Payment Successful!
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-gray-600">
						Your payment has been processed successfully. You will receive a
						confirmation SMS shortly.
					</p>

					<div className="space-y-2">
						<Button asChild className="w-full">
							<Link href="/dashboard">
								<Home className="mr-2 h-4 w-4" />
								Go to Dashboard
							</Link>
						</Button>

						<Button variant="outline" asChild className="w-full bg-transparent">
							<Link href="/dashboard/invoices">
								<Receipt className="mr-2 h-4 w-4" />
								View Invoices
							</Link>
						</Button>
					</div>

					<div className="text-xs text-gray-500 mt-6">
						<p>Yeka Michael Schools</p>
						<p>Thank you for your payment!</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
