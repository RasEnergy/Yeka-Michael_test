import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { UserRole } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface AuthUser {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	role: UserRole;
	schoolId: string;
	branchId?: string;
}

export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 12);
}

export async function verifyPassword(
	password: string,
	hashedPassword: string
): Promise<boolean> {
	return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: AuthUser): string {
	return jwt.sign(user, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string): AuthUser | null {
	try {
		return jwt.verify(token, JWT_SECRET) as AuthUser;
	} catch {
		return null;
	}
}

export async function getUserFromRequest(
	request: NextRequest
): Promise<AuthUser | null> {
	const token =
		request.cookies.get("auth-token")?.value ||
		request.headers.get("authorization")?.replace("Bearer ", "");

	if (!token) return null;

	const user = verifyToken(token);
	if (!user) return null;

	// Verify user still exists and is active
	const dbUser = await prisma.user.findFirst({
		where: { id: user.id, isActive: true },
		include: { school: true, branch: true },
	});

	if (!dbUser) return null;

	return {
		id: dbUser.id,
		email: dbUser.email,
		firstName: dbUser.firstName,
		lastName: dbUser.lastName,
		role: dbUser.role,
		schoolId: dbUser.schoolId,
		branchId: dbUser.branchId || undefined,
	};
}

export function hasPermission(
	userRole: UserRole,
	requiredRoles: UserRole[]
): boolean {
	return requiredRoles.includes(userRole);
}

export function canAccessBranch(user: AuthUser, branchId: string): boolean {
	console.error("User does not have access to this branch:", user, branchId);
	if (user.role === "SUPER_ADMIN") return true;
	if (user.role === "BRANCH_ADMIN" && user.branchId === branchId) return true;
	if (user.role === "REGISTRAR" && user.branchId === branchId) return true;
	if (user.branchId === branchId) return true;
	return false;
}
