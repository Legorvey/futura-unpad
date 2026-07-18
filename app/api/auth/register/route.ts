import { NextResponse } from "next/server";
import { invalidRequest, rateLimited, readJsonBody } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { signupSchema } from "@/lib/validation";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import { Resend } from "resend";

const isExistingAccountResponse = (data: unknown) => {
  if (!data || typeof data !== "object" || !("user" in data)) {
    return false;
  }

  const user = (data as { user?: { identities?: unknown[] | null } | null }).user;

  return Array.isArray(user?.identities) && user.identities.length === 0;
};

const isExistingAccountError = (error: { message?: string } | null) => {
  const message = error?.message?.toLowerCase() ?? "";

  return (
    message.includes("already registered") ||
    message.includes("already exists") ||
    message.includes("user already")
  );
};

export async function POST(request: Request) {
  const limit = await rateLimit(request, {
    key: "auth-register",
    limit: 5,
    windowSeconds: 300,
  });

  if (!limit.success) {
    return rateLimited(limit.retryAfter);
  }

  const body = await readJsonBody(request);

  if (!body.ok) {
    return body.response;
  }

  const parsed = signupSchema.safeParse(body.data);

  if (!parsed.success) {
    return invalidRequest();
  }

  const appOrigin = process.env.NEXT_PUBLIC_APP_URL;
  if (!appOrigin) {
    return NextResponse.json({ error: "Server configuration error: NEXT_PUBLIC_APP_URL is not set" }, { status: 500 });
  }
  
  const redirectUrl = new URL("/auth/callback", appOrigin);
  redirectUrl.searchParams.set("next", "/profile?verified=1");

  const supabase = await createClient();
  const adminAuth = createAdminClient().auth;
  
  const rawUsername = parsed.data.username;
  const lowercaseUsername = rawUsername.toLowerCase();

  // Check if username is taken
  const { data: isTaken, error: takenError } = await supabase.rpc('is_username_taken', { p_username: lowercaseUsername });
  if (isTaken || takenError) {
    return NextResponse.json({ error: "This username is already taken." }, { status: 409 });
  }

  const { data, error } = await adminAuth.admin.generateLink({
    type: "signup",
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      redirectTo: redirectUrl.toString(),
      data: {
        username: lowercaseUsername,
        display_name: "",
      }
    }
  });

  if (error) {
    if (isExistingAccountError(error)) {
      try {
        let existingUser = null;
        let page = 1;
        while (true) {
          const { data: { users }, error: listError } = await adminAuth.admin.listUsers({ page, perPage: 1000 });
          if (listError || !users || users.length === 0) break;
          existingUser = users.find(u => u.email === parsed.data.email);
          if (existingUser) break;
          page++;
        }
        
        if (existingUser && !existingUser.email_confirmed_at) {
          await adminAuth.admin.deleteUser(existingUser.id);
          return NextResponse.json({ error: "Incomplete previous registration cleared. Please click Create Account again." }, { status: 400 });
        }
      } catch (err) {
        console.error("Error during unverified account cleanup:", err);
      }
      return NextResponse.json({ ok: true, authenticated: false });
    }
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 400 });
  }

  if (isExistingAccountResponse(data)) {
    return NextResponse.json({ ok: true, authenticated: false });
  }

  // Send the email using Resend
  const properties = (data as any).properties;
  if (properties && properties.email_otp && properties.hashed_token) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const EMAIL_DOMAIN = "mail.futuraunpad.com";
    const magicLink = `${appOrigin}/auth/callback?token_hash=${properties.hashed_token}&type=signup&next=${encodeURIComponent(redirectUrl.toString())}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      </head>
      <body style="background-color:#f9fafb; padding: 40px 20px; margin: 0; -webkit-font-smoothing: antialiased;">
        <div style="font-family:'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width:540px; margin:40px auto; border:1px solid #e5e5e5; border-radius:16px; padding:48px 40px; color:#171717; background-color:#ffffff; box-shadow:0 4px 6px rgba(0,0,0,0.02);">
          <div style="font-weight:800; font-size:28px; letter-spacing:-1px; margin-bottom:32px; color:#000;">FUTURA</div>
          
          <h2 style="font-weight:700; font-size:22px; margin:0 0 24px 0; color:#111827;">Verifikasi akun Anda</h2>
          
          <p style="font-size:16px; line-height:1.6; margin:0 0 40px 0; color:#374151;">Terima kasih telah bergabung dengan Futura Unpad! Masukkan kode konfirmasi di bawah ini pada halaman pendaftaran untuk mengaktifkan akun Anda. Kode ini berlaku selama 1 jam.</p>
          
          <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; padding:32px 24px; text-align:center; margin-bottom:48px;">
            <div style="font-size:13px; text-transform:uppercase; letter-spacing:1px; color:#6b7280; margin-bottom:16px; font-weight:600;">Kode Verifikasi</div>
            <div style="font-size:42px; font-weight:700; letter-spacing:0.25em; color:#111827; line-height:1;">${properties.email_otp}</div>
          </div>
          
          <p style="font-size:15px; color:#525252; margin:0 0 20px 0; text-align:center;">Atau, klik tombol di bawah untuk memverifikasi secara instan:</p>
          
          <div style="text-align:center;">
            <a href="${magicLink}" style="display:inline-block; background:#171717; color:#ffffff; text-decoration:none; padding:16px 32px; border-radius:8px; font-size:15px; font-weight:600; letter-spacing:0.5px;">Verifikasi Secara Otomatis</a>
          </div>
          
          <hr style="border:none; border-top:1px solid #e5e5e5; margin:48px 0 32px 0;" />
          
          <p style="font-size:13px; color:#737373; margin:0; line-height:1.6;">&copy; ${new Date().getFullYear()} Futura Unpad. Seluruh hak cipta dilindungi.</p>
        </div>
      </body>
      </html>
    `;

    try {
      await resend.emails.send({
        from: `Futura Authenticantion <auth@${EMAIL_DOMAIN}>`,
        to: [parsed.data.email],
        subject: "Verifikasi Akun Futura Anda",
        html,
      });
    } catch (emailError) {
      console.error("Failed to send registration email:", emailError);
    }
  }

  return NextResponse.json({ ok: true, authenticated: false });
}
