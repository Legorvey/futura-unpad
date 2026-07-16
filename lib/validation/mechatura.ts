/* eslint-disable */
import z from "zod";
import { isMechaturaCompetitionType } from "@/lib/payment";
import { emailSchema, requiredText, requiredPhone } from "./helper";

export const DEFAULT_MECHATURA_DOCUMENT_MAX_SIZE = 2 * 1024 * 1024;

type CreateMechaturaSchemaOptions = {
    documentMaxSizeInBytes?: number;
};

type CoachFields = {
    has_coach?: boolean;
    coach_name?: unknown;
    coach_email?: unknown;
    coach_phone?: unknown;
};

function formatFileSize(bytes: number) {
    const sizeInMb = bytes / (1024 * 1024);
    return `${Number.isInteger(sizeInMb) ? sizeInMb : sizeInMb.toFixed(1)} MB`;
}

function createDocumentSchema(maxSizeInBytes: number) {
    return z
        .custom<FileList>(
            (value) =>
                typeof FileList !== "undefined" &&
                value instanceof FileList &&
                value.length > 0,
            "Dokumen wajib diunggah"
        )
        .refine(
            (files) => files[0]?.type === "application/pdf",
            "Dokumen harus berupa file PDF"
        )
        .refine(
            (files) => files[0]?.size <= maxSizeInBytes,
            `Ukuran dokumen maksimal ${formatFileSize(maxSizeInBytes)}`
        );
}

function optionalText(max = 120) {
    return z.string().trim().max(max).optional().or(z.literal(""));
}

function addIssue(
    ctx: z.RefinementCtx,
    path: string,
    message: string
) {
    ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [path],
        message,
    });
}

const mechaturaCompetitionShape = {
    competition_type: z
        .custom<"sumo" | "transporter">(
            isMechaturaCompetitionType,
            "Tipe robot wajib dipilih."
        ),
};

const mechaturaIdentityShape = {
    // Team Identity
    team_name: requiredText("Nama tim"),
    institution: requiredText("Asal institusi"),
    province: requiredText("Lokasi institusi"),

    // Team Leader Identity
    leader_name: requiredText("Nama ketua"),
    leader_email: emailSchema("Email ketua"),
    leader_phone: requiredPhone("Nomor ketua"),

    member_count: z.number().min(0).max(2),

    // Team Member Identity
    member2_name: z.string().trim().max(120).optional().or(z.literal("")),
    member2_email: emailSchema("Email member ke-2").optional().or(z.literal("")),
    member2_phone: requiredPhone("Nomor member ke-2").optional().or(z.literal("")),

    member3_name: z.string().trim().max(120).optional().or(z.literal("")),
    member3_email: emailSchema("Email member ke-3").optional().or(z.literal("")),
    member3_phone: requiredPhone("Nomor member ke-3").optional().or(z.literal("")),

    // Team Coach Identity
    has_coach: z.boolean(),
    coach_name: optionalText(),
    coach_email: emailSchema("Email pembimbing").optional().or(z.literal("")),
    coach_phone: requiredPhone("Nomor pembimbing").optional().or(z.literal("")),
};

const mechaturaAttachmentShape = {
    member_document: createDocumentSchema(DEFAULT_MECHATURA_DOCUMENT_MAX_SIZE),
    robot_name: requiredText("Nama robot"),
    robot_document: createDocumentSchema(DEFAULT_MECHATURA_DOCUMENT_MAX_SIZE),
};

const mechaturaVerificationShape = {
    identity_confirmed: z.boolean().refine(Boolean, {
        message: "Konfirmasi data wajib dicentang.",
    }),
};

const mechaturaSubmissionShape = {
    ...mechaturaCompetitionShape,
    ...mechaturaIdentityShape,
    robot_name: requiredText("Nama robot"),
    identity_confirmed: z.boolean().refine(Boolean, {
        message: "Konfirmasi data wajib dicentang.",
    }),
};

