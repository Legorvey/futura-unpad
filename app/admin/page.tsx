export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

import {
    CheckCircle2,
    Clock3,
    Users,
} from "lucide-react"
import { createAdminClient } from "@/lib/supabase-admin"
import { requireAdminOrRedirect } from "@/lib/auth"

type SeminarDashboardRow = {
    status_akademika: string | null
}

type MechaturaDashboardRow = {
    payment_status: string | null
    competition_type: string | null
}

const countBy = <TRow,>(
    rows: TRow[],
    predicate: (row: TRow) => boolean
) => rows.reduce((count, row) => count + (predicate(row) ? 1 : 0), 0)

export default async function AdminPage() {
    const { user } = await requireAdminOrRedirect()

    const adminSupabase = createAdminClient()
    const [
        { data: seminarRows, error: seminarError },
        { data: mechaturaRows, error: mechaturaError },
    ] = await Promise.all([
        adminSupabase
            .from("seminar_registrations")
            .select("status_akademika")
            .returns<SeminarDashboardRow[]>(),
        adminSupabase
            .from("mechatura_registrations")
            .select("payment_status,competition_type")
            .returns<MechaturaDashboardRow[]>(),
    ])

    if (seminarError || mechaturaError) {
        throw new Error(seminarError?.message ?? mechaturaError?.message)
    }

    const seminarRegistrations = seminarRows ?? []
    const mechaturaRegistrations = mechaturaRows ?? []
    const totalRegistrations = seminarRegistrations.length
    const mahasiswaCount = countBy(seminarRegistrations, (row) => row.status_akademika === "mahasiswa")
    const siswaCount = countBy(seminarRegistrations, (row) => row.status_akademika === "siswa")
    const dosenCount = countBy(seminarRegistrations, (row) => row.status_akademika === "dosen")
    const umumCount = countBy(seminarRegistrations, (row) => row.status_akademika === "umum")
    const totalMechaturaCount = mechaturaRegistrations.length
    const mechaturaPaidCount = countBy(mechaturaRegistrations, (row) => row.payment_status === "paid" || row.payment_status === "settled")
    const sumoCount = countBy(mechaturaRegistrations, (row) => row.competition_type === "sumo")
    const transporterCount = countBy(mechaturaRegistrations, (row) => row.competition_type === "transporter")

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
                            {totalMechaturaCount}
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
                            {sumoCount}
                        </p>
                    </div>
                    <div className="rounded-xl border border-border p-5">
                        <p className="text-sm text-muted-foreground">Robot Transporter</p>
                        <p className="mt-4 text-3xl font-semibold tracking-tight">
                            {transporterCount}
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
