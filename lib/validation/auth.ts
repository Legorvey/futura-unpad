import z from "zod";
import { normalizeEmail } from "../email";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Please enter your email.")
  .email("Please enter a valid email address.")
  .max(254, "Email is too long.")
  .transform((email) => normalizeEmail(email));

export const passwordSchema = z
  .string()
  .min(8, "Must be at least 8 characters long.")
  .max(128, "Password is too long.");

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters.")
  .max(20, "Username is too long.")
  .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores.");

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Please enter your email or username."),
  password: z.string().min(1, "Please enter your password."),
  keepSignedIn: z.boolean().optional(),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const editProfileSchema = z.object({
  username: z.union([usernameSchema, z.literal("")]).optional(),
  display_name: z.string().trim().min(1, "Display name is required.").max(100, "Display name is too long."),
  email: emailSchema,
});
export type EditProfileFormValues = z.infer<typeof editProfileSchema>;

export const signupSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
    termsAccepted: z.boolean().refine((value) => value === true, {
      message: "Please agree to the Terms and Privacy Policy.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
export type RegisterFormValues = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });