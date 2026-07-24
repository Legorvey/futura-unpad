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
    
    // Always use the explicitly configured application URL to prevent Token Leakage
    // via Open Redirect on the client-side redirect_to payload.
    const appOrigin = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://futuraunpad.com";
    const magicLink = `${appOrigin}/auth/callback?token_hash=${email_data.token_hash}&type=${email_data.email_action_type}&next=${encodeURIComponent(email_data.redirect_to || '/profile/account')}`;

    const emailWrapper = (content: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body { 
            font-family: 'Space Grotesk', system-ui, -apple-system, sans-serif; 
            background-color: #000000; 
            margin: 0; 
            padding: 40px 20px; 
            color: #e5e7eb; 
            -webkit-font-smoothing: antialiased;
          }
          .container { 
            max-width: 520px; 
            margin: 0 auto; 
            background: #09090b; 
            border: 1px solid #27272a;
            border-radius: 16px; 
            padding: 48px; 
          }
          .logo { 
            font-size: 28px; 
            font-weight: 700; 
            color: #ffffff; 
            margin-bottom: 40px; 
            letter-spacing: -0.05em; 
          }
          .content-title {
            font-size: 24px;
            font-weight: 600;
            color: #ffffff;
            margin-top: 0;
            margin-bottom: 16px;
            letter-spacing: -0.03em;
          }
          .content-text {
            font-size: 15px;
            line-height: 1.6;
            color: #a1a1aa;
            margin-bottom: 24px;
          }
          .btn-container {
            margin: 32px 0;
          }
          .btn { 
            display: inline-block; 
            background-color: #ffffff; 
            color: #000000; 
            text-decoration: none; 
            padding: 14px 28px; 
            border-radius: 8px; 
            font-weight: 600; 
            font-size: 15px;
            transition: all 0.2s ease;
          }
          .btn:hover {
            opacity: 0.9;
          }
          .footer { 
            margin-top: 48px; 
            font-size: 13px; 
            color: #52525b; 
            text-align: center; 
            border-top: 1px solid #27272a; 
            padding-top: 24px; 
          }
          .code { 
            background: #18181b; 
            border: 1px solid #27272a;
            padding: 16px; 
            border-radius: 8px; 
            font-size: 24px; 
            font-weight: 700; 
            letter-spacing: 0.2em; 
            text-align: center; 
            margin: 24px 0;
            color: #ffffff;
          }
          .warning-box {
            background-color: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            border-radius: 8px;
            padding: 16px;
            margin-top: 24px;
          }
          .warning-text {
            color: #ef4444;
            font-size: 13px;
            margin: 0;
            line-height: 1.5;
          }
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
        subject = "Selesaikan pendaftaran Futura Anda";
        html = emailWrapper(`
          <h2 class="content-title">Selamat datang di Futura!</h2>
          <p class="content-text">Kami sangat senang menyambut Anda. Silakan verifikasi alamat email Anda untuk menyelesaikan pendaftaran dan mendapatkan akses penuh.</p>
          <div class="btn-container"><a href="${magicLink}" class="btn">Verifikasi Alamat Email</a></div>
          <p class="content-text">Atau masukkan kode ini secara manual:</p>
          <div class="code">${email_data.token}</div>
        `);
        break;
      case "recovery":
        from = `Futura Support <support@${EMAIL_DOMAIN}>`;
        subject = "Atur ulang kata sandi Futura Anda";
        html = emailWrapper(`
          <h2 class="content-title">Permintaan Atur Ulang Kata Sandi</h2>
          <p class="content-text">Kami menerima permintaan untuk mengatur ulang kata sandi akun Futura Anda. Klik tombol di bawah untuk mengatur kata sandi baru dengan aman.</p>
          <div class="btn-container"><a href="${magicLink}" class="btn">Atur Ulang Kata Sandi</a></div>
          <p class="content-text" style="font-size: 13px;">Jika Anda tidak merasa melakukan permintaan ini, Anda dapat mengabaikan email ini dengan aman. Kata sandi Anda tidak akan berubah.</p>
        `);
        break;
      case "email_change":
        const emailPromises = [];

        if (email_data.token_hash) {
          const oldMagicLink = `${appOrigin}/auth/callback?token_hash=${email_data.token_hash}&type=${email_data.email_action_type}&next=${encodeURIComponent('/profile/account')}`;
          emailPromises.push(
            resend.emails.send({
              from: `Futura Security <security@${EMAIL_DOMAIN}>`,
              to: [user.email],
              subject: "Konfirmasi Perubahan Alamat Email",
              html: emailWrapper(`
                <h2 class="content-title">Konfirmasi Perubahan Email</h2>
                <p class="content-text">Kami menerima permintaan untuk mengubah alamat email yang terhubung dengan akun Futura Anda.</p>
                <p class="content-text">Untuk mengizinkan perubahan ini, silakan konfirmasi dengan mengklik tombol di bawah:</p>
                <div class="btn-container"><a href="${oldMagicLink}" class="btn">Konfirmasi Perubahan</a></div>
                <div class="warning-box">
                  <p class="warning-text"><strong>Peringatan Keamanan:</strong> Jika Anda tidak melakukan permintaan ini, akun Anda mungkin disusupi. Harap abaikan email ini dan segera amankan akun Anda.</p>
                </div>
              `),
            })
          );
        }
        
        if (email_data.token_hash_new && user.new_email) {
          const newMagicLink = `${appOrigin}/auth/callback?token_hash=${email_data.token_hash_new}&type=${email_data.email_action_type}&next=${encodeURIComponent('/profile/account')}`;
          emailPromises.push(
            resend.emails.send({
              from: `Futura Security <security@${EMAIL_DOMAIN}>`,
              to: [user.new_email],
              subject: "Verifikasi Alamat Email Baru Anda",
              html: emailWrapper(`
                <h2 class="content-title">Verifikasi Alamat Email Baru</h2>
                <p class="content-text">Seseorang meminta untuk menggunakan alamat email ini untuk akun Futura mereka.</p>
                <p class="content-text">Jika ini adalah Anda, silakan verifikasi alamat email Anda untuk menyelesaikan transisi:</p>
                <div class="btn-container"><a href="${newMagicLink}" class="btn">Verifikasi Email</a></div>
                <div class="warning-box">
                  <p class="warning-text"><strong>Peringatan:</strong> Jika Anda tidak melakukan permintaan ini, jangan klik tautan di atas. Seseorang mungkin mencoba membajak email Anda.</p>
                </div>
              `),
            })
          );
        }
        
        // Await all emails concurrently to prevent webhook timeout
        const results = await Promise.all(emailPromises);
        
        // Check for any Resend errors to ensure Supabase safely retries on failure
        for (const result of results) {
          if (result.error) throw result.error;
        }
        
        return NextResponse.json({ ok: true });
      default:
        from = `Futura Updates <hello@${EMAIL_DOMAIN}>`;
        subject = "Tautan masuk ajaib Futura Anda";
        html = emailWrapper(`
          <h2 style="margin-top: 0;">Masuk ke Futura</h2>
          <div style="text-align: center;"><a href="${magicLink}" class="btn" style="color: #fff;">Masuk dengan Aman</a></div>
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
