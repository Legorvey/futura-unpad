import z from "zod";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Silakan masukkan email Anda.")
  .email("Silakan masukkan alamat email yang valid.")
  .max(254, "Email terlalu panjang.")
  .transform((email) => normalizeEmail(email));

export const passwordSchema = z
  .string()
  .min(8, "Kata sandi minimal 8 karakter.")
  .max(128, "Kata sandi terlalu panjang.");

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Nama pengguna minimal 3 karakter.")
  .max(20, "Nama pengguna terlalu panjang.")
  .regex(/^[a-zA-Z0-9_]+$/, "Nama pengguna hanya boleh berisi huruf, angka, dan garis bawah.");

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Silakan masukkan email atau nama pengguna Anda."),
  password: z.string().min(1, "Silakan masukkan kata sandi Anda."),
  keepSignedIn: z.boolean().optional(),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const editProfileSchema = z.object({
  username: z.union([usernameSchema, z.literal("")]).optional(),
  display_name: z.string().trim().max(100, "Nama tampilan terlalu panjang.").optional(),
  email: z.union([emailSchema, z.literal("")]).optional(),
});
export type EditProfileFormValues = z.infer<typeof editProfileSchema>;

export const signupSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
    termsAccepted: z.boolean().refine((value) => value === true, {
      message: "Harap setujui Syarat dan Kebijakan Privasi.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Kata sandi tidak cocok.",
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
    message: "Kata sandi tidak cocok.",
    path: ["confirmPassword"],
  });
