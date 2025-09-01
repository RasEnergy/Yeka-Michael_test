import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MarkAttendanceLoading() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Skeleton className="h-8 w-16" />
					<div className="space-y-2">
						<Skeleton className="h-8 w-48" />
						<Skeleton className="h-4 w-64" />
					</div>
				</div>
				<Skeleton className="h-10 w-32" />
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
				{Array.from({ length: 5 }).map((_, i) => (
					<Card key={i}>
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div className="space-y-2">
									<Skeleton className="h-4 w-16" />
									<Skeleton className="h-8 w-8" />
								</div>
								<Skeleton className="h-3 w-3 rounded-full" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Controls */}
			<Card>
				<CardHeader>
					<div className="flex gap-4">
						<div className="space-y-2">
							<Skeleton className="h-4 w-12" />
							<Skeleton className="h-10 w-48" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-10 w-64" />
						</div>
					</div>
				</CardHeader>
			</Card>

			{/* Attendance List */}
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-48" />
					<Skeleton className="h-4 w-64" />
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{Array.from({ length: 8 }).map((_, i) => (
							<div
								key={i}
								className="flex items-center gap-4 p-4 border border-border rounded-lg">
								<div className="flex-1 space-y-2">
									<Skeleton className="h-5 w-48" />
									<div className="flex gap-2">
										<Skeleton className="h-5 w-16" />
										<Skeleton className="h-5 w-12" />
									</div>
								</div>
								<div className="flex gap-3">
									<Skeleton className="h-10 w-32" />
									<Skeleton className="h-10 w-48" />
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
