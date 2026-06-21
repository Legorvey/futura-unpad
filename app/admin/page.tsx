export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

import { redirect } from "next/navigation"
import {
    CheckCircle2,
    Clock3,
    Users,
} from "lucide-react"
import { createAdminClient } from "@/lib/supabase-admin"
import { requireAdminOrRedirect } from "@/lib/auth"
import {
    isPaymentStatus,
} from "@/lib/payment"

type AdminRegistration = {
    status_akademika: string | null
    created_at: string | null
}

type AdminMechaturaSummary = {
    competition_type: unknown
    payment_status: string | null
    created_at: string | null
}

const completedStatuses = new Set(["paid", "settled"])

const getStatus = (status: string | null) =>
    isPaymentStatus(status) ? status : "unpaid"

export default async function AdminPage() {
    const { user } = await requireAdminOrRedirect()

    const adminSupabase = createAdminClient()
    const [{ data, error }, { data: mechaturaData, error: mechaturaError }] =
        await Promise.all([
            adminSupabase
                .from("seminar_registrations")
                .select("status_akademika,created_at")
                .order("created_at", { ascending: false }),
            adminSupabase
                .from("mechatura_registrations")
                .select(
                    "competition_type,payment_status,created_at"
                )
                .order("created_at", { ascending: false })
                .returns<AdminMechaturaSummary[]>(),
        ])

    if (error || mechaturaError) {
        throw new Error(error?.message ?? mechaturaError?.message)
    }

    const registrations = (data ?? []) as AdminRegistration[]
    const totalRegistrations = registrations.length
    const mahasiswaCount = registrations.filter(
        (registration) => registration.status_akademika === "mahasiswa"
    ).length
    const siswaCount = registrations.filter(
        (registration) => registration.status_akademika === "siswa"
    ).length
    const dosenCount = registrations.filter(
        (registration) => registration.status_akademika === "dosen"
    ).length
    const umumCount = registrations.filter(
        (registration) => registration.status_akademika === "umum"
    ).length

    const mechaturaRegistrations = mechaturaData ?? []
    const mechaturaPaidCount = mechaturaRegistrations.filter((registration) =>
        completedStatuses.has(getStatus(registration.payment_status))
    ).length

    return (
        <div className="mx-auto w-full max-w-6xl space-y-8">
            <section className="flex flex-col gap-5 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">
                        Admin Dashboard
                    </p>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-semibold tracking-tight text-balance">
                            Futura Overview
                        </h1>
                        <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                            Welcome back, {user.email}. Monitor registration progress and
                            payment health from one place. Navigate to specific events using the top navigation.
                        </p>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-5">Seminar</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                            <p className="text-sm text-muted-foreground">Mahasiswa</p>
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </div>
                        <p className="mt-4 text-3xl font-semibold tracking-tight">
                            {mahasiswaCount}
                        </p>
                    </div>

                    <div className="rounded-xl border border-border p-5">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm text-muted-foreground">Siswa</p>
                            <Clock3 className="h-4 w-4 text-amber-600" />
                        </div>
                        <p className="mt-4 text-3xl font-semibold tracking-tight">
                            {siswaCount}
                        </p>
                    </div>

                    <div className="rounded-xl border border-border p-5">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm text-muted-foreground">Dosen / Umum</p>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="mt-4 text-3xl font-semibold tracking-tight">
                            {dosenCount} / {umumCount}
                        </p>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-5">Mechatura</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-border p-5">
                        <p className="text-sm text-muted-foreground">Total Teams</p>
                        <p className="mt-4 text-3xl font-semibold tracking-tight">
                            {mechaturaRegistrations.length}
                        </p>
                    </div>
                    <div className="rounded-xl border border-border p-5">
                        <p className="text-sm text-muted-foreground">Paid Teams</p>
                        <p className="mt-4 text-3xl font-semibold tracking-tight">
                            {mechaturaPaidCount}
                        </p>
                    </div>
                    <div className="rounded-xl border border-border p-5">
                        <p className="text-sm text-muted-foreground">Robot Sumo</p>
                        <p className="mt-4 text-3xl font-semibold tracking-tight">
                            {
                                mechaturaRegistrations.filter(
                                    (registration) => registration.competition_type === "sumo"
                                ).length
                            }
                        </p>
                    </div>
                    <div className="rounded-xl border border-border p-5">
                        <p className="text-sm text-muted-foreground">Robot Transporter</p>
                        <p className="mt-4 text-3xl font-semibold tracking-tight">
                            {
                                mechaturaRegistrations.filter(
                                    (registration) =>
                                        registration.competition_type === "transporter"
                                ).length
                            }
                        </p>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-5">Lomba Karya Tulis Ilmiah</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-border p-5">
                        <p className="text-sm text-muted-foreground">Total Teams</p>
                        <p className="mt-4 text-3xl font-semibold tracking-tight text-muted-foreground">
                            -
                        </p>
                    </div>
                    <div className="rounded-xl border border-border p-5">
                        <p className="text-sm text-muted-foreground">Paid Teams</p>
                        <p className="mt-4 text-3xl font-semibold tracking-tight text-muted-foreground">
                            -
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}
