import { Resend } from "resend";
import {
  SEMINAR_EVENT_DATE_LABEL,
  SEMINAR_EVENT_TIME_LABEL,
  SEMINAR_LOCATION_FULL,
} from "@/lib/seminar/config";

const EMAIL_DOMAIN = "mail.futuraunpad.com";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getSafeHttpsUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null;
  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function getSafeHttpUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null;
  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === "https:" || parsed.protocol === "http:"
      ? parsed.toString()
      : null;
  } catch {
    return null;
  }
}

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
    console.warn("[Security Email] RESEND_API_KEY missing. Skipped sending email.");
    return;
  }

  const resend = new Resend(apiKey);
  const safeActionUrl = getSafeHttpUrl(actionUrl);

  const actionButton =
    actionText && safeActionUrl
      ? `<div style="margin: 28px 0;">
           <a href="${escapeHtml(safeActionUrl)}" style="background-color: #ffffff; color: #000000; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
             ${escapeHtml(actionText)}
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
        <h2 style="font-size: 20px; font-weight: 600; color: #ffffff; margin: 0 0 16px 0;">${escapeHtml(title)}</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa; margin: 0 0 20px 0;">${escapeHtml(message)}</p>
        ${actionButton}
        <div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid #27272a; font-size: 12px; color: #71717a;">
          Jika Anda tidak merasa melakukan tindakan ini, akun Anda mungkin dalam bahaya. Segera amankan akun Anda melalui tautan di atas atau hubungi tim administrasi Futura.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const { error } = await resend.emails.send({
      from: `Futura Security <security@${EMAIL_DOMAIN}>`,
      to: [to],
      subject,
      html,
    });
    if (error) {
      console.error("[Security Email] Resend rejected email:", error);
    }
  } catch (error) {
    console.error("[Security Email] Failed to send email:", error);
  }
}

export async function sendSeminarTicketEmail({
  to,
  registrationId,
  namaLengkap,
  noTelepon,
  asalInstitusi,
  statusLabel,
  registrationType,
  groupName,
  members = [],
  waGroupUrl,
}: {
  to: string;
  registrationId: string;
  namaLengkap: string;
  noTelepon: string;
  asalInstitusi: string;
  statusLabel: string;
  registrationType: "individual" | "group";
  groupName?: string | null;
  members?: { id: string; nama_lengkap: string; asal_institusi: string }[];
  waGroupUrl?: string | null;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Seminar Ticket Email] RESEND_API_KEY missing. Skipped sending email.");
    return false;
  }

  const resend = new Resend(apiKey);
  const safeWaUrl = getSafeHttpsUrl(waGroupUrl);
  const isGroup = registrationType === "group";

  const escapedName = escapeHtml(namaLengkap);
  const escapedEmail = escapeHtml(to);
  const escapedPhone = escapeHtml(noTelepon);
  const escapedInstitution = escapeHtml(asalInstitusi);
  const escapedStatus = escapeHtml(statusLabel);
  const escapedRegId = escapeHtml(registrationId);
  const escapedGroupName = groupName ? escapeHtml(groupName) : null;
  const escapedWaUrl = safeWaUrl ? escapeHtml(safeWaUrl) : null;

  const membersHtml =
    isGroup && members.length > 0
      ? `
        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #27272a;">
          <p style="font-size: 13px; font-weight: 600; color: #ffffff; margin: 0 0 12px 0;">
            Daftar Peserta Grup (${members.length} orang)
          </p>
          <table style="width: 100%; border-collapse: collapse;">
            ${members
              .map(
                (m, idx) => `
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #18181b; font-size: 13px; color: #e5e7eb;">
                      <strong>${idx + 1}. ${escapeHtml(m.nama_lengkap)}</strong><br/>
                      <span style="color: #a1a1aa; font-size: 12px;">${escapeHtml(m.asal_institusi)}</span><br/>
                      <span style="color: #71717a; font-family: monospace; font-size: 11px;">ID: ${escapeHtml(m.id)}</span>
                    </td>
                  </tr>
                `
              )
              .join("")}
          </table>
        </div>
      `
      : "";

  const waSectionHtml = escapedWaUrl
    ? `
      <div style="margin: 28px 0; padding: 20px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 12px;">
        <p style="font-size: 15px; font-weight: 600; color: #ffffff; margin: 0 0 8px 0;">
          Grup WhatsApp Peserta Seminar
        </p>
        <p style="font-size: 13px; line-height: 1.6; color: #a1a1aa; margin: 0 0 16px 0;">
          Silakan bergabung ke grup WhatsApp resmi peserta Seminar Nasional Futura 2026 untuk mendapatkan informasi teknis dan pengumuman acara.
        </p>
        <a href="${escapedWaUrl}" target="_blank" rel="noopener noreferrer" style="background-color: #fbbf24; color: #0f172a; text-decoration: none; padding: 12px 22px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
          Gabung Grup WhatsApp
        </a>
        <p style="font-size: 12px; color: #71717a; margin: 14px 0 0 0; word-break: break-all;">
          Atau buka tautan: <a href="${escapedWaUrl}" style="color: #fbbf24;">${escapedWaUrl}</a>
        </p>
      </div>
    `
    : "";

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #000000; margin: 0; padding: 40px 20px; color: #e5e7eb;">
      <div style="max-width: 560px; margin: 0 auto; background: #09090b; border: 1px solid #27272a; border-radius: 16px; padding: 40px;">
        <div style="font-size: 24px; font-weight: 700; color: #ffffff; margin-bottom: 24px; letter-spacing: -0.05em;">FUTURA 2026</div>
        <h2 style="font-size: 20px; font-weight: 600; color: #ffffff; margin: 0 0 12px 0;">Tiket Pendaftaran Seminar Nasional</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa; margin: 0 0 24px 0;">
          Terima kasih, <strong style="color: #ffffff;">${escapedName}</strong>. Pendaftaran Seminar Nasional Futura 2026 Anda telah berhasil tercatat.
        </p>

        <div style="background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #fbbf24; margin: 0 0 4px 0; font-weight: 600;">
            ${isGroup ? (escapedGroupName ? `Pendaftaran Grup: ${escapedGroupName}` : "Pendaftaran Grup") : "Pendaftaran Individu"}
          </p>
          <p style="font-size: 12px; color: #a1a1aa; margin: 0 0 16px 0;">
            ID Pendaftaran: <strong style="color: #ffffff; font-family: monospace;">${escapedRegId}</strong>
          </p>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #a1a1aa; width: 42%;">Nama${isGroup ? " (Kontak Utama)" : ""}</td>
              <td style="padding: 6px 0; color: #ffffff; font-weight: 500;">${escapedName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #a1a1aa;">Email</td>
              <td style="padding: 6px 0; color: #ffffff; font-weight: 500; word-break: break-all;">${escapedEmail}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #a1a1aa;">Nomor WhatsApp</td>
              <td style="padding: 6px 0; color: #ffffff; font-weight: 500;">${escapedPhone}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #a1a1aa;">Status Akademika</td>
              <td style="padding: 6px 0; color: #ffffff; font-weight: 500;">${escapedStatus}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #a1a1aa;">Asal Institusi</td>
              <td style="padding: 6px 0; color: #ffffff; font-weight: 500;">${escapedInstitution}</td>
            </tr>
          </table>
          ${membersHtml}
        </div>

        <div style="background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 16px 20px; font-size: 13px;">
          <p style="margin: 0 0 6px 0; color: #ffffff; font-weight: 600;">Informasi Pelaksanaan</p>
          <p style="margin: 0 0 4px 0; color: #a1a1aa;">Waktu: <span style="color: #e5e7eb;">${escapeHtml(SEMINAR_EVENT_DATE_LABEL)}, ${escapeHtml(SEMINAR_EVENT_TIME_LABEL)}</span></p>
          <p style="margin: 0; color: #a1a1aa;">Lokasi: <span style="color: #e5e7eb;">${escapeHtml(SEMINAR_LOCATION_FULL)}</span></p>
        </div>

        ${waSectionHtml}

        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #27272a; font-size: 12px; color: #71717a;">
          Simpan email ini sebagai bukti pendaftaran Anda. Sampai jumpa di Seminar Nasional Futura 2026!
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const { error } = await resend.emails.send({
      from: `Futura Seminar <noreply@${EMAIL_DOMAIN}>`,
      to: [to],
      subject: "Tiket & Grup WhatsApp Seminar Nasional Futura 2026",
      html,
    });

    if (error) {
      console.error("[Seminar Ticket Email] Resend rejected email:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Seminar Ticket Email] Failed to send email:", error);
    return false;
  }
}
