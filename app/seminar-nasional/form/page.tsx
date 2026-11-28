import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Ban } from "lucide-react";
import SeminarRegistrationForm from "./form";
import SeminarRegisteredView from "./registered-view";
import { getCachedAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import { seminarStatusOptions } from "@/lib/seminar/seminar-options";
import Countdown from "@/components/countdown";
import { isAcademicStatus } from "@/lib/payment";
import { Button } from "@/components/ui/button";
import {
  SEMINAR_REG_DISPLAY_END_LABEL,
  SEMINAR_REG_START_ISO,
  hasSeminarRegistrationStarted,
  isSeminarEventOngoing,
  isSeminarRegistrationOpen,
} from "@/lib/seminar/config";
import { getSeminarWaGroupUrl } from "@/lib/seminar/server-config";

export const metadata: Metadata = {
  title: "Form Pendaftaran Seminar Nasional",
};

type SeminarRegistrationRow = {
  id: string;
  nama_lengkap: string;
  email: string | null;
  no_telepon: string | null;
  asal_institusi: string;
  status_akademika: string;
  registration_type: string;
  group_id: string | null;
};

type SeminarMemberRow = {
  id: string;
  nama_lengkap: string;
  asal_institusi: string;
  is_main_contact: boolean;
};

const SEMINAR_THEME_STYLES = `
  body {
    background-color: #00205B !important;
  }
  .seminar-wrapper {
    --background: #f1f5f9;
    --foreground: #0f172a;
    --card: #f8fafc;
    --card-foreground: #0f172a;
    --popover: #f8fafc;
    --popover-foreground: #0f172a;
    --primary: #fbbf24;
    --primary-foreground: #0f172a;
    --secondary: #e2e8f0;
    --secondary-foreground: #0f172a;
    --muted: #e2e8f0;
    --muted-foreground: #475569;
    --accent: #e2e8f0;
    --accent-foreground: #0f172a;
    --destructive: #b91c1c;
    --border: #cbd5e1;
    --input: #cbd5e1;
    --ring: #b45309;
  }
  .seminar-wrapper button:not(:disabled),
  .seminar-wrapper a[href],
  .seminar-wrapper label[for],
  .seminar-wrapper [role="radio"]:not([data-disabled]),
  .seminar-wrapper [role="checkbox"]:not([data-disabled]),
  .seminar-wrapper [role="combobox"]:not(:disabled) {
    cursor: pointer;
  }
  .seminar-wrapper button:disabled,
  .seminar-wrapper input:disabled {
    cursor: not-allowed;
  }
`;

export default async function SeminarRegistrationPage() {
  const { user, adminAccess, needsMfaVerification, needsMfaEnrollment } =
    await getCachedAuth();

  if (needsMfaVerification) {
    redirect("/login/mfa-verify?next=/admin");
  }

  if (needsMfaEnrollment) {
    redirect("/login/mfa-enroll");
  }

  if (adminAccess) {
    redirect("/admin");
  }

  let latestRegistration: SeminarRegistrationRow | null = null;
  let allRegistrations: SeminarMemberRow[] = [];
  let statusLabel = "-";

  if (user) {
    const adminSupabase = createAdminClient();
    const { data } = await adminSupabase
      .from("seminar_registrations")
      .select(
        "id,nama_lengkap,email,no_telepon,asal_institusi,status_akademika,registration_type,group_id"
      )
      .eq("user_id", user.id)
      .eq("is_main_contact", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<SeminarRegistrationRow>();

    latestRegistration = data;

    if (latestRegistration) {
      statusLabel =
        seminarStatusOptions.find(
          (o) => o.id === latestRegistration?.status_akademika
        )?.title ?? "-";

      if (
        latestRegistration.registration_type === "group" ||
        latestRegistration.registration_type === "grup"
      ) {
        if (latestRegistration.group_id) {
          const { data: membersData } = await adminSupabase
            .from("seminar_registrations")
            .select("id,nama_lengkap,asal_institusi,is_main_contact")
            .eq("group_id", latestRegistration.group_id)
            .order("is_main_contact", { ascending: false })
            .order("created_at", { ascending: true })
            .order("nama_lengkap", { ascending: true });

          allRegistrations = (membersData as SeminarMemberRow[]) || [];
        }

        if (allRegistrations.length === 0) {
          allRegistrations = [
            {
              id: latestRegistration.id,
              nama_lengkap: latestRegistration.nama_lengkap,
              asal_institusi: latestRegistration.asal_institusi,
              is_main_contact: true,
            },
          ];
        }
      }
    }
  }

  const waGroupUrl = latestRegistration ? getSeminarWaGroupUrl() : null;
  const isOpen = isSeminarRegistrationOpen();
  const isOngoing = isSeminarEventOngoing();
  const hasStarted = hasSeminarRegistrationStarted();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SEMINAR_THEME_STYLES }} />

      <div
        className="fixed inset-0 z-[-2] pointer-events-none overflow-hidden bg-[#00205B]"
        aria-hidden="true"
      >
        <div className="absolute top-[20%] left-[-10vw] w-[120vw] h-[15vh] bg-[#307FE2] blur-[60px] rounded-[100%] opacity-20 transform translate-y-0 rotate-[-2deg] skew-y-[2deg]" />
        <div className="absolute top-[45%] right-[-10vw] w-[130vw] h-[12vh] bg-[#307FE2] blur-[50px] rounded-[100%] opacity-20 transform translate-y-[2vh] rotate-[3deg] skew-y-[-2deg]" />
        <div className="absolute bottom-[25%] left-[-15vw] w-[140vw] h-[18vh] bg-[#307FE2] blur-[70px] rounded-[100%] opacity-20 transform translate-y-[-3vh] rotate-[-1deg] skew-y-[1deg]" />
      </div>

      <main className="relative flex min-h-screen w-full flex-col items-center overflow-clip pb-32 pt-24 seminar-wrapper text-white">
        <div className="relative w-full max-w-6xl px-4 sm:px-8 space-y-10">
          <section className="text-center space-y-4">
            <h1 className="text-4xl font-extrabold tracking-[-0.07em] sm:text-5xl lg:text-6xl text-white">
              Formulir Seminar Nasional
            </h1>
            <p className="mx-auto max-w-2xl text-base tracking-tighter leading-relaxed text-blue-100/85 sm:text-lg">
              {latestRegistration
                ? "Anda sudah terdaftar pada Seminar Nasional Futura 2026. Detail tiket dan tautan grup WhatsApp peserta tersedia di bawah ini."
                : isOpen
                  ? isOngoing
                    ? `Seminar sedang berlangsung, namun pendaftaran masih dibuka hingga ${SEMINAR_REG_DISPLAY_END_LABEL}.`
                    : `Daftarkan diri atau grup Anda untuk Seminar Nasional Futura 2026, verifikasi data sertifikat, dan dapatkan tiket pendaftaran. Dibuka hingga ${SEMINAR_REG_DISPLAY_END_LABEL}.`
                  : "Informasi status pendaftaran Seminar Nasional Futura 2026."}
            </p>
          </section>

          {latestRegistration ? (
            <section className="relative rounded-3xl border border-transparent lg:border-border bg-card text-card-foreground p-0 lg:p-12 lg:shadow-2xl overflow-clip">
              <div
                className="absolute inset-0 bg-gradient-to-br from-[#307FE2]/5 via-transparent to-amber-500/5 pointer-events-none hidden lg:block"
                aria-hidden="true"
              />
              <div className="relative">
                <SeminarRegisteredView
                  registrations={allRegistrations}
                  registrationId={latestRegistration.id}
                  statusLabel={statusLabel}
                  waGroupUrl={waGroupUrl}
                  values={{
                    nama: latestRegistration.nama_lengkap,
                    email: latestRegistration.email ?? "",
                    telp: latestRegistration.no_telepon ?? "",
                    institusi: latestRegistration.asal_institusi,
                    registration_type:
                      latestRegistration.registration_type === "group" ||
                      latestRegistration.registration_type === "grup"
                        ? "grup"
                        : "individu",
                    status_akademika: isAcademicStatus(
                      latestRegistration.status_akademika
                    )
                      ? latestRegistration.status_akademika
                      : "umum",
                    is_same_institution: true,
                    identity_confirmed: true,
                    members: [],
                  }}
                />
              </div>
            </section>
          ) : isOpen ? (
            <section className="relative rounded-3xl border border-transparent lg:border-border bg-card text-card-foreground p-0 lg:p-12 lg:shadow-2xl overflow-clip">
              <div
                className="absolute inset-0 bg-gradient-to-br from-[#307FE2]/5 via-transparent to-amber-500/5 pointer-events-none hidden lg:block"
                aria-hidden="true"
              />
              <div className="relative">
                <SeminarRegistrationForm />
              </div>
            </section>
          ) : !hasStarted ? (
            <section className="flex flex-col items-center space-y-8 py-6">
              <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                Pendaftaran Segera Dibuka
              </h2>
              <Countdown
                targetDate={new Date(SEMINAR_REG_START_ISO).getTime()}
              />
            </section>
          ) : (
            <section className="mx-auto flex max-w-xl flex-col items-center space-y-6 rounded-3xl border border-border bg-card p-8 sm:p-10 text-center text-card-foreground shadow-2xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-700 border border-red-200">
                <Ban className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
                  Pendaftaran Seminar Nasional Ditutup
                </h2>
                <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
                  Periode pendaftaran Seminar Nasional Futura 2026 telah berakhir.
                </p>
              </div>
              <Button asChild className="h-11 rounded-[8px] px-6">
                <Link href="/seminar-nasional">Kembali ke Halaman Seminar</Link>
              </Button>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
