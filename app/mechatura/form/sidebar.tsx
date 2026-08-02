"use client";

import { useEffect } from "react";
import { InfoIcon, ChevronLeft, ChevronRight, Check, Calendar, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MechaturaRegistrationStep, StepDefinition } from "@/lib/registration-steps";

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
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const stepGuides: Record<MechaturaRegistrationStep, { title: string; description: string }> = {
  "tipe-robot": {
    title: "Kategori Lomba",
    description:
      "Pilih kategori perlombaan (Robot Sumo atau Robot Transporter). Lomba luring akan diselenggarakan pada Sabtu, 7 November 2026 di Gedung PPBS Unpad Jatinangor. Seluruh peserta dan juara akan mendapatkan sertifikat resmi.",
  },
  identitas: {
    title: "Identitas Tim",
    description:
      "Satu tim terdiri dari 1–3 orang (1 ketua dan maksimal 2 anggota). Anggota diperbolehkan berasal dari institusi berbeda. Anda juga dapat menambahkan 1 orang pembimbing (opsional). Nama tim dilarang mengandung unsur SARA atau pornografi.",
  },
  lampiran: {
    title: "Unggah Lampiran",
    description:
      "Unggah 1 file PDF gabungan kartu identitas seluruh anggota (KTM/Kartu Pelajar untuk pelajar/mahasiswa atau KTP untuk umum) dan 1 file PDF dokumen spesifikasi teknis serta foto robot rakitan peserta (maks. 5MB per file).",
  },
  verifikasi: {
    title: "Verifikasi Data",
    description:
      "Periksa kembali seluruh data tim dan berkas lampiran. Perubahan nama atau anggota tim hanya dilayani maksimal hingga Technical Meeting (22 Oktober 2026). Biaya pendaftaran bersifat non-refundable.",
  },
  payment: {
    title: "Pembayaran",
    description:
      "Lakukan pembayaran biaya registrasi tim via payment gateway dalam batas waktu 24 jam untuk mengamankan slot tim Anda pada sistem Mechatura 2026.",
  },
};

interface MechaturaFormSidebarProps {
  currentStep: MechaturaRegistrationStep;
  steps: readonly StepDefinition<MechaturaRegistrationStep>[];
  isOpen: boolean;
  onToggle: () => void;
}

