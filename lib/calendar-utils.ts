import {
	format,
	startOfMonth,
	endOfMonth,
	eachDayOfInterval,
	getDay,
	addMonths,
	subMonths,
	isSameDay,
	isSameMonth,
} from "date-fns";

export interface CalendarDay {
	date: Date;
	isCurrentMonth: boolean;
	isWorkingDay: boolean;
	isToday: boolean;
	dayOfWeek: number;
	formattedDate: string;
}

export interface CalendarWeek {
	days: CalendarDay[];
	weekNumber: number;
}

export interface CalendarMonth {
	year: number;
	month: number;
	monthName: string;
	weeks: CalendarWeek[];
	workingDays: CalendarDay[];
	totalWorkingDays: number;
}

export class CalendarUtils {
	/**
	 * Check if a date is a working day (not Sunday)
	 */
	static isWorkingDay(date: Date): boolean {
		return getDay(date) !== 0; // Sunday is 0
	}

	/**
	 * Get working days for a specific month (excluding Sundays)
	 */
	static getWorkingDaysForMonth(year: number, month: number): Date[] {
		const start = startOfMonth(new Date(year, month - 1));
		const end = endOfMonth(new Date(year, month - 1));
		const allDays = eachDayOfInterval({ start, end });

		return allDays.filter((day) => this.isWorkingDay(day));
	}

	/**
	 * Get week number within the month (1-5)
	 */
	static getWeekNumberInMonth(date: Date): number {
		const startOfMonthDate = startOfMonth(date);
		const dayOfMonth = date.getDate();
		const firstDayOfWeek = getDay(startOfMonthDate);

		// Adjust for Monday as start of week (0 = Monday, 6 = Sunday)
		const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

		return Math.ceil((dayOfMonth + adjustedFirstDay) / 7);
	}

	/**
	 * Create a calendar day object
	 */
	static createCalendarDay(date: Date, currentMonth: Date): CalendarDay {
		const today = new Date();

		return {
			date,
			isCurrentMonth: isSameMonth(date, currentMonth),
			isWorkingDay: this.isWorkingDay(date),
			isToday: isSameDay(date, today),
			dayOfWeek: getDay(date),
			formattedDate: format(date, "yyyy-MM-dd"),
		};
	}

	/**
	 * Generate calendar month data with 5-week structure
	 */
	static generateCalendarMonth(year: number, month: number): CalendarMonth {
		const currentMonth = new Date(year, month - 1);
		const monthStart = startOfMonth(currentMonth);
		const monthEnd = endOfMonth(currentMonth);

		// Get the first Monday of the calendar view
		const startDate = new Date(monthStart);
		const startDayOfWeek = getDay(monthStart);
		const daysToSubtract = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
		startDate.setDate(monthStart.getDate() - daysToSubtract);

		// Generate 5 weeks (35 days) for consistent layout
		const weeks: CalendarWeek[] = [];
		const allDays: CalendarDay[] = [];

		for (let weekIndex = 0; weekIndex < 5; weekIndex++) {
			const weekDays: CalendarDay[] = [];

			for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
				const currentDate = new Date(startDate);
				currentDate.setDate(startDate.getDate() + weekIndex * 7 + dayIndex);

				const calendarDay = this.createCalendarDay(currentDate, currentMonth);
				weekDays.push(calendarDay);
				allDays.push(calendarDay);
			}

			weeks.push({
				days: weekDays,
				weekNumber: weekIndex + 1,
			});
		}

		// Filter working days for the current month only
		const workingDays = allDays.filter(
			(day) => day.isCurrentMonth && day.isWorkingDay
		);

		return {
			year,
			month,
			monthName: format(currentMonth, "MMMM yyyy"),
			weeks,
			workingDays,
			totalWorkingDays: workingDays.length,
		};
	}

	/**
	 * Navigate to previous month
	 */
	static getPreviousMonth(
		year: number,
		month: number
	): { year: number; month: number } {
		const currentDate = new Date(year, month - 1);
		const previousMonth = subMonths(currentDate, 1);

		return {
			year: previousMonth.getFullYear(),
			month: previousMonth.getMonth() + 1,
		};
	}

	/**
	 * Navigate to next month
	 */
	static getNextMonth(
		year: number,
		month: number
	): { year: number; month: number } {
		const currentDate = new Date(year, month - 1);
		const nextMonth = addMonths(currentDate, 1);

		return {
			year: nextMonth.getFullYear(),
			month: nextMonth.getMonth() + 1,
		};
	}

	/**
	 * Get current month and year
	 */
	static getCurrentMonth(): { year: number; month: number } {
		const now = new Date();
		return {
			year: now.getFullYear(),
			month: now.getMonth() + 1,
		};
	}

	/**
	 * Format date for display
	 */
	static formatDate(date: Date, formatString = "MMM dd, yyyy"): string {
		return format(date, formatString);
	}

	/**
	 * Get day names for calendar header (Monday to Saturday, excluding Sunday)
	 */
	static getWorkingDayNames(): string[] {
		return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	}

	/**
	 * Get full day names for calendar header
	 */
	static getFullDayNames(): string[] {
		return [
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday",
			"Sunday",
		];
	}

	/**
	 * Check if a date falls within a specific month
	 */
	static isDateInMonth(date: Date, year: number, month: number): boolean {
		return date.getFullYear() === year && date.getMonth() === month - 1;
	}

	/**
	 * Get attendance status color classes
	 */
	static getAttendanceStatusColor(status: string | null): string {
		switch (status) {
			case "PRESENT":
				return "bg-success text-success-foreground";
			case "ABSENT":
				return "bg-destructive text-destructive-foreground";
			case "LATE":
				return "bg-warning text-warning-foreground";
			case "EXCUSED":
				return "bg-info text-info-foreground";
			case "SICK":
				return "bg-secondary text-secondary-foreground";
			default:
				return "bg-muted text-muted-foreground";
		}
	}

	/**
	 * Get attendance status display text
	 */
	static getAttendanceStatusText(status: string | null): string {
		switch (status) {
			case "PRESENT":
				return "P";
			case "ABSENT":
				return "A";
			case "LATE":
				return "L";
			case "EXCUSED":
				return "E";
			case "SICK":
				return "S";
			default:
				return "-";
		}
	}

	/**
	 * Calculate attendance statistics
	 */
	static calculateAttendanceStats(attendanceData: {
		[date: string]: string | null;
	}): {
		totalDays: number;
		presentDays: number;
		absentDays: number;
		lateDays: number;
		excusedDays: number;
		sickDays: number;
		attendanceRate: number;
	} {
		const values = Object.values(attendanceData).filter(
			(status) => status !== null
		);
		const totalDays = values.length;

		const stats = values.reduce(
			(acc, status) => {
				switch (status) {
					case "PRESENT":
						acc.presentDays++;
						break;
					case "ABSENT":
						acc.absentDays++;
						break;
					case "LATE":
						acc.lateDays++;
						break;
					case "EXCUSED":
						acc.excusedDays++;
						break;
					case "SICK":
						acc.sickDays++;
						break;
				}
				return acc;
			},
			{
				totalDays,
				presentDays: 0,
				absentDays: 0,
				lateDays: 0,
				excusedDays: 0,
				sickDays: 0,
				attendanceRate: 0,
			}
		);

		// Calculate attendance rate (present + late as attended)
		const attendedDays = stats.presentDays + stats.lateDays;
		stats.attendanceRate =
			totalDays > 0 ? Math.round((attendedDays / totalDays) * 100) : 0;

		return stats;
	}
}
