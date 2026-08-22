import type { Metadata } from "next"
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ExternalLink, FileText, Info, MapPin, Receipt, Bot, Building2, AlertTriangle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { getSafeUrl } from "../_lib/mechatura-utils";
import {
    isMechaturaCompetitionType,
    mechaturaCompetitionLabels,
    paymentStatusLabels,
    type PaymentStatus,
} from "@/lib/payment";
import { formatMechaturaDateTime } from "@/lib/mechatura/format";
import { createClient } from "@/utils/supabase/server";
import { TeamDetailActions } from "./team-detail-actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const MECHATURA_DOCUMENT_BUCKET = "mechatura-documents";
const DOCUMENT_URL_EXPIRES_IN_SECONDS = 10 * 60;

const detailColumns = [
    "id",
    "join_code",
    "name",
    "category",
    "payment_status",
    "payment_proof_link",
    "robot_document_link",
    "created_at",
    "submission_status",
    "admin_approval_status",
    "admin_rejection_reason",
    "pembina_name",
    "pembina_institution",
    "pembina_city",
    "pembina_phone",
    "pembina_id_link",
    "pembina_relationship"
].join(",");

type MechaturaDetailRegistration = {
    id: string;
    join_code: string;
    name: string;
    category: string;
    payment_status: string | null;
    payment_proof_link: string | null;
    robot_document_link: string | null;
    created_at: string | null;
    submission_status: "draft" | "submitted" | "revision";
    admin_approval_status: "pending" | "approved" | "revision";
    admin_rejection_reason: string | null;
    pembina_name: string | null;
    pembina_institution: string | null;
    pembina_city: string | null;
    pembina_phone: string | null;
    pembina_id_link: string | null;
    pembina_relationship: string | null;
};

type MechaturaDetailMember = {
    id: string;
    user_id: string | null;
    full_name: string | null;
    phone_number: string | null;
    institution: string | null;
    city: string | null;
    instagram_username: string | null;
    student_id_link: string | null;
    is_leader: boolean | null;
    fallback_name?: string | null;
};

type DocumentLink = {
    label: string;
    href: string | null;
};

const statusClassName: Record<PaymentStatus, string> = {
    unpaid: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
    pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    paid: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20",
    failed: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
    expired: "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-500/10 dark:text-zinc-400 dark:border-zinc-500/20",
    cancelled: "bg-neutral-50 text-neutral-700 border-neutral-200 dark:bg-neutral-500/10 dark:text-neutral-400 dark:border-neutral-500/20",
    settled: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20",
    pending_verification: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    verified: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20",
};

const getPaymentStatus = (status: string | null): PaymentStatus =>
    status && status in statusClassName ? (status as PaymentStatus) : "unpaid";

const getDocumentLink = async (
    supabase: Awaited<ReturnType<typeof createClient>>,
    label: string,
    path: string | null
): Promise<DocumentLink> => {
    if (!path) {
        return { label, href: null };
    }

    const { data, error } = await supabase.storage
        .from(MECHATURA_DOCUMENT_BUCKET)
        .createSignedUrl(path, DOCUMENT_URL_EXPIRES_IN_SECONDS);

    return { label, href: error ? null : data.signedUrl };
};

const DetailItem = ({
    label,
    value,
    wide,
}: {
    label: string;
    value: React.ReactNode;
    wide?: boolean;
}) => (
    <div className={`flex items-start justify-between gap-4 py-2 ${wide ? "md:col-span-2" : ""}`}>
        <dt className="text-sm text-muted-foreground shrink-0">{label}</dt>
        <dd className="text-sm font-medium text-right break-words">{value}</dd>
    </div>
);

const formatPaymentType = (type: string | null) => {
    if (!type) return "-";
    const map: Record<string, string> = {
        gopay: "GoPay",
        qris: "QRIS",
        shopeepay: "ShopeePay",
        credit_card: "Credit Card",
        bank_transfer: "Bank Transfer",
        echannel: "Mandiri Bill",
        cstore: "Convenience Store",
        bca_klikpay: "BCA KlikPay",
        bca_klikbca: "KlikBCA",
    };
    return map[type] || type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
};