export default function MechaturaFormSidebar({
  currentStep,
  steps,
  isOpen,
  onToggle,
}: MechaturaFormSidebarProps) {
  const guide = stepGuides[currentStep];
  const activeStepIndex = Math.max(
    0,
    steps.findIndex((item) => item.id === currentStep)
  );

  // Bulletproof body scroll locking when mobile sidebar is open
  useEffect(() => {
    if (!isOpen) return;

    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    if (!mediaQuery.matches) return;

    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
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

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.position = originalBodyPosition;
      document.body.style.top = originalBodyTop;
      document.body.style.width = originalBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Backdrop - Dark Blur & Touch Locked */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md lg:hidden transition-opacity duration-300 touch-none select-none overscroll-none"
          onClick={onToggle}
          onTouchMove={(e) => e.preventDefault()}
          onWheel={(e) => e.preventDefault()}
          aria-hidden="true"
        />
      )}

      <div 
        className={cn(
          "shrink-0 transition-transform duration-500 ease-in-out flex flex-col",
          // Desktop: static/embedded flow, fixed width, always visible
          "lg:relative lg:w-72 xl:w-80 lg:h-auto lg:translate-x-0 lg:bg-muted/10 lg:border-r lg:border-border/50 lg:z-0",
          // Mobile: fixed off-canvas drawer from the left
          "fixed inset-y-0 left-0 z-[101] h-[100dvh] w-[280px] bg-background/95 backdrop-blur-xl shadow-2xl lg:shadow-none lg:backdrop-blur-none touch-pan-y",
          isOpen ? "translate-x-0" : "-translate-x-full" 
        )}
      >
        {/* Ponytail Toggle (Mobile Only) */}
        <button
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls="mechatura-sidebar-content"
          className={cn(
            "absolute top-[30%] z-[102] flex items-center justify-center border shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:hidden",
            "-right-6 h-16 w-6 rounded-r-xl border-l-0",
            isOpen 
              ? "border-border bg-card text-muted-foreground hover:text-foreground" 
              : "border-primary bg-primary text-primary-foreground shadow-md"
          )}
          aria-label={isOpen ? "Tutup panduan" : "Buka panduan"}
        >
          <span className="lg:hidden">
            {isOpen ? <ChevronLeft className="h-4 w-4" aria-hidden="true" /> : <ChevronRight className="h-4 w-4" aria-hidden="true" />}
          </span>
        </button>

        {/* Sidebar Content Wrapper */}
        <div className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden flex flex-col p-6 sm:p-8 space-y-6 overscroll-contain",
          "lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)]"
        )}>
          <div 
            id="mechatura-sidebar-content"
            className="flex-1 flex flex-col gap-6"
          >
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight">Panduan</h2>
              <p className="text-xs text-muted-foreground">
                Langkah pendaftaran Mechatura 2026.
              </p>
            </div>

            {/* Vertical Progress */}
            <div className="space-y-3">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground border-b pb-2">Progres</h3>
              <div className="relative">
                <div className="absolute left-[14px] top-4 bottom-4 w-0.5 bg-border rounded-full" />
                
                <ul className="space-y-5 relative z-10">
                  {steps.map((item, index) => {
                    const isActive = index === activeStepIndex;
                    const isCompleted = index < activeStepIndex;
                    
                    return (
                      <li key={item.id} className="flex items-start gap-4" aria-current={isActive ? "step" : undefined}>
                        <div 
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                            isActive ? "border-primary bg-primary text-primary-foreground ring-4 ring-primary/20" : 
                            isCompleted ? "border-primary bg-primary text-primary-foreground" : 
                            "border-border bg-background text-muted-foreground"
                          )}
                        >
                          {isCompleted ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : index + 1}
                        </div>
                        <div className="flex flex-col justify-center h-7">
                          <span className={cn(
                            "text-sm transition-colors font-medium",
                            isActive ? "text-foreground font-semibold" : 
                            isCompleted ? "text-foreground" : 
                            "text-muted-foreground"
                          )}>
                            {item.label}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Step Guide Box */}
            <div className="rounded-xl border bg-card p-4 shadow-sm space-y-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <div className="flex items-center gap-2 text-primary">
                <InfoIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <h3 className="font-semibold text-sm">{guide?.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {guide?.description}
              </p>
            </div>

            {/* Timeline Info Card */}
            <div className="rounded-xl border p-4 space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Calendar className="h-4 w-4 text-primary shrink-0" />
                <span>Timeline Mechatura</span>
              </div>
              <ul className="space-y-1.5 border-t border-border/50 pt-2 text-[11px] leading-relaxed">
                <li><strong className="text-foreground">Batch 1:</strong> 21 Jul – 31 Ags 2026 (Rp175k)</li>
                <li><strong className="text-foreground">Batch 2:</strong> 1 Sep – 1 Okt 2026 (Rp200k)</li>
                <li><strong className="text-foreground">Tech. Meeting:</strong> 22 Okt 2026</li>
                <li><strong className="text-foreground">Main Event:</strong> 7 Nov 2026 (PPBS Unpad)</li>
              </ul>
            </div>

            {/* Contact Person Card */}
            <div className="rounded-xl border p-4 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>Narahubung Resmi</span>
              </div>
              <div className="space-y-1.5 border-t border-border/50 pt-2 text-[11px]">
                <p>
                  <strong className="text-foreground">Adam:</strong>{" "}
                  <a href="https://wa.me/6289529846686" target="_blank" rel="noreferrer" className="hover:underline">
                    0895-2984-6686
                  </a>
                </p>
                <p>
                  <strong className="text-foreground">Raisa:</strong>{" "}
                  <a href="https://wa.me/6285711735270" target="_blank" rel="noreferrer" className="hover:underline">
                    0857-1173-5270
                  </a>
                </p>
                <p className="flex items-center gap-1 pt-0.5">
                  <InstagramIcon className="h-3.5 w-3.5 text-black shrink-0" />
                  <a href="https://instagram.com/futuraunpad.hmte" target="_blank" rel="noreferrer" className="hover:underline">
                    @futuraunpad.hmte
                  </a>
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
