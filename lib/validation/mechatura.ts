import z from "zod";
import { emailSchema, requiredText, requiredPhone } from "./helper";

// IDENTITIY STEP VALIDATIONS
export const MechaturaFormSchema = z.object({

    // Team Identity
    team_name: requiredText("Nama tim"),
    institution: requiredText("Nama institusi"),
    province: requiredText("Lokasi institusi"),
    
    // Team Leader Identity
    leader_name: requiredText("Nama ketua"),
    leader_email: emailSchema("Email ketua"),
    leader_phone: requiredPhone("Nomor ketua"),

    // Team Member Identity
    member2_name: z.string().trim().max(120).optional().or(z.literal("")),
    member3_name: z.string().trim().max(120).optional().or(z.literal("")),

    // Team Coach Identity
    coach_name: requiredText("Nama pembimbing"),
    coach_email: emailSchema("Email pembimbing"),
    coach_phone: requiredPhone("Nomor pembimbing"),
})

export type MechaturaValues = z.infer<typeof MechaturaFormSchema>;
export const mechaturaSchema = MechaturaFormSchema;
export type MechaturaFormValues = MechaturaValues;