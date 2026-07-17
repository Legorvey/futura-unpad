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
    registrationStatus: "approved" | "rejected" | "registered" | "waiting_payment" | null;
};

export function TeamDetailActions({ teamId, registrationStatus }: TeamDetailActionsProps) {
    const router = useRouter();
    const deleteTeam = useDeleteMechaturaRegistrationMutation();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [approveOpen, setApproveOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleStatusUpdate = async (status: "approved" | "rejected") => {
        try {
            await updateMechaturaRegistrationStatus(teamId, status);
            toast.success(`Application ${status} successfully`);
            router.refresh();
        } catch (error) {
            toast.error(`Failed to update application status`);
            throw error;
        }
    };

    const handleDelete = async () => {
        try {
            await deleteTeam.mutateAsync(teamId);
            toast.success("Team deleted successfully");
            router.push("/admin/mechatura");
        } catch (e) {
            toast.error("Failed to delete team");
            throw e;
        }
    };

    return (
        <div className="flex items-center gap-3">
            {registrationStatus !== "approved" && (
                <Button 
                    variant="outline" 
                    className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900" 
                    onClick={() => setApproveOpen(true)}
                    disabled={isPending}
                >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                </Button>
            )}
            {registrationStatus !== "rejected" && (
                <Button 
                    variant="outline" 
                    className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900" 
                    onClick={() => setRejectOpen(true)}
                    disabled={isPending}
                >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                </Button>
            )}
            <Button 
                variant="destructive" 
                onClick={() => setDeleteOpen(true)}
                disabled={isPending || deleteTeam.isPending}
            >
                <Trash className="mr-2 h-4 w-4" />
                Delete
            </Button>
            <ConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete team?"
                description="This will permanently remove this Mechatura team, its registered people, and uploaded documents. This action cannot be undone."
                confirmText="Delete team"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={handleDelete}
            />
            <ConfirmDialog
                open={approveOpen}
                onOpenChange={setApproveOpen}
                title="Approve Team Application?"
                description="This will mark the team's application as approved."
                confirmText="Approve Application"
                cancelText="Cancel"
                variant="default"
                onConfirm={() => handleStatusUpdate("approved")}
            />
            <ConfirmDialog
                open={rejectOpen}
                onOpenChange={setRejectOpen}
                title="Reject Team Application?"
                description="This will mark the team's application as rejected. Please make sure you have a valid reason."
                confirmText="Reject Application"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={() => handleStatusUpdate("rejected")}
            />
        </div>
    );
}
