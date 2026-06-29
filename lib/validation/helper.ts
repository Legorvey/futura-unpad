import z from "zod";

export const emailSchema = (field: string) =>
    z.string()
    .trim()
    .min(1, `${field} wajib diisi.`)
    .email("Format email tidak valid.")
    .max(254, "Email terlalu panjang.");

export const requiredText = (field: string, max = 120) =>
    z.string()
    .trim()
    .min(1, `${field} wajib diisi.`)
    .max(max, `${field} terlalu panjang.`);

export const requiredPhone = (field: string) =>
    z.string()
    .trim()
    .min(9, `${field} minimal 9 karakter.`)
    .max(32, `${field} terlalu panjang.`)
    .regex(/^[0-9+\-\s().]+$/, `${field} hanya boleh berisi angka dan simbol +, -, spasi.`)