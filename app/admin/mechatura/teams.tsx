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
    fallback_name?: string | null;
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
    unpaid: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30",
    pending: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30",
    paid: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/30",
    failed: "bg-red-100 text-red-800 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30",
    expired: "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-500/20 dark:text-zinc-300 dark:border-zinc-500/30",
    cancelled: "bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-500/20 dark:text-neutral-300 dark:border-neutral-500/30",
    settled: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/30",
    pending_verification: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30",
    verified: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/30",
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

export const getColumns = (searchParam?: string): ColumnDef<MechaturaTeamData>[] => [
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
        cell: ({ row }) => {
            const searchParts = searchParam?.toLowerCase().trim().split(/\s+/).filter(Boolean) || [];
            const isMatch = (str?: string | null) => searchParts.length > 0 && searchParts.every(part => str?.toLowerCase().includes(part));
            
            const nameMatches = isMatch(row.original.name);
            const codeMatches = isMatch(row.original.join_code);
            
            return (
                <div className="min-w-0 flex flex-col gap-1 items-start">
                    <span className={`font-medium ${nameMatches ? 'bg-yellow-200 text-yellow-900 px-1 rounded-sm' : ''}`}>{row.original.name}</span>
                    <span className={`text-xs text-muted-foreground tracking-wide uppercase ${codeMatches ? 'bg-yellow-200 text-yellow-900 px-1 rounded-sm font-medium' : ''}`}>
                        ID: {row.original.join_code}
                    </span>
                </div>
            );
        },
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
            const members = row.original.mechatura_members || [];
            const leader = members.find((m: any) => m.is_leader);
            
            const searchParts = searchParam?.toLowerCase().trim().split(/\s+/).filter(Boolean) || [];
            const isMatch = (str?: string | null) => searchParts.length > 0 && searchParts.every(part => str?.toLowerCase().includes(part));
            
            const leaderNameMatches = isMatch(leader?.full_name) || isMatch(leader?.fallback_name);
            const leaderPhoneMatches = isMatch(leader?.phone_number);

            // Find matching non-leader members
            const matchedAnggotas = members.filter((m: any) => !m.is_leader && (
                isMatch(m.full_name) || 
                isMatch(m.fallback_name) || 
                isMatch(m.phone_number)
            ));
            
            return (
                <div className="min-w-0 flex flex-col gap-1 relative">
                    <div className="flex flex-col">
                        <span className={`font-medium text-[13px] leading-tight ${leaderNameMatches ? 'bg-yellow-200 text-yellow-900 px-1 rounded-sm w-fit' : ''}`}>
                            {leader?.full_name || leader?.fallback_name || "-"}
                        </span>
                        <span className={`text-[11px] text-muted-foreground mt-0.5 ${leaderPhoneMatches ? 'bg-yellow-200 text-yellow-900 px-1 rounded-sm w-fit font-medium' : ''}`}>
                            {leader?.phone_number ?? "-"}
                        </span>
                    </div>

                    {matchedAnggotas.length > 0 && (
                        <div className="absolute top-full mt-1.5 left-0 z-50">
                            <div className="relative">
                                <div className="absolute -top-1 left-2 w-2 h-2 bg-yellow-300 rotate-45 transform origin-center rounded-[1px]" />
                                <div className="inline-block px-2 py-1 bg-yellow-300 text-yellow-950 text-[10px] font-medium rounded-md shadow-sm relative z-10">
                                    {matchedAnggotas.length} result{matchedAnggotas.length > 1 ? 's' : ''}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        },
    },
    {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
            const team = row.original;
            const paymentStatus = getStatus(team.payment_status);
            const submitStatus = team.submission_status;
            const approval = team.admin_approval_status;
            
            return (
                <div className="flex flex-col gap-1.5 items-start">
                    {submitStatus === 'draft' ? (
                        <span className="inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30">Submit: Draft</span>
                    ) : (
                        <span className="inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30">Submit: Done</span>
                    )}
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusClassName[paymentStatus]}`}>
                        Bayar: {paymentStatusLabels[paymentStatus]}
                    </span>
                    {approval === 'approved' ? (
                        <span className="inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30">Admin: Disetujui</span>
                    ) : approval === 'rejected' ? (
                        <span className="inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium bg-red-100 text-red-800 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30">Admin: Ditolak</span>
                    ) : (
                        <span className="inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30">Admin: Menunggu</span>
                    )}
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <TeamActions team={row.original} />,
    },
];
