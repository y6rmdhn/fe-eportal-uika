import z from "zod";

export const loginSchema = z.object({
  email: z
      .string()
      .min(1, { message: "Email is required." })
      .email({ message: "Invalid email address." }),
  password: z
      .string()
      .min(1, { message: "Password is required." })
      .min(8, { message: "Password must be at least 8 characters." })
      .max(32, { message: "Password must not exceed 32 characters." }),
});

export const createUserSchema = z.object({
  email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Please enter a valid email"),
  password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(32, "Password is too long"),
  password_confirmation: z
      .string()
      .min(1, "Password confirmation is required"),
  name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(100, "Name must be less than 100 characters"),
  role_id: z
      .string()
      .trim()
      .min(1, "Role is required"),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

export const forgotPasswordSchema = z.object({
  email: z
      .string()
      .min(1, { message: "Email is required." })
      .email({ message: "Invalid email address." }),
});

export const resetPasswordSchema = z.object({
  password: z
      .string()
      .min(1, { message: "Password is required." })
      .min(6, { message: "Password must be at least 6 characters." })
      .max(50, { message: "Password must not exceed 50 characters." }),
  password_confirmation: z
      .string()
      .min(1, { message: "Password confirmation is required." }),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match.",
  path: ["password_confirmation"],
});

export type loginForm = z.infer<typeof loginSchema>;
export type createUserForm = z.infer<typeof createUserSchema>;
export type forgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
export type resetPasswordForm = z.infer<typeof resetPasswordSchema>;
