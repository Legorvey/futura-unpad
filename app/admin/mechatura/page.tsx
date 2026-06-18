export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

import { createAdminClient } from "@/lib/supabase-admin"
import { requireAdminOrRedirect } from "@/lib/auth"
import {
    isMechaturaCompetitionType,
    isPaymentStatus,
    mechaturaCompetitionLabels,
    paymentStatusLabels,
    type PaymentStatus,
} from "@/lib/payment"
import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type AdminMechaturaRegistration = {
    id: string
    team_id: string
    team_name: string
    institution: string
    competition_type: unknown
    robot_name: string
    registration_status: string | null
    payment_status: string | null
    payment_amount: number | null
    created_at: string | null
}

type AdminMechaturaLeader = {
    registration_id: string
    full_name: string
    email: string | null
}

const statusClassName: Record<PaymentStatus, string> = {
    unpaid: "bg-zinc-100 text-zinc-700",
    pending: "bg-amber-100 text-amber-800",
    paid: "bg-emerald-100 text-emerald-800",
    failed: "bg-red-100 text-red-800",
    expired: "bg-slate-100 text-slate-700",
    cancelled: "bg-neutral-100 text-neutral-700",
    settled: "bg-blue-100 text-blue-800",
}

const getStatus = (status: string | null) =>
    isPaymentStatus(status) ? status : "unpaid"

type AdminSearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function MechaturaAdminPage({
    searchParams,
}: {
    searchParams: AdminSearchParams
}) {
    const params = await searchParams
    const categoryParam = Array.isArray(params.category)
        ? params.category[0]
        : params.category
    const paymentParam = Array.isArray(params.payment)
        ? params.payment[0]
        : params.payment
    const searchParam = Array.isArray(params.search)
        ? params.search[0]
        : params.search
    const categoryFilter = isMechaturaCompetitionType(categoryParam)
        ? categoryParam
        : "all"
    const searchFilter = (searchParam ?? "").trim().toLowerCase()

    await requireAdminOrRedirect()

    const adminSupabase = createAdminClient()
    const { data: mechaturaData, error: mechaturaError } = await adminSupabase
        .from("mechatura_registrations")
        .select(
            "id,team_id,team_name,institution,competition_type,robot_name,registration_status,payment_status,payment_amount,created_at"
        )
        .order("created_at", { ascending: false })
        .returns<AdminMechaturaRegistration[]>()

    if (mechaturaError) {
        throw new Error(mechaturaError.message)
    }

    const paymentStatuses: PaymentStatus[] = [
        "unpaid",
        "pending",
        "paid",
        "settled",
        "failed",
        "expired",
        "cancelled",
    ]
    const paymentFilter = isPaymentStatus(paymentParam) ? paymentParam : "all"
    const mechaturaRegistrations = mechaturaData ?? []

    const { data: leaders } = mechaturaRegistrations.length
        ? await adminSupabase
            .from("mechatura_members")
            .select("registration_id,full_name,email")
            .in(
                "registration_id",
                mechaturaRegistrations.map((registration) => registration.id)
            )
            .eq("is_leader", true)
            .returns<AdminMechaturaLeader[]>()
        : { data: [] }

    const leaderByRegistrationId = new Map(
        (leaders ?? []).map((leader) => [leader.registration_id, leader])
    )

    const filteredMechaturaRegistrations = mechaturaRegistrations.filter(
        (registration) => {
            const leader = leaderByRegistrationId.get(registration.id)
            const categoryMatches =
                categoryFilter === "all" ||
                registration.competition_type === categoryFilter
            const paymentMatches =
                paymentFilter === "all" ||
                getStatus(registration.payment_status) === paymentFilter
            const searchMatches =
                !searchFilter ||
                [
                    registration.team_id,
                    registration.team_name,
                    registration.institution,
                    registration.robot_name,
                    leader?.full_name,
                    leader?.email,
                ]
                    .filter(Boolean)
                    .some((value) => value!.toLowerCase().includes(searchFilter))

            return categoryMatches && paymentMatches && searchMatches
        }
    )

    const completedStatuses = new Set(["paid", "settled"])
    const mechaturaPaidCount = filteredMechaturaRegistrations.filter((registration) =>
        completedStatuses.has(getStatus(registration.payment_status))
    ).length
    const sumoCount = filteredMechaturaRegistrations.filter(
        (registration) => registration.competition_type === "sumo"
    ).length
    const transporterCount = filteredMechaturaRegistrations.filter(
        (registration) => registration.competition_type === "transporter"
    ).length

    return (
        <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-10 sm:px-8">
            <section className="rounded-xl bg-card">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h2 className="font-semibold text-2xl">Mechatura Teams</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Search and filter robotics competition registrations.
                        </p>
                    </div>

                    <form className="grid gap-3 sm:grid-cols-3 lg:min-w-[560px]" action="/admin/mechatura">
                        <input
                            name="search"
                            defaultValue={searchParam ?? ""}
                            placeholder="Search team, robot, leader"
                            className="h-10 rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        />
                        <Select name="category" defaultValue={categoryFilter}>
                            <SelectTrigger className="w-full h-10 rounded-xl">
                                <SelectValue placeholder="All categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All categories</SelectItem>
                                <SelectItem value="sumo">Robot Sumo</SelectItem>
                                <SelectItem value="transporter">Robot Transporter</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select name="payment" defaultValue={paymentFilter}>
                            <SelectTrigger className="w-full h-10 rounded-xl">
                                <SelectValue placeholder="All payments" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All payments</SelectItem>
                                {paymentStatuses.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {paymentStatusLabels[status]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button className="h-10 rounded-xl sm:col-span-3 lg:col-span-1">
                            Apply filters
                        </Button>
                    </form>
                </div>

                <div className="grid gap-3 border-y border-border py-6 mt-6 sm:grid-cols-4">
                    <div className="rounded-lg border border-border bg-card/90 p-5">
                        <p className="text-sm text-muted-foreground">Total Teams</p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">{filteredMechaturaRegistrations.length}</p>
                    </div>
                    <div className="rounded-lg border border-border p-5">
                        <p className="text-sm text-muted-foreground">Paid Teams</p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">{mechaturaPaidCount}</p>
                    </div>
                    <div className="rounded-lg border border-border p-5">
                        <p className="text-sm text-muted-foreground">Robot Sumo</p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">{sumoCount}</p>
                    </div>
                    <div className="rounded-lg border border-border p-5">
                        <p className="text-sm text-muted-foreground">Robot Transporter</p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">{transporterCount}</p>
                    </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-xl border border-border">
                    <div className="hidden grid-cols-[1.2fr_1fr_1fr_120px_120px] gap-4 border-b border-border px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground lg:grid">
                        <span>Team</span>
                        <span>Category</span>
                        <span>Leader</span>
                        <span>Payment</span>
                        <span>Registration</span>
                    </div>
                    <div className="divide-y divide-border">
                        {filteredMechaturaRegistrations.length ? (
                            filteredMechaturaRegistrations.map((registration) => {
                                const leader = leaderByRegistrationId.get(registration.id)
                                const status = getStatus(registration.payment_status)
                                const category = isMechaturaCompetitionType(
                                    registration.competition_type
                                )
                                    ? mechaturaCompetitionLabels[registration.competition_type]
                                    : "-"

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
                                )
                            })
                        ) : (
                            <div className="p-6 text-sm text-muted-foreground">
                                No Mechatura teams match the current filters.
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    )
}
