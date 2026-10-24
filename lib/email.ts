import { Resend } from "resend";

const EMAIL_DOMAIN = "mail.futuraunpad.com";

export async function sendSecurityEmail({
  to,
  subject,
  title,
  message,
  actionText,
  actionUrl,
}: {
  to: string;
  subject: string;
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[Security Email] RESEND_API_KEY missing. Skipped sending email to: ${to}`);
    return;
  }

  const resend = new Resend(apiKey);

  const actionButton =
    actionText && actionUrl
      ? `<div style="margin: 28px 0;">
           <a href="${actionUrl}" style="background-color: #ffffff; color: #000000; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
             ${actionText}
           </a>
         </div>`
      : "";

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #000000; margin: 0; padding: 40px 20px; color: #e5e7eb;">
      <div style="max-width: 500px; margin: 0 auto; background: #09090b; border: 1px solid #27272a; border-radius: 16px; padding: 40px;">
        <div style="font-size: 24px; font-weight: 700; color: #ffffff; margin-bottom: 28px; letter-spacing: -0.05em;">FUTURA</div>
        <h2 style="font-size: 20px; font-weight: 600; color: #ffffff; margin: 0 0 16px 0;">${title}</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa; margin: 0 0 20px 0;">${message}</p>
        ${actionButton}
        <div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid #27272a; font-size: 12px; color: #71717a;">
          Jika Anda tidak merasa melakukan tindakan ini, akun Anda mungkin dalam bahaya. Segera amankan akun Anda melalui tautan di atas atau hubungi tim administrasi Futura.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: `Futura Security <security@${EMAIL_DOMAIN}>`,
      to: [to],
      subject,
      html,
    });
  } catch (error) {
    console.error(`[Security Email] Failed to send email to ${to}:`, error);
  }
}
