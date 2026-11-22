import type { Metadata } from "next";
import Link from "next/link";
import SeminarRegistrationForm from "./form";
import { getCachedAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import SeminarSuccessStep from "@/components/registration/seminar/seminar-success-step";
import { seminarStatusOptions } from "@/lib/seminar/seminar-options";
import Countdown from "@/components/countdown";
import StepProgress from "@/components/registration/step-progress";
import { seminarRegistrationSteps } from "@/lib/registration-steps";
import { isAcademicStatus } from "@/lib/payment";
import { Button } from "@/components/ui/button";
import {
  SEMINAR_REG_DISPLAY_END_LABEL,
  SEMINAR_REG_START_ISO,
  hasSeminarRegistrationStarted,
  isSeminarRegistrationOpen,
} from "@/lib/seminar/config";

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
  group_name: string | null;
};

type SeminarMemberRow = {
  id: string;
  nama_lengkap: string;
  asal_institusi: string;
  is_main_contact: boolean;
};

export default async function SeminarRegistrationPage() {
  const { user } = await getCachedAuth();
  let latestRegistration: SeminarRegistrationRow | null = null;
  let allRegistrations: SeminarMemberRow[] = [];
  let statusLabel = "-";

  if (user) {
    const adminSupabase = createAdminClient();
    const { data } = await adminSupabase
      .from("seminar_registrations")
      .select(
        "id,nama_lengkap,email,no_telepon,asal_institusi,status_akademika,registration_type,group_id,group_name"
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
        (latestRegistration.registration_type === "group" ||
          latestRegistration.registration_type === "grup") &&
        latestRegistration.group_id
      ) {
        const { data: membersData } = await adminSupabase
          .from("seminar_registrations")
          .select("id,nama_lengkap,asal_institusi,is_main_contact")
          .eq("group_id", latestRegistration.group_id)
          .order("created_at", { ascending: true });

        allRegistrations = (membersData as SeminarMemberRow[]) || [];
      }
    }
  }

  const isOpen = isSeminarRegistrationOpen();
  const hasStarted = hasSeminarRegistrationStarted();

  return (
    <main className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-3xl flex-col justify-center space-y-8 px-4 pb-32 pt-28 sm:px-8">
      <section>
        <div className="space-y-2">
          <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
            Formulir Seminar Nasional
          </h1>
          <p className="max-w-lg text-sm font-medium leading-relaxed text-neutral-500">
            {latestRegistration
              ? "Anda sudah terdaftar pada Seminar Nasional Futura 2026. Detail tiket dan tautan grup WhatsApp peserta tersedia di bawah ini."
              : isOpen
                ? `Lengkapi data pendaftaran Seminar Nasional Futura 2026 di bawah ini. Pendaftaran dibuka hingga ${SEMINAR_REG_DISPLAY_END_LABEL}.`
                : "Informasi status pendaftaran Seminar Nasional Futura 2026."}
          </p>
        </div>
      </section>
      <section>
        {latestRegistration ? (
          <div className="space-y-8">
            <StepProgress
              steps={seminarRegistrationSteps}
              currentStep="ticket"
              ariaLabel="Progres pendaftaran seminar"
            />
            <SeminarSuccessStep
              registrations={allRegistrations}
              registrationId={latestRegistration.id}
              statusLabel={statusLabel}
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
                group_name: latestRegistration.group_name ?? undefined,
                members: [],
              }}
            />
          </div>
        ) : isOpen ? (
          <SeminarRegistrationForm />
        ) : !hasStarted ? (
          <div className="flex flex-col items-center space-y-8">
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Pendaftaran Segera Dibuka
            </h2>
            <Countdown
              targetDate={new Date(SEMINAR_REG_START_ISO).getTime()}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-6 rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Pendaftaran Seminar Nasional Ditutup
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Periode pendaftaran Seminar Nasional Futura 2026 telah berakhir.
            </p>
            <Button asChild variant="outline" className="h-10 rounded-[8px]">
              <Link href="/seminar-nasional">Kembali ke Halaman Seminar</Link>
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
