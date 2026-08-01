"use client";

import { useState, useTransition } from "react";
import { deleteExpiredRegistration } from "./actions";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

type ExpiredRegistrationDialogProps = {
  teamName: string;
  registrationId: string;
};

export default function ExpiredRegistrationDialog({
  teamName,
  registrationId,
}: ExpiredRegistrationDialogProps) {
  const [open, setOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await deleteExpiredRegistration(registrationId);
        setOpen(false);
      } catch (err) {
        console.error("Failed to delete expired registration:", err);
        setError("Gagal mereset pendaftaran. Silakan muat ulang halaman atau coba lagi.");
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={isPending ? undefined : () => {}}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Batas waktu pembayaran telah berakhir</AlertDialogTitle>
          <AlertDialogDescription>
            Batas waktu pembayaran untuk {teamName} telah berakhir. Pendaftaran tim Mechatura Anda sebelumnya telah diatur ulang, sehingga Anda dapat mengirimkan pendaftaran baru dari awal.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <p className="text-sm font-medium text-destructive mt-2">{error}</p>
        )}

        <AlertDialogFooter>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="h-11 rounded-xl bg-white hover:bg-white/90 text-neutral-950 font-semibold shadow-sm transition-all"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Mulai Pendaftaran Baru
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
