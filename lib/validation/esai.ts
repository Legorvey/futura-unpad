import z from "zod";

export const clientEsaiFormSchema = z.object({
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

export type ClientEsaiFormValues = z.infer<typeof clientEsaiFormSchema>;
const clientLombaEsaiFormSchema = clientEsaiFormSchema;
export type ClientLombaEsaiFormValues = ClientEsaiFormValues;

export const MAX_GENERAL_FILE_SIZE = 3 * 1024 * 1024; // 3MB
export const MAX_ESSAY_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];
export const ALLOWED_PDF_TYPE = ["application/pdf"];

export const IdentitySchema = z.object({
  full_name: z.string().trim().min(2, "Nama lengkap minimal 2 karakter").max(255),
  institution_category: z.string().optional(),
  institution: z.string().trim().min(3, "Nama institusi minimal 3 karakter").max(255, "Nama institusi terlalu panjang"),
  city: z.string().trim().min(2, "Kota minimal 2 karakter").max(255),
  phone_number: z.string().trim().min(10, "Nomor telepon minimal 10 digit").max(15, "Nomor telepon maksimal 15 digit").regex(/^[0-9+ \-]+$/, "Nomor telepon tidak valid"),
  twibbon: z.any().optional(),
  ktm: z.any().optional(),
}).superRefine((val, ctx) => {
  if (val.twibbon && val.twibbon.length > 0) {
    const file = val.twibbon[0];
    if (file.size > MAX_GENERAL_FILE_SIZE) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Twibbon maksimal 3MB", path: ["twibbon"] });
    }
    if (![...ALLOWED_IMAGE_TYPES, ...ALLOWED_PDF_TYPE].includes(file.type)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Format tidak didukung", path: ["twibbon"] });
    }
  }
  if (val.ktm && val.ktm.length > 0) {
    const file = val.ktm[0];
    if (file.size > MAX_GENERAL_FILE_SIZE) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "KTM maksimal 3MB", path: ["ktm"] });
    }
    if (![...ALLOWED_IMAGE_TYPES, ...ALLOWED_PDF_TYPE].includes(file.type)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Format tidak didukung", path: ["ktm"] });
    }
  }
});
export type IdentityValues = z.infer<typeof IdentitySchema>;

export const DocsSchema = z.object({
  essay: z.any().optional(),
}).superRefine((val, ctx) => {
  if (val.essay && val.essay.length > 0) {
    const file = val.essay[0];
    if (file.size > MAX_ESSAY_FILE_SIZE) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Esai maksimal 2MB", path: ["essay"] });
    }
    if (!ALLOWED_PDF_TYPE.includes(file.type)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Hanya PDF yang didukung", path: ["essay"] });
    }
  }
});
export type DocsValues = z.infer<typeof DocsSchema>;

export const PaymentSchema = z.object({
  payment: z.any().optional(),
}).superRefine((val, ctx) => {
  if (val.payment && val.payment.length > 0) {
    const file = val.payment[0];
    if (file.size > MAX_GENERAL_FILE_SIZE) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Bukti pembayaran maksimal 3MB", path: ["payment"] });
    }
    if (![...ALLOWED_IMAGE_TYPES, ...ALLOWED_PDF_TYPE].includes(file.type)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Format tidak didukung", path: ["payment"] });
    }
  }
});
export type PaymentValues = z.infer<typeof PaymentSchema>;

export const UpdateEsaiSchema = z.object({
  full_name: z.string().trim().min(2).max(255).optional(),
  institution_category: z.string().optional(),
  institution: z.string().trim().min(3).max(255).optional(),
  city: z.string().trim().min(2).max(255).optional(),
  email: z.string().email().max(255).optional(),
  phone_number: z.string().trim().min(10).max(15).regex(/^[0-9+ \-]+$/).optional(),
  instagram_twibbon_url: z.string().max(1000).optional().nullable(),
  identity_card_url: z.string().max(1000).optional().nullable(),
  essay_paper_url: z.string().max(1000).optional().nullable(),
  payment_proof_url: z.string().max(1000).optional().nullable(),
  submission_status: z.enum(["draft", "submitted"]).optional(),
});
