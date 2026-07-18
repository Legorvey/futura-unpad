import { NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const hookSecret = process.env.SEND_EMAIL_HOOK_SECRET?.replace("v1,whsec_", "") || "";

const EMAIL_DOMAIN = "mail.futuraunpad.com";

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    const headers = Object.fromEntries(request.headers);
    const wh = new Webhook(hookSecret);
    
    // Verify the webhook signature to ensure it actually came from Supabase
    const { user, email_data } = wh.verify(payload, headers) as any;

    let from = `Futura Notifications <noreply@${EMAIL_DOMAIN}>`;
    let subject = "Notification from Futura";
    let html = "";
    
    // Intelligently extract the correct app domain from the redirect_to URL
    // (Bypasses misconfigured Site URLs in the Supabase Dashboard)
    const appOrigin = email_data.redirect_to ? new URL(email_data.redirect_to).origin : "https://futuraunpad.com";
    const magicLink = `${appOrigin}/auth/callback?token_hash=${email_data.token_hash}&type=${email_data.email_action_type}&next=${encodeURIComponent(email_data.redirect_to)}`;

    const emailWrapper = (content: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #f9fafb; margin: 0; padding: 40px 20px; color: #111827; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
          .logo { font-size: 24px; font-weight: 800; color: #000; margin-bottom: 30px; letter-spacing: -0.5px; }
          .btn { display: inline-block; background-color: #000; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; margin: 20px 0; }
          .footer { margin-top: 40px; font-size: 13px; color: #6b7280; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px; }
          .code { background: #f3f4f6; padding: 10px 16px; border-radius: 6px; font-size: 18px; font-weight: 600; letter-spacing: 4px; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">FUTURA</div>
          ${content}
          <div class="footer">&copy; ${new Date().getFullYear()} Futura Unpad. All rights reserved.</div>
        </div>
      </body>
      </html>
    `;

    switch (email_data.email_action_type) {
      case "signup":
        from = `Futura Accounts <auth@${EMAIL_DOMAIN}>`;
        subject = "Complete your Futura registration";
        html = emailWrapper(`
          <h2 style="margin-top: 0;">Welcome to Futura!</h2>
          <p>Please verify your email address to complete your registration.</p>
          <div style="text-align: center;"><a href="${magicLink}" class="btn" style="color: #fff;">Verify Email Address</a></div>
          <p>Or use this code: <div class="code">${email_data.token}</div></p>
        `);
        break;
      case "recovery":
        from = `Futura Support <support@${EMAIL_DOMAIN}>`;
        subject = "Reset your Futura password";
        html = emailWrapper(`
          <h2 style="margin-top: 0;">Password Reset Request</h2>
          <p>Click the button below to securely reset your password:</p>
          <div style="text-align: center;"><a href="${magicLink}" class="btn" style="color: #fff;">Reset Password</a></div>
        `);
        break;
      default:
        from = `Futura Updates <hello@${EMAIL_DOMAIN}>`;
        subject = "Your magic link to sign in to Futura";
        html = emailWrapper(`
          <h2 style="margin-top: 0;">Sign in to Futura</h2>
          <div style="text-align: center;"><a href="${magicLink}" class="btn" style="color: #fff;">Secure Log In</a></div>
        `);
    }

    const { error } = await resend.emails.send({
      from,
      to: [user.email],
      subject,
      html,
    });
    
    if (error) throw error;
    return NextResponse.json({ ok: true });
    
  } catch (err: any) {
    console.error("Webhook processing failed:", err);
    return NextResponse.json({ error: err?.message || "Internal Server Error" }, { status: 401 });
  }
}
