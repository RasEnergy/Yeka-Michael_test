import { z } from "zod";

export const paymentSchema = z.object({
	amount: z.string().min(1, "Amount is required"),
	phoneNumber: z
		.string()
		.min(9, "Phone number must be at least 9 digits")
		.max(9, "Phone number must be exactly 9 digits")
		.regex(/^9\d{8}$/, "Phone number must start with 9 and be 9 digits long"),
	reason: z.string().min(1, "Payment reason is required"),
	invoiceId: z.string().min(1, "Invoice ID is required"),
	parentId: z.string().min(1, "Parent ID is required"),
	branchId: z.string().min(1, "Branch ID is required"),
});

export type PaymentSchema = z.infer<typeof paymentSchema>;

// Export other existing schemas if they exist
export const studentRegistrationSchema = z.object({
	// Add your existing student registration schema here
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	email: z.string().email("Invalid email address").optional(),
	phone: z.string().optional(),
	// Add other fields as needed
});

export type StudentRegistrationSchema = z.infer<
	typeof studentRegistrationSchema
>;
