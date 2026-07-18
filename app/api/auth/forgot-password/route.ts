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

  const emailLimit = await rateLimit(request, {
    key: `auth-forgot-password:${parsed.data.email}`,
    limit: 3,
    windowSeconds: 300,
  });

  if (!emailLimit.success) {
    return rateLimited(emailLimit.retryAfter);
  }

  const appOrigin = process.env.NEXT_PUBLIC_APP_URL;
  if (!appOrigin) {
    return NextResponse.json({ error: "Server configuration error: NEXT_PUBLIC_APP_URL is not set" }, { status: 500 });
  }

  const redirectUrl = new URL("/auth/callback?next=/reset-password", appOrigin);

  const { createClient, createAdminClient } = await import("@/utils/supabase/server");
  const supabase = await createClient();
  const adminAuth = createAdminClient().auth;

  const { data, error } = await adminAuth.admin.generateLink({
    type: "recovery",
    email: parsed.data.email,
    options: {
      redirectTo: redirectUrl.toString(),
    }
  });

  if (error) {
    if (error.message.includes("User not found") || error.status === 404) {
      // Prevent user enumeration by silently returning success
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const properties = (data as any).properties;
  if (properties && properties.email_otp && properties.hashed_token) {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const EMAIL_DOMAIN = "mail.futuraunpad.com";
    const magicLink = `${appOrigin}/auth/callback?token_hash=${properties.hashed_token}&type=recovery&next=${encodeURIComponent("/reset-password")}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      </head>
      <body style="background-color:#f9fafb; padding: 40px 20px; margin: 0; -webkit-font-smoothing: antialiased;">
        <div style="font-family:'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width:540px; margin:40px auto; border:1px solid #e5e5e5; border-radius:16px; padding:48px 40px; color:#171717; background-color:#ffffff; box-shadow:0 4px 6px rgba(0,0,0,0.02);">
          <div style="font-weight:800; font-size:28px; letter-spacing:-1px; margin-bottom:32px; color:#000;">FUTURA</div>
          
          <h2 style="font-weight:700; font-size:22px; margin:0 0 24px 0; color:#111827;">Reset Password Anda</h2>
          
          <p style="font-size:16px; line-height:1.6; margin:0 0 40px 0; color:#374151;">Kami menerima permintaan untuk mereset password akun Futura Anda. Masukkan kode konfirmasi di bawah ini pada halaman reset untuk melanjutkan. Kode ini berlaku selama 1 jam.</p>
          
          <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; padding:32px 24px; text-align:center; margin-bottom:48px;">
            <div style="font-size:13px; text-transform:uppercase; letter-spacing:1px; color:#6b7280; margin-bottom:16px; font-weight:600;">Kode Reset</div>
            <div style="font-size:42px; font-weight:700; letter-spacing:0.25em; color:#111827; line-height:1;">${properties.email_otp}</div>
          </div>
          
          <p style="font-size:15px; color:#525252; margin:0 0 20px 0; text-align:center;">Atau, klik tombol di bawah untuk mereset secara instan:</p>
          
          <div style="text-align:center;">
            <a href="${magicLink}" style="display:inline-block; background:#171717; color:#ffffff; text-decoration:none; padding:16px 32px; border-radius:8px; font-size:15px; font-weight:600; letter-spacing:0.5px;">Reset Secara Otomatis</a>
          </div>
          
          <hr style="border:none; border-top:1px solid #e5e5e5; margin:48px 0 32px 0;" />
          
          <p style="font-size:13px; color:#737373; margin:0; line-height:1.6;">&copy; ${new Date().getFullYear()} Futura Unpad. Seluruh hak cipta dilindungi.</p>
        </div>
      </body>
      </html>
    `;

    try {
      await resend.emails.send({
        from: `Futura Support <support@${EMAIL_DOMAIN}>`,
        to: [parsed.data.email],
        subject: "Reset Password Futura Anda",
        html,
      });
    } catch (emailError) {
      console.error("Failed to send reset email:", emailError);
    }
  }

  return NextResponse.json({ ok: true });
}
