"use client";

import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CalendarHeader } from "@/components/calendar/calendar-header";
import { AttendanceLegend } from "@/components/calendar/attendance-legend";
import { CalendarUtils } from "@/lib/calendar-utils";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import {
	Search,
	Users,
	TrendingUp,
	AlertTriangle,
	Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Class {
	id: string;
	name: string;
	section: string | null;
	capacity: number;
	grade: {
		name: string;
		level: number;
	};
}

interface MonthlyAttendanceData {
	classId: string;
	className: string;
	month: number;
	year: number;
	workingDays: Date[];
	students: {
		id: string;
		studentId: string;
		firstName: string;
		lastName: string;
		gender: string | null;
		attendance: {
			[date: string]: string | null;
		};
	}[];
}

interface AttendanceStats {
	totalSessions: number;
	totalRecords: number;
	statusCounts: {
		PRESENT?: number;
		ABSENT?: number;
		LATE?: number;
		EXCUSED?: number;
		SICK?: number;
	};
	attendanceRate: number;
}

export default function AttendancePage() {
	const { user } = useAuth();
	const [classes, setClasses] = useState<Class[]>([]);
	const [selectedClass, setSelectedClass] = useState<string>("");
	const [attendanceData, setAttendanceData] =
		useState<MonthlyAttendanceData | null>(null);
	const [attendanceStats, setAttendanceStats] =
		useState<AttendanceStats | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(false);

	const { year: currentYear, month: currentMonth } =
		CalendarUtils.getCurrentMonth();
	const [selectedYear, setSelectedYear] = useState(currentYear);
	const [selectedMonth, setSelectedMonth] = useState(currentMonth);
	const [exportLoading, setExportLoading] = useState(false);

	// Fetch classes on component mount
	useEffect(() => {
		fetchClasses();
	}, []);

	// Fetch attendance data when class or date changes
	useEffect(() => {
		if (selectedClass) {
			fetchAttendanceData();
			fetchAttendanceStats();
		}
	}, [selectedClass, selectedYear, selectedMonth]);

	const fetchClasses = async () => {
		try {
			// const response = await apiClient.get("/classes");
			const response = await apiClient.get(`/classes/branch/${user?.branchId}`);
			console.log({
				classesData: response.data.classes,
				classId: response.data.classes[0].id,
			});
			//
			if (response) {
				setClasses(response.data.classes);
				if (response.data.classes.length > 0) {
					setSelectedClass(response.data.classes[0].id);
				}
			}
		} catch (error) {
			console.error("Failed to fetch classes:", error);
		}
	};

	const fetchAttendanceData = async () => {
		if (!selectedClass) return;

		setLoading(true);
		try {
			const response = await apiClient.get(
				`/attendance/classes/${selectedClass}/monthly?year=${selectedYear}&month=${selectedMonth}`
			);
			if (response.success) {
				setAttendanceData(response.data);
			}
		} catch (error) {
			console.error("Failed to fetch attendance data:", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchAttendanceStats = async () => {
		if (!selectedClass) return;

		try {
			const response = await apiClient.get(
				`/attendance/classes/${selectedClass}/stats?year=${selectedYear}&month=${selectedMonth}`
			);
			if (response.success) {
				setAttendanceStats(response.data);
			}
		} catch (error) {
			console.error("Failed to fetch attendance stats:", error);
		}
	};

	const handlePreviousMonth = () => {
		const { year, month } = CalendarUtils.getPreviousMonth(
			selectedYear,
			selectedMonth
		);
		setSelectedYear(year);
		setSelectedMonth(month);
	};

	const handleNextMonth = () => {
		const { year, month } = CalendarUtils.getNextMonth(
			selectedYear,
			selectedMonth
		);
		setSelectedYear(year);
		setSelectedMonth(month);
	};

	const handleToday = () => {
		const { year, month } = CalendarUtils.getCurrentMonth();
		setSelectedYear(year);
		setSelectedMonth(month);
	};

	const filteredStudents = attendanceData?.students.filter(
		(student) =>
			`${student.firstName} ${student.lastName}`
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const handleExportExcel = async () => {
		if (!selectedClass) return;

		setExportLoading(true);
		try {
			const selectedClassData = classes.find((cls) => cls.id === selectedClass);
			const schoolName = "YEKA MICHAEL SCHOOLS";
			const branchName = "WOSSEN BRANCH";
			const homeRoomTeacher =
				user?.firstName && user?.lastName
					? `${user.firstName} ${user.lastName}`
					: "";

			const response = await fetch(
				`${
					process.env.NEXT_PUBLIC_API_URL
				}/attendance/classes/${selectedClass}/export/excel?year=${selectedYear}&month=${selectedMonth}&schoolName=${encodeURIComponent(
					schoolName
				)}&branchName=${encodeURIComponent(
					branchName
				)}&homeRoomTeacher=${encodeURIComponent(homeRoomTeacher)}`,
				{
					method: "GET",
					credentials: "include",
					headers: {
						Accept:
							"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
					},
				}
			);

			if (!response.ok) {
				throw new Error("Failed to export attendance");
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `attendance-${
				selectedClassData?.name || "class"
			}-${selectedYear}-${selectedMonth}.xlsx`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Failed to export attendance:", error);
			alert("Failed to export attendance. Please try again.");
		} finally {
			setExportLoading(false);
		}
	};

	const formatDate = (date: Date) => {
		const day = new Date(date);

		console.log(day.getDate()); // 1

		return day.getDate();
	};

	const workingDays = attendanceData?.workingDays || [];
	const dayNames = CalendarUtils.getWorkingDayNames();

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-card-foreground">
						Attendance Management
					</h1>
					<p className="text-muted-foreground">
						Track and manage student attendance across classes
					</p>
				</div>
				{selectedClass && (
					<Button
						variant="outline"
						onClick={handleExportExcel}
						disabled={exportLoading}>
						{exportLoading ? "Exporting..." : "Export Attendance"}
					</Button>

					// <Button
					// 	onClick={handleExportExcel}
					// 	disabled={exportLoading}
					// 	className="bg-success hover:bg-success/90">
					// 	<Download className="h-4 w-4 mr-2" />
					// 	{exportLoading ? "Exporting..." : "Export Excel"}
					// </Button>
				)}
			</div>

			{/* Stats Cards */}
			{attendanceStats && (
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Students
							</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-card-foreground">
								{attendanceData?.students.length || 0}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Attendance Rate
							</CardTitle>
							<TrendingUp className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-card-foreground">
								{attendanceStats.attendanceRate}%
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Present Days
							</CardTitle>
							<div className="w-3 h-3 rounded-full bg-success" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-card-foreground">
								{attendanceStats.statusCounts.PRESENT || 0}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Absent Days</CardTitle>
							<AlertTriangle className="h-4 w-4 text-destructive" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-card-foreground">
								{attendanceStats.statusCounts.ABSENT || 0}
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Controls */}
			<Card>
				<CardHeader>
					<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
						<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
							<div className="space-y-2">
								<label className="text-sm font-medium text-card-foreground">
									Select Class
								</label>
								<Select value={selectedClass} onValueChange={setSelectedClass}>
									<SelectTrigger className="w-[250px]">
										<SelectValue placeholder="Choose a class" />
									</SelectTrigger>
									<SelectContent>
										{classes.map((cls) => (
											<SelectItem key={cls.id} value={cls.id}>
												{cls.name} {cls.section && `- ${cls.section}`} (
												{cls.grade.name})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-card-foreground">
									Search Students
								</label>
								<div className="relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										placeholder="Search by name or ID..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-10 w-[250px]"
									/>
								</div>
							</div>
						</div>

						<Button
							variant="outline"
							onClick={() =>
								(window.location.href = `/dashboard/attendance/mark/${selectedClass}`)
							}>
							Mark Attendance
						</Button>
					</div>
				</CardHeader>
			</Card>

			{/* Calendar Navigation */}
			<Card>
				<CardHeader>
					<CalendarHeader
						year={selectedYear}
						month={selectedMonth}
						onPreviousMonth={handlePreviousMonth}
						onNextMonth={handleNextMonth}
						onToday={handleToday}
					/>
				</CardHeader>
			</Card>

			{/* Attendance Table */}
			{attendanceData && (
				<Card>
					<CardHeader>
						<CardTitle className="text-card-foreground">
							Monthly Attendance - {attendanceData.className}
						</CardTitle>
						<CardDescription>
							{workingDays.length} working days in{" "}
							{CalendarUtils.formatDate(
								new Date(selectedYear, selectedMonth - 1),
								"MMMM yyyy"
							)}
						</CardDescription>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="flex items-center justify-center py-8">
								<div className="text-muted-foreground">
									Loading attendance data...
								</div>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full border-collapse">
									<thead>
										<tr className="border-b border-border">
											<th className="text-left p-3 font-medium text-card-foreground sticky left-0 bg-card min-w-[200px]">
												Student
											</th>
											<th className="text-center p-3 font-medium text-card-foreground min-w-[80px]">
												ID
											</th>
											<th className="text-center p-3 font-medium text-card-foreground min-w-[80px]">
												Gender
											</th>

											{workingDays.map((day) => (
												<th
													key={day as any}
													// key={day.toISOString()}
													className="text-center p-2 font-medium text-card-foreground min-w-[40px]">
													<div className="flex flex-col items-center">
														<span className="text-xs">
															{CalendarUtils.formatDate(day, "EEE")}
														</span>
														{/* <span className="text-sm">{day.getDate()}</span> */}
														<span className="text-sm">{formatDate(day)}</span>
													</div>
												</th>
											))}
										</tr>
									</thead>
									<tbody>
										{filteredStudents?.map((student) => (
											<tr
												key={student.id}
												className="border-b border-border hover:bg-muted/50">
												<td className="p-3 sticky left-0 bg-card">
													<div className="font-medium text-card-foreground">
														{student.firstName} {student.lastName}
													</div>
												</td>
												<td className="text-center p-3">
													<Badge variant="outline" className="text-xs">
														{student.studentId}
													</Badge>
												</td>
												<td className="text-center p-3">
													<Badge
														variant={
															student.gender === "MALE"
																? "default"
																: "secondary"
														}
														className="text-xs">
														{student.gender || "N/A"}
													</Badge>
												</td>
												{workingDays.map((day) => {
													const dateKey = CalendarUtils.formatDate(
														day,
														"yyyy-MM-dd"
													);
													const status = student.attendance[dateKey];
													const statusColor =
														CalendarUtils.getAttendanceStatusColor(status);
													const statusText =
														CalendarUtils.getAttendanceStatusText(status);

													return (
														<td key={dateKey} className="text-center p-2">
															<div
																className={cn(
																	"w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold mx-auto",
																	statusColor
																)}>
																{statusText}
															</div>
														</td>
													);
												})}
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{/* Legend */}
			<Card>
				<CardHeader>
					<CardTitle className="text-card-foreground">
						Attendance Legend
					</CardTitle>
				</CardHeader>
				<CardContent>
					<AttendanceLegend />
				</CardContent>
			</Card>
		</div>
	);
}
