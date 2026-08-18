"use client";

import { useState, useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";
import { CheckCircle, Trash, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/confirm-dialog";
import { updateMechaturaRegistrationStatus } from "../actions";
import { useDeleteMechaturaRegistrationMutation } from "@/hooks/mutations/use-admin-mutations";

type TeamDetailActionsProps = {
    teamId: string;
    approvalStatus: "pending" | "approved" | "rejected";
    submissionStatus: "draft" | "submitted";
};

export function TeamDetailActions({ teamId, approvalStatus, submissionStatus }: TeamDetailActionsProps) {
    const router = useRouter();
    const deleteTeam = useDeleteMechaturaRegistrationMutation();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [approveOpen, setApproveOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleStatusUpdate = async (status: "approved" | "rejected") => {
        try {
            await updateMechaturaRegistrationStatus(teamId, status);
            toast.success(status === "approved" ? "Pendaftaran berhasil disetujui" : "Pendaftaran berhasil ditolak");
            router.refresh();
        } catch (error) {
            toast.error("Gagal memperbarui status pendaftaran");
            throw error;
        }
    };

    const handleDelete = async () => {
        try {
            await deleteTeam.mutateAsync(teamId);
            toast.success("Tim berhasil dihapus");
            router.push("/admin/mechatura");
        } catch (e) {
            toast.error("Gagal menghapus tim");
            throw e;
        }
    };

    const isSubmitted = submissionStatus === "submitted";

    return (
        <div className="flex items-center gap-3">
            {approvalStatus !== "approved" && (
                <Button 
                    variant="outline" 
                    className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900 disabled:opacity-50 disabled:grayscale" 
                    onClick={() => setApproveOpen(true)}
                    disabled={isPending || !isSubmitted}
                >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Setujui
                </Button>
            )}
            {approvalStatus !== "rejected" && (
                <Button 
                    variant="outline" 
                    className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900 disabled:opacity-50 disabled:grayscale" 
                    onClick={() => setRejectOpen(true)}
                    disabled={isPending || !isSubmitted}
                >
                    <XCircle className="mr-2 h-4 w-4" />
                    Tolak
                </Button>
            )}
            <Button 
                variant="destructive" 
                onClick={() => setDeleteOpen(true)}
                disabled={isPending || deleteTeam.isPending}
            >
                <Trash className="mr-2 h-4 w-4" />
                Hapus
            </Button>
            <ConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Hapus tim?"
                description="Tindakan ini akan menghapus permanen tim Mechatura ini, anggota terdaftar, dan dokumen yang diunggah. Tindakan ini tidak dapat dibatalkan."
                confirmText="Hapus tim"
                cancelText="Batal"
                variant="destructive"
                onConfirm={handleDelete}
            />
            <ConfirmDialog
                open={approveOpen}
                onOpenChange={setApproveOpen}
                title="Setujui Pendaftaran Tim?"
                description="Tindakan ini akan menandai pendaftaran tim sebagai disetujui."
                confirmText="Setujui Pendaftaran"
                cancelText="Batal"
                variant="default"
                onConfirm={() => handleStatusUpdate("approved")}
            />
            <ConfirmDialog
                open={rejectOpen}
                onOpenChange={setRejectOpen}
                title="Tolak Pendaftaran Tim?"
                description="Tindakan ini akan menandai pendaftaran tim sebagai ditolak. Pastikan Anda memiliki alasan yang sah."
                confirmText="Tolak Pendaftaran"
                cancelText="Batal"
                variant="destructive"
                onConfirm={() => handleStatusUpdate("rejected")}
            />
        </div>
    );
}
