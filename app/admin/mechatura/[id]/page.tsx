import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ExternalLink, FileText } from "lucide-react";
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
    isMechaturaCompetitionType,
    mechaturaCompetitionLabels,
    paymentStatusLabels,
    type PaymentStatus,
} from "@/lib/payment";
import { formatMechaturaDateTime } from "@/lib/mechatura/format";
import { createAdminClient } from "@/lib/supabase-admin";

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
    "member_document_path",
    "robot_document_path",
    "created_at",
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
    member_document_path: string | null;
    robot_document_path: string | null;
    created_at: string | null;
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
    <div className={wide ? "md:col-span-2" : undefined}>
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <dd className="mt-2 font-medium break-words">{value}</dd>
    </div>
);

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
    return (
        <div className="mx-auto w-full max-w-6xl space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" asChild>
                    <Link href="/admin/mechatura">
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Back to Mechatura Teams</span>
                    </Link>
                </Button>
                <div>
                    <h2 className="font-semibold text-2xl tracking-tight">
                        Mechatura Team Details
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Viewing complete details for one Mechatura registration.
                    </p>
                </div>
            </div>

            <section className="rounded-xl border border-border bg-card p-6">
                <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                    <DetailItem label="Team Name" value={registrationData.team_name ?? "-"} />
                    <DetailItem label="Team ID" value={registrationData.team_id ?? "-"} />
                    <DetailItem label="Robot Type" value={competition} />
                    <DetailItem label="Robot Name" value={registrationData.robot_name ?? "-"} />
                    <DetailItem
                        label="Institution"
                        value={registrationData.institution ?? "-"}
                    />
                    <DetailItem label="Province/City" value={registrationData.province ?? "-"} />
                    <DetailItem
                        label="Submitted"
                        value={formatMechaturaDateTime(registrationData.created_at)}
                    />
                    <DetailItem
                        label="Payment"
                        value={
                            <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClassName[paymentStatus]}`}
                            >
                                {paymentStatusLabels[paymentStatus]}
                            </span>
                        }
                    />
                </dl>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
                {[memberDocument, robotDocument].map((document) => (
                    <div key={document.label} className="rounded-xl border border-border bg-card p-5">
                        <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-medium">{document.label}</h3>
                        </div>
                        <div className="mt-4">
                            {document.href ? (
                                <Button variant="outline" className="rounded-[8px]" asChild>
                                    <a href={document.href} target="_blank" rel="noreferrer">
                                        Open Document
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </Button>
                            ) : (
                                <p className="text-sm text-muted-foreground">Document unavailable</p>
                            )}
                        </div>
                    </div>
                ))}
            </section>

            <section className="overflow-hidden rounded-xl border border-border bg-card/90">
                <div className="border-b border-border bg-card p-6">
                    <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                        Team People ({members?.length ?? 0})
                    </h3>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="h-12 w-12 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                #
                            </TableHead>
                            <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Name
                            </TableHead>
                            <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Role
                            </TableHead>
                            <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Email
                            </TableHead>
                            <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Phone
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members?.length ? (
                            members.map((member, index) => (
                                <TableRow key={member.id}>
                                    <TableCell className="px-4 py-3 text-muted-foreground">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 font-medium">
                                        {member.full_name ?? "-"}
                                    </TableCell>
                                    <TableCell className="px-4 py-3">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${member.is_leader
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-zinc-100 text-zinc-700"
                                                }`}
                                        >
                                            {member.is_leader ? "Leader" : "Member"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-muted-foreground">
                                        {member.email ?? "-"}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-muted-foreground">
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
                                    No people are attached to this team.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </section>
        </div>
    );
}
