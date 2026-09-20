"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerEsai } from "@/lib/essay/actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EsaiRegistrationButtonProps {
  className?: string;
}

export function EsaiRegistrationButton({ className }: EsaiRegistrationButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const res = await registerEsai();
      if (!res.success) {
        if (res.error?.includes("login")) {
          toast.info("Silakan login terlebih dahulu untuk mendaftar.");
          router.push("/login?next=/lomba-esai");
        } else {
          toast.error(res.error || "Gagal mendaftar");
        }
        return;
      }
      toast.success("Berhasil masuk ke halaman registrasi!");
      router.push("/profile/lomba-esai");
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-fit relative z-10 transition-transform active:scale-95 ${className || ""}`}>
      <button
        onClick={handleRegister}
        disabled={isLoading}
        className="group relative inline-flex h-12 md:h-14 w-fit items-center justify-center overflow-hidden rounded-full bg-white text-black cursor-pointer border-none disabled:opacity-70"
      >
        <div className="absolute inset-0 z-0 h-full w-full -translate-x-full rounded-full bg-amber-300 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0" />

        <div className="absolute left-2 z-10 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-black text-white transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:left-[calc(100%-2.5rem)] md:group-hover:left-[calc(100%-3rem)]">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-colors duration-700 group-hover:text-amber-300"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          )}
        </div>

        <span className="relative z-10 pl-13 md:pl-16 pr-6 text-md md:text-lg font-medium transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:pl-6 group-hover:pr-13 md:group-hover:pr-16">
          Daftar Sekarang
        </span>
      </button>
    </div>
  );
}
