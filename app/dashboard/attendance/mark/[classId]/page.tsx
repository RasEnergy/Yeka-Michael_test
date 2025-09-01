"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api";
import { CalendarUtils } from "@/lib/calendar-utils";
import { Search, Save, ArrowLeft, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface Student {
	id: string;
	studentId: string;
	user: {
		firstName: string;
		lastName: string;
	};
	gender: string | null;
}

interface AttendanceRecord {
	studentId: string;
	status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED" | "SICK";
	notes?: string;
}

export default function MarkAttendancePage() {
	const params = useParams();
	const router = useRouter();
	const classId = params.classId as string;

	const [students, setStudents] = useState<Student[]>([]);
	const [attendanceRecords, setAttendanceRecords] = useState<{
		[studentId: string]: AttendanceRecord;
	}>({});
	const [selectedDate, setSelectedDate] = useState(
		new Date().toISOString().split("T")[0]
	);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [classInfo, setClassInfo] = useState<{
		name: string;
		section: string | null;
	} | null>(null);

	useEffect(() => {
		fetchClassInfo();
		fetchStudents();
	}, [classId]);

	const fetchClassInfo = async () => {
		try {
			const response = await apiClient.get(`/classes/${classId}`);
			if (response.success) {
				setClassInfo(response.data);
			}
		} catch (error) {
			console.error("Failed to fetch class info:", error);
		}
	};

	const fetchStudents = async () => {
		setLoading(true);
		try {
			const response = await apiClient.get(`/students?classId=${classId}`);
			if (response.success) {
				setStudents(response.data.students || []);
				// Initialize attendance records with default PRESENT status
				const initialRecords: { [studentId: string]: AttendanceRecord } = {};
				response.data.students?.forEach((student: Student) => {
					initialRecords[student.id] = {
						studentId: student.id,
						status: "PRESENT",
					};
				});
				setAttendanceRecords(initialRecords);
			}
		} catch (error) {
			console.error("Failed to fetch students:", error);
		} finally {
			setLoading(false);
		}
	};

	const updateAttendanceStatus = (
		studentId: string,
		status: AttendanceRecord["status"]
	) => {
		setAttendanceRecords((prev) => ({
			...prev,
			[studentId]: {
				...prev[studentId],
				status,
			},
		}));
	};

	const updateAttendanceNotes = (studentId: string, notes: string) => {
		setAttendanceRecords((prev) => ({
			...prev,
			[studentId]: {
				...prev[studentId],
				notes,
			},
		}));
	};

	const handleSaveAttendance = async () => {
		setSaving(true);
		try {
			// First create or get the attendance session
			const sessionResponse = await apiClient.post("/attendance/sessions", {
				classId,
				date: selectedDate,
			});

			if (!sessionResponse.success) {
				throw new Error("Failed to create attendance session");
			}

			const sessionId = sessionResponse.data.id;

			// Prepare attendance data
			const attendanceData = Object.values(attendanceRecords).map((record) => ({
				studentId: record.studentId,
				status: record.status,
				notes: record.notes,
			}));

			// Bulk mark attendance
			const response = await apiClient.post("/attendance/bulk-mark", {
				sessionId,
				attendanceData,
			});

			if (response.success) {
				router.push("/dashboard/attendance");
			} else {
				throw new Error("Failed to save attendance");
			}
		} catch (error) {
			console.error("Failed to save attendance:", error);
		} finally {
			setSaving(false);
		}
	};

	const filteredStudents = students.filter(
		(student) =>
			`${student.user.firstName} ${student.user.lastName}`
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const statusOptions = [
		{
			value: "PRESENT",
			label: "Present",
			color: "bg-success text-success-foreground",
		},
		{
			value: "ABSENT",
			label: "Absent",
			color: "bg-destructive text-destructive-foreground",
		},
		{
			value: "LATE",
			label: "Late",
			color: "bg-warning text-warning-foreground",
		},
		{
			value: "EXCUSED",
			label: "Excused",
			color: "bg-info text-info-foreground",
		},
		{
			value: "SICK",
			label: "Sick",
			color: "bg-secondary text-secondary-foreground",
		},
	];

	const getStatusCounts = () => {
		const counts = { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0, SICK: 0 };
		Object.values(attendanceRecords).forEach((record) => {
			counts[record.status]++;
		});
		return counts;
	};

	const statusCounts = getStatusCounts();

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="outline" size="sm" onClick={() => router.back()}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back
					</Button>
					<div>
						<h1 className="text-3xl font-bold text-card-foreground">
							Mark Attendance
						</h1>
						<p className="text-muted-foreground">
							{classInfo &&
								`${classInfo.name}${
									classInfo.section ? ` - ${classInfo.section}` : ""
								}`}{" "}
							•{" "}
							{CalendarUtils.formatDate(
								new Date(selectedDate),
								"EEEE, MMMM dd, yyyy"
							)}
						</p>
					</div>
				</div>
				<Button onClick={handleSaveAttendance} disabled={saving}>
					<Save className="h-4 w-4 mr-2" />
					{saving ? "Saving..." : "Save Attendance"}
				</Button>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
				{statusOptions.map((option) => (
					<Card key={option.value}>
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-muted-foreground">
										{option.label}
									</p>
									<p className="text-2xl font-bold text-card-foreground">
										{statusCounts[option.value as keyof typeof statusCounts]}
									</p>
								</div>
								<div className={cn("w-3 h-3 rounded-full", option.color)} />
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Controls */}
			<Card>
				<CardHeader>
					<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
						<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
							<div className="space-y-2">
								<label className="text-sm font-medium text-card-foreground">
									Date
								</label>
								<Input
									type="date"
									value={selectedDate}
									onChange={(e) => setSelectedDate(e.target.value)}
									className="w-[200px]"
								/>
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

						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Users className="h-4 w-4" />
							{filteredStudents.length} students
						</div>
					</div>
				</CardHeader>
			</Card>

			{/* Attendance List */}
			<Card>
				<CardHeader>
					<CardTitle className="text-card-foreground">
						Student Attendance
					</CardTitle>
					<CardDescription>Mark attendance for each student</CardDescription>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="flex items-center justify-center py-8">
							<div className="text-muted-foreground">Loading students...</div>
						</div>
					) : (
						<div className="space-y-4">
							{filteredStudents.map((student) => {
								const record = attendanceRecords[student.id];
								const selectedStatus = statusOptions.find(
									(opt) => opt.value === record?.status
								);

								return (
									<div
										key={student.id}
										className="flex items-center gap-4 p-4 border border-border rounded-lg">
										<div className="flex-1">
											<div className="flex items-center gap-3">
												<div>
													<p className="font-medium text-card-foreground">
														{student.user.firstName} {student.user.lastName}
													</p>
													<div className="flex items-center gap-2 mt-1">
														<Badge variant="outline" className="text-xs">
															{student.studentId}
														</Badge>
														{student.gender && (
															<Badge
																variant={
																	student.gender === "MALE"
																		? "default"
																		: "secondary"
																}
																className="text-xs">
																{student.gender}
															</Badge>
														)}
													</div>
												</div>
											</div>
										</div>

										<div className="flex items-center gap-3">
											<Select
												value={record?.status || "PRESENT"}
												onValueChange={(value) =>
													updateAttendanceStatus(
														student.id,
														value as AttendanceRecord["status"]
													)
												}>
												<SelectTrigger className="w-[140px]">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{statusOptions.map((option) => (
														<SelectItem key={option.value} value={option.value}>
															<div className="flex items-center gap-2">
																<div
																	className={cn(
																		"w-2 h-2 rounded-full",
																		option.color
																	)}
																/>
																{option.label}
															</div>
														</SelectItem>
													))}
												</SelectContent>
											</Select>

											<Input
												placeholder="Notes (optional)"
												value={record?.notes || ""}
												onChange={(e) =>
													updateAttendanceNotes(student.id, e.target.value)
												}
												className="w-[200px]"
											/>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
