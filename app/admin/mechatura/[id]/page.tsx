import type { Metadata } from "next"
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ExternalLink, FileText, Info, MapPin, Receipt, Bot, Building2 } from "lucide-react";
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
import {
    isMechaturaCompetitionType,
    mechaturaCompetitionLabels,
    paymentStatusLabels,
    type PaymentStatus,
} from "@/lib/payment";
import { formatMechaturaDateTime } from "@/lib/mechatura/format";
import { createAdminClient } from "@/lib/supabase-admin";
import { TeamDetailActions } from "./team-detail-actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const MECHATURA_DOCUMENT_BUCKET = "mechatura-documents";
const DOCUMENT_URL_EXPIRES_IN_SECONDS = 10 * 60;

const detailColumns = [
    "id",
    "team_id",
    "team_name",
    "institution",
    "province",
    "competition_type",
    "robot_name",
    "payment_status",
    "payment_type",
    "member_document_path",
    "robot_document_path",
    "created_at",
    "paid_at",
    "check_in_time",
    "registration_status",
].join(",");

type MechaturaDetailRegistration = {
    id: string;
    team_id: string | null;
    team_name: string | null;
    institution: string | null;
    province: string | null;
    competition_type: unknown;
    robot_name: string | null;
    payment_status: string | null;
    payment_type: string | null;
    member_document_path: string | null;
    robot_document_path: string | null;
    created_at: string | null;
    paid_at: string | null;
    check_in_time: string | null;
    registration_status: "approved" | "rejected" | "registered" | "waiting_payment" | null;
};

type MechaturaDetailMember = {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    is_leader: boolean | null;
};

