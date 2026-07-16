import { NextResponse } from "next/server";

import { invalidRequest, jsonError, rateLimited, serverError } from "@/lib/http";
import {
  deleteMechaturaRegistration,
  findLatestMechaturaRegistrationForUser,
  getMechaturaRegistrationStepHref,
  isMechaturaPaymentExpired,
} from "@/lib/mechatura/registration";
import {
  createRegistrationToken,
  mechaturaPaymentAmount,
} from "@/lib/payment";
import { rateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase-admin";
import {
  DEFAULT_MECHATURA_DOCUMENT_MAX_SIZE,
  mechaturaSubmissionSchema,
} from "@/lib/validation/mechatura";
import { createClient } from "@/utils/supabase/server";

const MAX_MULTIPART_BYTES = 6 * 1024 * 1024;
const MECHATURA_DOCUMENT_BUCKET = "mechatura-documents";

const textValue = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "");

const boolValue = (formData: FormData, name: string) =>
  textValue(formData, name) === "true";

const createTeamId = () =>
  `MCH-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomUUID()
    .slice(0, 8)
    .toUpperCase()}`;

const isValidPdf = (value: FormDataEntryValue | null): value is File =>
  typeof File !== "undefined" &&
  value instanceof File &&
  value.size > 0 &&
  value.size <= DEFAULT_MECHATURA_DOCUMENT_MAX_SIZE &&
  value.type === "application/pdf";

const ensureDocumentBucket = async (
  supabase: ReturnType<typeof createAdminClient>
) => {
  const { error: lookupError } = await supabase.storage.getBucket(
    MECHATURA_DOCUMENT_BUCKET
  );

  if (!lookupError) {
    return true;
  }

  const { error: createError } = await supabase.storage.createBucket(
    MECHATURA_DOCUMENT_BUCKET,
    { public: false }
  );

  return !createError;
};

