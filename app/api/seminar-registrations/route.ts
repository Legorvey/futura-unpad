import { NextResponse } from "next/server";
import { isUniqueViolation } from "@/lib/database-errors";
import { createAdminClient } from "@/lib/supabase-admin";
import { invalidRequest, rateLimited, serverError } from "@/lib/http";
import { createRegistrationToken, getPaymentAmount } from "@/lib/payment";
import { rateLimit } from "@/lib/rate-limit";
import { seminarRegistrationSchema } from "@/lib/validation";
import { createClient } from "@/utils/supabase/server";

type ExistingRegistration = {
  xendit_external_id: string;
  payment_status: string | null;
  user_id: string | null;
  email: string;
};

const duplicateRegistrationResponse = (registration: ExistingRegistration) =>
  NextResponse.json(
    {
      error: "You already have a registration. Continue to your profile to view payment status.",
      order_id: registration.xendit_external_id,
      payment_status: registration.payment_status,
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
  const existingBaseQuery = adminSupabase
    .from("seminar_registrations")
    .select("xendit_external_id,payment_status,user_id,email");
  const existingQuery = user
    ? existingBaseQuery.or(`user_id.eq.${user.id},email.eq.${parsed.data.email}`)
    : existingBaseQuery.eq("email", parsed.data.email);
  const { data: existingRegistration, error: existingError } = user
    ? await existingQuery.order("created_at", { ascending: false }).limit(1)
    : await existingQuery.order("created_at", { ascending: false }).limit(1);

  if (existingError) {
    console.error("Duplicate registration lookup failed", existingError.message);
    return serverError();
  }

  if (existingRegistration?.[0]) {
    return duplicateRegistrationResponse(existingRegistration[0] as ExistingRegistration);
  }

  const orderId = createRegistrationToken();
  const amount = getPaymentAmount(
    parsed.data.status_akademika,
    parsed.data.presentasi_riset
  );

  const { error } = await adminSupabase.from("seminar_registrations").insert({
    user_id: user?.id ?? null,
    nama_lengkap: parsed.data.nama_lengkap,
    email: parsed.data.email,
    no_telepon: parsed.data.no_telepon,
    asal_institusi: parsed.data.asal_institusi,
    status_akademika: parsed.data.status_akademika,
    presentasi_riset: parsed.data.presentasi_riset,
    payment_status: "unpaid",
    payment_amount: amount,
    xendit_external_id: orderId,
  });

  if (error) {
    if (isUniqueViolation(error)) {
      const duplicateBaseQuery = adminSupabase
        .from("seminar_registrations")
        .select("xendit_external_id,payment_status,user_id,email");
      const duplicateQuery = user
        ? duplicateBaseQuery.or(`user_id.eq.${user.id},email.eq.${parsed.data.email}`)
        : duplicateBaseQuery.eq("email", parsed.data.email);
      const { data: registration } = user
        ? await duplicateQuery
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle<ExistingRegistration>()
        : await duplicateQuery
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle<ExistingRegistration>();

      if (registration) {
        return duplicateRegistrationResponse(registration);
      }

      return NextResponse.json(
        { error: "You already have a registration. Continue to your profile to view payment status." },
        { status: 409 }
      );
    }

    console.error("Seminar registration insert failed", error.message);
    return serverError();
  }

  return NextResponse.json({ order_id: orderId });
}
