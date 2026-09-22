
import type { Metadata } from "next"
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ExternalLink, FileText, Info, Receipt, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

import { formatMechaturaDateTime } from "@/lib/mechatura/format";
import { createAdminClient } from "@/lib/supabase-admin";
import { requireAdminOrRedirect } from "@/lib/auth";
import { EsaiDetailActions } from "./esai-detail-actions";
import { AdminEsaiRegistration } from "../_lib/esai-utils";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const DOCUMENT_URL_EXPIRES_IN_SECONDS = 10 * 60;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const id = (await params).id;
    return {
        title: `Detail Peserta ${id.substring(0, 8)} - Admin Lomba Esai`,
    };
}

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

const AdminSidebarContent = ({
    participant,
    
    paymentProofUrl, twibbonUrl,
    ktmUrl,
    essayUrl
}: {
    participant: AdminEsaiRegistration;
    
    paymentProofUrl: string | null; twibbonUrl: string | null;
    ktmUrl: string | null;
    essayUrl: string | null;
}) => (
    <div className="space-y-6">
        {/* Documents */}
        <section className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-1">
                Dokumen Lampiran
            </h3>
            
            {[
                { label: "Naskah Esai", href: essayUrl, icon: FileText },
                { label: "KTM / Identitas", href: ktmUrl, icon: User },
                { label: "Bukti Twibbon", href: twibbonUrl, icon: Info },
                { label: "Bukti Pembayaran", href: paymentProofUrl, icon: Receipt },
                
            ].map((document) => (
                <div key={document.label} className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                            <document.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-medium text-sm truncate">{document.label}</h3>
                        </div>
                    </div>
                    <div className="shrink-0 self-start sm:self-auto">
                        {document.href ? (
                            <Button variant="secondary" size="sm" className="rounded-full shadow-sm h-8 w-full sm:w-auto" asChild>
                                <a href={document.href} target="_blank" rel="noreferrer">
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

        {/* Current Status */}
        <section className="rounded-xl border border-border bg-card p-5 flex flex-col">
            <div className="flex items-center gap-2 border-b border-border pb-3 mb-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <h3 className="font-semibold tracking-tight text-sm text-foreground">
                    Status Saat Ini
                </h3>
            </div>
            <dl className="flex-1 divide-y divide-border/50">
                <DetailItem label="Verifikasi Admin" value={
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        participant.submission_status === "approved" ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30" :
                        participant.submission_status === "draft" ? "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30" :
                        "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30"
                    }`}>
                        {participant.submission_status === "approved" ? "Disetujui" :
                         participant.submission_status === "draft" ? "Draft" : "Pending"}
                    </span>
                } />
                <DetailItem
                    label="Dikirim"
                    value={formatMechaturaDateTime(participant.created_at)}
                />
            </dl>
        </section>


    </div>
);

export default async function EsaiParticipantDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    await requireAdminOrRedirect();
    const { id } = await params;
    
    if (!id) notFound();

    const adminSupabase = createAdminClient();

    const { data: participant, error } = await adminSupabase
        .from("esai_registrations")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !participant) {
        notFound();
    }



    const getSignedUrl = async (path: string | null) => {
        if (!path) return null;
        const { data } = await adminSupabase.storage
            .from("esai_documents")
            .createSignedUrl(path, DOCUMENT_URL_EXPIRES_IN_SECONDS);
        return data?.signedUrl || null;
    };

    
    const paymentProofUrl = await getSignedUrl(participant.payment_proof_url); const twibbonUrl = await getSignedUrl(participant.instagram_twibbon_url);
    const ktmUrl = await getSignedUrl(participant.identity_card_url);
    const essayUrl = await getSignedUrl(participant.essay_paper_url);

    return (
        <div className="mx-auto w-full space-y-6 sm:space-y-8 pb-12">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4">
                    <Button variant="outline" size="icon" asChild className="h-9 w-9 rounded-full shrink-0 mt-1 sm:mt-0">
                        <Link href="/admin/lomba-esai" prefetch={false}>
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Kembali ke Daftar Lomba Esai</span>
                        </Link>
                    </Button>
                    <div>
                        <h2 className="font-semibold text-xl sm:text-2xl tracking-tight line-clamp-1">
                            Detail Peserta Lomba Esai
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Melihat detail lengkap untuk satu pendaftaran Lomba Esai.
                        </p>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="xl:hidden">
                                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                Info Peserta & Dokumen
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-full sm:max-w-[480px] p-0 gap-0 flex flex-col border-l shadow-2xl bg-zinc-50 dark:bg-zinc-950">
                            <div className="flex-none p-4 sm:p-6 border-b border-border bg-background">
                                <SheetHeader className="p-0 text-left">
                                    <SheetTitle className="text-xl font-sans font-semibold">Metadata Peserta</SheetTitle>
                                </SheetHeader>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                                <AdminSidebarContent
                                    participant={participant as AdminEsaiRegistration}
                                    
                                    paymentProofUrl={paymentProofUrl} twibbonUrl={twibbonUrl}
                                    ktmUrl={ktmUrl}
                                    essayUrl={essayUrl}
                                />
                            </div>
                        </SheetContent>
                    </Sheet>

                    <EsaiDetailActions 
                        registrationId={participant.id} 
                        submissionStatus={participant.submission_status} 
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-8">
                    <section className="overflow-hidden rounded-xl border border-border bg-card/90">
                        <div className="border-b border-border bg-card p-6">
                            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                Data Diri Peserta
                            </h3>
                        </div>
                        <div className="p-6">
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="min-w-0">
                                    <dt className="text-sm text-muted-foreground mb-1">Nama Lengkap</dt>
                                    <dd className="text-sm font-medium truncate" title={participant.full_name || undefined}>{participant.full_name || "-"}</dd>
                                </div>
                                <div className="min-w-0">
                                    <dt className="text-sm text-muted-foreground mb-1">Instansi / Sekolah</dt>
                                    <dd className="text-sm font-medium truncate" title={participant.institution || undefined}>{participant.institution || "-"}</dd>
                                </div>
                                <div className="min-w-0">
                                    <dt className="text-sm text-muted-foreground mb-1">Kategori Instansi</dt>
                                    <dd className="text-sm font-medium truncate" title={participant.institution_category || undefined}>{participant.institution_category || "-"}</dd>
                                </div>
                                <div className="min-w-0">
                                    <dt className="text-sm text-muted-foreground mb-1">Kota</dt>
                                    <dd className="text-sm font-medium truncate" title={participant.city || undefined}>{participant.city || "-"}</dd>
                                </div>
                                <div className="min-w-0">
                                    <dt className="text-sm text-muted-foreground mb-1">Email</dt>
                                    <dd className="text-sm font-medium truncate" title={participant.email || undefined}>{participant.email || "-"}</dd>
                                </div>
                                <div className="min-w-0">
                                    <dt className="text-sm text-muted-foreground mb-1">No. Telepon / WA</dt>
                                    <dd className="text-sm font-medium truncate" title={participant.phone_number || undefined}>{participant.phone_number || "-"}</dd>
                                </div>
                            </dl>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-xl border border-border bg-card/90">
                        <div className="border-b border-border bg-card p-6">
                            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                Data Karya Esai
                            </h3>
                        </div>
                        <div className="p-6">
                            <dl className="grid grid-cols-1 gap-6">
                                <div className="min-w-0">
                                    <dt className="text-sm text-muted-foreground mb-1">Judul Karya Esai</dt>
                                    <dd className="text-sm font-medium" title={participant.paper_title || undefined}>{participant.paper_title || "-"}</dd>
                                </div>
                                <div className="min-w-0">
                                    <dt className="text-sm text-muted-foreground mb-1">Subtema</dt>
                                    <dd className="text-sm font-medium">{participant.sub_theme || "-"}</dd>
                                </div>
                            </dl>
                        </div>
                    </section>
                </div>

                <div className="hidden xl:block">
                    <AdminSidebarContent
                        participant={participant as AdminEsaiRegistration}
                        
                        paymentProofUrl={paymentProofUrl} twibbonUrl={twibbonUrl}
                        ktmUrl={ktmUrl}
                        essayUrl={essayUrl}
                    />
                </div>
            </div>
        </div>
    );
}

