"use client";

import { useState, useTransition } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, Eye, FileText, Mail, MoreHorizontal, Phone, Tags, Trash, User, XCircle } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import Link from "next/link";
import { toast } from "sonner";
import { getMechaturaDocumentUrl, updateMechaturaRegistrationStatus } from "./actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmDialog from "@/components/confirm-dialog";
import {
    useDeleteMechaturaRegistrationMutation,
    useToggleMechaturaAttendanceMutation,
} from "@/hooks/mutations/use-admin-mutations";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    isMechaturaCompetitionType,
    mechaturaCompetitionLabels,
    paymentStatusLabels,
    type PaymentStatus,
} from "@/lib/payment";
import { formatMechaturaDateTime } from "@/lib/mechatura/format";

export type AdminMechaturaRegistration = {
    id: string;
    team_id: string;
    team_name: string;
    institution: string;
    competition_type: unknown;
    robot_name: string;
    payment_status: string | null;
    attended: boolean | null;
    check_in_time: string | null;
    created_at: string | null;
    registration_status: "approved" | "rejected" | "registered" | "waiting_payment" | null;
    member_document_path: string | null;
    robot_document_path: string | null;
};

export type AdminMechaturaLeader = {
    registration_id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
};

export type MechaturaTeamData = AdminMechaturaRegistration & {
    leader?: AdminMechaturaLeader;
};

const statusClassName: Record<PaymentStatus, string> = {
    unpaid: "bg-zinc-100 text-zinc-700",
    pending: "bg-amber-100 text-amber-800",
    paid: "bg-emerald-100 text-emerald-800",
    failed: "bg-red-100 text-red-800",
    expired: "bg-slate-100 text-slate-700",
    cancelled: "bg-neutral-100 text-neutral-700",
    settled: "bg-blue-100 text-blue-800",
};

const getStatus = (status: string | null): PaymentStatus =>
    status && status in statusClassName ? (status as PaymentStatus) : "unpaid";

function AttendanceCheckbox({ team }: { team: MechaturaTeamData }) {
    const router = useRouter();
    const toggleAttendance = useToggleMechaturaAttendanceMutation();

    const handleToggle = async (checked: boolean | "indeterminate") => {
        try {
            await toggleAttendance.mutateAsync({
                registration_id: team.id,
                attended: checked === true,
            });
            router.refresh();
        } catch (e) {
            console.error("Error toggling attendance", e);
        }
    };

    return (
        <div className="flex items-center justify-center gap-2">
            <Checkbox
                checked={!!team.attended}
                onCheckedChange={handleToggle}
                disabled={toggleAttendance.isPending}
                aria-label="Attendance status"
                className={toggleAttendance.isPending ? "opacity-50" : ""}
            />
        </div>
    );
}

const copyText = async (value: string | null | undefined, label: string) => {
    if (!value) {
        toast.error(`No ${label.toLowerCase()} available to copy`);
        return;
    }
    await navigator.clipboard.writeText(value);
    toast.success(`Copied ${label.toLowerCase()} to clipboard`);
};

