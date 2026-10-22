"use client";

import { ArrowLeft } from "lucide-react";
import { useMfaExit } from "@/hooks/use-mfa-exit";
import ConfirmDialog from "@/components/confirm-dialog";

/**
 * MfaBackButton
 *
 * Replaces the unintercepted <Link href="/login"> on the MFA pages.
 * Renders the visual back button and wires it to the MFA exit guard hook,
 * which also intercepts the browser's native Back button (popstate).
 *
 * On click, opens a ConfirmDialog warning the admin that their incomplete
 * MFA session will be fully terminated if they proceed.
 */
export function MfaBackButton() {
  const { showExitDialog, setShowExitDialog, isExiting, confirmExit } =
    useMfaExit();

  return (
    <>
      <button
        type="button"
        onClick={() => setShowExitDialog(true)}
        className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-black transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Halaman Masuk
      </button>

      <ConfirmDialog
        open={showExitDialog}
        onOpenChange={setShowExitDialog}
        title="Batalkan Verifikasi & Keluar?"
        description="Anda belum menyelesaikan verifikasi dua langkah (MFA). Demi keamanan akun administrator, kembali ke halaman masuk akan otomatis mengakhiri sesi Anda dan Anda harus masuk kembali dari awal."
        confirmText="Keluar & Batalkan"
        cancelText="Lanjutkan Verifikasi"
        variant="destructive"
        isLoading={isExiting}
        onConfirm={confirmExit}
      />
    </>
  );
}
