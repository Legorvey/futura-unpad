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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    admin_approval_status: "pending" | "approved" | "revision";
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
    const [rejectionReason, setRejectionReason] = useState("");
    const [internalRejectLoading, setInternalRejectLoading] = useState(false);
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

    const handleStatusUpdate = async (status: "approved" | "revision", reason?: string) => {
        try {
            if (status === "revision") setInternalRejectLoading(true);
            const result = await updateMechaturaRegistrationStatus(team.id, status, reason);
            
            if (result?.error) {
                toast.error(result.error);
                return;
            }
            
            toast.success(status === "approved" ? "Pendaftaran berhasil disetujui" : "Pendaftaran berhasil ditolak");
            if (status === "revision") setRejectOpen(false);
            if (status === "approved") setApproveOpen(false);
            router.refresh();
        } catch (error) {
            toast.error(`Gagal memperbarui status pendaftaran`);
        } finally {
            if (status === "revision") setInternalRejectLoading(false);
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
                            disabled={isPending || team.admin_approval_status === "revision" || team.submission_status !== "submitted"}
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
            <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
                <DialogContent className="sm:max-w-xl w-[95vw] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle>Setujui Pendaftaran Tim?</DialogTitle>
                        <DialogDescription>
                            Tindakan ini akan menandai pendaftaran tim {team.name} sebagai disetujui dan mengirimkan email konfirmasi ke ketua tim.
                        </DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="action" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="action">Tindakan</TabsTrigger>
                            <TabsTrigger value="preview">Preview Email</TabsTrigger>
                        </TabsList>
                        <TabsContent value="action" className="py-4">
                            <p className="text-sm text-muted-foreground">
                                Pastikan Anda telah memeriksa semua dokumen dan data yang diunggah oleh tim. Email konfirmasi akan otomatis dikirim.
                            </p>
                        </TabsContent>
                        <TabsContent value="preview" className="py-2">
                            <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col max-h-[50vh] sm:max-h-[60vh] w-full">
                                <div className="bg-gray-100/80 px-4 py-3 border-b border-gray-200 text-xs sm:text-sm space-y-1 cursor-default select-none">
                                    <div className="grid grid-cols-[50px_1fr] sm:grid-cols-[60px_1fr] gap-2 items-start">
                                        <span className="font-semibold text-gray-500">Dari:</span>
                                        <span className="text-gray-900 break-words">Panitia Mechatura &lt;noreply@mail.futuraunpad.com&gt;</span>
                                    </div>
                                    <div className="grid grid-cols-[50px_1fr] sm:grid-cols-[60px_1fr] gap-2 items-start">
                                        <span className="font-semibold text-gray-500">Ke:</span>
                                        <span className="text-gray-900 break-words">Ketua Tim</span>
                                    </div>
                                    <div className="grid grid-cols-[50px_1fr] sm:grid-cols-[60px_1fr] gap-2 items-start">
                                        <span className="font-semibold text-gray-500">Subjek:</span>
                                        <span className="text-gray-900 font-medium break-words">Pendaftaran {team.category === "robot_sumo" ? "Lomba Sumo" : "Lomba Transporter"} Disetujui</span>
                                    </div>
                                </div>
                                <div className="p-4 sm:p-6 text-sm sm:text-base font-sans space-y-4 overflow-y-auto bg-gray-50 text-gray-800">
                                    <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                                        <div className="font-extrabold text-2xl text-black tracking-tight mb-8">FUTURA</div>
                                        <h4 className="font-bold text-2xl text-black mb-4 tracking-tight">Pendaftaran Berhasil Disetujui ✨</h4>
                                        <p className="leading-relaxed text-gray-700">Halo! Selamat, pendaftaran kamu untuk <strong className="text-black font-bold">{team.category === "robot_sumo" ? "Lomba Sumo" : "Lomba Transporter"}</strong> sudah berhasil disetujui. ✨</p>
                                        <p className="leading-relaxed text-gray-700 mt-4">
                                            Langkah selanjutnya, yuk segera bergabung ke grup WhatsApp resmi peserta melalui tautan ini:
                                        </p>
                                        <div className="my-8">
                                            <div className="inline-block bg-black text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer shadow-sm">
                                                Gabung Grup WhatsApp
                                            </div>
                                        </div>
                                        <p className="leading-relaxed text-gray-700">
                                            Biar tidak ketinggalan informasi penting lainnya, pastikan kamu selalu memantau pembaruan dari kami di kanal berikut:<br/><br/>
                                            <span className="inline-block space-y-1">
                                                <span className="block">Website: <span className="text-black font-medium underline break-all">futuraunpad.com</span></span>
                                                <span className="block">Instagram: <span className="text-black font-medium underline break-all">@futuraunpad.hmte</span></span>
                                                <span className="block">TikTok: <span className="text-black font-medium underline break-all">@futuraunpad</span></span>
                                            </span>
                                        </p>
                                        <p className="leading-relaxed text-gray-700 mt-6">Sampai jumpa di perlombaan dan persiapkan yang terbaik!</p>
                                        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
                                            &copy; {new Date().getFullYear()} Futura Unpad. All rights reserved.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setApproveOpen(false)} disabled={isPending}>
                            Batal
                        </Button>
                        <Button 
                            onClick={() => handleStatusUpdate("approved")}
                            disabled={isPending}
                        >
                            Setujui Pendaftaran
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                <DialogContent className="sm:max-w-xl w-[95vw] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle>Minta Revisi Tim?</DialogTitle>
                        <DialogDescription>
                            Tindakan ini akan menandai pendaftaran tim {team.name} sebagai ditolak. Berikan catatan revisi untuk dikirimkan ke email ketua tim.
                        </DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="action" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="action">Tindakan</TabsTrigger>
                            <TabsTrigger value="preview">Preview Email</TabsTrigger>
                        </TabsList>
                        <TabsContent value="action" className="py-4 space-y-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor={`reason-${team.id}`}>Catatan Revisi</Label>
                                <Textarea 
                                    id={`reason-${team.id}`}
                                    placeholder="Tuliskan data atau dokumen yang perlu direvisi..." 
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    rows={5}
                                    className="resize-none"
                                />
                            </div>
                        </TabsContent>
                        <TabsContent value="preview" className="py-2">
                            <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col max-h-[50vh] sm:max-h-[60vh] w-full">
                                <div className="bg-gray-100/80 px-4 py-3 border-b border-gray-200 text-xs sm:text-sm space-y-1 cursor-default select-none">
                                    <div className="grid grid-cols-[50px_1fr] sm:grid-cols-[60px_1fr] gap-2 items-start">
                                        <span className="font-semibold text-gray-500">Dari:</span>
                                        <span className="text-gray-900 break-words">Panitia Mechatura &lt;noreply@mail.futuraunpad.com&gt;</span>
                                    </div>
                                    <div className="grid grid-cols-[50px_1fr] sm:grid-cols-[60px_1fr] gap-2 items-start">
                                        <span className="font-semibold text-gray-500">Ke:</span>
                                        <span className="text-gray-900 break-words">Ketua Tim</span>
                                    </div>
                                    <div className="grid grid-cols-[50px_1fr] sm:grid-cols-[60px_1fr] gap-2 items-start">
                                        <span className="font-semibold text-gray-500">Subjek:</span>
                                        <span className="text-gray-900 font-medium break-words">Revisi Pendaftaran {team.category === "robot_sumo" ? "Lomba Sumo" : "Lomba Transporter"}</span>
                                    </div>
                                </div>
                                <div className="p-4 sm:p-6 text-sm sm:text-base font-sans space-y-4 overflow-y-auto bg-gray-50 text-gray-800">
                                    <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                                        <div className="font-extrabold text-2xl text-black tracking-tight mb-8">FUTURA</div>
                                        <h4 className="font-bold text-2xl text-black mb-4 tracking-tight">Revisi Data Pendaftaran</h4>
                                        <p className="leading-relaxed text-gray-700">Halo! Terima kasih atas antusiasme kamu mendaftar di perlombaan kami. ✨</p>
                                        <p className="leading-relaxed text-gray-700 mt-4">Saat ini, pendaftaran kamu belum dapat disetujui karena ada beberapa data atau dokumen yang perlu direvisi terlebih dahulu.</p>
                                        <p className="leading-relaxed text-gray-700 mt-4 mb-6">Berikut adalah catatan revisi dari tim panitia:</p>
                                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 my-8">
                                            <p className="italic whitespace-pre-wrap font-sans text-sm text-slate-700 m-0 leading-relaxed">
                                                {rejectionReason || "Silakan cek kembali kelengkapan pendaftaran Anda."}
                                            </p>
                                        </div>
                                        <p className="leading-relaxed text-gray-700">Yuk, segera perbaiki dan kirimkan ulang pendaftaran kamu sesuai dengan catatan di atas agar bisa segera kami proses kembali. Jika ada kebingungan atau kendala saat merevisi, jangan ragu untuk bertanya, ya!</p>
                                        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
                                            &copy; {new Date().getFullYear()} Futura Unpad. All rights reserved.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectOpen(false)} disabled={internalRejectLoading}>
                            Batal
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={() => handleStatusUpdate("revision", rejectionReason)}
                            disabled={!rejectionReason.trim() || internalRejectLoading}
                        >
                            {internalRejectLoading ? "Menyimpan..." : "Minta Revisi"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
                    ) : approval === "revision" ? (
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
