"use client";

import {
	useState,
	useEffect,
	createContext,
	useContext,
	type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { apiClient, type LoginRequest } from "@/lib/api";

interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	role: string;
	schoolId: string;
	branchId?: string;
}

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	login: (credentials: LoginRequest) => Promise<void>;
	logout: () => Promise<void>;
	refreshToken: () => Promise<void>;
	updateProfile: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	const isAuthenticated = !!user;

	// Initialize auth state on mount
	useEffect(() => {
		initializeAuth();
	}, []);

	const initializeAuth = async () => {
		try {
			// Check if user data exists in localStorage
			const storedUser = localStorage.getItem("user");
			if (storedUser) {
				setUser(JSON.parse(storedUser));
			}

			// Try to refresh token to validate session
			await refreshToken();
		} catch (error) {
			// If refresh fails, clear stored data
			localStorage.removeItem("user");
			localStorage.removeItem("auth-token");
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	};

	const login = async (credentials: LoginRequest) => {
		try {
			const response = await apiClient.login(credentials);

			if (response.success && response.data) {
				const { user: userData, token } = response.data;

				// Store user data and token
				localStorage.setItem("user", JSON.stringify(userData));
				localStorage.setItem("auth-token", token);
				setUser(userData);

				// Redirect to dashboard
				router.push("/dashboard");
			} else {
				throw new Error(response.error || "Login failed");
			}
		} catch (error) {
			console.error("Login error:", error);
			throw error;
		}
	};

	const logout = async () => {
		try {
			await apiClient.logout();
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			// Clear local storage and state regardless of API call success
			localStorage.removeItem("user");
			localStorage.removeItem("auth-token");
			setUser(null);
			router.push("/login");
		}
	};

	const refreshToken = async () => {
		try {
			const response = await apiClient.refreshToken();

			if (response.success && response.data) {
				const { user: userData, token } = response.data;

				// Update stored data
				localStorage.setItem("user", JSON.stringify(userData));
				localStorage.setItem("auth-token", token);
				setUser(userData);
			} else {
				throw new Error("Token refresh failed");
			}
		} catch (error) {
			console.error("Token refresh error:", error);
			throw error;
		}
	};

	const updateProfile = (userData: Partial<User>) => {
		if (user) {
			const updatedUser = { ...user, ...userData };
			setUser(updatedUser);
			localStorage.setItem("user", JSON.stringify(updatedUser));
		}
	};

	const value: AuthContextType = {
		user,
		isLoading,
		isAuthenticated,
		login,
		logout,
		refreshToken,
		updateProfile,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
