import { NextResponse } from "next/server";
import { isUniqueViolation } from "@/lib/database-errors";
import { createAdminClient } from "@/lib/supabase-admin";
import { invalidRequest, rateLimited, serverError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { seminarRegistrationSchema } from "@/lib/validation";
import { createClient } from "@/utils/supabase/server";

type ExistingRegistration = {
  id: string;
  user_id: string | null;
  email: string;
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
  const limit = await rateLimit(request, {
    key: "seminar-registration",
    limit: 5,
    windowSeconds: 300,
  });

  if (!limit.success) {
    return rateLimited(limit.retryAfter);
  }

  const parsed = seminarRegistrationSchema.safeParse(
    await request.json().catch(() => null)
  );

  if (!parsed.success) {
    return invalidRequest();
  }

  const authSupabase = await createClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();
  const adminSupabase = createAdminClient();

  // Check duplicate by name AND email
  const existingQuery = adminSupabase
    .from("seminar_registrations")
    .select("id,user_id,email")
    .eq("email", parsed.data.email)
    .eq("nama_lengkap", parsed.data.nama_lengkap);

  const { data: existingRegistration, error: existingError } = await existingQuery
    .order("created_at", { ascending: false })
    .limit(1);

  if (existingError) {
    console.error("Duplicate registration lookup failed", existingError.message);
    return serverError();
  }

  if (existingRegistration?.[0]) {
    return duplicateRegistrationResponse(existingRegistration[0] as ExistingRegistration);
  }

  const isGroup = parsed.data.registration_type === "group";
  const groupId = isGroup ? crypto.randomUUID() : null;

  const inserts = [
    {
      user_id: user?.id ?? null,
      nama_lengkap: parsed.data.nama_lengkap,
      email: parsed.data.email,
      no_telepon: parsed.data.no_telepon,
      asal_institusi: parsed.data.asal_institusi,
      status_akademika: parsed.data.status_akademika,
      registration_type: parsed.data.registration_type,
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
        group_id: groupId,
        is_main_contact: false,
      });
    }
  }

  const { data: insertedRegistrations, error } = await adminSupabase
    .from("seminar_registrations")
    .insert(inserts)
    .select("id, is_main_contact");

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

  // Find the main contact record
  const mainContact = insertedRegistrations?.find(r => r.is_main_contact) || insertedRegistrations?.[0];

  return NextResponse.json({
    success: true,
    registration_id: mainContact?.id,
  });
}
