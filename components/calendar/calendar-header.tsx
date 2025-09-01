"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarUtils } from "@/lib/calendar-utils";

interface CalendarHeaderProps {
	year: number;
	month: number;
	onPreviousMonth: () => void;
	onNextMonth: () => void;
	onToday?: () => void;
	showTodayButton?: boolean;
}

export function CalendarHeader({
	year,
	month,
	onPreviousMonth,
	onNextMonth,
	onToday,
	showTodayButton = true,
}: CalendarHeaderProps) {
	const monthName = CalendarUtils.formatDate(
		new Date(year, month - 1),
		"MMMM yyyy"
	);
	const { year: currentYear, month: currentMonth } =
		CalendarUtils.getCurrentMonth();
	const isCurrentMonth = year === currentYear && month === currentMonth;

	return (
		<div className="flex items-center justify-between mb-6">
			<div className="flex items-center gap-2">
				<Button variant="outline" size="sm" onClick={onPreviousMonth}>
					<ChevronLeft className="h-4 w-4" />
				</Button>
				<Button variant="outline" size="sm" onClick={onNextMonth}>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>

			<h2 className="text-xl font-semibold text-foreground">{monthName}</h2>

			<div className="flex items-center gap-2">
				{showTodayButton && !isCurrentMonth && onToday && (
					<Button variant="outline" size="sm" onClick={onToday}>
						Today
					</Button>
				)}
			</div>
		</div>
	);
}
