import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, Phone } from "lucide-react";

export default function PaymentFailurePage() {
	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<Card className="w-full max-w-md text-center">
				<CardHeader>
					<div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
						<XCircle className="w-8 h-8 text-red-600" />
					</div>
					<CardTitle className="text-2xl text-red-600">
						Payment Failed
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-gray-600">
						We were unable to process your payment. This could be due to
						insufficient funds, network issues, or other technical problems.
					</p>

					<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
						<p className="text-yellow-800">
							<strong>What to do next:</strong>
						</p>
						<ul className="text-yellow-700 mt-2 space-y-1 text-left">
							<li>• Check your account balance</li>
							<li>• Ensure you have network connectivity</li>
							<li>• Try again in a few minutes</li>
							<li>• Contact your mobile money provider</li>
						</ul>
					</div>

					<div className="space-y-2">
						<Button asChild className="w-full">
							<Link href="/dashboard/invoices">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Invoices
							</Link>
						</Button>

						<Button variant="outline" asChild className="w-full bg-transparent">
							<Link href="/contact">
								<Phone className="mr-2 h-4 w-4" />
								Contact Support
							</Link>
						</Button>
					</div>

					<div className="text-xs text-gray-500 mt-6">
						<p>Yeka Michael Schools</p>
						<p>Need help? Contact your branch office</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
