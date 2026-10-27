"use client";

import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { type User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import {
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MfaProfileCard } from "@/components/admin/mfa-profile-card";

type AdminProfileClientProps = {
  user: User;
  verifiedTotp: {
    id: string;
    friendly_name?: string;
    created_at?: string;
    last_challenged_at?: string;
  } | null;
  isPasswordUser: boolean;
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  try {
    return dateFormatter.format(new Date(dateString));
  } catch {
    return dateString;
  }
};

export function AdminProfileClient({
  user,
  verifiedTotp,
  isPasswordUser,
}: AdminProfileClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"general" | "mfa">("general");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Instant inline editable profile fields
  const [displayName, setDisplayName] = useState(
    user.user_metadata?.display_name || ""
  );
  const [username, setUsername] = useState(
    user.user_metadata?.username || ""
  );
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const initialDisplayName = user.user_metadata?.display_name || "";
  const initialUsername = user.user_metadata?.username || "";

  const hasProfileChanges =
    displayName.trim() !== initialDisplayName.trim() ||
    username.trim().toLowerCase() !== initialUsername.trim().toLowerCase();

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedField(field);
    toast.success("Berhasil disalin ke clipboard");
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleResetProfileForm = () => {
    setDisplayName(initialDisplayName);
    setUsername(initialUsername);
    setProfileError(null);
  };

  const handleSaveProfile = async () => {
    const trimmedDisplayName = displayName.trim();
    const trimmedUsername = username.trim().toLowerCase();

    setProfileError(null);

    // Validasi nama tampilan
    if (trimmedDisplayName.length > 100) {
      setProfileError("Nama tampilan tidak boleh lebih dari 100 karakter.");
      return;
    }

    // Validasi username jika diisi
    if (trimmedUsername) {
      if (trimmedUsername.length < 3) {
        setProfileError("Username minimal terdiri dari 3 karakter.");
        return;
      }
      if (trimmedUsername.length > 20) {
        setProfileError("Username tidak boleh lebih dari 20 karakter.");
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
        setProfileError(
          "Username hanya boleh berisi huruf, angka, dan garis bawah (_)."
        );
        return;
      }
    }

    setIsSavingProfile(true);

    try {
      const supabase = createClient();
      const updates: { data: { display_name?: string; username?: string } } = {
        data: {},
      };

      // Cek keunikan username jika diubah
      if (trimmedUsername !== initialUsername.toLowerCase()) {
        if (trimmedUsername !== "") {
          const { data: isTaken, error: takenError } = await supabase.rpc(
            "is_username_taken",
            { p_username: trimmedUsername }
          );
          if (isTaken || takenError) {
            setProfileError("Username ini sudah digunakan oleh akun lain.");
            setIsSavingProfile(false);
            return;
          }
          updates.data.username = trimmedUsername;
        } else {
          updates.data.username = "";
        }
      }

      if (trimmedDisplayName !== initialDisplayName) {
        updates.data.display_name = trimmedDisplayName;
      }

      const { error: updateError } = await supabase.auth.updateUser(updates);
      if (updateError) throw updateError;

      toast.success("Perubahan profil berhasil disimpan!");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memperbarui profil";
      setProfileError(message);
      toast.error("Gagal menyimpan perubahan", { description: message });
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Profil Admin
          </h1>
        </div>

        {/* Resend-style Pill Tabs */}
        <div
          role="tablist"
          aria-label="Navigasi profil"
          className="flex items-center gap-1.5 overflow-x-auto pb-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "general"}
            onClick={() => setActiveTab("general")}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all ${
              activeTab === "general"
                ? "bg-zinc-800 text-white dark:bg-zinc-800 dark:text-zinc-100 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            Umum
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "mfa"}
            onClick={() => setActiveTab("mfa")}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all ${
              activeTab === "mfa"
                ? "bg-zinc-800 text-white dark:bg-zinc-800 dark:text-zinc-100 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            Autentikasi (MFA)
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: UMUM                                                    */}
      {/* ============================================================== */}
      {activeTab === "general" && (
        <div className="space-y-6">
          {/* Card 1: Email Anda (Read-only) */}
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Email Anda
                </h2>
                <label
                  htmlFor="profile-email-input"
                  className="text-sm font-medium text-muted-foreground mt-3 block"
                >
                  Alamat email
                </label>
              </div>

              <div className="flex items-center gap-2 max-w-md">
                <Input
                  id="profile-email-input"
                  value={user.email || ""}
                  readOnly
                  disabled
                  className="h-10 bg-muted/40 border-border text-foreground font-mono text-sm cursor-not-allowed opacity-90"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(user.email || "", "email")}
                  className="h-10 w-10 shrink-0 border-border text-muted-foreground hover:text-foreground"
                  title="Salin email"
                >
                  {copiedField === "email" ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Bottom action bar explaining non-editable status */}
            <div className="border-t border-border/60 bg-muted/20 px-6 py-3.5 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Alamat email dikunci untuk akun administrator. Silakan hubungi pengembang (developer) untuk mengajukan pembaruan email.
              </p>
              <span className="text-[11px] font-mono text-muted-foreground/80">
                Tidak dapat diubah
              </span>
            </div>
          </div>

          {/* Card 2: Detail profil (Edit langsung untuk Display Name & Username) */}
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
            <div className="p-6 space-y-5">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Detail Profil
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Kelola nama tampilan dan username Anda. Klik simpan untuk memverifikasi dan menerapkan perubahan.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
                {/* Display Name Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="profile-display-name"
                    className="text-sm font-medium text-foreground block"
                  >
                    Nama tampilan
                  </label>
                  <Input
                    id="profile-display-name"
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      setProfileError(null);
                    }}
                    placeholder="cth. Futura Admin"
                    className="h-10 bg-muted/30 border-border text-foreground text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Nama publik Anda yang ditampilkan pada sistem.
                  </p>
                </div>

                {/* Username Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="profile-username"
                    className="text-sm font-medium text-foreground block"
                  >
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm select-none">
                      @
                    </span>
                    <Input
                      id="profile-username"
                      value={username}
                      onChange={(e) => {
                        setUsername(
                          e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                        );
                        setProfileError(null);
                      }}
                      placeholder="username"
                      className="h-10 pl-7 font-mono bg-muted/30 border-border text-foreground text-sm"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Handle unik yang terdiri dari huruf kecil, angka, dan garis bawah (_).
                  </p>
                </div>
              </div>

              {/* Account ID (Read-only metadata) */}
              <div className="pt-2 border-t border-border/40">
                <dt className="text-xs font-medium text-muted-foreground mb-1">
                  ID Akun
                </dt>
                <dd className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                  <span className="truncate max-w-[280px] sm:max-w-md">
                    {user.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(user.id, "account_id")}
                    className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                    title="Salin ID"
                  >
                    {copiedField === "account_id" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </dd>
              </div>

              {/* Pesan error validasi */}
              {profileError && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 text-xs font-medium text-red-600 dark:text-red-400">
                  {profileError}
                </div>
              )}
            </div>

            {/* Bottom action bar */}
            <div className="border-t border-border/60 bg-muted/20 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {hasProfileChanges
                  ? "Ada perubahan yang belum disimpan. Klik simpan untuk menerapkan."
                  : "Nama tampilan dan username sudah diperbarui."}
              </p>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {hasProfileChanges && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetProfileForm}
                    disabled={isSavingProfile}
                    className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Batalkan
                  </Button>
                )}

                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile || !hasProfileChanges}
                  className="h-9 px-4 rounded-lg bg-foreground text-background hover:bg-foreground/90 font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Menyimpan perubahan...
                    </span>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Card 3: Informasi akun */}
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
            <div className="p-6">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Informasi Akun
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Metadata autentikasi dan informasi pendaftaran akun.
                </p>
              </div>

              <div className="mt-4 divide-y divide-border/60">
                <div className="flex items-center justify-between py-4">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium text-foreground">
                      Akun Dibuat
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Waktu saat akun administrator ini didaftarkan.
                    </div>
                  </div>
                  <div
                    suppressHydrationWarning
                    className="text-sm font-medium text-foreground"
                  >
                    {formatDate(user.created_at)}
                  </div>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium text-foreground">
                      Masuk Terakhir
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Waktu sesi autentikasi terakhir Anda.
                    </div>
                  </div>
                  <div
                    suppressHydrationWarning
                    className="text-sm font-medium text-foreground"
                  >
                    {formatDate(user.last_sign_in_at)}
                  </div>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium text-foreground">
                      Penyedia Autentikasi
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Metode identitas yang terhubung ke akun ini.
                    </div>
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {isPasswordUser ? "Email & Kata Sandi" : "Penyedia OAuth"}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border/60 bg-muted/20 px-6 py-3.5 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Kredensial autentikasi akun terenkripsi dan terlindungi dengan aman.
              </p>
              <span className="text-xs font-mono text-muted-foreground">
                Aktif
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: AUTENTIKASI (MFA)                                       */}
      {/* ============================================================== */}
      {activeTab === "mfa" && (
        <div className="space-y-6">
          <MfaProfileCard
            isEnrolled={!!verifiedTotp}
            factorId={verifiedTotp?.id || null}
            friendlyName={verifiedTotp?.friendly_name}
            createdAt={
              verifiedTotp?.created_at ? formatDate(verifiedTotp.created_at) : null
            }
            isPasswordUser={!!isPasswordUser}
          />
        </div>
      )}
    </div>
  );
}
