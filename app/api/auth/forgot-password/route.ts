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
    "/auth/callback?next=/reset-password",
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
    if (generateError.message.includes("User not found") || generateError.status === 404) {
      // Prevent user enumeration by silently returning success
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: generateError.message }, { status: 400 });
  }

  // 2. Send the email directly via Resend to bypass Supabase's 30/hr limit
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error("RESEND_API_KEY is missing in environment variables.");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const supabaseLink = new URL(linkData.properties.action_link);
  const token = supabaseLink.searchParams.get("token");
  
  if (!token) {
      console.error("Failed to extract token from Supabase action_link");
      return NextResponse.json({ error: "Failed to generate valid recovery link" }, { status: 500 });
  }

  const customLink = `${requestUrl.origin}/auth/callback?token_hash=${token}&type=recovery&next=/reset-password`;

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Futura Support <onboarding@resend.dev>",
      to: parsed.data.email,
      subject: "Reset Kata Sandi Akun Anda",
      html: `
        <div style="font-family: 'Inter', Helvetica, sans-serif; max-width: 600px; margin: 40px auto; padding: 32px; border: 1px solid #e5e5e5; border-radius: 12px; background-color: #ffffff; color: #171717;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 24px; font-weight: 700; margin: 0; color: #171717;">Reset Kata Sandi</h1>
          </div>
          
          <p style="font-size: 16px; line-height: 24px; margin: 0 0 24px 0; color: #525252;">Halo,</p>
          
          <p style="font-size: 16px; line-height: 24px; margin: 0 0 32px 0; color: #525252;">
            Kami menerima permintaan untuk mereset kata sandi akun <strong>Futura Unpad</strong> Anda. Silakan klik tombol di bawah ini untuk mengatur kata sandi baru:
          </p>
          
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${customLink}" style="display: inline-block; padding: 14px 28px; background-color: #171717; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 500;">Atur Ulang Kata Sandi</a>
          </div>
          
          <p style="font-size: 14px; line-height: 24px; margin: 0 0 32px 0; color: #737373;">
            Tautan ini hanya berlaku untuk sementara waktu. Jika Anda tidak pernah merasa meminta reset kata sandi, Anda dapat mengabaikan email ini dengan aman.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 0 0 24px 0;" />
          
          <p style="font-size: 12px; line-height: 20px; margin: 0; color: #a3a3a3; text-align: center;">
            &copy; ${new Date().getFullYear()} Futura Unpad. Seluruh hak cipta dilindungi.<br>
            Jika tombol di atas tidak berfungsi, salin dan tempel tautan berikut ke browser Anda:<br>
            <a href="${customLink}" style="color: #404040; word-break: break-all;">${customLink}</a>
          </p>
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
