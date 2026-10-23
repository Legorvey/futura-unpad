"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ShieldCheck, Loader2 } from "lucide-react";
import { getSafeAdminRedirectPath } from "@/lib/navigation";

export default function MfaVerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next");
  const nextUrl = getSafeAdminRedirectPath(rawNext, "/admin");
  const supabase = createClient();

  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadFactors() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.replace("/login");
          return;
        }

        const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
        if (factorsError || !factors?.totp) {
          throw new Error("Gagal mengambil data faktor MFA");
        }

        const verifiedTotp = factors.totp.find((f) => f.status === "verified");
        if (!verifiedTotp) {
          // If no verified factor exists, redirect to enrollment
          router.replace(`/login/mfa-enroll?next=${encodeURIComponent(nextUrl)}`);
          return;
        }

        if (isMounted) {
          setFactorId(verifiedTotp.id);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : "Gagal memuat faktor MFA";
          setErrorMessage(message);
        }
      } finally {
        if (isMounted) {
          setInitLoading(false);
        }
      }
    }

    loadFactors();

    return () => {
      isMounted = false;
    };
  }, [router, supabase, nextUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId || code.length !== 6 || loading) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ factorId, code }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Kode verifikasi salah atau telah kedaluwarsa");
      }

      toast.success("Verifikasi berhasil");
      router.refresh();

      // Use window.location.href to guarantee full browser navigation with newly minted AAL2 cookies
      window.location.href = nextUrl;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Kode verifikasi salah";
      setErrorMessage(message);
      toast.error("Verifikasi Gagal", {
        description: message,
      });
      setLoading(false);
    }
  };

  if (initLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
        <p className="text-sm text-zinc-500">Memeriksa status autentikasi...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px] space-y-6 text-center">
      <div className="mx-auto w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900 border border-zinc-200 shadow-xs">
        <ShieldCheck className="w-6 h-6" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Verifikasi Dua Langkah
        </h1>
        <p className="text-sm text-zinc-500 leading-relaxed text-balance">
          Masukkan 6 digit angka dari aplikasi <strong>Google Authenticator</strong> pada perangkat Anda.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          autoFocus
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={(e) => {
            setErrorMessage("");
            setCode(e.target.value.replace(/\D/g, ""));
          }}
          className="text-center text-3xl tracking-[0.4em] font-mono h-14 bg-white border-zinc-300 text-black focus:border-black focus:ring-0 rounded-xl"
        />

        {errorMessage && (
          <p className="text-xs text-red-600 font-medium text-center">
            {errorMessage}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl transition-all shadow-sm"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Memverifikasi...
            </span>
          ) : (
            "Verifikasi & Lanjutkan"
          )}
        </Button>
      </form>

      <p className="text-xs text-zinc-400">
        Kode diperbarui secara otomatis setiap 30 detik.
      </p>
    </div>
  );
}
