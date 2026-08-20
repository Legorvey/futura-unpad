"use client";

import { useState, useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";
import { CheckCircle, Trash, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/confirm-dialog";
import { updateMechaturaRegistrationStatus } from "../actions";
import { useDeleteMechaturaRegistrationMutation } from "@/hooks/mutations/use-admin-mutations";

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

type TeamDetailActionsProps = {
    teamId: string;
    teamName: string;
    category: string;
    approvalStatus: "pending" | "approved" | "revision";
    submissionStatus: "draft" | "submitted" | "revision";
};

export function TeamDetailActions({ teamId, teamName, category, approvalStatus, submissionStatus }: TeamDetailActionsProps) {
    const router = useRouter();
    const deleteTeam = useDeleteMechaturaRegistrationMutation();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [approveOpen, setApproveOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isPending, startTransition] = useTransition();
    const [internalRejectLoading, setInternalRejectLoading] = useState(false);

    const handleStatusUpdate = async (status: "approved" | "revision", reason?: string) => {
        try {
            if (status === "revision") setInternalRejectLoading(true);
            const result = await updateMechaturaRegistrationStatus(teamId, status, reason);
            
            if (result?.error) {
                toast.error(result.error);
                return;
            }

            toast.success(status === "approved" ? "Pendaftaran berhasil disetujui" : "Pendaftaran berhasil ditolak");
            if (status === "revision") setRejectOpen(false);
            if (status === "approved") setApproveOpen(false);
            router.refresh();
        } catch (error) {
            toast.error("Gagal memperbarui status pendaftaran");
        } finally {
            if (status === "revision") setInternalRejectLoading(false);
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
                    className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900 disabled:opacity-50" 
                    onClick={() => setApproveOpen(true)}
                    disabled={isPending || !isSubmitted}
                >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Setujui
                </Button>
            )}
            {approvalStatus !== "revision" && (
                <Button 
                    variant="outline" 
                    className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900 disabled:opacity-50" 
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
            <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
                <DialogContent className="sm:max-w-xl w-[95vw] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle>Setujui Pendaftaran Tim?</DialogTitle>
                        <DialogDescription>
                            Tindakan ini akan menandai pendaftaran tim {teamName} sebagai disetujui dan mengirimkan email konfirmasi ke ketua tim.
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
                                        <span className="text-gray-900 font-medium break-words">Pendaftaran {category === "robot_sumo" ? "Lomba Sumo" : "Lomba Transporter"} Disetujui</span>
                                    </div>
                                </div>
                                <div className="p-4 sm:p-6 text-sm sm:text-base font-sans space-y-4 overflow-y-auto bg-gray-50 text-gray-800">
                                    <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                                        <div className="font-extrabold text-2xl text-black tracking-tight mb-8">FUTURA</div>
                                        <h4 className="font-bold text-2xl text-black mb-4 tracking-tight">Pendaftaran Berhasil Disetujui ✨</h4>
                                        <p className="leading-relaxed text-gray-700">Halo! Selamat, pendaftaran kamu untuk <strong className="text-black font-bold">{category === "robot_sumo" ? "Lomba Sumo" : "Lomba Transporter"}</strong> sudah berhasil disetujui. ✨</p>
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
                            Tindakan ini akan menandai pendaftaran tim {teamName} sebagai ditolak. Berikan catatan revisi untuk dikirimkan ke email ketua tim.
                        </DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="action" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="action">Tindakan</TabsTrigger>
                            <TabsTrigger value="preview">Preview Email</TabsTrigger>
                        </TabsList>
                        <TabsContent value="action" className="py-4 space-y-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="reason">Catatan Revisi</Label>
                                <Textarea 
                                    id="reason" 
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
                                        <span className="text-gray-900 font-medium break-words">Revisi Pendaftaran {category === "robot_sumo" ? "Lomba Sumo" : "Lomba Transporter"}</span>
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
        </div>
    );
}
