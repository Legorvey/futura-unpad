"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ShieldCheck, Eye, EyeOff, Copy, Check, Loader2 } from "lucide-react";
import { getSafeAdminRedirectPath } from "@/lib/navigation";

type MfaEnrollFormProps = {
  isPasswordUser?: boolean;
};

export default function MfaEnrollForm({
  isPasswordUser = true,
}: MfaEnrollFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next");
  const nextUrl = getSafeAdminRedirectPath(rawNext, "/admin");

  const [step, setStep] = useState<"reauth" | "scan">("reauth");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCodeSvg, setQrCodeSvg] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);

  const [verifyCode, setVerifyCode] = useState("");

  // Step 1: Password Confirmation (for email accounts) & Generating QR Code
  const handleStartEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/auth/mfa/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isPasswordUser ? { password } : {}),
      });

      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Gagal memulai pendaftaran MFA");
      }

      setFactorId(result.data.id);
      setQrCodeSvg(result.data.totp.qr_code);
      setSecret(result.data.totp.secret);
      setStep("scan");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memulai pendaftaran";
      setErrorMsg(message);
      toast.error("Gagal Memulai Pendaftaran", { description: message });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verifying the first 6-digit code
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId || verifyCode.length !== 6 || loading) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ factorId, code: verifyCode }),
      });

      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(
          result.error || "Kode verifikasi salah atau telah kedaluwarsa"
        );
      }

      toast.success("Google Authenticator berhasil diaktifkan!");
      router.refresh();

      // Use window.location.href to guarantee full browser navigation with newly minted AAL2 cookies
      window.location.href = nextUrl;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Kode verifikasi salah";
      setErrorMsg(message);
      toast.error("Verifikasi Gagal", { description: message });
      setLoading(false);
    }
  };

  const handleCopySecret = () => {
    if (!secret) return;
    navigator.clipboard.writeText(secret);
    setCopied(true);
    toast.success("Kunci cadangan disalin ke clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-[460px] space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900 border border-zinc-200 shadow-xs mb-3">
          <ShieldCheck className="w-6 h-6 text-zinc-900" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Setup Google Authenticator
        </h1>
        <p className="text-sm text-zinc-500 leading-relaxed text-balance">
          {step === "reauth"
            ? isPasswordUser
              ? "Konfirmasi kata sandi Anda untuk menyiapkan Autentikasi Dua Faktor pada akun administrator."
              : "Siapkan Autentikasi Dua Faktor pada akun administrator Anda untuk melindungi akses sistem."
            : "Pindai QR code menggunakan aplikasi Google Authenticator di ponsel Anda."}
        </p>
      </div>

      {step === "reauth" && (
        <form onSubmit={handleStartEnroll} className="space-y-4 pt-2">
          {isPasswordUser && (
            <div className="space-y-2 text-left">
              <label className="text-xs font-semibold text-zinc-700 block">
                Kata Sandi Akun
              </label>
              <Input
                autoFocus
                type="password"
                placeholder="Masukkan kata sandi akun"
                value={password}
                onChange={(e) => {
                  setErrorMsg("");
                  setPassword(e.target.value);
                }}
                className="h-11 bg-white border-zinc-300 text-black rounded-xl"
                required
              />
            </div>
          )}

          {errorMsg && (
            <p className="text-xs text-red-600 font-medium text-center">
              {errorMsg}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading || (isPasswordUser && !password)}
            className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl transition-all shadow-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Memverifikasi...
              </span>
            ) : isPasswordUser ? (
              "Lanjutkan Setup"
            ) : (
              "Mulai Setup QR Code"
            )}
          </Button>
        </form>
      )}

      {step === "scan" && qrCodeSvg && (
        <div className="space-y-6 pt-2">
          {/* Safe SVG Rendering via <img> Data URI (XSS proof) */}
          <div className="w-52 h-52 mx-auto bg-white p-3 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:image/svg+xml;utf8,${encodeURIComponent(qrCodeSvg)}`}
              alt="QR Code Google Authenticator"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Masked Secret Key Backup */}
          {secret && (
            <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 text-center space-y-2">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                Kunci Cadangan Manual
              </span>
              <div className="flex items-center justify-center gap-2">
                <code className="text-sm font-mono font-bold text-zinc-900 tracking-wider">
                  {showSecret ? secret : "••••••••••••••••"}
                </code>
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="p-1 hover:text-black text-zinc-400 transition"
                  title={showSecret ? "Sembunyikan kunci" : "Lihat kunci"}
                >
                  {showSecret ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCopySecret}
                  className="p-1 hover:text-black text-zinc-400 transition"
                  title="Salin kunci"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Verification input */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2 text-center">
              <label className="text-xs font-semibold text-zinc-700 block">
                Masukkan 6-digit kode verifikasi dari aplikasi:
              </label>
              <Input
                autoFocus
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                value={verifyCode}
                onChange={(e) => {
                  setErrorMsg("");
                  setVerifyCode(e.target.value.replace(/\D/g, ""));
                }}
                className="text-center text-2xl tracking-[0.4em] font-mono h-12 bg-white border-zinc-300 text-black focus:border-black rounded-xl max-w-[240px] mx-auto"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-red-600 font-medium text-center">
                {errorMsg}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading || verifyCode.length !== 6}
              className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl transition-all shadow-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengaktifkan MFA...
                </span>
              ) : (
                "Aktifkan & Lanjutkan ke Dashboard"
              )}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
