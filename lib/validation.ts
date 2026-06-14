import { z } from "zod";

const requiredText = (max: number) => z.string().trim().min(1).max(max);

export const emailSchema = z.string().trim().email().max(254);

export const passwordSchema = z.string().min(8).max(128);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

export const signupSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const seminarRegistrationSchema = z.object({
  nama_lengkap: requiredText(120),
  email: emailSchema,
  no_telepon: requiredText(32),
  asal_institusi: requiredText(160),
  status_akademika: z.enum(["mahasiswa", "dosen"]),
  presentasi_riset: z.enum(["daring", "luring"]),
});

export const orderSchema = z.object({
  order_id: z.string().regex(/^FUTURA-\d{10,}-[a-zA-Z0-9-]+$/),
});

export const idParamSchema = z.object({
  id: z.string().min(1).max(128).regex(/^[a-zA-Z0-9-]+$/),
});

export const xenditWebhookSchema = z.object({
  id: z.string().min(1).max(160),
  external_id: z.string().regex(/^FUTURA-\d{10,}-[a-zA-Z0-9-]+$/),
  status: z.string().min(1).max(40),
  invoice_url: z.string().url().max(2048).nullable().optional(),
  paid_at: z.string().max(80).nullable().optional(),
});
