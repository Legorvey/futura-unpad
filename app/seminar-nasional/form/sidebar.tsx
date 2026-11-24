"use client";

import { useEffect } from "react";
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  InfoIcon,
  MapPin,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SEMINAR_EVENT_DATE_LABEL,
  SEMINAR_EVENT_TIME_LABEL,
  SEMINAR_LOCATION_NAME,
  SEMINAR_MAPS_URL,
  SEMINAR_REG_DISPLAY_END_LABEL,
} from "@/lib/seminar/config";
import type {
  SeminarRegistrationStep,
  StepDefinition,
} from "@/lib/registration-steps";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const stepGuides: Record<
  SeminarRegistrationStep,
  { title: string; description: string }
> = {
  "registration-option": {
    title: "Email & Opsi Pendaftaran",
    description:
      "Masukkan alamat email aktif Anda untuk pengiriman tiket dan tautan grup WhatsApp, lalu pilih pendaftaran individu atau grup.",
  },
  details: {
    title: "Detail Peserta",
    description:
      "Lengkapi nama lengkap sesuai identitas untuk kebutuhan sertifikat, nomor WhatsApp aktif, status akademika, dan asal institusi (isi \"-\" jika tidak ada). Untuk grup, tambahkan seluruh anggota sebelum melanjutkan.",
  },
  verification: {
    title: "Verifikasi Data",
    description:
      "Periksa kembali ejaan nama, asal institusi, kontak, dan daftar anggota grup. Data ini digunakan sebagai catatan kehadiran dan penerbitan sertifikat seminar.",
  },
  ticket: {
    title: "Tiket Terdaftar",
    description:
      "Pendaftaran Anda sudah tercatat. Simpan ID pendaftaran Anda dan bergabung ke grup WhatsApp peserta untuk informasi teknis sebelum hari acara.",
  },
};

interface SeminarFormSidebarProps {
  currentStep: SeminarRegistrationStep;
  steps: readonly StepDefinition<SeminarRegistrationStep>[];
  isOpen: boolean;
  onToggle: () => void;
}

