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

export type AdminMechaturaMember = {
    id: string;
    team_id: string;
    user_id: string;
    is_leader: boolean;
    full_name: string;
    phone_number: string | null;
    institution: string | null;
    city: string | null;
    instagram_username: string | null;
    student_id_link: string | null;
    created_at: string;
};

export type AdminMechaturaTeam = {
    id: string;
    join_code: string;
    name: string;
    category: string;
    payment_status: string | null;
    payment_proof_link: string | null;
    robot_document_link: string | null;
    submission_status: "draft" | "submitted";
    admin_approval_status: "pending" | "approved" | "rejected";
    created_at: string | null;
    mechatura_members: AdminMechaturaMember[];
};

export type MechaturaTeamData = AdminMechaturaTeam;

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

const copyText = async (value: string | null | undefined, label: string) => {
    if (!value) {
        toast.error(`Tidak ada ${label} untuk disalin`);
        return;
    }
    await navigator.clipboard.writeText(value);
    toast.success(`Berhasil menyalin ${label} ke papan klip`);
};

export function TeamActions({ team, hideViewDetails }: { team: MechaturaTeamData, hideViewDetails?: boolean }) {
    const router = useRouter();
    const deleteTeam = useDeleteMechaturaRegistrationMutation();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [approveOpen, setApproveOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    
    const leader = team.mechatura_members?.find(m => m.is_leader);

    const handleDownload = async (url: string | null, label: string) => {
        if (!url) {
            toast.error(`Tidak ada ${label} yang tersedia`);
            return;
        }
        window.open(url, '_blank');
        toast.success(`Membuka ${label}`);
    };

    const handleStatusUpdate = async (status: "approved" | "rejected") => {
        try {
            await updateMechaturaRegistrationStatus(team.id, status);
            toast.success(status === "approved" ? "Pendaftaran berhasil disetujui" : "Pendaftaran berhasil ditolak");
            router.refresh();
        } catch (error) {
            toast.error(`Gagal memperbarui status pendaftaran`);
            throw error;
        }
    };

    const handleDelete = async () => {
        try {
            await deleteTeam.mutateAsync(team.id);
            toast.success("Tim berhasil dihapus");
            router.refresh();
        } catch (e) {
            toast.error("Gagal menghapus tim");
            throw e; 
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
                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {!hideViewDetails && (
                        <>
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/mechatura/${team.id}`} prefetch={false}>
                                    <Eye className="h-4 w-4" />
                                    Lihat Detail
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </>
                    )}

                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Salin</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => copyText(team.join_code, "Join Code")}>
                            <Tags className="h-4 w-4" />
                            Join Code
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => copyText(leader?.phone_number, "Telepon Ketua")}>
                            <Phone className="h-4 w-4" />
                            Telepon Ketua
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Dokumen</DropdownMenuLabel>
                        <DropdownMenuItem 
                            onClick={() => handleDownload(team.payment_proof_link, "Bukti Pembayaran")}
                            disabled={!team.payment_proof_link}
                        >
                            <FileText className="h-4 w-4" />
                            Bukti Bayar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={() => handleDownload(team.robot_document_link, "Dokumen Robot")}
                            disabled={!team.robot_document_link}
                        >
                            <FileText className="h-4 w-4" />
                            Dok. Robot
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    
                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Pendaftaran</DropdownMenuLabel>
                        <DropdownMenuItem 
                            onClick={(e) => { e.preventDefault(); setApproveOpen(true); }}
                            disabled={isPending || team.admin_approval_status === "approved" || team.submission_status !== "submitted"}
                            className="text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 dark:focus:bg-emerald-950"
                        >
                            <CheckCircle className="h-4 w-4" />
                            Setujui
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={(e) => { e.preventDefault(); setRejectOpen(true); }}
                            disabled={isPending || team.admin_approval_status === "rejected" || team.submission_status !== "submitted"}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                        >
                            <XCircle className="h-4 w-4" />
                            Tolak
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleteOpen(true)}
                    >
                        <Trash className="h-4 w-4" />
                        Hapus
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
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
                description={`Tindakan ini akan menandai pendaftaran tim ${team.name} sebagai disetujui.`}
                confirmText="Setujui Pendaftaran"
                cancelText="Batal"
                variant="default"
                onConfirm={() => handleStatusUpdate("approved")}
            />
            <ConfirmDialog
                open={rejectOpen}
                onOpenChange={setRejectOpen}
                title="Tolak Pendaftaran Tim?"
                description={`Tindakan ini akan menandai pendaftaran tim ${team.name} sebagai ditolak. Pastikan Anda memiliki alasan yang sah.`}
                confirmText="Tolak Pendaftaran"
                cancelText="Batal"
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
        accessorKey: "name",
        header: "Tim",
        cell: ({ row }) => (
            <div className="min-w-0">
                <p className="font-medium">{row.original.name}</p>
                <p className="text-xs text-muted-foreground mt-1 tracking-wide uppercase">
                    ID: {row.original.join_code}
                </p>
            </div>
        ),
    },
    {
        accessorKey: "category",
        header: "Kategori",
        cell: ({ row }) => {
            const team = row.original;
            const categoryLabel = team.category === "robot_sumo" ? "Robot Sumo" : team.category === "robot_transporter" ? "Robot Transporter" : team.category;
            
            return (
                <div>
                    <p className="font-medium">{categoryLabel}</p>
                </div>
            );
        },
    },
    {
        id: "leader",
        header: "Ketua",
        cell: ({ row }) => {
            const leader = row.original.mechatura_members?.find((m: any) => m.is_leader);
            return (
                <div className="min-w-0">
                    <p className="font-medium">
                        {leader?.full_name ?? "-"}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                        {leader?.phone_number ?? "-"}
                    </p>
                </div>
            );
        },
    },
    {
        accessorKey: "payment_status",
        header: "Pembayaran",
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
        id: "status",
        header: "Status",
        cell: ({ row }) => {
            const submitStatus = row.original.submission_status;
            const approval = row.original.admin_approval_status;
            if (submitStatus === 'draft') return <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium bg-zinc-100 text-zinc-700">Draft</span>;
            
            if (approval === 'approved') return <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800">Disetujui</span>;
            if (approval === 'rejected') return <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium bg-red-100 text-red-800">Ditolak</span>;
            return <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-800">Menunggu</span>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <TeamActions team={row.original} />,
    },
];