export const MECHATURA_COMPETITION_FIELDS = Object.keys(mechaturaCompetitionShape);
export const MECHATURA_IDENTITY_FIELDS = Object.keys(mechaturaIdentityShape);
export const MECHATURA_ATTACHMENT_FIELDS = Object.keys(mechaturaAttachmentShape);
export const MECHATURA_EDITABLE_FIELDS = [
    ...MECHATURA_COMPETITION_FIELDS,
    ...MECHATURA_IDENTITY_FIELDS,
    ...MECHATURA_ATTACHMENT_FIELDS,
];
export const MECHATURA_VERIFICATION_FIELDS = [
    ...MECHATURA_EDITABLE_FIELDS,
    ...Object.keys(mechaturaVerificationShape),
];

function requireCoachWhenSelected<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
    return schema.superRefine((values, ctx) => {
        const coach = values as CoachFields;

        if (!coach.has_coach) {
            return;
        }

        const coachName = requiredText("Nama pembimbing").safeParse(coach.coach_name);
        const coachEmail = emailSchema("Email pembimbing").safeParse(coach.coach_email);
        const coachPhone = requiredPhone("Nomor pembimbing").safeParse(coach.coach_phone);

        if (!coachName.success) {
            addIssue(ctx, "coach_name", coachName.error.issues[0]?.message ?? "Nama pembimbing wajib diisi.");
        }

        if (!coachEmail.success) {
            addIssue(ctx, "coach_email", coachEmail.error.issues[0]?.message ?? "Email pembimbing wajib diisi.");
        }

        if (!coachPhone.success) {
            addIssue(ctx, "coach_phone", coachPhone.error.issues[0]?.message ?? "Nomor pembimbing wajib diisi.");
        }
    });
}

function requireMembersWhenPartiallyFilled<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
    return schema.superRefine((values, ctx) => {
        const memberCount = (values as any).member_count || 0;

        // Anggota 2 Validation
        const m2Name = !!(values as any).member2_name?.trim();
        const m2Email = !!(values as any).member2_email?.trim();
        const m2Phone = !!(values as any).member2_phone?.trim();

        if (memberCount >= 1 || m2Name || m2Email || m2Phone) {
            if (!m2Name) addIssue(ctx, "member2_name", "Nama anggota 1 wajib diisi.");
            if (!m2Email) addIssue(ctx, "member2_email", "Email anggota 1 wajib diisi.");
            if (!m2Phone) addIssue(ctx, "member2_phone", "Nomor telepon anggota 1 wajib diisi.");
        }

        // Anggota 3 Validation
        const m3Name = !!(values as any).member3_name?.trim();
        const m3Email = !!(values as any).member3_email?.trim();
        const m3Phone = !!(values as any).member3_phone?.trim();

        if (memberCount === 2 || m3Name || m3Email || m3Phone) {
            if (!m3Name) addIssue(ctx, "member3_name", "Nama anggota 2 wajib diisi.");
            if (!m3Email) addIssue(ctx, "member3_email", "Email anggota 2 wajib diisi.");
            if (!m3Phone) addIssue(ctx, "member3_phone", "Nomor telepon anggota 2 wajib diisi.");
        }
    });
}

export const mechaturaIdentitySchema = requireMembersWhenPartiallyFilled(requireCoachWhenSelected(
    z.object(mechaturaIdentityShape)
));

const mechaturaCompetitionSchema = z.object(mechaturaCompetitionShape);
export const mechaturaSubmissionSchema = requireMembersWhenPartiallyFilled(requireCoachWhenSelected(
    z.object(mechaturaSubmissionShape)
));

// IDENTITIY STEP VALIDATIONS
export function createMechaturaSchema({
    documentMaxSizeInBytes = DEFAULT_MECHATURA_DOCUMENT_MAX_SIZE,
}: CreateMechaturaSchemaOptions = {}) {
    return requireMembersWhenPartiallyFilled(requireCoachWhenSelected(z.object({
        ...mechaturaCompetitionShape,
        ...mechaturaIdentityShape,
        // Team Attachments
        member_document: createDocumentSchema(documentMaxSizeInBytes),
        robot_name: requiredText("Nama robot"),
        robot_document: createDocumentSchema(documentMaxSizeInBytes),
        ...mechaturaVerificationShape,
    })));
}

export const MechaturaFormSchema = createMechaturaSchema();
export type MechaturaValues = z.infer<ReturnType<typeof createMechaturaSchema>>;
const mechaturaSchema = MechaturaFormSchema;
export type MechaturaFormValues = MechaturaValues;