export default function SeminarFormSidebar({
  currentStep,
  steps,
  isOpen,
  onToggle,
}: SeminarFormSidebarProps) {
  const guide = stepGuides[currentStep];
  const activeStepIndex = Math.max(
    0,
    steps.findIndex((item) => item.id === currentStep)
  );
  const isCompletedAll = currentStep === "ticket";

  // Lock page scroll while the mobile off-canvas drawer is open.
  useEffect(() => {
    if (!isOpen) return;

    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    if (!mediaQuery.matches) return;

    const scrollY =
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      0;
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const originalBodyTop = document.body.style.top;
    const originalBodyWidth = document.body.style.width;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onToggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.position = originalBodyPosition;
      document.body.style.top = originalBodyTop;
      document.body.style.width = originalBodyWidth;
      window.scrollTo({ top: scrollY, behavior: "instant" });
    };
  }, [isOpen, onToggle]);

  return (
    <>
      {isOpen && (
        <div
          data-lenis-prevent=""
          className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md lg:hidden transition-opacity duration-300 touch-none select-none overscroll-none"
          onClick={onToggle}
          onTouchMove={(e) => e.preventDefault()}
          onWheel={(e) => e.preventDefault()}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Panduan pendaftaran seminar"
        className={cn(
          "shrink-0 transition-transform duration-300 ease-in-out flex flex-col",
          "lg:relative lg:w-72 xl:w-80 lg:h-auto lg:translate-x-0 lg:bg-muted/20 lg:border-r lg:border-border/70 lg:z-0",
          "fixed inset-y-0 left-0 z-[101] h-[100dvh] w-[280px] bg-background/95 backdrop-blur-xl shadow-2xl lg:shadow-none lg:backdrop-blur-none touch-pan-y",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls="seminar-sidebar-content"
          className={cn(
            "absolute top-[30%] z-[102] flex items-center justify-center border shadow-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:hidden",
            "-right-7 h-16 w-7 rounded-r-xl border-l-0 after:absolute after:inset-y-0 after:left-0 after:-right-4 after:content-['']",
            isOpen
              ? "border-border bg-card text-muted-foreground hover:text-foreground"
              : "border-primary bg-primary text-primary-foreground shadow-md"
          )}
          aria-label={isOpen ? "Tutup panduan" : "Buka panduan"}
        >
          {isOpen ? (
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          )}
        </button>

        <div
          data-lenis-prevent=""
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden flex flex-col p-6 sm:p-8 space-y-6 overscroll-contain",
            "lg:flex-none lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)]",
            isOpen ? "visible" : "invisible lg:visible"
          )}
        >
          <div id="seminar-sidebar-content" className="flex-1 flex flex-col gap-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Panduan
              </h2>
              <p className="text-xs text-muted-foreground">
                Langkah pendaftaran Seminar Nasional Futura 2026.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                Progres
              </h3>
              <div className="relative">
                <div
                  className="absolute left-[14px] top-4 bottom-4 w-0.5 bg-border rounded-full"
                  aria-hidden="true"
                />

                <ul className="space-y-5 relative z-10">
                  {steps.map((item, index) => {
                    const isActive = index === activeStepIndex;
                    const isCompleted =
                      index < activeStepIndex || (isCompletedAll && isActive);

                    return (
                      <li
                        key={item.id}
                        className="flex items-start gap-4"
                        aria-current={isActive ? "step" : undefined}
                      >
                        <div
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                            isActive
                              ? "border-primary bg-primary text-primary-foreground ring-4 ring-primary/20"
                              : isCompleted
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-card text-muted-foreground"
                          )}
                        >
                          {isCompleted ? (
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="flex flex-col justify-center h-7">
                          <span
                            className={cn(
                              "text-sm transition-colors",
                              isActive
                                ? "text-foreground font-semibold"
                                : isCompleted
                                  ? "text-foreground font-medium"
                                  : "text-muted-foreground font-medium"
                            )}
                          >
                            {item.label}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-2 relative overflow-hidden">
              <div
                className="absolute top-0 left-0 w-1 h-full bg-primary"
                aria-hidden="true"
              />
              <div className="flex items-center gap-2 text-amber-700">
                <InfoIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <h3 className="font-semibold text-sm">{guide?.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {guide?.description}
              </p>
            </div>

            <div className="rounded-xl border border-border p-4 space-y-2.5 text-xs text-muted-foreground bg-card/60">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Calendar
                  className="h-4 w-4 text-amber-700 shrink-0"
                  aria-hidden="true"
                />
                <span>Informasi Acara</span>
              </div>
              <div className="space-y-2 border-t border-border/70 pt-2.5 text-xs leading-relaxed">
                <p>
                  <strong className="text-foreground">Pelaksanaan:</strong>{" "}
                  {SEMINAR_EVENT_DATE_LABEL}, {SEMINAR_EVENT_TIME_LABEL}
                </p>
                <p>
                  <strong className="text-foreground">Batas Daftar:</strong>{" "}
                  {SEMINAR_REG_DISPLAY_END_LABEL}
                </p>
                <a
                  href={SEMINAR_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-11 items-center justify-between gap-2 rounded-lg bg-muted/60 px-2.5 py-2 text-foreground font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <MapPin
                      className="h-3.5 w-3.5 text-amber-700 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="truncate">{SEMINAR_LOCATION_NAME}</span>
                  </span>
                  <ExternalLink
                    className="h-3.5 w-3.5 text-muted-foreground shrink-0"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </div>

            <div className="rounded-xl border border-border p-4 space-y-2 text-xs text-muted-foreground bg-card/60">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Phone
                  className="h-4 w-4 text-amber-700 shrink-0"
                  aria-hidden="true"
                />
                <span>Narahubung Resmi</span>
              </div>
              <div className="space-y-1 border-t border-border/70 pt-2 text-xs">
                <a
                  href="https://wa.me/62895609198200"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-11 items-center justify-between rounded-lg px-2 text-foreground/90 transition-colors hover:bg-muted/60 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span>
                    <strong className="text-foreground">Abid:</strong>{" "}
                    0895-6091-98200
                  </span>
                  <ExternalLink
                    className="h-3.5 w-3.5 text-muted-foreground shrink-0"
                    aria-hidden="true"
                  />
                </a>
                <a
                  href="https://instagram.com/futuraunpad.hmte"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-11 items-center justify-between rounded-lg px-2 text-foreground/90 transition-colors hover:bg-muted/60 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex items-center gap-2">
                    <InstagramIcon className="h-3.5 w-3.5 text-foreground shrink-0" />
                    <span>@futuraunpad.hmte</span>
                  </span>
                  <ExternalLink
                    className="h-3.5 w-3.5 text-muted-foreground shrink-0"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
