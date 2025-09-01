"use client";

import { CalendarUtils } from "@/lib/calendar-utils";
import { cn } from "@/lib/utils";

interface AttendanceLegendProps {
	className?: string;
}

export function AttendanceLegend({ className }: AttendanceLegendProps) {
	const statuses = [
		{ key: "PRESENT", label: "Present", text: "P" },
		{ key: "ABSENT", label: "Absent", text: "A" },
		{ key: "LATE", label: "Late", text: "L" },
		{ key: "EXCUSED", label: "Excused", text: "E" },
		{ key: "SICK", label: "Sick", text: "S" },
		{ key: null, label: "Not Marked", text: "-" },
	];

	return (
		<div className={cn("flex flex-wrap gap-4", className)}>
			{statuses.map((status) => {
				const colorClass = CalendarUtils.getAttendanceStatusColor(status.key);

				return (
					<div
						key={status.key || "not-marked"}
						className="flex items-center gap-2">
						<div
							className={cn(
								"w-6 h-6 rounded-sm flex items-center justify-center text-xs font-bold",
								colorClass
							)}>
							{status.text}
						</div>
						<span className="text-sm text-muted-foreground">
							{status.label}
						</span>
					</div>
				);
			})}
		</div>
	);
}
