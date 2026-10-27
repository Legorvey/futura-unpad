"use client";

import { Ban } from "lucide-react";

interface MechaturaRegistrationButtonProps {
  className?: string;
}

export function MechaturaRegistrationButton({ className }: MechaturaRegistrationButtonProps) {
  return (
    <div className={`w-fit relative z-10 select-none ${className || ""}`}>
      <div
        role="status"
        aria-label="Pendaftaran Mechatura Ditutup"
        className="relative inline-flex h-12 md:h-14 w-fit items-center justify-center overflow-hidden rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/75 px-5 md:px-7 cursor-not-allowed shadow-inner"
      >
        <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-red-500/20 text-red-300 mr-3 border border-red-500/30">
          <Ban className="h-4 w-4 stroke-[2.2]" />
        </div>
        <span className="text-sm md:text-base font-semibold tracking-tight text-white/90">
          Pendaftaran Ditutup
        </span>
      </div>
    </div>
  );
}
