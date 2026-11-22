"use client";

import { useCallback, useState } from "react";
import { PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { seminarRegistrationSteps } from "@/lib/registration-steps";
import type { ClientSeminarFormValues } from "@/lib/validation/seminar";
import SeminarSuccessStep from "@/components/registration/seminar/seminar-success-step";
import SeminarFormSidebar from "./sidebar";

type SeminarRegisteredViewProps = {
  registrations: {
    id: string;
    nama_lengkap: string;
    asal_institusi: string;
    is_main_contact?: boolean;
  }[];
  registrationId: string;
  statusLabel: string;
  values: ClientSeminarFormValues;
};

export default function SeminarRegisteredView({
  registrations,
  registrationId,
  statusLabel,
  values,
}: SeminarRegisteredViewProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row items-stretch gap-0 relative lg:-mx-12 lg:-my-12 h-full rounded-[inherit] overflow-clip">
      <SeminarFormSidebar
        currentStep="ticket"
        steps={seminarRegistrationSteps}
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
      />

      <section className="flex-1 space-y-6 p-4 sm:p-8 lg:p-12 transition-all duration-300 min-w-0">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/80 px-4 py-2.5 lg:hidden">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              Langkah 4 dari {seminarRegistrationSteps.length}
            </p>
            <p className="text-sm font-semibold text-foreground truncate">
              Tiket Terdaftar
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="min-h-11 rounded-[8px] shrink-0"
            onClick={toggleSidebar}
            aria-expanded={isSidebarOpen}
            aria-controls="seminar-sidebar-content"
          >
            <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
            <span>Panduan</span>
          </Button>
        </div>

        <SeminarSuccessStep
          registrations={registrations}
          registrationId={registrationId}
          statusLabel={statusLabel}
          values={values}
        />
      </section>
    </div>
  );
}
