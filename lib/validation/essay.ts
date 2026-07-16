import z from "zod";

export const clientEssayFormSchema = z.object({
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
}).superRefine((data, ctx) => {
  // Anggota 2 Validation
  const hasMember2Name = !!data.member2_name?.trim();
  const hasMember2Nim = !!data.member2_nim?.trim();
  
  if (hasMember2Name || hasMember2Nim) {
    if (!hasMember2Name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nama anggota 2 wajib diisi jika NIM diisi.",
        path: ["member2_name"],
      });
    }
    if (!hasMember2Nim) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "NIM anggota 2 wajib diisi jika nama diisi.",
        path: ["member2_nim"],
      });
    }
  }

  // Anggota 3 Validation
  const hasMember3Name = !!data.member3_name?.trim();
  const hasMember3Nim = !!data.member3_nim?.trim();
  
  if (hasMember3Name || hasMember3Nim) {
    if (!hasMember3Name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nama anggota 3 wajib diisi jika NIM diisi.",
        path: ["member3_name"],
      });
    }
    if (!hasMember3Nim) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "NIM anggota 3 wajib diisi jika nama diisi.",
        path: ["member3_nim"],
      });
    }
  }
});

export type ClientEssayFormValues = z.infer<typeof clientEssayFormSchema>;
const clientLombaEssayFormSchema = clientEssayFormSchema;
export type ClientLombaEssayFormValues = ClientEssayFormValues;
