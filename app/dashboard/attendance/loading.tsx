import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AttendanceLoading() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<Skeleton className="h-8 w-64" />
					<Skeleton className="h-4 w-96" />
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<Card key={i}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-4" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-8 w-16" />
						</CardContent>
					</Card>
				))}
			</div>

			{/* Controls */}
			<Card>
				<CardHeader>
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="space-y-2">
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-10 w-64" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-10 w-64" />
						</div>
					</div>
				</CardHeader>
			</Card>

			{/* Calendar Navigation */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex gap-2">
							<Skeleton className="h-8 w-8" />
							<Skeleton className="h-8 w-8" />
						</div>
						<Skeleton className="h-6 w-32" />
						<Skeleton className="h-8 w-16" />
					</div>
				</CardHeader>
			</Card>

			{/* Attendance Table */}
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-48" />
					<Skeleton className="h-4 w-64" />
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<Skeleton className="h-12 w-full" />
						{Array.from({ length: 5 }).map((_, i) => (
							<Skeleton key={i} className="h-12 w-full" />
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
