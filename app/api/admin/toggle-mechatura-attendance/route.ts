import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { invalidRequest, rateLimited, readJsonBody, serverError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase-admin";

const toggleMechaturaAttendanceSchema = z.object({
  registration_id: z.uuid(),
  attended: z.boolean(),
});

export async function POST(request: Request) {
  const limit = await rateLimit(request, {
    key: "admin-toggle-mechatura-attendance",
    limit: 60,
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

  const parsed = toggleMechaturaAttendanceSchema.safeParse(body.data);

  if (!parsed.success) {
    return invalidRequest();
  }

  const supabase = createAdminClient();
  const { registration_id, attended } = parsed.data;

  const { data: updatedRegistration, error } = await supabase
    .from("mechatura_registrations")
    .update({
      attended,
      check_in_time: attended ? new Date().toISOString() : null,
    })
    .eq("id", registration_id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to toggle Mechatura attendance", error.message);
    return serverError();
  }

  if (!updatedRegistration) {
    return NextResponse.json({ error: "Mechatura team not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