export async function POST(request: Request) {
  const limit = await rateLimit(request, {
    key: "mechatura-registration",
    limit: 5,
    windowSeconds: 300,
  });

  if (!limit.success) {
    return rateLimited(limit.retryAfter);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (Number.isFinite(contentLength) && contentLength > MAX_MULTIPART_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const authSupabase = await createClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    return jsonError("Please log in before registering for Mechatura.", 401);
  }

  const adminSupabase = createAdminClient();
  const existingRegistration = await findLatestMechaturaRegistrationForUser(
    adminSupabase,
    user.id
  ).catch((error) => {
    console.error("Mechatura registration lookup failed", error.message);
    return undefined;
  });

  if (existingRegistration === undefined) {
    return serverError();
  }

  if (existingRegistration && isMechaturaPaymentExpired(existingRegistration)) {
    const deleted = await deleteMechaturaRegistration(
      adminSupabase,
      existingRegistration.id
    ).catch((error) => {
      console.error("Expired Mechatura registration cleanup failed", error.message);
      return null;
    });

    if (deleted === null) {
      return serverError();
    }
  } else if (existingRegistration) {
    return NextResponse.json(
      {
        error: "This account already has a Mechatura registration.",
        payment_url: getMechaturaRegistrationStepHref(existingRegistration),
      },
      { status: 409 }
    );
  }

  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return invalidRequest();
  }

  const parsed = mechaturaSubmissionSchema.safeParse({
    team_name: textValue(formData, "team_name"),
    competition_type: textValue(formData, "competition_type"),
    institution: textValue(formData, "institution"),
    province: textValue(formData, "province"),
    leader_name: textValue(formData, "leader_name"),
    leader_email: textValue(formData, "leader_email"),
    leader_phone: textValue(formData, "leader_phone"),
    member2_name: textValue(formData, "member2_name"),
    member2_email: textValue(formData, "member2_email"),
    member2_phone: textValue(formData, "member2_phone"),
    member3_name: textValue(formData, "member3_name"),
    member3_email: textValue(formData, "member3_email"),
    member3_phone: textValue(formData, "member3_phone"),
    member_count: Number(textValue(formData, "member_count") || 0),
    has_coach: boolValue(formData, "has_coach"),
    coach_name: textValue(formData, "coach_name"),
    coach_email: textValue(formData, "coach_email"),
    coach_phone: textValue(formData, "coach_phone"),
    robot_name: textValue(formData, "robot_name"),
    identity_confirmed: boolValue(formData, "identity_confirmed"),
  });

  const memberDocument = formData.get("member_document");
  const robotDocument = formData.get("robot_document");

  if (!parsed.success || !isValidPdf(memberDocument) || !isValidPdf(robotDocument)) {
    return invalidRequest();
  }

  const registrationId = crypto.randomUUID();
  const paymentOrderId = createRegistrationToken();
  const values = parsed.data;
  const memberDocumentPath = `${registrationId}/member-document.pdf`;
  const robotDocumentPath = `${registrationId}/robot-document.pdf`;

  const { data: registration, error: registrationError } = await adminSupabase
    .from("mechatura_registrations")
    .insert({
      id: registrationId,
      user_id: user.id,
      team_id: createTeamId(),
      team_name: values.team_name,
      institution: values.institution,
      province: values.province,
      competition_type: values.competition_type,
      robot_name: values.robot_name,
      registration_status: "waiting_payment",
      payment_status: "unpaid",
      payment_amount: mechaturaPaymentAmount,
      midtrans_order_id: paymentOrderId,
      member_document_path: memberDocumentPath,
      robot_document_path: robotDocumentPath,
    })
    .select("id")
    .single<{ id: string }>();

  if (registrationError || !registration) {
    console.error(
      "Mechatura registration insert failed",
      registrationError?.message
    );

    const latestRegistration = await findLatestMechaturaRegistrationForUser(
      adminSupabase,
      user.id
    ).catch(() => null);

    if (latestRegistration) {
      return NextResponse.json(
        {
          error: "This account already has a Mechatura registration.",
          payment_url: getMechaturaRegistrationStepHref(latestRegistration),
        },
        { status: 409 }
      );
    }

    return serverError();
  }

  const hasDocumentBucket = await ensureDocumentBucket(adminSupabase);

  if (!hasDocumentBucket) {
    console.error("Mechatura document bucket is unavailable");
    await adminSupabase
      .from("mechatura_registrations")
      .delete()
      .eq("id", registration.id);
    return serverError();
  }

  const documentUploads = await Promise.all([
    adminSupabase.storage
      .from(MECHATURA_DOCUMENT_BUCKET)
      .upload(memberDocumentPath, memberDocument, {
        contentType: "application/pdf",
        upsert: true,
      }),
    adminSupabase.storage
      .from(MECHATURA_DOCUMENT_BUCKET)
      .upload(robotDocumentPath, robotDocument, {
        contentType: "application/pdf",
        upsert: true,
      }),
  ]);

  const documentUploadError = documentUploads.find((result) => result.error)?.error;

  if (documentUploadError) {
    console.error("Mechatura document upload failed", documentUploadError.message);
    await adminSupabase
      .from("mechatura_registrations")
      .delete()
      .eq("id", registration.id);
    return serverError();
  }

  const memberRows = [
    {
      registration_id: registration.id,
      full_name: values.leader_name,
      email: values.leader_email,
      phone: values.leader_phone,
      is_leader: true,
    },
    ...[
      [values.member2_name, values.member2_email, values.member2_phone],
      [values.member3_name, values.member3_email, values.member3_phone],
      values.has_coach
        ? [values.coach_name, values.coach_email, values.coach_phone]
        : null,
    ]
      .filter(
        (member): member is [string | undefined, string | undefined, string | undefined] =>
          Array.isArray(member) && member.some(Boolean)
      )
      .map(([fullName, email, phone]) => ({
        registration_id: registration.id,
        full_name: fullName ?? "",
        email: email || null,
        phone: phone || null,
        is_leader: false,
      })),
  ];

  const { error: membersError } = await adminSupabase
    .from("mechatura_members")
    .insert(memberRows);

  if (membersError) {
    console.error("Mechatura members insert failed", membersError.message);
    await adminSupabase
      .from("mechatura_registrations")
      .delete()
      .eq("id", registration.id);
    return serverError();
  }

  return NextResponse.json({
    success: true,
    registration_id: registration.id,
    order_id: paymentOrderId,
    payment_url: `/payment?order_id=${encodeURIComponent(paymentOrderId)}`,
  });
}
