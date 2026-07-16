import { z } from "zod";

export const okResponseSchema = z.object({
  ok: z.literal(true),
});

export const authLoginResponseSchema = okResponseSchema.extend({
  adminAccess: z.boolean(),
});

export const authRegisterResponseSchema = okResponseSchema.extend({
  authenticated: z.boolean(),
});

export const seminarTicketRegistrationSchema = z.object({
  id: z.string(),
  is_main_contact: z.boolean(),
  nama_lengkap: z.string(),
  asal_institusi: z.string(),
  group_name: z.string().nullable().optional(),
});

export const seminarRegistrationResponseSchema = z.object({
  success: z.literal(true),
  registration_id: z.string(),
  registrations: z.array(seminarTicketRegistrationSchema),
});

export const mechaturaRegistrationResponseSchema = z.object({
  success: z.boolean().optional(),
  registration_id: z.string().optional(),
  order_id: z.string().optional(),
  payment_url: z.string(),
});

export const midtransPaymentResponseSchema = z.object({
  token: z.string().optional(),
  redirect_url: z.string(),
});

export const verifyRegistrationResponseSchema = okResponseSchema.extend({
  participant: z.object({
    nama_lengkap: z.string(),
  }),
});

export const verifyMechaturaTeamResponseSchema = okResponseSchema.extend({
  team: z.object({
    team_name: z.string(),
    member_count: z.number(),
  }),
});

export type AuthRegisterResponse = z.infer<typeof authRegisterResponseSchema>;
export type SeminarRegistrationResponse = z.infer<
  typeof seminarRegistrationResponseSchema
>;
export type MechaturaRegistrationResponse = z.infer<
  typeof mechaturaRegistrationResponseSchema
>;
export type MidtransPaymentResponse = z.infer<
  typeof midtransPaymentResponseSchema
>;
export type VerifyRegistrationResponse = z.infer<
  typeof verifyRegistrationResponseSchema
>;
export type VerifyMechaturaTeamResponse = z.infer<
  typeof verifyMechaturaTeamResponseSchema
>;
