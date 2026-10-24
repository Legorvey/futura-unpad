"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ShieldCheck, ShieldAlert, Loader2, RotateCcw } from "lucide-react";

type MfaProfileCardProps = {
  isEnrolled: boolean;
  factorId: string | null;
  friendlyName?: string | null;
  createdAt?: string | null;
  isPasswordUser?: boolean;
};

export function MfaProfileCard({
  isEnrolled,
  factorId,
  friendlyName,
  createdAt,
  isPasswordUser = true,
}: MfaProfileCardProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleResetMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/auth/mfa/unenroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isPasswordUser
            ? { factorId, password }
            : { factorId, code: totpCode }
        ),
      });

      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Gagal mereset MFA");
      }

      toast.success("MFA berhasil direset. Mengalihkan ke halaman setup...");
      setOpen(false);
      window.location.href = "/login/mfa-enroll";
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal mereset MFA";
      setErrorMsg(message);
      toast.error("Gagal Reset MFA", { description: message });
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {isEnrolled ? (
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-amber-500" />
          )}
          <h2 className="font-medium text-foreground">
            Autentikasi Dua Langkah (MFA)
          </h2>
        </div>

        {isEnrolled ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs sm:h-9 sm:text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Atur Ulang MFA
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white text-zinc-900 rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-red-600">
                  Konfirmasi Reset Google Authenticator
                </DialogTitle>
                <DialogDescription className="text-zinc-500 text-sm">
                  Mereset MFA akan menghapus faktor Google Authenticator yang saat ini aktif. Anda akan langsung diarahkan untuk memindai QR Code baru.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleResetMfa} className="space-y-4 pt-2">
                {isPasswordUser ? (
                  <div className="space-y-2 text-left">
                    <label
                      htmlFor="mfa-reset-password"
                      className="text-xs font-semibold text-zinc-700 block"
                    >
                      Masukkan Kata Sandi Akun untuk Konfirmasi:
                    </label>
                    <Input
                      id="mfa-reset-password"
                      type="password"
                      placeholder="Kata sandi akun"
                      value={password}
                      onChange={(e) => {
                        setErrorMsg("");
                        setPassword(e.target.value);
                      }}
                      className="h-10 text-sm"
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-2 text-left">
                    <label
                      htmlFor="mfa-reset-code"
                      className="text-xs font-semibold text-zinc-700 block"
                    >
                      Masukkan 6 Digit Kode Google Authenticator Saat Ini:
                    </label>
                    <Input
                      id="mfa-reset-code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="000000"
                      value={totpCode}
                      onChange={(e) => {
                        setErrorMsg("");
                        setTotpCode(e.target.value.replace(/\D/g, ""));
                      }}
                      className="h-10 text-sm font-mono tracking-widest text-center"
                      required
                    />
                  </div>
                )}

                {errorMsg && (
                  <p className="text-xs text-red-600 font-medium" role="alert">
                    {errorMsg}
                  </p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setOpen(false)}
                    disabled={loading}
                    className="h-9 text-xs"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      loading ||
                      (isPasswordUser ? !password : totpCode.length !== 6)
                    }
                    className="h-9 text-xs bg-red-600 hover:bg-red-700 text-white"
                  >
                    {loading ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Mereset...
                      </span>
                    ) : (
                      "Reset & Scan Ulang"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        ) : (
          <Button
            size="sm"
            onClick={() => router.push("/login/mfa-enroll")}
            className="h-8 text-xs sm:h-9 sm:text-sm bg-zinc-900 text-white hover:bg-zinc-800"
          >
            Aktifkan MFA
          </Button>
        )}
      </div>

      <div className="p-6">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">
              Status Keamanan
            </dt>
            <dd className="text-base font-medium flex items-center gap-2">
              {isEnrolled ? (
                <>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Aktif (Google Authenticator)
                  </span>
                </>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  Belum Aktif
                </span>
              )}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">
              Metode Autentikasi
            </dt>
            <dd className="text-base font-medium text-foreground">
              {friendlyName || "Time-based One-Time Password (TOTP)"}
            </dd>
          </div>

          {createdAt && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground mb-1">
                Diaktifkan Pada
              </dt>
              <dd className="text-sm text-foreground">
                {createdAt}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