type DocumentLink = {
    label: string;
    href: string | null;
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

const getPaymentStatus = (status: string | null): PaymentStatus =>
    status && status in statusClassName ? (status as PaymentStatus) : "unpaid";

const getDocumentLink = async (
    adminSupabase: ReturnType<typeof createAdminClient>,
    label: string,
    path: string | null
): Promise<DocumentLink> => {
    if (!path) {
        return { label, href: null };
    }

    const { data, error } = await adminSupabase.storage
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
    memberDocument,
    robotDocument,
}: {
    registrationData: MechaturaDetailRegistration;
    competition: string;
    paymentStatus: PaymentStatus;
    memberDocument: DocumentLink;
    robotDocument: DocumentLink;
}) => (
    <div className="space-y-6">
        {/* Documents */}
        <section className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-1">
                Dokumen Lampiran
            </h3>
            {[memberDocument, robotDocument].map((document) => (
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

        {/* Registration Info */}
        <section className="rounded-xl border border-border bg-card p-5 flex flex-col">
            <div className="flex items-center gap-2 border-b border-border pb-3 mb-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold tracking-tight text-sm">Ringkasan Status</h3>
            </div>
            <dl className="flex-1 divide-y divide-border/50">
                <DetailItem label="Team ID" value={registrationData.team_id ?? "-"} />
                <DetailItem label="Pendaftaran" value={
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        registrationData.registration_status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        registrationData.registration_status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                    }`}>
                        {registrationData.registration_status ? 
                            registrationData.registration_status.charAt(0).toUpperCase() + registrationData.registration_status.slice(1) 
                            : "Terdaftar"}
                    </span>
                } />
                <DetailItem
                    label="Dikirim"
                    value={formatMechaturaDateTime(registrationData.created_at)}
                />
                <DetailItem
                    label="Check In"
                    value={formatMechaturaDateTime(registrationData.check_in_time)}
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
                <DetailItem label="Nama Tim" value={registrationData.team_name ?? "-"} />
                <DetailItem
                    label="Institusi"
                    value={registrationData.institution ?? "-"}
                />
                <DetailItem label="Lokasi" value={
                    <span className="flex items-center gap-1.5 justify-end">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        {registrationData.province ?? "-"}
                    </span>
                } />
                <DetailItem label="Kat. Robot" value={competition} />
                <DetailItem label="Nama Robot" value={registrationData.robot_name ?? "-"} />
            </dl>
        </section>

        {/* Payment Info */}
        <section className="rounded-xl border border-border bg-card p-5 flex flex-col">
            <div className="flex items-center gap-2 border-b border-border pb-3 mb-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold tracking-tight text-sm">Pembayaran</h3>
            </div>
            <dl className="flex-1 divide-y divide-border/50">
                <DetailItem
                    label="Status"
                    value={
                        <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClassName[paymentStatus]}`}
                        >
                            {paymentStatusLabels[paymentStatus]}
                        </span>
                    }
                />
                <DetailItem label="Metode" value={formatPaymentType(registrationData.payment_type)} />
                <DetailItem
                    label="Dibayar Pada"
                    value={formatMechaturaDateTime(registrationData.paid_at)}
                />
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
    const adminSupabase = createAdminClient();
    const { data: registrationData, error } = await adminSupabase
        .from("mechatura_registrations")
        .select(detailColumns)
        .eq("id", id)
        .single<MechaturaDetailRegistration>();

    if (error || !registrationData) {
        notFound();
    }

    const [{ data: members, error: membersError }, memberDocument, robotDocument] =
        await Promise.all([
            adminSupabase
                .from("mechatura_members")
                .select("id,full_name,email,phone,is_leader")
                .eq("registration_id", registrationData.id)
                .order("is_leader", { ascending: false })
                .order("full_name", { ascending: true })
                .returns<MechaturaDetailMember[]>(),
            getDocumentLink(
                adminSupabase,
                "Member Documents",
                registrationData.member_document_path
            ),
            getDocumentLink(
                adminSupabase,
                "Robot Document",
                registrationData.robot_document_path
            ),
        ]);

    if (membersError) {
        throw new Error(membersError.message);
    }

    const paymentStatus = getPaymentStatus(registrationData.payment_status);
    const competition = isMechaturaCompetitionType(registrationData.competition_type)
        ? mechaturaCompetitionLabels[registrationData.competition_type]
        : "-";

    const leaderMember = members?.find((m) => m.is_leader);
    const leaderData = leaderMember ? {
        registration_id: registrationData.id,
        full_name: leaderMember.full_name ?? "",
        email: leaderMember.email,
        phone: leaderMember.phone,
    } : undefined;


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
                                    memberDocument={memberDocument}
                                    robotDocument={robotDocument}
                                />
                            </div>
                        </SheetContent>
                    </Sheet>
                    <TeamDetailActions teamId={registrationData.id} registrationStatus={registrationData.registration_status} />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column (Main Information) */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Team Members Table */}
                    <section className="overflow-hidden rounded-xl border border-border bg-card/90">
                        <div className="border-b border-border bg-card p-6">
                            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                Anggota Tim ({members?.length ?? 0})
                            </h3>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="h-12 w-12 px-4 whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        #
                                    </TableHead>
                                    <TableHead className="h-12 px-4 whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Nama
                                    </TableHead>
                                    <TableHead className="h-12 px-4 whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Peran
                                    </TableHead>
                                    <TableHead className="h-12 px-4 whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Email
                                    </TableHead>
                                    <TableHead className="h-12 px-4 whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Telepon
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members?.length ? (
                                    members.map((member, index) => (
                                        <TableRow key={member.id}>
                                            <TableCell className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 font-medium whitespace-nowrap">
                                                {member.full_name ?? "-"}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${member.is_leader
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-zinc-100 text-zinc-700"
                                                        }`}
                                                >
                                                    {member.is_leader ? "Ketua" : "Anggota"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                                {member.email ?? "-"}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                                {member.phone ?? "-"}
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
                </div>

                {/* Right Column (Administrative Meta) - Hidden on Mobile, Shown on XL */}
                <div className="hidden xl:block">
                    <AdminSidebarContent
                        registrationData={registrationData}
                        competition={competition}
                        paymentStatus={paymentStatus}
                        memberDocument={memberDocument}
                        robotDocument={robotDocument}
                    />
                </div>
            </div>
        </div>
    );
}
