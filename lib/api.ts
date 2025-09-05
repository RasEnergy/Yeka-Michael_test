// API client utility for communicating with Express backend

const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
	details?: any[];
}

interface RequestConfig extends RequestInit {
	params?: Record<string, any>;
	responseType?: "json" | "blob";
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	user: {
		id: string;
		email: string;
		firstName: string;
		lastName: string;
		role: string;
		schoolId: string;
		branchId?: string;
	};
	token: string;
}

class ApiClient {
	private baseURL: string;
	private isRefreshing = false;
	private refreshPromise: Promise<any> | null = null;
	constructor(baseURL: string) {
		this.baseURL = baseURL;
	}

	private getAuthHeaders(): HeadersInit {
		const token = localStorage.getItem("auth-token");
		console.log({
			token,
		});

		return {
			"Content-Type": "application/json",
			...(token && { Authorization: `Bearer ${token}` }),
		};
	}

	private buildUrl(endpoint: string, params?: Record<string, any>): string {
		const url = new URL(`${API_BASE_URL}${endpoint}`);

		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					url.searchParams.append(key, value.toString());
				}
			});
		}

		return url.toString();
	}

	// private async request<T>(
	// 	endpoint: string,
	// 	options: RequestInit = {}
	// ): Promise<ApiResponse<T>> {
	// 	const url = `${this.baseURL}${endpoint}`;

	// 	const config: RequestInit = {
	// 		headers: {
	// 			"Content-Type": "application/json",
	// 			...options.headers,
	// 		},
	// 		credentials: "include", // Include cookies for authentication
	// 		...options,
	// 	};

	// 	// Add authorization header if token exists in localStorage
	// 	const token = localStorage.getItem("auth-token");
	// 	if (token) {
	// 		config.headers = {
	// 			...config.headers,
	// 			Authorization: `Bearer ${token}`,
	// 		};
	// 	}

	// 	try {
	// 		const response = await fetch(url, config);
	// 		const data = await response.json();

	// 		if (!response.ok) {
	// 			throw new Error(data.error || `HTTP error! status: ${response.status}`);
	// 		}

	// 		return data;
	// 	} catch (error) {
	// 		console.error("API request failed:", error);
	// 		throw error;
	// 	}
	// }
	private async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<ApiResponse<T>> {
		const url = `${this.baseURL}${endpoint}`;

		const config: RequestInit = {
			headers: {
				"Content-Type": "application/json",
				...options.headers,
			},
			credentials: "include", // Include cookies for authentication
			...options,
		};

		// The server will automatically read the auth-token from cookies

		try {
			const response = await fetch(url, config);

			if (
				response.status === 401 &&
				endpoint !== "/auth/refresh" &&
				endpoint !== "/auth/login"
			) {
				try {
					await this.handleTokenRefresh();
					// Retry the original request after refresh
					return this.request<T>(endpoint, options);
				} catch (refreshError) {
					// If refresh fails, redirect to login
					if (typeof window !== "undefined") {
						window.location.href = "/login";
					}
					throw refreshError;
				}
			}

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || `HTTP error! status: ${response.status}`);
			}

			return data;
		} catch (error) {
			console.error("API request failed:", error);
			throw error;
		}
	}

	private async requestCaller<T = any>(
		endpoint: string,
		config: RequestConfig = {}
	): Promise<ApiResponse<T>> {
		const { params, responseType = "json", headers, ...requestConfig } = config;
		const url = this.buildUrl(endpoint, params);

		// Base headers
		let finalHeaders: HeadersInit = {
			"Content-Type": "application/json",
			...headers,
		};

		// Add authorization header if token exists in localStorage
		const token = localStorage.getItem("auth-token");
		console.log("TOKEN_FOUND", token);
		if (token) {
			finalHeaders = {
				...finalHeaders,
				Authorization: `Bearer ${token}`,
			};
		}

		const requestOptions: RequestInit = {
			headers: finalHeaders,
			credentials: "include", // Include cookies for authentication
			...requestConfig,
		};

		try {
			const response = await fetch(url, requestOptions);

			if (
				response.status === 401 &&
				endpoint !== "/auth/refresh" &&
				endpoint !== "/auth/login"
			) {
				try {
					await this.handleTokenRefresh();
					// Retry the original request after refresh
					return this.request<T>(endpoint, requestOptions);
				} catch (refreshError) {
					// If refresh fails, redirect to login
					if (typeof window !== "undefined") {
						window.location.href = "/login";
					}
					throw refreshError;
				}
			}

			if (responseType === "blob") {
				const blob = await response.blob();
				return { success: true, data: blob as T };
			}

			const data = await response.json();

			if (!response.ok) {
				throw new Error(
					data.error || data.message || `HTTP error! status: ${response.status}`
				);
			}

			return data;
		} catch (error) {
			console.error("API request failed:", error);
			throw error;
		}
	}

	private async requestBlobCaller<T = any>(
		endpoint: string,
		config: RequestConfig = {}
	): Promise<ApiResponse<T>> {
		const { params, responseType = "json", headers, ...requestConfig } = config;
		const url = this.buildUrl(endpoint, params);

		let finalHeaders: HeadersInit = {
			"Content-Type": "application/json",
			...headers,
		};

		const token = localStorage.getItem("auth-token");
		if (token) {
			finalHeaders = {
				...finalHeaders,
				Authorization: `Bearer ${token}`,
			};
		}

		const requestOptions: RequestInit = {
			headers: finalHeaders,
			credentials: "include",
			...requestConfig,
		};

		try {
			const response = await fetch(url, requestOptions);

			if (
				response.status === 401 &&
				endpoint !== "/auth/refresh" &&
				endpoint !== "/auth/login"
			) {
				try {
					await this.handleTokenRefresh();
					return this.request<T>(endpoint, requestOptions);
				} catch (refreshError) {
					if (typeof window !== "undefined") {
						window.location.href = "/login";
					}
					throw refreshError;
				}
			}

			if (responseType === "blob") {
				const blob = await response.blob();
				return { success: true, data: blob as T };
			}

			const data = await response.json();

			if (!response.ok) {
				throw new Error(
					data.error || data.message || `HTTP error! status: ${response.status}`
				);
			}

			return data;
		} catch (error) {
			console.error("API request failed:", error);
			throw error;
		}
	}

	private async handleTokenRefresh(): Promise<void> {
		if (this.isRefreshing) {
			// If already refreshing, wait for the existing refresh to complete
			return this.refreshPromise;
		}

		this.isRefreshing = true;
		this.refreshPromise = this.performTokenRefresh();

		try {
			await this.refreshPromise;
		} finally {
			this.isRefreshing = false;
			this.refreshPromise = null;
		}
	}

	private async performTokenRefresh(): Promise<void> {
		const url = `${this.baseURL}/auth/refresh`;

		const response = await fetch(url, {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error("Token refresh failed");
		}

		const data = await response.json();
		if (!data.success) {
			throw new Error(data.error || "Token refresh failed");
		}
	}

	// private async requestCaller<T = any>(
	// 	endpoint: string,
	// 	config: RequestConfig = {}
	// ): Promise<ApiResponse<T>> {
	// 	const { params, responseType = "json", ...requestConfig } = config;
	// 	const url = this.buildUrl(endpoint, params);

	// 	// const requestOptions: RequestInit = {
	// 	// 	headers: this.getAuthHeaders(),
	// 	// 	...requestConfig,
	// 	// };
	// 	const requestOptions: RequestInit = {
	// 		headers: {
	// 			"Content-Type": "application/json",
	// 			...config.headers,
	// 		},
	// 		credentials: "include", // Include cookies for authentication
	// 		...config,
	// 	};

	// 	// Add authorization header if token exists in localStorage
	// 	const token = localStorage.getItem("auth-token");
	// 	console.log("TOKEN_FOUND", token);
	// 	if (token) {
	// 		config.headers = {
	// 			...config.headers,
	// 			Authorization: `Bearer ${token}`,
	// 		};
	// 	}

	// 	try {
	// 		const response = await fetch(url, requestOptions);

	// 		if (responseType === "blob") {
	// 			const blob = await response.blob();
	// 			return { success: true, data: blob as T };
	// 		}

	// 		const data = await response.json();

	// 		if (!response.ok) {
	// 			throw new Error(
	// 				data.error || data.message || `HTTP error! status: ${response.status}`
	// 			);
	// 		}

	// 		return data;
	// 	} catch (error) {
	// 		console.error("API request failed:", error);
	// 		throw error;
	// 	}
	// }

	// Authentication endpoints
	async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
		return this.request<LoginResponse>("/auth/login", {
			method: "POST",
			body: JSON.stringify(credentials),
		});
	}

	async logout(): Promise<ApiResponse> {
		return this.request("/auth/logout", {
			method: "POST",
		});
	}

	async refreshToken(): Promise<ApiResponse<LoginResponse>> {
		return this.request<LoginResponse>("/auth/refresh", {
			method: "POST",
		});
	}

	async getProfile(): Promise<ApiResponse<{ user: any }>> {
		return this.request("/auth/profile");
	}

	async changePassword(data: {
		currentPassword: string;
		newPassword: string;
	}): Promise<ApiResponse> {
		return this.request("/auth/change-password", {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	// User endpoints
	async createUser(userData: any): Promise<ApiResponse<{ user: any }>> {
		return this.request("/users", {
			method: "POST",
			body: JSON.stringify(userData),
		});
	}

	async getUser(id: string): Promise<ApiResponse<{ user: any }>> {
		return this.request(`/users/${id}`);
	}

	async updateUser(
		id: string,
		userData: any
	): Promise<ApiResponse<{ user: any }>> {
		return this.request(`/users/${id}`, {
			method: "PUT",
			body: JSON.stringify(userData),
		});
	}

	async deleteUser(id: string): Promise<ApiResponse> {
		return this.request(`/users/${id}`, {
			method: "DELETE",
		});
	}

	async getUsersBySchool(
		schoolId: string,
		params?: { branchId?: string; role?: string }
	): Promise<ApiResponse<{ users: any[] }>> {
		const searchParams = new URLSearchParams();
		if (params?.branchId) searchParams.append("branchId", params.branchId);
		if (params?.role) searchParams.append("role", params.role);

		const queryString = searchParams.toString();
		const endpoint = `/users/school/${schoolId}${
			queryString ? `?${queryString}` : ""
		}`;

		return this.request(endpoint);
	}

	// Student endpoints
	async createStudent(
		studentData: any
	): Promise<ApiResponse<{ student: any }>> {
		return this.request("/students", {
			method: "POST",
			body: JSON.stringify(studentData),
		});
	}

	async getStudent(id: string): Promise<ApiResponse<{ student: any }>> {
		return this.request(`/students/${id}`);
	}

	async updateStudent(
		id: string,
		studentData: any
	): Promise<ApiResponse<{ student: any }>> {
		return this.request(`/students/${id}`, {
			method: "PUT",
			body: JSON.stringify(studentData),
		});
	}

	async getStudentsByBranch(
		branchId: string,
		params?: { gradeId?: string }
	): Promise<ApiResponse<{ students: any[] }>> {
		const searchParams = new URLSearchParams();
		if (params?.gradeId) searchParams.append("gradeId", params.gradeId);

		const queryString = searchParams.toString();
		const endpoint = `/students/branch/${branchId}${
			queryString ? `?${queryString}` : ""
		}`;

		return this.request(endpoint);
	}

	async searchStudents(
		query: string,
		branchId: string
	): Promise<ApiResponse<{ students: any[] }>> {
		return this.request(
			`/students/search?q=${encodeURIComponent(query)}&branchId=${branchId}`
		);
	}

	// School endpoints
	async createSchool(schoolData: any): Promise<ApiResponse<{ school: any }>> {
		return this.request("/schools", {
			method: "POST",
			body: JSON.stringify(schoolData),
		});
	}

	async getSchool(id: string): Promise<ApiResponse<{ school: any }>> {
		return this.request(`/schools/${id}`);
	}

	async getAllSchools(): Promise<ApiResponse<{ schools: any[] }>> {
		return this.request("/schools");
	}

	async updateSchool(
		id: string,
		schoolData: any
	): Promise<ApiResponse<{ school: any }>> {
		return this.request(`/schools/${id}`, {
			method: "PUT",
			body: JSON.stringify(schoolData),
		});
	}

	// Branch endpoints
	async createBranch(branchData: any): Promise<ApiResponse<{ branch: any }>> {
		return this.request("/branches", {
			method: "POST",
			body: JSON.stringify(branchData),
		});
	}

	async getBranch(id: string): Promise<ApiResponse<{ branch: any }>> {
		return this.request(`/branches/${id}`);
	}

	async getBranchesBySchool(
		schoolId: string
	): Promise<ApiResponse<{ branches: any[] }>> {
		return this.request(`/branches/school/${schoolId}`);
	}

	// Invoice endpoints
	async createInvoice(
		invoiceData: any
	): Promise<ApiResponse<{ invoice: any }>> {
		return this.request("/invoices", {
			method: "POST",
			body: JSON.stringify(invoiceData),
		});
	}

	async getInvoice(id: string): Promise<ApiResponse<{ invoice: any }>> {
		return this.request(`/invoices/${id}`);
	}

	async getInvoicesByStudent(
		studentId: string
	): Promise<ApiResponse<{ invoices: any[] }>> {
		return this.request(`/invoices/student/${studentId}`);
	}

	// Payment endpoints
	async createPayment(
		paymentData: any
	): Promise<ApiResponse<{ payment: any }>> {
		return this.request("/payments", {
			method: "POST",
			body: JSON.stringify(paymentData),
		});
	}

	async processPayment(
		paymentData: any
	): Promise<ApiResponse<{ payment: any }>> {
		return this.request("/payments/process", {
			method: "POST",
			body: JSON.stringify(paymentData),
		});
	}

	async getPayment(id: string): Promise<ApiResponse<{ payment: any }>> {
		return this.request(`/payments/${id}`);
	}

	async getPaymentsByStudent(
		studentId: string
	): Promise<ApiResponse<{ payments: any[] }>> {
		return this.request(`/payments/student/${studentId}`);
	}

	// Registration endpoints
	async createRegistration(
		registrationData: any
	): Promise<ApiResponse<{ registration: any }>> {
		return this.request("/registrations", {
			method: "POST",
			body: JSON.stringify(registrationData),
		});
	}

	async getRegistration(
		id: string
	): Promise<ApiResponse<{ registration: any }>> {
		return this.request(`/registrations/${id}`);
	}

	async getRegistrationsByBranch(
		branchId: string
	): Promise<ApiResponse<{ registrations: any[] }>> {
		return this.request(`/registrations/branch/${branchId}`);
	}

	async approveRegistration(
		id: string
	): Promise<ApiResponse<{ registration: any }>> {
		return this.request(`/registrations/${id}/approve`, {
			method: "POST",
		});
	}

	// Generic HTTP methods
	async get<T = any>(
		endpoint: string,
		params?: Record<string, any>
	): Promise<ApiResponse<T>> {
		console.log(`GET request to ${endpoint} with params`, params);
		return this.requestCaller<T>(endpoint, { method: "GET", params });
	}

	async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
		console.log(`POST request to ${endpoint} with data`, data);

		const isFormData = data instanceof FormData;

		return this.requestCaller<T>(endpoint, {
			method: "POST",
			headers: {
				...this.getAuthHeaders(),
				...(isFormData ? {} : { "Content-Type": "application/json" }),
			},
			body: isFormData ? data : JSON.stringify(data),
		});
	}

	async postFormData<T>(
		endpoint: string,
		formData: FormData
	): Promise<ApiResponse<T>> {
		const url = `${this.baseURL}${endpoint}`;

		const config: RequestInit = {
			method: "POST",
			body: formData,
			credentials: "include",
		};

		try {
			const response = await fetch(url, config);

			if (
				response.status === 401 &&
				endpoint !== "/auth/refresh" &&
				endpoint !== "/auth/login"
			) {
				try {
					await this.handleTokenRefresh();
					// Retry the original request after refresh
					return this.postFormData<T>(endpoint, formData);
				} catch (refreshError) {
					if (typeof window !== "undefined") {
						window.location.href = "/login";
					}
					throw refreshError;
				}
			}

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || `HTTP error! status: ${response.status}`);
			}

			return data;
		} catch (error) {
			console.error("API request failed:", error);
			throw error;
		}
	}

	// async postFormData<T>(
	// 	endpoint: string,
	// 	formData: FormData
	// ): Promise<ApiResponse<T>> {
	// 	const url = `${this.baseURL}${endpoint}`;

	// 	const config: RequestInit = {
	// 		method: "POST",
	// 		body: formData,
	// 		credentials: "include",
	// 	};

	// 	// Add authorization header if token exists in localStorage
	// 	const token = localStorage.getItem("auth-token");
	// 	if (token) {
	// 		config.headers = {
	// 			Authorization: `Bearer ${token}`,
	// 		};
	// 	}

	// 	try {
	// 		const response = await fetch(url, config);
	// 		const data = await response.json();

	// 		if (!response.ok) {
	// 			throw new Error(data.error || `HTTP error! status: ${response.status}`);
	// 		}

	// 		return data;
	// 	} catch (error) {
	// 		console.error("API request failed:", error);
	// 		throw error;
	// 	}
	// }

	async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
		return this.requestCaller<T>(endpoint, {
			method: "PUT",
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
		return this.requestCaller<T>(endpoint, {
			method: "PATCH",
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
		return this.requestCaller<T>(endpoint, { method: "DELETE" });
	}
	// Special method for blob responses (like file downloads)
	async getBlob(
		endpoint: string,
		params?: Record<string, any>
	): Promise<Blob | any> {
		console.log(`GET blob request to ${endpoint} with params`, params);
		const response = await this.requestBlobCaller<Blob>(endpoint, {
			method: "GET",
			params,
			responseType: "blob",
		});
		return response.data;
	}
}

// Create and export a singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export individual methods for convenience
export const {
	login,
	logout,
	refreshToken,
	getProfile,
	changePassword,
	createUser,
	getUser,
	updateUser,
	deleteUser,
	getUsersBySchool,
	createStudent,
	getStudent,
	updateStudent,
	getStudentsByBranch,
	searchStudents,
	createSchool,
	getSchool,
	getAllSchools,
	updateSchool,
	createBranch,
	getBranch,
	getBranchesBySchool,
	createInvoice,
	getInvoice,
	getInvoicesByStudent,
	createPayment,
	processPayment,
	getPayment,
	getPaymentsByStudent,
	createRegistration,
	getRegistration,
	postFormData,
	getRegistrationsByBranch,
	approveRegistration,
	getBlob,
} = apiClient;
