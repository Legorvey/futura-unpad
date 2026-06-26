import { NextResponse } from "next/server";
import { invalidRequest, rateLimited, readJsonBody } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const limit = await rateLimit(request, {
    key: "auth-forgot-password",
    limit: 4,
    windowSeconds: 300,
  });

  if (!limit.success) {
    return rateLimited(limit.retryAfter);
  }

  const body = await readJsonBody(request);

  if (!body.ok) {
    return body.response;
  }

  const parsed = forgotPasswordSchema.safeParse(body.data);

  if (!parsed.success) {
    return invalidRequest();
  }

  const requestUrl = new URL(request.url);
  const redirectUrl = new URL(
    "/auth/verify-reset",
    process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin
  );

  const { createAdminClient } = await import("@/utils/supabase/server");
  const adminSupabase = createAdminClient();

  // 1. Generate the recovery link using the Admin client (bypasses standard limits)
  const { data: linkData, error: generateError } = await adminSupabase.auth.admin.generateLink({
    type: "recovery",
    email: parsed.data.email,
    options: {
      redirectTo: redirectUrl.toString(),
    },
  });

  if (generateError) {
    return NextResponse.json({ error: generateError.message }, { status: 400 });
  }

  // 2. Send the email directly via Resend to bypass Supabase's 30/hr limit
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error("RESEND_API_KEY is missing in environment variables.");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const actionLink = linkData.properties.action_link;

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Futura Support <onboarding@resend.dev>",
      to: parsed.data.email,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset your password. Click the button below to choose a new password:</p>
          <a href="${actionLink}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; margin-top: 16px;">Reset Password</a>
          <p style="margin-top: 32px; font-size: 14px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    }),
  });

  if (!resendResponse.ok) {
    const errorData = await resendResponse.json().catch(() => null);
    console.error("Resend error:", errorData);
    return NextResponse.json(
      { error: "Failed to send reset email via Resend" },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
