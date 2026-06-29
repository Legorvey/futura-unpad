import { z } from "zod";
import { emailSchema } from "./auth";

const requiredText = (max: number) => z.string().trim().min(1).max(max);

export const seminarRegistrationSchema = z.object({
  registration_type: z.enum(["individual", "group"]),
  nama_lengkap: requiredText(120),
  email: emailSchema.optional().nullable(),
  no_telepon: z.string().trim().max(32).optional().nullable(),
  asal_institusi: requiredText(160),
  status_akademika: z.enum(["mahasiswa", "siswa", "dosen", "umum"]),
  identity_confirmed: z.literal(true),
  group_name: z.string().trim().max(120).optional().nullable(),
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
  group_name: z.string().trim().max(120, "Nama tim terlalu panjang.").optional(),
  members: z.array(z.object({
    nama: z.string().trim().min(1, "Nama anggota wajib diisi.").max(120, "Nama terlalu panjang."),
    institusi: z.string().trim().max(160, "Nama institusi terlalu panjang.").optional()
  })).optional(),
}).superRefine((data, ctx) => {
  if (data.registration_type === "grup") {
    if (!data.group_name || data.group_name.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nama grup wajib diisi.",
        path: ["group_name"],
      });
    }

    if (!data.is_same_institution && data.members) {
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
  }
});

export type ClientSeminarFormValues = z.infer<typeof clientSeminarFormSchema>;