const AdminSidebarContent = ({
    registrationData,
    competition,
    paymentStatus,
}: {
    registrationData: MechaturaDetailRegistration;
    competition: string;
    paymentStatus: PaymentStatus;
}) => (
    <div className="space-y-6">
        {/* Documents */}
        <section className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-1">
                Dokumen Lampiran
            </h3>
            {[
                { label: "Bukti Pembayaran", href: registrationData.payment_proof_link },
                { label: "Dokumen Robot", href: registrationData.robot_document_link }
            ].map((document) => (
                <div key={document.label} className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                            <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-medium text-sm truncate">{document.label}</h3>
                        </div>
                    </div>
                    <div className="shrink-0 self-start sm:self-auto">
                        {document.href ? (
                            <Button variant="secondary" size="sm" className="rounded-full shadow-sm h-8 w-full sm:w-auto" asChild>
                                <a href={getSafeUrl(document.href) ?? "#"} target="_blank" rel="noreferrer">
                                    Buka
                                    <ExternalLink className="ml-1.5 h-3 w-3" />
                                </a>
                            </Button>
                        ) : (
                            <span className="text-xs text-muted-foreground italic px-2">N/A</span>
                        )}
                    </div>
                </div>
            ))}
        </section>

        {/* Registration Info */}
        <section className="rounded-xl border border-border bg-card p-5 flex flex-col">
            <div className="flex items-center gap-2 border-b border-border pb-3 mb-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold tracking-tight text-sm">Ringkasan Status</h3>
            </div>
            <dl className="flex-1 divide-y divide-border/50">
                <DetailItem label="Join Code" value={registrationData.join_code ?? "-"} />
                <DetailItem label="Submission" value={
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                        registrationData.submission_status === 'submitted' 
                        ? 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30' 
                        : 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30'
                    }`}>
                        {registrationData.submission_status === 'submitted' ? "Submitted" : "Draft"}
                    </span>
                } />
                <DetailItem label="Admin Approval" value={
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                        registrationData.admin_approval_status === 'approved' 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30' :
                        registrationData.admin_approval_status === "revision" 
                        ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30' :
                        'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30'
                    }`}>
                        {registrationData.admin_approval_status === 'approved' ? "Disetujui" :
                         registrationData.admin_approval_status === "revision" ? "Revisi" : "Pending"}
                    </span>
                } />
                <DetailItem
                    label="Dikirim"
                    value={formatMechaturaDateTime(registrationData.created_at)}
                />
            </dl>
        </section>

        {/* Institution & Robot Info */}
        <section className="rounded-xl border border-border bg-card p-5 flex flex-col">
            <div className="flex items-center gap-2 border-b border-border pb-3 mb-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold tracking-tight text-sm">Identitas & Robot</h3>
            </div>
            <dl className="flex-1 divide-y divide-border/50">
                <DetailItem label="Nama Tim" value={registrationData.name ?? "-"} />
                <DetailItem label="Kat. Robot" value={competition} />
            </dl>
        </section>

    </div>
);

export const metadata: Metadata = {
  title: "Detail Tim Mechatura Admin"
}

