import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { invalidRequest, rateLimited, readJsonBody, serverError } from "@/lib/http";
import { isCompletedPaymentStatus } from "@/lib/payment";
import { rateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase-admin";

const verifyMechaturaTeamSchema = z.object({
  registration_id: z.uuid(),
});

type MechaturaCheckInTarget = {
  id: string;
  team_name: string | null;
  payment_status: string | null;
  attended: boolean | null;
};

export async function POST(request: Request) {
  const limit = await rateLimit(request, {
    key: "admin-verify-mechatura-team",
    limit: 30,
    windowSeconds: 60,
  });

  if (!limit.success) {
    return rateLimited(limit.retryAfter);
  }

  const { user, adminAccess } = await requireAdmin();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!adminAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await readJsonBody(request);

  if (!body.ok) {
    return body.response;
  }

  const parsed = verifyMechaturaTeamSchema.safeParse(body.data);

  if (!parsed.success) {
    return invalidRequest();
  }

  const adminSupabase = createAdminClient();
  const { data: registration, error: fetchError } = await adminSupabase
    .from("mechatura_registrations")
    .select("id,team_name,payment_status,attended")
    .eq("id", parsed.data.registration_id)
    .maybeSingle<MechaturaCheckInTarget>();

  if (fetchError) {
    console.error("Mechatura check-in lookup failed", fetchError.message);
    return serverError();
  }

  if (!registration) {
    return NextResponse.json({ error: "Mechatura team not found" }, { status: 404 });
  }

  if (!isCompletedPaymentStatus(registration.payment_status)) {
    return NextResponse.json(
      { error: "Mechatura team payment is not complete" },
      { status: 409 }
    );
  }

  if (registration.attended) {
    return NextResponse.json(
      { error: "Mechatura team already checked in" },
      { status: 409 }
    );
  }

  const checkInTime = new Date().toISOString();
  const { data: updatedRegistration, error: updateError } = await adminSupabase
    .from("mechatura_registrations")
    .update({
      attended: true,
      check_in_time: checkInTime,
    })
    .eq("id", registration.id)
    .or("attended.eq.false,attended.is.null")
    .select("team_name")
    .maybeSingle<{ team_name: string | null }>();

  if (updateError) {
    console.error("Mechatura check-in update failed", updateError.message);
    return serverError();
  }

  if (!updatedRegistration) {
    return NextResponse.json(
      { error: "Mechatura team already checked in" },
      { status: 409 }
    );
  }

  const { count, error: countError } = await adminSupabase
    .from("mechatura_members")
    .select("id", { count: "exact", head: true })
    .eq("registration_id", registration.id);

  if (countError) {
    console.error("Mechatura member count failed", countError.message);
  }

  return NextResponse.json({
    ok: true,
    team: {
      team_name: updatedRegistration.team_name ?? "Mechatura Team",
      member_count: count ?? 0,
    },
  });
}
