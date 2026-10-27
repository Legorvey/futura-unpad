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
    <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
      <div className="p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Autentikasi Multifaktor (MFA)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Tingkatkan keamanan akun administrator Anda menggunakan Time-based One-Time Password (TOTP) / aplikasi autentikator.
          </p>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1.5">
              Status keamanan
            </dt>
            <dd className="text-sm font-medium flex items-center gap-2">
              {isEnrolled ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Aktif (Google Authenticator)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Belum dikonfigurasi
                </span>
              )}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1.5">
              Metode autentikasi
            </dt>
            <dd className="text-sm font-medium text-foreground">
              {friendlyName || "Time-based One-Time Password (TOTP)"}
            </dd>
          </div>

          {createdAt && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground mb-1.5">
                Diaktifkan pada
              </dt>
              <dd className="text-sm text-foreground">
                {createdAt}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="border-t border-border/60 bg-muted/20 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {isEnrolled
            ? "Verifikasi TOTP diwajibkan pada setiap sesi masuk administrator."
            : "Verifikasi dua langkah diwajibkan untuk seluruh akses administrator."}
        </p>

        <div>
          {isEnrolled ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 rounded-lg border-red-500/30 text-red-600 hover:text-red-700 hover:bg-red-500/10 font-medium text-sm transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Reset MFA
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-card text-card-foreground border-border rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-red-600">
                    Konfirmasi Reset Google Authenticator
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground text-sm">
                    Mereset MFA akan menghapus faktor Google Authenticator yang saat ini aktif. Anda akan langsung diarahkan untuk memindai QR Code baru.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleResetMfa} className="space-y-4 pt-2">
                  {isPasswordUser ? (
                    <div className="space-y-2 text-left">
                      <label
                        htmlFor="mfa-reset-password"
                        className="text-xs font-semibold text-foreground block"
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
                        className="h-10 text-sm bg-background border-input text-foreground"
                        required
                      />
                    </div>
                  ) : (
                    <div className="space-y-2 text-left">
                      <label
                        htmlFor="mfa-reset-code"
                        className="text-xs font-semibold text-foreground block"
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
                        className="h-10 text-sm font-mono tracking-widest text-center bg-background border-input text-foreground"
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
              className="h-9 px-4 rounded-lg bg-foreground text-background hover:bg-foreground/90 font-medium text-sm transition-colors shadow-sm"
            >
              Aktifkan MFA
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
