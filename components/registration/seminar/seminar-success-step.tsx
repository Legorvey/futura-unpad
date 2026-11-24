import {
  Calendar,
  CheckCircle2,
  ExternalLink,
  MapPin,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import type { ClientSeminarFormValues } from "@/lib/validation/seminar";
import {
  SEMINAR_EVENT_DATE_LABEL,
  SEMINAR_EVENT_TIME_LABEL,
  SEMINAR_LOCATION_NAME,
} from "@/lib/seminar/config";

type SeminarSuccessStepProps = {
  registrations: { id: string; nama_lengkap: string; asal_institusi: string }[];
  registrationId: string;
  statusLabel: string;
  values: ClientSeminarFormValues;
  waGroupUrl?: string | null;
  showProfileLink?: boolean;
  emailSent?: boolean;
};

export default function SeminarSuccessStep({
  registrations,
  registrationId,
  statusLabel,
  values,
  waGroupUrl,
  showProfileLink = false,
  emailSent,
}: SeminarSuccessStepProps) {
  const isGroup = values.registration_type === "grup";
  const safeWaGroupUrl = (() => {
    if (!waGroupUrl) return null;
    try {
      const parsed = new URL(waGroupUrl);
      return parsed.protocol === "https:" ? parsed.toString() : null;
    } catch {
      return null;
    }
  })();

  return (
    <FieldGroup className="gap-6">
      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-start gap-4 p-4 sm:p-6 border-b border-border">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-500/25">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Pendaftaran Anda telah selesai
            </h2>
            <p className="mt-1.5 text-sm font-medium leading-relaxed text-muted-foreground">
              Pendaftaran Seminar Nasional Futura 2026 Anda sudah tersimpan. Detail tiket dan informasi acara tersedia di bawah ini.
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                {isGroup
                  ? values.group_name
                    ? `Pendaftaran Grup: ${values.group_name}`
                    : "Pendaftaran Grup"
                  : "Pendaftaran Individu"}
              </p>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                {values.nama}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {values.institusi} / {statusLabel}
              </p>
            </div>
          </div>

          <div className="grid gap-3 rounded-xl border border-border/80 bg-background/70 p-4 text-xs sm:grid-cols-2">
            <div className="flex items-start gap-2.5">
              <Calendar
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                aria-hidden="true"
              />
              <div>
                <p className="text-muted-foreground">Waktu Pelaksanaan</p>
                <p className="mt-0.5 font-medium text-foreground">
                  {SEMINAR_EVENT_DATE_LABEL}, {SEMINAR_EVENT_TIME_LABEL}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                aria-hidden="true"
              />
              <div>
                <p className="text-muted-foreground">Lokasi</p>
                <p className="mt-0.5 font-medium text-foreground">
                  {SEMINAR_LOCATION_NAME}
                </p>
              </div>
            </div>
          </div>

          <dl className="grid gap-4 border-t border-border pt-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="mt-1 break-all font-medium text-foreground">
                {values.email}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">WhatsApp</dt>
              <dd className="mt-1 font-medium text-foreground">
                {values.telp}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">ID Pendaftaran</dt>
              <dd className="mt-1 font-mono text-sm font-semibold text-foreground break-all">
                {registrationId}
              </dd>
            </div>
            {isGroup && (
              <div>
                <dt className="text-muted-foreground">Total Peserta</dt>
                <dd className="mt-1 font-medium text-foreground">
                  {registrations.length} orang
                </dd>
              </div>
            )}
          </dl>

          {isGroup && registrations.length > 0 && (
            <div className="border-t border-border pt-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Daftar Peserta Grup
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {registrations.map((registration) => (
                  <div
                    key={registration.id}
                    className="rounded-xl border border-border bg-background/60 p-4 flex flex-col justify-center"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {registration.nama_lengkap}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {registration.asal_institusi}
                      </p>
                      <p className="text-[11px] font-mono text-muted-foreground mt-1 break-all">
                        {registration.id}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {safeWaGroupUrl ? (
        <section className="overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-500/25">
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Grup WhatsApp Peserta
                </h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  Bergabung ke grup WhatsApp peserta Seminar Nasional Futura 2026 untuk informasi teknis dan pengumuman acara.{" "}
                  {emailSent === false
                    ? "Silakan simpan tautan ini langsung dari halaman tiket."
                    : values.email
                      ? `Tautan ini juga telah dikirimkan ke ${values.email}.`
                      : null}
                </p>
              </div>
            </div>
            <Button className="h-11 shrink-0 rounded-[8px] px-5" asChild>
              <a
                href={safeWaGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Gabung Grup WA</span>
                <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
          </div>
        </section>
      ) : null}

      {emailSent === false ? (
        <section
          role="status"
          className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900"
        >
          Pendaftaran Anda telah berhasil disimpan, namun pengiriman email konfirmasi sedang mengalami kendala. Silakan simpan ID pendaftaran dan tautan grup WhatsApp di atas.
        </section>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="outline" className="h-11 rounded-[8px]" asChild>
          <Link href="/">Ke Beranda</Link>
        </Button>
        {showProfileLink ? (
          <Button className="h-11 rounded-[8px]" asChild>
            <Link href="/profile">Ke Profil</Link>
          </Button>
        ) : (
          <Button className="h-11 rounded-[8px]" asChild>
            <Link href="/seminar-nasional">Kembali ke Seminar</Link>
          </Button>
        )}
      </div>
    </FieldGroup>
  );
}
