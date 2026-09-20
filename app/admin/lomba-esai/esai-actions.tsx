"use client";

import { useState, useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";
import { 
    Eye, FileText, MoreHorizontal, Phone, Tags, Mail, 
    CheckCircle, Unlock, Trash, Info, User, Receipt
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import ConfirmDialog from "@/components/confirm-dialog";
import Link from "next/link";
import { AdminEsaiRegistration } from "./_lib/esai-utils";
import { updateEsaiRegistrationStatus, deleteEsaiRegistration, getEsaiDocumentUrl } from "./actions";

const copyText = async (value: string | null | undefined, label: string) => {
    if (!value) {
        toast.error(`Tidak ada ${label} untuk disalin`);
        return;
    }
    await navigator.clipboard.writeText(value);
    toast.success(`Berhasil menyalin ${label} ke papan klip`);
};

export function EsaiActions({ participant }: { participant: AdminEsaiRegistration }) {
    const router = useRouter();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [approveOpen, setApproveOpen] = useState(false);
    const [unlockOpen, setUnlockOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleDownload = async (path: string | null, label: string) => {
        if (!path) {
            toast.error(`Tidak ada ${label} yang tersedia`);
            return;
        }
        
        const toastId = toast.loading(`Membuka ${label}...`);
        const { url, error } = await getEsaiDocumentUrl(path);
        
        if (error || !url) {
            toast.error(error || `Gagal membuka ${label}`, { id: toastId });
            return;
        }
        
        toast.dismiss(toastId);
        window.open(url, '_blank');
        toast.success(`Berhasil membuka ${label}`);
    };

    const handleStatusUpdate = (status: "approved" | "draft") => {
        startTransition(async () => {
            const result = await updateEsaiRegistrationStatus(participant.id, status);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(status === "approved" ? "Pendaftaran berhasil disetujui" : "Dokumen berhasil dibuka kuncinya");
                setApproveOpen(false);
                setUnlockOpen(false);
                router.refresh();
            }
        });
    };

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteEsaiRegistration(participant.id);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Pendaftaran berhasil dihapus");
                setDeleteOpen(false);
                router.refresh();
            }
        });
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
                <DropdownMenuContent align="end" className="w-52 max-h-[300px] overflow-y-auto">
                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                        <Link href={`/admin/lomba-esai/${participant.id}`} prefetch={false}>
                            <Eye className="h-4 w-4 mr-2" />
                            Lihat Detail
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Salin</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => copyText(participant.id, "ID Pendaftaran")}>
                            <Tags className="h-4 w-4 mr-2" />
                            ID Pendaftaran
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => copyText(participant.phone_number, "Nomor Telepon")}>
                            <Phone className="h-4 w-4 mr-2" />
                            Nomor Telepon
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => copyText(participant.email, "Email")}>
                            <Mail className="h-4 w-4 mr-2" />
                            Email
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Dokumen</DropdownMenuLabel>
                        <DropdownMenuItem 
                            onClick={() => handleDownload(participant.essay_paper_url, "Naskah Esai")}
                            disabled={!participant.essay_paper_url}
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Naskah Esai
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={() => handleDownload(participant.identity_card_url, "KTM / Identitas")}
                            disabled={!participant.identity_card_url}
                        >
                            <User className="h-4 w-4 mr-2" />
                            KTM / Identitas
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={() => handleDownload(participant.instagram_twibbon_url, "Bukti Twibbon")}
                            disabled={!participant.instagram_twibbon_url}
                        >
                            <Info className="h-4 w-4 mr-2" />
                            Bukti Twibbon
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={() => handleDownload(participant.payment_proof_url, "Bukti Pembayaran")}
                            disabled={!participant.payment_proof_url}
                        >
                            <Receipt className="h-4 w-4 mr-2" />
                            Bukti Pembayaran
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    
                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Pendaftaran</DropdownMenuLabel>
                        <DropdownMenuItem 
                            onClick={(e) => { e.preventDefault(); setApproveOpen(true); }}
                            disabled={isPending || participant.submission_status === "approved" || participant.submission_status !== "submitted"}
                            className="text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 dark:focus:bg-emerald-950"
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Setujui
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={(e) => { e.preventDefault(); setUnlockOpen(true); }}
                            disabled={isPending || participant.submission_status === "draft"}
                            className="text-amber-600 focus:text-amber-600 focus:bg-amber-50 dark:focus:bg-amber-950"
                        >
                            <Unlock className="h-4 w-4 mr-2" />
                            Buka Kunci
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleteOpen(true)}
                    >
                        <Trash className="h-4 w-4 mr-2" />
                        Hapus
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Hapus peserta?"
                description="Tindakan ini akan menghapus permanen pendaftaran peserta ini beserta seluruh dokumen yang diunggah. Tindakan ini tidak dapat dibatalkan."
                confirmText="Hapus pendaftaran"
                cancelText="Batal"
                variant="destructive"
                onConfirm={handleDelete}
            />

            <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Setujui Dokumen Esai?</DialogTitle>
                        <DialogDescription>
                            Tindakan ini akan menandai dokumen peserta <strong>{participant.full_name || "Tanpa Nama"}</strong> sebagai disetujui.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setApproveOpen(false)} disabled={isPending}>
                            Batal
                        </Button>
                        <Button 
                            onClick={() => handleStatusUpdate("approved")}
                            disabled={isPending}
                        >
                            {isPending ? "Memproses..." : "Setujui"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={unlockOpen} onOpenChange={setUnlockOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Buka Kunci Dokumen?</DialogTitle>
                        <DialogDescription>
                            Tindakan ini akan mengubah status peserta <strong>{participant.full_name || "Tanpa Nama"}</strong> menjadi "Draft". Peserta akan dapat mengedit dan mengunggah ulang dokumen mereka.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setUnlockOpen(false)} disabled={isPending}>
                            Batal
                        </Button>
                        <Button 
                            variant="default"
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                            onClick={() => handleStatusUpdate("draft")}
                            disabled={isPending}
                        >
                            {isPending ? "Memproses..." : "Buka Kunci"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