export default async function MechaturaRegistrationDetails({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: registrationData, error } = await supabase
        .from("mechatura_teams")
        .select(detailColumns)
        .eq("id", id)
        .single<MechaturaDetailRegistration>();

    if (error || !registrationData) {
        notFound();
    }

    const { data: members, error: membersError } = await supabase
        .from("mechatura_members")
        .select("id,user_id,full_name,phone_number,institution,city,instagram_username,student_id_link,is_leader")
        .eq("team_id", registrationData.id)
        .order("is_leader", { ascending: false })
        .order("full_name", { ascending: true })
        .returns<MechaturaDetailMember[]>();

    if (membersError) {
        throw new Error(membersError.message);
    }

    const enrichedMembers = await Promise.all(
        (members || []).map(async (m) => {
            let fallback_name = null;
            if (m.user_id) {
                try {
                    const { data: userData } = await supabase.auth.admin.getUserById(m.user_id);
                    if (userData?.user) {
                        const meta = userData.user.user_metadata || {};
                        fallback_name = meta.display_name || meta.username || userData.user.email || null;
                    }
                } catch (e) {
                    // ignore error
                }
            }
            return {
                ...m,
                fallback_name
            };
        })
    );

    const paymentStatus = getPaymentStatus(registrationData.payment_status);
    const competition = registrationData.category === "robot_sumo" ? "Robot Sumo" : registrationData.category === "robot_transporter" ? "Robot Transporter" : registrationData.category;

    return (
        <div className="mx-auto w-full space-y-6 sm:space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4">
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-full shrink-0 mt-1 sm:mt-0" asChild>
                        <Link href="/admin/mechatura" prefetch={false}>
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Kembali ke Tim Mechatura</span>
                        </Link>
                    </Button>
                    <div>
                        <h2 className="font-semibold text-xl sm:text-2xl tracking-tight line-clamp-1">
                            Detail Tim Mechatura
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Melihat detail lengkap untuk satu pendaftaran Mechatura.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="xl:hidden">
                                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                Info Tim & Dokumen
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-full sm:max-w-[480px] p-0 gap-0 flex flex-col border-l shadow-2xl bg-zinc-50 dark:bg-zinc-950">
                            <div className="flex-none p-4 sm:p-6 border-b border-border bg-background">
                                <SheetHeader className="p-0 text-left">
                                    <SheetTitle className="text-xl font-sans font-semibold">Metadata Tim</SheetTitle>
                                </SheetHeader>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                                <AdminSidebarContent
                                    registrationData={registrationData}
                                    competition={competition}
                                    paymentStatus={paymentStatus}
                                />
                            </div>
                        </SheetContent>
                    </Sheet>
                    <TeamDetailActions 
                        teamId={registrationData.id} 
                        teamName={registrationData.name}
                        category={registrationData.category}
                        approvalStatus={registrationData.admin_approval_status} 
                        submissionStatus={registrationData.submission_status}
                        members={enrichedMembers}
                    />
                </div>
            </div>

            {registrationData.admin_rejection_reason && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:bg-red-950/30 dark:border-red-900/50 mb-8 shadow-sm">
                    <h3 className="text-sm font-bold text-red-800 dark:text-red-400 flex items-center gap-2 mb-4">
                        <AlertTriangle className="h-5 w-5" />
                        Catatan Revisi Sebelumnya
                    </h3>
                    <div className="text-sm leading-relaxed text-red-900 dark:text-red-200">
                        {(() => {
                            try {
                                const parsed = JSON.parse(registrationData.admin_rejection_reason);
                                if (typeof parsed !== "object" || parsed === null) throw new Error();

                                const fields = Array.isArray(parsed.fields) ? parsed.fields : [];
                                const reason = parsed.reason || "";
                                
                                const docFields: string[] = [];
                                const memberFields: Record<string, { name: string, fields: string[] }> = {};

                                const labelMap: Record<string, string> = {
                                    full_name: "Nama Lengkap",
                                    institution_category: "Kategori Institusi",
                                    institution: "Asal Sekolah / Institusi",
                                    city: "Kota",
                                    phone_number: "Nomor WhatsApp",
                                    instagram_username: "Twibbon (Link)",
                                    student_id_link: "Identitas/KTM (Link)"
                                };

                                fields.forEach((f: string) => {
                                    if (f === "payment_proof") docFields.push("Bukti Pembayaran");
                                    else if (f === "robot_document") docFields.push("Dokumen Robot");
                                    else if (f.startsWith("member_")) {
                                        const parts = f.split("_");
                                        if (parts.length >= 3) {
                                            const mId = parts[1];
                                            const fieldName = parts.slice(2).join("_");
                                            if (!memberFields[mId]) {
                                                const m = enrichedMembers?.find(mem => mem.id === mId);
                                                memberFields[mId] = { 
                                                    name: m?.full_name || m?.fallback_name || "Anggota",
                                                    fields: []
                                                };
                                            }
                                            memberFields[mId].fields.push(labelMap[fieldName] || fieldName);
                                        }
                                    }
                                });

                                return (
                                    <div className="space-y-5">
                                        {fields.length > 0 && (
                                            <div className="space-y-3">
                                                <div className="font-semibold text-red-950 dark:text-red-300">Bagian yang diminta untuk direvisi:</div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {docFields.length > 0 && (
                                                        <div className="bg-white/60 dark:bg-black/20 rounded-lg p-4 border border-red-100 dark:border-red-900/40">
                                                            <div className="font-semibold text-red-950 dark:text-red-300 mb-2 border-b border-red-200 dark:border-red-900/50 pb-2">Pembayaran & Dokumen Tim</div>
                                                            <ul className="list-disc list-inside space-y-1 text-red-800 dark:text-red-200/90 ml-1">
                                                                {docFields.map(df => <li key={df}>{df}</li>)}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {Object.values(memberFields).map((mf, i) => (
                                                        <div key={i} className="bg-white/60 dark:bg-black/20 rounded-lg p-4 border border-red-100 dark:border-red-900/40">
                                                            <div className="font-semibold text-red-950 dark:text-red-300 mb-2 border-b border-red-200 dark:border-red-900/50 pb-2 flex items-center gap-2">
                                                                <User className="w-4 h-4 text-red-700/70 dark:text-red-400/70" />
                                                                {mf.name}
                                                            </div>
                                                            <ul className="list-disc list-inside space-y-1 text-red-800 dark:text-red-200/90 ml-1">
                                                                {mf.fields.map(f => <li key={f}>{f}</li>)}
                                                            </ul>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {reason && (
                                            <div className="space-y-2 pt-2 border-t border-red-200/60 dark:border-red-900/40">
                                                <div className="font-semibold text-red-950 dark:text-red-300">Catatan Tambahan:</div>
                                                <div className="whitespace-pre-wrap text-red-800 dark:text-red-200 bg-white/60 dark:bg-black/30 p-4 rounded-lg border border-red-200/60 dark:border-red-900/40">
                                                    {reason}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {fields.length === 0 && !reason && (
                                            <span className="italic text-red-800 dark:text-red-400">Tidak ada catatan spesifik.</span>
                                        )}
                                    </div>
                                );
                            } catch {
                                return <div className="whitespace-pre-wrap font-mono text-xs opacity-70">{registrationData.admin_rejection_reason}</div>;
                            }
                        })()}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column (Main Information) */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Team Members Table */}
                    <section className="overflow-hidden rounded-xl border border-border bg-card/90">
                        <div className="border-b border-border bg-card p-6">
                            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                Anggota Tim ({enrichedMembers?.length ?? 0})
                            </h3>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="h-12 w-12 px-4 whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        #
                                    </TableHead>
                                    <TableHead className="h-12 px-4 whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Anggota & Peran
                                    </TableHead>
                                    <TableHead className="h-12 px-4 whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Telepon
                                    </TableHead>
                                    <TableHead className="h-12 px-4 whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Institusi & Kota
                                    </TableHead>
                                    <TableHead className="h-12 px-4 whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground text-right">
                                        Kartu Pelajar & Twibbon
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {enrichedMembers?.length ? (
                                    enrichedMembers.map((member, index) => (
                                        <TableRow key={member.id}>
                                            <TableCell className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="font-medium whitespace-nowrap text-foreground">{member.full_name || member.fallback_name || "Anggota Belum Bernama"}</span>
                                                    <div>
                                                        <span
                                                            className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${member.is_leader
                                                                ? "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30"
                                                                : "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30"
                                                                }`}
                                                        >
                                                            {member.is_leader ? "Ketua" : "Anggota"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                                                {member.phone_number ?? "-"}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-medium text-foreground">{member.institution ?? "-"}</span>
                                                    <span>{member.city ?? "-"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-right whitespace-nowrap">
                                                <div className="flex flex-col items-end gap-2">
                                                    {member.student_id_link ? (
                                                        <a
                                                            href={getSafeUrl(member.student_id_link) ?? "#"}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center text-blue-600 hover:underline text-sm font-medium"
                                                        >
                                                            <FileText className="w-4 h-4 mr-1" />
                                                            Kartu Pelajar
                                                        </a>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                    {member.instagram_username && (
                                                        <a
                                                            href={`https://instagram.com/${member.instagram_username.replace("@", "")}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center text-blue-600 hover:underline text-sm font-medium"
                                                        >
                                                            <ExternalLink className="w-4 h-4 mr-1" />
                                                            Bukti Twibbon
                                                        </a>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="h-24 px-4 text-center text-muted-foreground"
                                        >
                                            Tidak ada orang yang terhubung ke tim ini.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </section>

                    {/* Pembina Tim */}
                    <section className="overflow-hidden rounded-xl border border-border bg-card/90">
                        <div className="border-b border-border bg-card p-6">
                            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                Pembina Tim
                            </h3>
                        </div>
                        <div className="p-6 overflow-hidden">
                            {registrationData.pembina_name ? (
                                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="min-w-0">
                                        <dt className="text-sm text-muted-foreground mb-1">Nama Pembina</dt>
                                        <dd className="text-sm font-medium truncate" title={registrationData.pembina_name || undefined}>{registrationData.pembina_name}</dd>
                                    </div>
                                    <div className="min-w-0">
                                        <dt className="text-sm text-muted-foreground mb-1">Telepon</dt>
                                        <dd className="text-sm font-medium truncate" title={registrationData.pembina_phone || undefined}>{registrationData.pembina_phone ?? "-"}</dd>
                                    </div>
                                    <div className="min-w-0">
                                        <dt className="text-sm text-muted-foreground mb-1">Hubungan</dt>
                                        <dd className="text-sm font-medium capitalize truncate" title={registrationData.pembina_relationship || undefined}>{registrationData.pembina_relationship ?? "-"}</dd>
                                    </div>
                                    <div className="min-w-0 lg:col-span-2 xl:col-span-1">
                                        <dt className="text-sm text-muted-foreground mb-1">Institusi & Kota</dt>
                                        <dd className="text-sm font-medium flex flex-col gap-0.5">
                                            <span className="truncate" title={registrationData.pembina_institution || undefined}>
                                                {registrationData.pembina_institution ?? "-"}
                                            </span>
                                            {registrationData.pembina_city && (
                                                <span className="truncate text-muted-foreground" title={registrationData.pembina_city}>
                                                    {registrationData.pembina_city}
                                                </span>
                                            )}
                                        </dd>
                                    </div>
                                    <div className="min-w-0">
                                        <dt className="text-sm text-muted-foreground mb-1">Identitas</dt>
                                        <dd className="text-sm font-medium truncate">
                                            {registrationData.pembina_id_link ? (
                                                <a href={getSafeUrl(registrationData.pembina_id_link) ?? "#"} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">
                                                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                                                    Lihat Dokumen
                                                </a>
                                            ) : "-"}
                                        </dd>
                                    </div>
                                </dl>
                            ) : (
                                <p className="text-muted-foreground text-sm text-center py-4">Tim ini tidak menambahkan pembina.</p>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Column (Administrative Meta) - Hidden on Mobile, Shown on XL */}
                <div className="hidden xl:block">
                    <AdminSidebarContent
                        registrationData={registrationData}
                        competition={competition}
                        paymentStatus={paymentStatus}
                    />
                </div>
            </div>
        </div>
    );
}
