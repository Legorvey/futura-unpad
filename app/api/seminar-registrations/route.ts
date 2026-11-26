import { NextResponse } from "next/server";
import type { z } from "zod";
import { isUniqueViolation } from "@/lib/database-errors";
import { sendSeminarTicketEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@/utils/supabase/server";
import {
  NO_STORE_HEADERS,
  invalidRequest,
  isSameOriginRequest,
  jsonError,
  rateLimited,
  readJsonBody,
  serverError,
} from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { seminarRegistrationSchema } from "@/lib/validation";
import {
  hasSeminarRegistrationStarted,
  isSeminarRegistrationOpen,
} from "@/lib/seminar/config";
import { seminarStatusOptions } from "@/lib/seminar/seminar-options";
import {
  getSeminarWaGroupUrl,
  isSeminarEmailRegistered,
} from "@/lib/seminar/server-config";

export const runtime = "nodejs";

type SeminarStatusAkademika = z.infer<
  typeof seminarRegistrationSchema
>["status_akademika"];

type SeminarRegistrationInsert = {
  user_id: string | null;
  nama_lengkap: string;
  email: string | null;
  no_telepon: string | null;
  asal_institusi: string;
  status_akademika: SeminarStatusAkademika;
  registration_type: "individual" | "group";
  group_name: string | null;
  group_id: string | null;
  is_main_contact: boolean;
};

const duplicateEmailResponse = () =>
  NextResponse.json(
    {
      error: "Email ini sudah terdaftar pada Seminar Nasional.",
    },
    { status: 409, headers: NO_STORE_HEADERS }
  );

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return jsonError("Forbidden", 403);
  }

  if (!isSeminarRegistrationOpen()) {
    return NextResponse.json(
      {
        success: false,
        error: hasSeminarRegistrationStarted()
          ? "Pendaftaran Seminar Nasional telah ditutup."
          : "Pendaftaran Seminar Nasional belum dibuka.",
      },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }

  const ipLimit = await rateLimit(request, {
    key: "seminar-registration-ip",
    limit: 30,
    windowSeconds: 300,
  });

  if (!ipLimit.success) {
    return rateLimited(ipLimit.retryAfter);
  }

  const body = await readJsonBody(request, 24_576);

  if (!body.ok) {
    return body.response;
  }

  const parsed = seminarRegistrationSchema.safeParse(body.data);

  if (!parsed.success) {
    return invalidRequest();
  }

  const emailLimit = await rateLimit(parsed.data.email, {
    key: "seminar-registration-email",
    limit: 5,
    windowSeconds: 300,
  });

  if (!emailLimit.success) {
    return rateLimited(emailLimit.retryAfter);
  }

  let authenticatedUserId: string | null = null;
  try {
    const authSupabase = await createClient();
    const {
      data: { user },
    } = await authSupabase.auth.getUser();
    authenticatedUserId = user?.id ?? null;
  } catch {
    authenticatedUserId = null;
  }

  const supabase = createAdminClient();

  try {
    if (await isSeminarEmailRegistered(parsed.data.email)) {
      return duplicateEmailResponse();
    }
  } catch (lookupError) {
    console.error(
      "Duplicate email lookup failed",
      lookupError instanceof Error ? lookupError.message : lookupError
    );
    return serverError();
  }

  let insertUserId: string | null = authenticatedUserId;
  if (authenticatedUserId) {
    const { data: existingByUser, error: userLookupError } = await supabase
      .from("seminar_registrations")
      .select("id")
      .eq("user_id", authenticatedUserId)
      .eq("is_main_contact", true)
      .limit(1);

    if (userLookupError) {
      console.error("User registration lookup failed", userLookupError.message);
      return serverError();
    }

    if (existingByUser?.[0]) {
      insertUserId = null;
    }
  }

  const isGroup = parsed.data.registration_type === "group";
  const groupId = isGroup ? crypto.randomUUID() : null;

  const inserts: SeminarRegistrationInsert[] = [
    {
      user_id: insertUserId,
      nama_lengkap: parsed.data.nama_lengkap,
      email: parsed.data.email,
      no_telepon: parsed.data.no_telepon,
      asal_institusi: parsed.data.asal_institusi,
      status_akademika: parsed.data.status_akademika,
      registration_type: parsed.data.registration_type,
      group_name: null,
      group_id: groupId,
      is_main_contact: true,
    },
  ];

  if (isGroup && parsed.data.members) {
    for (const member of parsed.data.members) {
      inserts.push({
        user_id: null,
        nama_lengkap: member.nama_lengkap,
        email: null,
        no_telepon: null,
        asal_institusi: member.asal_institusi || parsed.data.asal_institusi,
        status_akademika: parsed.data.status_akademika,
        registration_type: "group",
        group_name: null,
        group_id: groupId,
        is_main_contact: false,
      });
    }
  }

  const { data: insertedRegistrations, error } = await supabase
    .from("seminar_registrations")
    .insert(inserts)
    .select("id, is_main_contact, nama_lengkap, asal_institusi, group_name");

  if (error) {
    if (isUniqueViolation(error)) {
      const errorDetail = `${error.message ?? ""} ${(error as { details?: string }).details ?? ""}`.toLowerCase();
      if (errorDetail.includes("email")) {
        return duplicateEmailResponse();
      }
      return NextResponse.json(
        { error: "Pendaftaran tidak dapat diproses karena data duplikat." },
        { status: 409, headers: NO_STORE_HEADERS }
      );
    }
    console.error("Seminar registration insert failed", error.message);
    return serverError();
  }

  const mainContact =
    insertedRegistrations?.find((r) => r.is_main_contact) ||
    insertedRegistrations?.[0];
  const waGroupUrl = getSeminarWaGroupUrl();
  const statusLabel =
    seminarStatusOptions.find((o) => o.id === parsed.data.status_akademika)
      ?.title ?? parsed.data.status_akademika;

  const emailSent = mainContact?.id
    ? await Promise.race([
        sendSeminarTicketEmail({
          to: parsed.data.email,
          registrationId: mainContact.id,
          namaLengkap: parsed.data.nama_lengkap,
          noTelepon: parsed.data.no_telepon,
          asalInstitusi: parsed.data.asal_institusi,
          statusLabel,
          registrationType: parsed.data.registration_type,
          groupName: null,
          members: insertedRegistrations || [],
          waGroupUrl,
        }),
        new Promise<boolean>((resolve) =>
          setTimeout(() => resolve(false), 6000)
        ),
      ])
    : false;

  return NextResponse.json(
    {
      success: true,
      registration_id: mainContact?.id,
      registrations: insertedRegistrations || [],
      wa_group_url: waGroupUrl,
      email_sent: emailSent,
      linked_to_profile: Boolean(insertUserId),
    },
    { headers: NO_STORE_HEADERS }
  );
}
