import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export interface ImageValidation {
	isValid: boolean;
	error?: string;
}

export function validateImageFile(file: File): ImageValidation {
	const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
	const maxSize = 5 * 1024 * 1024; // 5MB

	if (!allowedTypes.includes(file.type)) {
		return {
			isValid: false,
			error: "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
		};
	}

	if (file.size > maxSize) {
		return {
			isValid: false,
			error: "File size too large. Maximum size is 5MB.",
		};
	}

	return { isValid: true };
}

export async function uploadStudentPhoto(
	file: File,
	studentId: string
): Promise<string> {
	try {
		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		// Create upload directory if it doesn't exist
		const uploadDir = join(process.cwd(), "public", "uploads", "students");
		await mkdir(uploadDir, { recursive: true });

		// Generate unique filename
		const fileExtension = file.name.split(".").pop();
		const fileName = `${studentId}-${randomUUID()}.${fileExtension}`;
		const filePath = join(uploadDir, fileName);

		// Write file
		await writeFile(filePath, buffer);

		// Return public URL
		return `/uploads/students/${fileName}`;
	} catch (error) {
		console.error("Student photo upload error:", error);
		throw new Error("Failed to upload student photo");
	}
}

export async function uploadParentPhoto(
	file: File,
	parentId: string
): Promise<string> {
	try {
		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		// Create upload directory if it doesn't exist
		const uploadDir = join(process.cwd(), "public", "uploads", "parents");
		await mkdir(uploadDir, { recursive: true });

		// Generate unique filename
		const fileExtension = file.name.split(".").pop();
		const fileName = `${parentId}-${randomUUID()}.${fileExtension}`;
		const filePath = join(uploadDir, fileName);

		// Write file
		await writeFile(filePath, buffer);

		// Return public URL
		return `/uploads/parents/${fileName}`;
	} catch (error) {
		console.error("Parent photo upload error:", error);
		throw new Error("Failed to upload parent photo");
	}
}

export async function uploadTeacherPhoto(
	file: File,
	teacherId: string
): Promise<string> {
	try {
		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		// Create upload directory if it doesn't exist
		const uploadDir = join(process.cwd(), "public", "uploads", "teachers");
		await mkdir(uploadDir, { recursive: true });

		// Generate unique filename
		const fileExtension = file.name.split(".").pop();
		const fileName = `${teacherId}-${randomUUID()}.${fileExtension}`;
		const filePath = join(uploadDir, fileName);

		// Write file
		await writeFile(filePath, buffer);

		// Return public URL
		return `/uploads/teachers/${fileName}`;
	} catch (error) {
		console.error("Teacher photo upload error:", error);
		throw new Error("Failed to upload teacher photo");
	}
}
// import { writeFile, mkdir } from "fs/promises";
// import { join } from "path";
// import { existsSync } from "fs";

// export async function uploadStudentPhoto(
// 	file: File,
// 	studentId: string
// ): Promise<string> {
// 	try {
// 		const bytes = await file.arrayBuffer();
// 		const buffer = Buffer.from(bytes);

// 		// Create uploads directory if it doesn't exist
// 		const uploadsDir = join(process.cwd(), "public", "uploads", "students");
// 		if (!existsSync(uploadsDir)) {
// 			await mkdir(uploadsDir, { recursive: true });
// 		}

// 		// Generate filename with timestamp to avoid conflicts
// 		const timestamp = Date.now();
// 		const extension = file.name.split(".").pop();
// 		const filename = `${studentId}_${timestamp}.${extension}`;
// 		const filepath = join(uploadsDir, filename);

// 		// Write file
// 		await writeFile(filepath, buffer);

// 		// Return the public URL
// 		return `/uploads/students/${filename}`;
// 	} catch (error) {
// 		console.error("Error uploading student photo:", error);
// 		throw new Error("Failed to upload photo");
// 	}
// }

// export async function uploadParentPhoto(
// 	file: File,
// 	parentId: string
// ): Promise<string> {
// 	try {
// 		const bytes = await file.arrayBuffer();
// 		const buffer = Buffer.from(bytes);

// 		// Create uploads directory if it doesn't exist
// 		const uploadsDir = join(process.cwd(), "public", "uploads", "parents");
// 		if (!existsSync(uploadsDir)) {
// 			await mkdir(uploadsDir, { recursive: true });
// 		}

// 		// Generate filename with timestamp to avoid conflicts
// 		const timestamp = Date.now();
// 		const extension = file.name.split(".").pop();
// 		const filename = `${parentId}_${timestamp}.${extension}`;
// 		const filepath = join(uploadsDir, filename);

// 		// Write file
// 		await writeFile(filepath, buffer);

// 		// Return the public URL
// 		return `/uploads/parents/${filename}`;
// 	} catch (error) {
// 		console.error("Error uploading parent photo:", error);
// 		throw new Error("Failed to upload parent photo");
// 	}
// }

// export function validateImageFile(file: File): {
// 	isValid: boolean;
// 	error?: string;
// } {
// 	// Validate file type
// 	const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
// 	if (!allowedTypes.includes(file.type)) {
// 		return {
// 			isValid: false,
// 			error: "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
// 		};
// 	}

// 	// Validate file size (max 5MB)
// 	const maxSize = 5 * 1024 * 1024; // 5MB
// 	if (file.size > maxSize) {
// 		return {
// 			isValid: false,
// 			error: "File size too large. Maximum size is 5MB.",
// 		};
// 	}

// 	return { isValid: true };
// }
