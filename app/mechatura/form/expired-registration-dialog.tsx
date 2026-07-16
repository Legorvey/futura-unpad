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
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      await deleteExpiredRegistration(registrationId);
      setOpen(false);
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={isPending ? undefined : setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Payment window expired</AlertDialogTitle>
          <AlertDialogDescription>
            The payment window for {teamName} has ended. Your previous
            Mechatura team registration has been reset, so you can submit a new
            registration from the beginning.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Start new registration
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
