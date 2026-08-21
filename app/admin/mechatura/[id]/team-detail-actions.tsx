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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type TeamDetailActionsProps = {
    teamId: string;
    teamName: string;
    category: string;
    approvalStatus: "pending" | "approved" | "revision";
    submissionStatus: "draft" | "submitted" | "revision";
    members: any[];
};

export function TeamDetailActions({ teamId, teamName, category, approvalStatus, submissionStatus, members }: TeamDetailActionsProps) {
    const router = useRouter();
    const deleteTeam = useDeleteMechaturaRegistrationMutation();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [approveOpen, setApproveOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [rejectionReasonText, setRejectionReasonText] = useState("");
    const [revisionFields, setRevisionFields] = useState<string[]>([]);
    const [isPending, startTransition] = useTransition();
    const [internalRejectLoading, setInternalRejectLoading] = useState(false);

    const docFieldsPreview: string[] = [];
    const memberFieldsPreview: Record<string, { name: string, fields: string[] }> = {};
    const labelMap: Record<string, string> = {
        full_name: "Nama Lengkap",
        institution_category: "Kategori Institusi",
        institution: "Asal Sekolah / Institusi",
        city: "Kota",
        phone_number: "Nomor WhatsApp",
        instagram_username: "Twibbon (Link)",
        student_id_link: "Identitas/KTM (Link)"
    };
    revisionFields.forEach((f: string) => {
        if (f === "payment_proof") docFieldsPreview.push("Bukti Pembayaran");
        else if (f === "robot_document") docFieldsPreview.push("Dokumen Robot");
        else if (f.startsWith("member_")) {
            const parts = f.split("_");
            if (parts.length >= 3) {
                const mId = parts[1];
                const fieldName = parts.slice(2).join("_");
                if (!memberFieldsPreview[mId]) {
                    const m = members?.find((mem: any) => mem.id === mId);
                    memberFieldsPreview[mId] = { 
                        name: m?.full_name || m?.fallback_name || "Anggota",
                        fields: []
                    };
                }
                memberFieldsPreview[mId].fields.push(labelMap[fieldName] || fieldName);
            }
        }
    });

    const handleStatusUpdate = async (status: "approved" | "revision", reason?: string) => {
        try {
            if (status === "revision") setInternalRejectLoading(true);
            const result = await updateMechaturaRegistrationStatus(teamId, status, reason);
            
            if (result?.error) {
                toast.error(result.error);
                if (status === "revision") setInternalRejectLoading(false);
                return;
            }

            toast.success(status === "approved" ? "Pendaftaran berhasil disetujui" : "Pendaftaran berhasil ditolak");
            
            startTransition(() => {
                router.refresh();
                if (status === "revision") {
                    setRejectOpen(false);
                    setInternalRejectLoading(false);
                }
                if (status === "approved") {
                    setApproveOpen(false);
                }
            });
        } catch (error) {
            toast.error("Gagal memperbarui status pendaftaran");
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
                <DialogContent className="sm:max-w-3xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader className="shrink-0">
                        <DialogTitle>Minta Revisi Tim?</DialogTitle>
                        <DialogDescription>
                            Tindakan ini akan menandai pendaftaran tim {teamName} sebagai ditolak. Pilih data yang perlu direvisi dan berikan catatan.
                        </DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="action" className="w-full flex-1 flex flex-col min-h-0">
                        <TabsList className="grid w-full grid-cols-2 shrink-0">
                            <TabsTrigger value="action">Tindakan</TabsTrigger>
                            <TabsTrigger value="preview">Preview Email</TabsTrigger>
                        </TabsList>
                        <TabsContent value="action" className="flex-1 overflow-y-auto py-4 space-y-6 pr-2">
                            <div className="flex flex-col gap-3">
                                <Label className="text-base">Pilih Bagian yang Perlu Direvisi</Label>
                                <Accordion type="multiple" className="w-full space-y-3">
                                    <AccordionItem value="team-docs" className="border rounded-lg px-4 bg-card shadow-sm data-[state=open]:pb-3 data-[state=closed]:pb-0">
                                        <AccordionTrigger className="hover:no-underline font-medium py-3">
                                            Pembayaran & Dokumen Tim
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 pl-1">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id={`rev-payment-${teamId}`} checked={revisionFields.includes("payment_proof")} onCheckedChange={(c) => c ? setRevisionFields([...revisionFields, "payment_proof"]) : setRevisionFields(revisionFields.filter(f => f !== "payment_proof"))} />
                                                    <label htmlFor={`rev-payment-${teamId}`} className="text-sm cursor-pointer leading-none">Bukti Pembayaran</label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id={`rev-robot-${teamId}`} checked={revisionFields.includes("robot_document")} onCheckedChange={(c) => c ? setRevisionFields([...revisionFields, "robot_document"]) : setRevisionFields(revisionFields.filter(f => f !== "robot_document"))} />
                                                    <label htmlFor={`rev-robot-${teamId}`} className="text-sm cursor-pointer leading-none">Dokumen Robot</label>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    {(members || []).map((m: any) => (
                                        <AccordionItem key={m.id} value={`member-${m.id}`} className="border rounded-lg px-4 bg-card shadow-sm data-[state=open]:pb-3 data-[state=closed]:pb-0">
                                            <AccordionTrigger className="hover:no-underline font-medium py-3 text-left">
                                                <div className="flex items-center gap-2">
                                                    {m.full_name || m.fallback_name || "Anggota"} 
                                                    {m.is_leader && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Ketua</span>}
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1 pl-1">
                                                    {[
                                                        { id: "full_name", label: "Nama Lengkap" },
                                                        { id: "institution_category", label: "Kategori Institusi" },
                                                        { id: "institution", label: "Asal Sekolah / Institusi" },
                                                        { id: "city", label: "Kota" },
                                                        { id: "phone_number", label: "Nomor WhatsApp" },
                                                        { id: "instagram_username", label: "Twibbon (Link)" },
                                                        { id: "student_id_link", label: "Identitas/KTM (Link)" }
                                                    ].map(field => {
                                                        const fieldKey = `member_${m.id}_${field.id}`;
                                                        return (
                                                            <div key={fieldKey} className="flex items-center space-x-2">
                                                                <Checkbox 
                                                                    id={`rev-${fieldKey}`} 
                                                                    checked={revisionFields.includes(fieldKey)} 
                                                                    onCheckedChange={(c) => c ? setRevisionFields([...revisionFields, fieldKey]) : setRevisionFields(revisionFields.filter(f => f !== fieldKey))} 
                                                                />
                                                                <label htmlFor={`rev-${fieldKey}`} className="text-sm cursor-pointer leading-none truncate" title={field.label}>{field.label}</label>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <Label htmlFor={`reason-${teamId}`} className="text-base">Catatan Revisi Tambahan</Label>
                                <Textarea 
                                    id={`reason-${teamId}`}
                                    placeholder="Berikan penjelasan detail (opsional jika sudah memilih centang di atas)..." 
                                    value={rejectionReasonText}
                                    onChange={(e) => setRejectionReasonText(e.target.value)}
                                    rows={4}
                                    className="resize-none"
                                />
                            </div>
                        </TabsContent>
                        <TabsContent value="preview" className="py-2 flex-1 overflow-y-auto">
                            <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col w-full h-full min-h-[300px]">
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
                                        {revisionFields.length > 0 && (
                                            <div className="bg-[#fff8f8] border border-[#fee2e2] rounded-xl p-5 mb-6">
                                                <p className="font-bold text-[#991b1b] mb-4 text-[15px]">Bagian yang diminta untuk direvisi:</p>
                                                
                                                {docFieldsPreview.length > 0 && (
                                                    <div className={Object.keys(memberFieldsPreview).length > 0 ? "mb-4" : ""}>
                                                        <p className="font-semibold text-[#7f1d1d] mb-2 text-sm border-b border-[#fecaca] pb-1">Pembayaran & Dokumen Tim</p>
                                                        <ul className="list-disc list-inside text-[#991b1b] text-sm space-y-1 ml-1 leading-relaxed">
                                                            {docFieldsPreview.map(df => <li key={df}>{df}</li>)}
                                                        </ul>
                                                    </div>
                                                )}
                                                
                                                {Object.values(memberFieldsPreview).map((mf, i, arr) => (
                                                    <div key={i} className={i === arr.length - 1 ? "" : "mb-4"}>
                                                        <p className="font-semibold text-[#7f1d1d] mb-2 text-sm border-b border-[#fecaca] pb-1">{mf.name}</p>
                                                        <ul className="list-disc list-inside text-[#991b1b] text-sm space-y-1 ml-1 leading-relaxed">
                                                            {mf.fields.map(f => <li key={f}>{f}</li>)}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {(rejectionReasonText || revisionFields.length === 0) && (
                                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8">
                                                <p className="font-semibold text-slate-800 mb-2 text-sm">Catatan Tambahan:</p>
                                                <p className="whitespace-pre-wrap font-sans text-sm text-slate-700 m-0 leading-relaxed">
                                                    {rejectionReasonText || "Silakan cek kembali kelengkapan pendaftaran Anda."}
                                                </p>
                                            </div>
                                        )}
                                        <p className="leading-relaxed text-gray-700">Yuk, segera perbaiki bagian yang ditandai revisi di dashboard peserta dan kirimkan ulang pendaftaran kamu agar bisa segera kami proses kembali.</p>
                                        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
                                            &copy; {new Date().getFullYear()} Futura Unpad. All rights reserved.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                    <DialogFooter className="shrink-0 mt-4">
                        <Button variant="outline" onClick={() => setRejectOpen(false)} disabled={internalRejectLoading}>
                            Batal
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={() => {
                                const payload = JSON.stringify({ reason: rejectionReasonText, fields: revisionFields });
                                handleStatusUpdate("revision", payload);
                            }}
                            disabled={(revisionFields.length === 0 && !rejectionReasonText.trim()) || internalRejectLoading}
                        >
                            {internalRejectLoading ? "Menyimpan..." : "Minta Revisi"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
