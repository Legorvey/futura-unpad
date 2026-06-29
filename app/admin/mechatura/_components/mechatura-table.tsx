import {
    isMechaturaCompetitionType,
    mechaturaCompetitionLabels,
    paymentStatusLabels,
    type PaymentStatus,
} from "@/lib/payment";

export type AdminMechaturaRegistration = {
    id: string;
    team_id: string;
    team_name: string;
    institution: string;
    competition_type: unknown;
    robot_name: string;
    registration_status: string | null;
    payment_status: string | null;
    payment_amount: number | null;
    created_at: string | null;
};

export type AdminMechaturaLeader = {
    registration_id: string;
    full_name: string;
    email: string | null;
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

const getStatus = (status: string | null): PaymentStatus =>
    status && status in statusClassName ? (status as PaymentStatus) : "unpaid";

type MechaturaTableProps = {
    registrations: AdminMechaturaRegistration[];
    leaderByRegistrationId: Map<string, AdminMechaturaLeader>;
};

export default function MechaturaTable({
    registrations,
    leaderByRegistrationId,
}: MechaturaTableProps) {
    return (
        <div className="mt-6 overflow-hidden rounded-xl border border-border">
            <div className="hidden grid-cols-[1.2fr_1fr_1fr_120px_120px] gap-4 border-b border-border px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground lg:grid">
                <span>Team</span>
                <span>Category</span>
                <span>Leader</span>
                <span>Payment</span>
                <span>Registration</span>
            </div>
            <div className="divide-y divide-border">
                {registrations.length ? (
                    registrations.map((registration) => {
                        const leader = leaderByRegistrationId.get(registration.id);
                        const status = getStatus(registration.payment_status);
                        const category = isMechaturaCompetitionType(
                            registration.competition_type
                        )
                            ? mechaturaCompetitionLabels[registration.competition_type]
                            : "-";

                        return (
                            <article
                                key={registration.id}
                                className="grid gap-4 px-4 py-4 text-sm lg:grid-cols-[1.2fr_1fr_1fr_120px_120px] lg:items-center"
                            >
                                <div>
                                    <p className="font-medium">{registration.team_name}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {registration.team_id} / {registration.robot_name}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {registration.institution}
                                    </p>
                                </div>
                                <p>{category}</p>
                                <div>
                                    <p className="font-medium">{leader?.full_name ?? "-"}</p>
                                    <p className="mt-1 break-all text-xs text-muted-foreground">
                                        {leader?.email ?? "-"}
                                    </p>
                                </div>
                                <span
                                    className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${statusClassName[status]}`}
                                >
                                    {paymentStatusLabels[status]}
                                </span>
                                <p className="text-muted-foreground">
                                    {registration.registration_status ?? "-"}
                                </p>
                            </article>
                        );
                    })
                ) : (
                    <div className="p-6 text-sm text-muted-foreground">
                        No Mechatura teams match the current filters.
                    </div>
                )}
            </div>
        </div>
    );
}
