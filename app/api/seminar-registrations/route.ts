import { NextResponse } from "next/server";
import { isUniqueViolation } from "@/lib/database-errors";
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
import { getSeminarWaGroupUrl } from "@/lib/seminar/server-config";

export const runtime = "nodejs";

type ExistingRegistration = {
  id: string;
  user_id: string | null;
  email: string;
};

type SeminarRegistrationInsert = {
  user_id: string | null;
  nama_lengkap: string;
  email: string | null | undefined;
  no_telepon: string | null | undefined;
  asal_institusi: string;
  status_akademika: "mahasiswa" | "siswa" | "dosen" | "umum";
  registration_type: "individual" | "group";
  group_name: string | null;
  group_id: string | null;
  is_main_contact: boolean;
};

const duplicateRegistrationResponse = (registration: ExistingRegistration) =>
  NextResponse.json(
    {
      error: "You already have a seminar registration.",
      registration_id: registration.id,
    },
    { status: 409 }
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

  const authSupabase = await createClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Please log in before registering for the seminar." },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  const userLimit = await rateLimit(user.id, {
    key: "seminar-registration-user",
    limit: 5,
    windowSeconds: 300,
  });

  if (!userLimit.success) {
    return rateLimited(userLimit.retryAfter);
  }

  const body = await readJsonBody(request, 24_576);

  if (!body.ok) {
    return body.response;
  }

  const parsed = seminarRegistrationSchema.safeParse(body.data);

  if (!parsed.success) {
    return invalidRequest();
  }

  const supabase = createAdminClient();

  const existingQuery = supabase
    .from("seminar_registrations")
    .select("id,user_id,email")
    .eq("user_id", user.id)
    .eq("is_main_contact", true);

  const { data: existingRegistration, error: existingError } =
    await existingQuery.order("created_at", { ascending: false }).limit(1);

  if (existingError) {
    console.error("Duplicate registration lookup failed", existingError.message);
    return serverError();
  }

  if (existingRegistration?.[0]) {
    return duplicateRegistrationResponse(
      existingRegistration[0] as ExistingRegistration
    );
  }

  const isGroup = parsed.data.registration_type === "group";
  const groupId = isGroup ? crypto.randomUUID() : null;

  const inserts: SeminarRegistrationInsert[] = [
    {
      user_id: user.id,
      nama_lengkap: parsed.data.nama_lengkap,
      email: parsed.data.email,
      no_telepon: parsed.data.no_telepon,
      asal_institusi: parsed.data.asal_institusi,
      status_akademika: parsed.data.status_akademika,
      registration_type: parsed.data.registration_type,
      group_name: isGroup ? parsed.data.group_name || null : null,
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
        group_name: parsed.data.group_name || null,
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
      return NextResponse.json(
        { error: "You already have a seminar registration." },
        { status: 409 }
      );
    }
    console.error("Seminar registration insert failed", error.message);
    return serverError();
  }

  const mainContact =
    insertedRegistrations?.find((r) => r.is_main_contact) ||
    insertedRegistrations?.[0];

  return NextResponse.json(
    {
      success: true,
      registration_id: mainContact?.id,
      registrations: insertedRegistrations || [],
      wa_group_url: getSeminarWaGroupUrl(),
    },
    { headers: NO_STORE_HEADERS }
  );
}
