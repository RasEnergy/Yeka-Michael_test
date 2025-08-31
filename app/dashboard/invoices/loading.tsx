import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function InvoicesLoading() {
	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div className="space-y-2">
					<Skeleton className="h-8 w-64" />
					<Skeleton className="h-4 w-96" />
				</div>
			</div>

			{/* Filters Card */}
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-24" />
				</CardHeader>
				<CardContent>
					<div className="flex flex-col sm:flex-row gap-4">
						<Skeleton className="h-10 flex-1" />
						<Skeleton className="h-10 w-full sm:w-[200px]" />
					</div>
				</CardContent>
			</Card>

			{/* Table Card */}
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-24" />
					<Skeleton className="h-4 w-32" />
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{/* Table Header */}
						<div className="grid grid-cols-7 gap-4 pb-2 border-b">
							{Array.from({ length: 7 }).map((_, i) => (
								<Skeleton key={i} className="h-4 w-full" />
							))}
						</div>

						{/* Table Rows */}
						{Array.from({ length: 5 }).map((_, i) => (
							<div key={i} className="grid grid-cols-7 gap-4 py-2">
								{Array.from({ length: 7 }).map((_, j) => (
									<Skeleton key={j} className="h-8 w-full" />
								))}
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
