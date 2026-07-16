/* eslint-disable */
import { z } from "zod";
import { isRegistrationToken } from "./payment";

export * from "./validation/auth";
export * from "./validation/essay";
export * from "./validation/mechatura";
export * from "./validation/seminar";

const requiredText = (field: string, max = 120) =>
  z.string()
    .trim()
    .min(1, `${field} wajib diisi.`)
    .max(max, `${field} terlalu panjang.`);

const orderSchema = z.object({
  order_id: z.string().refine(isRegistrationToken),
});

export const idParamSchema = z.object({
  id: z.string().min(1).max(128).regex(/^[a-zA-Z0-9-]+$/),
});
