import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { invalidRequest, rateLimited, serverError } from "@/lib/http";
import { createRegistrationToken, getPaymentAmount } from "@/lib/payment";
import { rateLimit } from "@/lib/rate-limit";
import { seminarRegistrationSchema } from "@/lib/validation";
import { createClient } from "@/utils/supabase/server";

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
  const orderId = createRegistrationToken();
  const amount = getPaymentAmount(
    parsed.data.status_akademika,
    parsed.data.presentasi_riset
  );

  const adminSupabase = createAdminClient();
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
    console.error("Seminar registration insert failed", error.message);
    return serverError();
  }

  return NextResponse.json({ order_id: orderId });
}
