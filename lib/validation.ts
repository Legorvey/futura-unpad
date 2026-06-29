import { z } from "zod";

export * from "./validation/auth";
export * from "./validation/essay";
export * from "./validation/mechatura";
export * from "./validation/seminar";

export const requiredText = (field: string, max = 120) =>
  z.string()
    .trim()
    .min(1, `${field} wajib diisi.`)
    .max(max, `${field} terlalu panjang.`);

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
