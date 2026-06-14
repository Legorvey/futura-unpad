import { redirect } from "next/navigation"
import Link from "next/link"
import {
    ArrowUpRight,
    Banknote,
    CheckCircle2,
    Clock3,
    Monitor,
    Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createAdminClient } from "@/lib/supabase-admin"
import {
    formatCurrency,
    isPaymentStatus,
    paymentStatusLabels,
    type PaymentStatus,
} from "@/lib/payment"
import { createClient } from "@/utils/supabase/server"

type AdminRegistration = {
    status_akademika: string | null
    presentasi_riset: string | null
    payment_status: string | null
    payment_amount: number | null
    created_at: string | null
}

const completedStatuses = new Set(["paid", "settled"])

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

export default async function AdminPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: adminUser } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle()

    if (!adminUser) {
        redirect("/")
    }

    const adminSupabase = createAdminClient()
    const { data, error } = await adminSupabase
        .from("seminar_registrations")
        .select("status_akademika,presentasi_riset,payment_status,payment_amount,created_at")
        .order("created_at", { ascending: false })

    if (error) {
        throw new Error(error.message)
    }

    const registrations = (data ?? []) as AdminRegistration[]
    const totalRegistrations = registrations.length
    const paidRegistrations = registrations.filter((registration) =>
        completedStatuses.has(getStatus(registration.payment_status))
    )
    const pendingRegistrations = registrations.filter(
        (registration) => getStatus(registration.payment_status) === "pending"
    ).length
    const unpaidRegistrations = registrations.filter(
        (registration) => getStatus(registration.payment_status) === "unpaid"
    ).length
    const totalRevenue = paidRegistrations.reduce(
        (sum, registration) => sum + (registration.payment_amount ?? 0),
        0
    )
    const luringCount = registrations.filter(
        (registration) => registration.presentasi_riset === "luring"
    ).length
    const daringCount = registrations.filter(
        (registration) => registration.presentasi_riset === "daring"
    ).length
    const mahasiswaCount = registrations.filter(
        (registration) => registration.status_akademika === "mahasiswa"
    ).length
    const dosenCount = registrations.filter(
        (registration) => registration.status_akademika === "dosen"
    ).length
    const paymentStatuses: PaymentStatus[] = [
        "unpaid",
        "pending",
        "paid",
        "settled",
        "failed",
        "expired",
        "cancelled",
    ]

    return (
        <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-10 sm:px-8">
            <section className="flex flex-col gap-5 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">
                        Admin Dashboard
                    </p>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-semibold tracking-tight text-balance">
                            Futura seminar overview
                        </h1>
                        <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                            Welcome back, {user.email}. Monitor registration progress,
                            payment health, and attendance distribution from one place.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button asChild className="h-10 rounded-xl">
                        <Link href="/seminar-list">
                            View participants
                            <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-10 rounded-xl">
                        <Link href="/registration">Open registration</Link>
                    </Button>
                </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-border p-5">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-muted-foreground">Registrations</p>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="mt-4 text-3xl font-semibold tracking-tight">
                        {totalRegistrations}
                    </p>
                </div>

                <div className="rounded-xl border border-border p-5">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-muted-foreground">Paid</p>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="mt-4 text-3xl font-semibold tracking-tight">
                        {paidRegistrations.length}
                    </p>
                </div>

                <div className="rounded-xl border border-border p-5">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-muted-foreground">Pending / Unpaid</p>
                        <Clock3 className="h-4 w-4 text-amber-600" />
                    </div>
                    <p className="mt-4 text-3xl font-semibold tracking-tight">
                        {pendingRegistrations} / {unpaidRegistrations}
                    </p>
                </div>

                <div className="rounded-xl border border-border p-5">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-muted-foreground">Confirmed revenue</p>
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="mt-4 text-3xl font-semibold tracking-tight">
                        {formatCurrency(totalRevenue)}
                    </p>
                </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                <div className="rounded-xl border border-border p-5">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="font-semibold">Payment Status</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Current payment distribution from all registrations.
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 divide-y divide-border">
                        {paymentStatuses.map((status) => {
                            const count = registrations.filter(
                                (registration) => getStatus(registration.payment_status) === status
                            ).length
                            const percentage =
                                totalRegistrations > 0
                                    ? Math.round((count / totalRegistrations) * 100)
                                    : 0

                            return (
                                <div
                                    key={status}
                                    className="grid gap-3 py-4 sm:grid-cols-[140px_1fr_64px] sm:items-center"
                                >
                                    <span
                                        className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${statusClassName[status]}`}
                                    >
                                        {paymentStatusLabels[status]}
                                    </span>
                                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-foreground"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <p className="text-sm text-muted-foreground sm:text-right">
                                        {count}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="rounded-xl border border-border p-5">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            <Monitor className="h-5 w-5 text-muted-foreground" />
                        </span>
                        <div>
                            <h2 className="font-semibold">Audience Mix</h2>
                            <p className="text-sm text-muted-foreground">
                                Attendance and academic status.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-5">
                        <div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Luring</span>
                                <span className="font-medium">{luringCount}</span>
                            </div>
                            <div className="mt-2 h-2 rounded-full bg-muted">
                                <div
                                    className="h-2 rounded-full bg-blue-600"
                                    style={{
                                        width: `${
                                            totalRegistrations > 0
                                                ? (luringCount / totalRegistrations) * 100
                                                : 0
                                        }%`,
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Daring</span>
                                <span className="font-medium">{daringCount}</span>
                            </div>
                            <div className="mt-2 h-2 rounded-full bg-muted">
                                <div
                                    className="h-2 rounded-full bg-emerald-600"
                                    style={{
                                        width: `${
                                            totalRegistrations > 0
                                                ? (daringCount / totalRegistrations) * 100
                                                : 0
                                        }%`,
                                    }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="rounded-lg border border-border p-4">
                                <p className="text-sm text-muted-foreground">Mahasiswa</p>
                                <p className="mt-2 text-2xl font-semibold tracking-tight">
                                    {mahasiswaCount}
                                </p>
                            </div>
                            <div className="rounded-lg border border-border p-4">
                                <p className="text-sm text-muted-foreground">Dosen</p>
                                <p className="mt-2 text-2xl font-semibold tracking-tight">
                                    {dosenCount}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
