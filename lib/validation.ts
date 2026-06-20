import { z } from "zod";
import { normalizeEmail } from "@/lib/email";

const requiredText = (max: number) => z.string().trim().min(1).max(max);

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

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Please enter your password."),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
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

export const seminarRegistrationSchema = z.object({
  registration_type: z.enum(["individual", "group"]),
  nama_lengkap: requiredText(120),
  email: emailSchema.optional().nullable(),
  no_telepon: z.string().trim().max(32).optional().nullable(),
  asal_institusi: requiredText(160),
  status_akademika: z.enum(["mahasiswa", "siswa", "dosen", "umum"]),
  identity_confirmed: z.literal(true),
  members: z.array(z.object({
    nama_lengkap: requiredText(120),
    asal_institusi: z.string().trim().max(160).optional().nullable(),
  })).optional(),
});

export const clientSeminarFormSchema = z.object({
  registration_type: z.enum(["individu", "grup"]),
  nama: z
    .string()
    .trim()
    .min(1, "Nama lengkap wajib diisi.")
    .max(120, "Nama tidak boleh melebihi 120 karakter."),
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi.")
    .email("Format email tidak valid.")
    .max(254, "Email terlalu panjang."),
  telp: z
    .string()
    .trim()
    .min(9, "Nomor WhatsApp minimal 9 karakter.")
    .max(32, "Nomor WhatsApp terlalu panjang.")
    .regex(/^[0-9+\-\s().]+$/, "Nomor WhatsApp hanya boleh berisi angka dan simbol +, -, spasi."),
  institusi: z
    .string()
    .trim()
    .min(1, "Asal institusi wajib diisi.")
    .max(160, "Nama institusi terlalu panjang."),
  status_akademika: z
    .enum(["mahasiswa", "siswa", "dosen", "umum"])
    .refine((v) => v.length > 0, { message: "Pilih status akademika." }),
  identity_confirmed: z.boolean().refine((val) => val === true, {
    message: "Please confirm if your details are correct for certificate records.",
  }),
  is_same_institution: z.boolean(),
  members: z.array(z.object({
    nama: z.string().trim().min(1, "Nama anggota wajib diisi.").max(120, "Nama terlalu panjang."),
    institusi: z.string().trim().max(160, "Nama institusi terlalu panjang.").optional()
  })).optional(),
}).superRefine((data, ctx) => {
  if (data.registration_type === "grup" && !data.is_same_institution && data.members) {
    data.members.forEach((member, index) => {
      if (!member.institusi || member.institusi.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Asal institusi anggota wajib diisi.",
          path: ["members", index, "institusi"],
        });
      }
    });
  }
});

export type ClientSeminarFormValues = z.infer<typeof clientSeminarFormSchema>;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || null);

export const clientLombaKtiFormSchema = z.object({
  team_name: z.string().trim().min(1, "Nama tim wajib diisi.").max(120, "Nama tim terlalu panjang."),
  institution: z.string().trim().min(1, "Perguruan tinggi wajib diisi.").max(160, "Nama perguruan tinggi terlalu panjang."),
  faculty: z.string().trim().min(1, "Jurusan/Prodi wajib diisi.").max(120, "Jurusan/Prodi terlalu panjang."),
  paper_title: z.string().trim().min(1, "Judul karya tulis wajib diisi.").max(250, "Judul terlalu panjang."),
  leader_name: z.string().trim().min(1, "Nama ketua wajib diisi.").max(120, "Nama terlalu panjang."),
  leader_nim: z.string().trim().min(1, "NIM ketua wajib diisi.").max(40, "NIM terlalu panjang."),
  leader_email: z.string().trim().min(1, "Email wajib diisi.").email("Format email tidak valid.").max(254, "Email terlalu panjang."),
  leader_phone: z.string().trim().min(9, "Nomor WhatsApp minimal 9 karakter.").max(32, "Nomor WhatsApp terlalu panjang.").regex(/^[0-9+\-\s().]+$/, "Nomor WhatsApp hanya boleh berisi angka dan simbol +, -, spasi."),
  member2_name: z.string().trim().max(120).optional().or(z.literal("")),
  member2_nim: z.string().trim().max(40).optional().or(z.literal("")),
  member3_name: z.string().trim().max(120).optional().or(z.literal("")),
  member3_nim: z.string().trim().max(40).optional().or(z.literal("")),
  sub_theme: z.enum(["teknologi", "kesehatan", "ekonomi", "sosial", "pendidikan"]),
  identity_confirmed: z.boolean().refine((val) => val === true, {
    message: "Harap centang konfirmasi bahwa data yang diisi sudah benar.",
  }),
});

export type ClientLombaKtiFormValues = z.infer<typeof clientLombaKtiFormSchema>;


const phoneSchema = z
  .string()
  .trim()
  .min(9)
  .max(32)
  .regex(/^[0-9+\-\s().]+$/);

export const mechaturaMemberSchema = z.object({
  full_name: requiredText(120),
  participant_id: requiredText(80),
  email: z
    .string()
    .trim()
    .max(254)
    .optional()
    .transform((value) => (value ? normalizeEmail(value) : null)),
  phone: z
    .string()
    .trim()
    .max(32)
    .optional()
    .transform((value) => value || null),
  is_leader: z.boolean(),
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
  amount: z.number().positive().optional(),
  invoice_url: z.string().url().max(2048).nullable().optional(),
  paid_at: z.string().max(80).nullable().optional(),
});
