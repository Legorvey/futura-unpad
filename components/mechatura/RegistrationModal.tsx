"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ban } from "lucide-react";

interface MechaturaRegistrationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MechaturaRegistrationModal({ isOpen, onOpenChange }: MechaturaRegistrationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border/80 bg-background/95 backdrop-blur-xl">
        <DialogHeader className="flex flex-col items-center text-center pt-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15 text-red-400 mb-3 border border-red-500/20">
            <Ban className="h-6 w-6 stroke-[2.2]" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">
            Pendaftaran Mechatura Telah Ditutup
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm mt-2 leading-relaxed">
            Pendaftaran kompetisi robotika Mechatura 2026 telah resmi berakhir. Terima kasih banyak atas partisipasi dan antusiasme Anda.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center pt-4 pb-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-full px-6"
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
