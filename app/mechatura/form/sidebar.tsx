"use client";

import { InfoIcon, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MechaturaRegistrationStep, StepDefinition } from "@/lib/registration-steps";

const stepGuides: Record<MechaturaRegistrationStep, { title: string; description: string }> = {
  "tipe-robot": {
    title: "Kategori Lomba",
    description:
      "Pilih kategori perlombaan yang akan diikuti oleh tim Anda. Setiap kategori memiliki persyaratan dan regulasi yang berbeda sesuai dengan buku panduan.",
  },
  identitas: {
    title: "Identitas Tim",
    description:
      "Isi data identitas tim, ketua tim, anggota, dan pembimbing (opsional). Pastikan email dan nomor telepon (WhatsApp) yang dimasukkan aktif untuk keperluan komunikasi panitia.",
  },
  lampiran: {
    title: "Unggah Lampiran",
    description:
      "Unggah dokumen pendukung seperti scan/foto kartu pelajar atau mahasiswa dari seluruh anggota tim yang disatukan ke dalam 1 file PDF (maksimal 2MB).",
  },
  verifikasi: {
    title: "Verifikasi Data",
    description:
      "Periksa kembali seluruh data dan dokumen yang telah Anda masukkan. Pastikan semuanya sudah benar sebelum melanjutkan ke proses pembayaran. Data yang sudah disubmit tidak dapat diubah kembali.",
  },
  payment: {
    title: "Pembayaran",
    description:
      "Lakukan pembayaran sesuai dengan instruksi yang diberikan untuk menyelesaikan proses pendaftaran tim Anda ke sistem kami.",
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

  return (
    <>
      {/* Mobile Backdrop (Optional UX improvement for modal-like drawer) */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      <div 
        className={cn(
          "shrink-0 transition-transform duration-500 ease-in-out flex flex-col",
          // Desktop: static/embedded flow, fixed width, always visible, slightly transparent bg
          "lg:relative lg:w-72 xl:w-80 lg:h-auto lg:translate-x-0 lg:bg-muted/10 lg:border-r lg:border-border/50 lg:z-0",
          // Mobile: fixed off-canvas drawer from the left, solid background for readability
          "fixed inset-y-0 left-0 z-[101] h-[100dvh] w-[280px] bg-background/95 backdrop-blur-xl shadow-2xl lg:shadow-none lg:backdrop-blur-none",
          isOpen ? "translate-x-0" : "-translate-x-full" 
        )}
      >
        {/* Ponytail Toggle (Mobile Only) - Always visible on the edge */}
        <button
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls="mechatura-sidebar-content"
          className={cn(
            "absolute top-[30%] z-[102] flex items-center justify-center border shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:hidden",
            // Pin to the right edge of the sliding drawer
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
          "flex-1 overflow-y-auto overflow-x-hidden flex flex-col p-6 sm:p-8",
          "lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)]"
        )}>
          <div 
            id="mechatura-sidebar-content"
            className="flex-1 flex flex-col gap-8"
          >
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight">Panduan</h2>
              <p className="text-xs text-muted-foreground">
                Langkah pendaftaran Mechatura.
              </p>
            </div>

            <div className="space-y-8 flex-1">
              {/* Vertical Progress */}
              <div className="space-y-4">
                <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground border-b pb-2">Progres</h3>
                <div className="relative">
                  {/* Vertical line connecting steps */}
                  <div className="absolute left-[14px] top-4 bottom-4 w-0.5 bg-border rounded-full" />
                  
                  <ul className="space-y-6 relative z-10">
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

              <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <div className="flex items-center gap-2 text-primary">
                  <InfoIcon className="h-4 w-4" aria-hidden="true" />
                  <h3 className="font-semibold text-base">{guide?.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {guide?.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
