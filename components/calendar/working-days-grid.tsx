"use client";

import { CalendarUtils, type CalendarDay } from "@/lib/calendar-utils";
import { cn } from "@/lib/utils";

interface WorkingDaysGridProps {
	workingDays: CalendarDay[];
	attendanceData?: { [date: string]: string | null };
	onDateClick?: (date: Date) => void;
	selectedDate?: Date;
	className?: string;
}

export function WorkingDaysGrid({
	workingDays,
	attendanceData = {},
	onDateClick,
	selectedDate,
	className,
}: WorkingDaysGridProps) {
	const dayNames = CalendarUtils.getWorkingDayNames();

	return (
		<div className={cn("space-y-2", className)}>
			{/* Header with day names */}
			<div className="grid grid-cols-6 gap-1 mb-2">
				{dayNames.map((dayName) => (
					<div
						key={dayName}
						className="text-center text-sm font-medium text-muted-foreground py-2">
						{dayName}
					</div>
				))}
			</div>

			{/* Working days grid */}
			<div className="grid grid-cols-6 gap-1">
				{workingDays.map((day) => {
					const attendanceStatus = attendanceData[day.formattedDate];
					const isSelected =
						selectedDate && day.date.getTime() === selectedDate.getTime();
					const statusColor =
						CalendarUtils.getAttendanceStatusColor(attendanceStatus);
					const statusText =
						CalendarUtils.getAttendanceStatusText(attendanceStatus);

					return (
						<button
							key={day.formattedDate}
							onClick={() => onDateClick?.(day.date)}
							className={cn(
								"relative h-12 w-full rounded-md border text-sm font-medium transition-colors",
								"hover:bg-accent hover:text-accent-foreground",
								"focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
								day.isToday && "ring-2 ring-primary",
								isSelected && "ring-2 ring-primary bg-primary/10",
								attendanceStatus
									? statusColor
									: "bg-background text-foreground border-border"
							)}>
							<div className="flex flex-col items-center justify-center h-full">
								<span className="text-xs">{day.date.getDate()}</span>
								<span className="text-xs font-bold">{statusText}</span>
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);
}