export function TeamActions({ team, hideViewDetails }: { team: MechaturaTeamData, hideViewDetails?: boolean }) {
    const router = useRouter();
    const deleteTeam = useDeleteMechaturaRegistrationMutation();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [approveOpen, setApproveOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleDownload = async (path: string | null, label: string) => {
        if (!path) {
            toast.error(`No ${label.toLowerCase()} available`);
            return;
        }
        
        try {
            const url = await getMechaturaDocumentUrl(path);
            if (!url) throw new Error("URL generation failed");
            window.open(url, '_blank');
            toast.success(`Opening ${label.toLowerCase()}`);
        } catch (error) {
            toast.error(`Failed to download ${label.toLowerCase()}`);
        }
    };

    const handleStatusUpdate = async (status: "approved" | "rejected") => {
        try {
            await updateMechaturaRegistrationStatus(team.id, status);
            toast.success(`Application ${status} successfully`);
            router.refresh();
        } catch (error) {
            toast.error(`Failed to update application status`);
            throw error;
        }
    };

    const handleDelete = async () => {
        try {
            await deleteTeam.mutateAsync(team.id);
            toast.success("Team deleted successfully");
            router.refresh();
        } catch (e) {
            toast.error("Failed to delete team");
            throw e; // Let ConfirmDialog catch it for internal error handling too
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {!hideViewDetails && (
                        <>
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/mechatura/${team.id}`} prefetch={false}>
                                    <Eye className="h-4 w-4" />
                                    View Details
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </>
                    )}

                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Copy</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => copyText(team.team_id, "Team ID")}>
                            <Tags className="h-4 w-4" />
                            Team ID
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyText(team.leader?.email, "Leader Email")}>
                            <Mail className="h-4 w-4" />
                            Leader Email
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyText(team.leader?.phone, "Leader Phone")}>
                            <Phone className="h-4 w-4" />
                            Leader Phone
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Documents</DropdownMenuLabel>
                        <DropdownMenuItem 
                            onClick={() => handleDownload(team.member_document_path, "Member Document")}
                            disabled={!team.member_document_path}
                        >
                            <FileText className="h-4 w-4" />
                            Member Doc
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={() => handleDownload(team.robot_document_path, "Robot Document")}
                            disabled={!team.robot_document_path}
                        >
                            <FileText className="h-4 w-4" />
                            Robot Doc
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    
                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Application</DropdownMenuLabel>
                        <DropdownMenuItem 
                            onClick={(e) => { e.preventDefault(); setApproveOpen(true); }}
                            disabled={isPending || team.registration_status === "approved"}
                            className="text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 dark:focus:bg-emerald-950"
                        >
                            <CheckCircle className="h-4 w-4" />
                            Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={(e) => { e.preventDefault(); setRejectOpen(true); }}
                            disabled={isPending || team.registration_status === "rejected"}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                        >
                            <XCircle className="h-4 w-4" />
                            Reject
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleteOpen(true)}
                    >
                        <Trash className="h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
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
                description={`This will mark ${team.team_name}'s application as approved.`}
                confirmText="Approve Application"
                cancelText="Cancel"
                variant="default"
                onConfirm={() => handleStatusUpdate("approved")}
            />
            <ConfirmDialog
                open={rejectOpen}
                onOpenChange={setRejectOpen}
                title="Reject Team Application?"
                description={`This will mark ${team.team_name}'s application as rejected. Please make sure you have a valid reason.`}
                confirmText="Reject Application"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={() => handleStatusUpdate("rejected")}
            />
        </>
    );
}

export const columns: ColumnDef<MechaturaTeamData>[] = [
    {
        id: "index",
        header: "#",
        cell: ({ row }) => (
            <div className="text-muted-foreground">{row.index + 1}</div>
        ),
    },
    {
        accessorKey: "attended",
        header: () => <div className="text-center">Checked In</div>,
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <AttendanceCheckbox team={row.original} />
            </div>
        )
    },
    {
        accessorKey: "team_name",
        header: "Team",
        cell: ({ row }) => (
            <div className="min-w-0">
                <p className="font-medium">{row.original.team_name}</p>
            </div>
        ),
    },
    {
        accessorKey: "competition_type",
        header: "Category",
        cell: ({ row }) => {
            const team = row.original;
            const category = isMechaturaCompetitionType(team.competition_type)
                ? mechaturaCompetitionLabels[team.competition_type]
                : "-";
            
            return (
                <div>
                    <p className="font-medium">{category}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {team.robot_name}
                    </p>
                </div>
            );
        },
    },
    {
        accessorKey: "leader",
        header: "Leader",
        cell: ({ row }) => {
            const leader = row.original.leader;
            return (
                <div className="min-w-0">
                    <p className="font-medium">
                        {leader?.full_name ?? "-"}
                    </p>
                    <p className="mt-1 max-w-64 truncate text-xs text-muted-foreground">
                        {leader?.email ?? "-"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {leader?.phone ?? "-"}
                    </p>
                </div>
            );
        },
    },
    {
        accessorKey: "payment_status",
        header: "Payment",
        cell: ({ row }) => {
            const status = getStatus(row.original.payment_status);
            return (
                <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClassName[status]}`}
                >
                    {paymentStatusLabels[status]}
                </span>
            );
        },
    },
    {
        accessorKey: "registration_status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.registration_status;
            if (status === 'approved') return <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800">Approved</span>;
            if (status === 'rejected') return <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
            if (status === 'waiting_payment') return <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-800">Waiting Payment</span>;
            if (status === 'registered') return <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800">Registered</span>;
            return <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium bg-zinc-100 text-zinc-700">Unknown</span>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <TeamActions team={row.original} />,
    },
];
