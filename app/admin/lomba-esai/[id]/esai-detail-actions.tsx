"use client";

import { useState, useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";
import { CheckCircle, Unlock, Trash } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/confirm-dialog";
import { updateEsaiRegistrationStatus, deleteEsaiRegistration } from "../actions";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type EsaiDetailActionsProps = {
    registrationId: string;
    submissionStatus: string | null;
};

export function EsaiDetailActions({ registrationId, submissionStatus }: EsaiDetailActionsProps) {
    const router = useRouter();
    const [approveOpen, setApproveOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleStatusUpdate = async (status: "approved" | "draft") => {
        try {
            const result = await updateEsaiRegistrationStatus(registrationId, status);
            
            if (result?.error) {
                toast.error(result.error);
                return;
            }

            toast.success(status === "approved" ? "Pendaftaran berhasil disetujui" : "Pendaftaran dikembalikan ke draft");
            
            startTransition(() => {
                router.refresh();
                setApproveOpen(false);
                setRejectOpen(false);
            });
        } catch (error) {
            toast.error("Terjadi kesalahan sistem");
        }
    };

    const handleDelete = async () => {
        try {
            const result = await deleteEsaiRegistration(registrationId);
            if (result?.error) {
                toast.error(result.error);
                return;
            }
            toast.success("Peserta berhasil dihapus");
            router.push("/admin/lomba-esai");
        } catch (error) {
            toast.error("Terjadi kesalahan sistem");
        }
    };

    const isSubmitted = submissionStatus === "submitted";

    return (
        <div className="flex items-center gap-3">
            <Button 
                variant="outline" 
                className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900 disabled:opacity-50" 
                onClick={() => setApproveOpen(true)}
                disabled={isPending || submissionStatus === "approved" || !isSubmitted}
            >
                <CheckCircle className="mr-2 h-4 w-4" />
                Setujui
            </Button>
            
            <Button 
                variant="outline" 
                className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900 disabled:opacity-50" 
                onClick={() => setRejectOpen(true)}
                disabled={isPending || submissionStatus === "draft"}
            >
                <Unlock className="mr-2 h-4 w-4" />
                Buka Kunci
            </Button>
            
            <Button 
                variant="destructive" 
                onClick={() => setDeleteOpen(true)}
                disabled={isPending}
            >
                <Trash className="mr-2 h-4 w-4" />
                Hapus
            </Button>

            <ConfirmDialog
                open={approveOpen}
                onOpenChange={setApproveOpen}
                title="Setujui Dokumen Esai"
                description="Peserta akan ditandai sebagai disetujui dan dokumen dianggap valid. Apakah Anda yakin?"
                onConfirm={() => handleStatusUpdate("approved")}
                confirmText="Ya, Setujui"
                cancelText="Batal"
                variant="default"
                isLoading={isPending}
            />

            <ConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Hapus peserta?"
                description="Tindakan ini akan menghapus permanen peserta Lomba Esai ini beserta dokumen yang diunggah. Tindakan ini tidak dapat dibatalkan."
                confirmText="Hapus peserta"
                cancelText="Batal"
                variant="destructive"
                onConfirm={handleDelete}
            />

            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Kembalikan ke Draft</DialogTitle>
                        <DialogDescription>
                            Tindakan ini akan membuka kunci pendaftaran sehingga peserta dapat merevisi dan mengunggah ulang dokumen mereka. Apakah Anda yakin?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6">
                        <Button variant="outline" onClick={() => setRejectOpen(false)} disabled={isPending}>Batal</Button>
                        <Button variant="default" onClick={() => handleStatusUpdate("draft")} disabled={isPending}>
                            {isPending ? "Memproses..." : "Ya, Kembalikan ke Draft"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
