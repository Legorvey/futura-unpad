export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

import {
    CheckCircle2,
    Clock3,
    Users,
} from "lucide-react"
import { createAdminClient } from "@/lib/supabase-admin"
import { requireAdminOrRedirect } from "@/lib/auth"

export default async function AdminPage() {
    const { user } = await requireAdminOrRedirect()

    const adminSupabase = createAdminClient()
    const [
        seminarTotal,
        seminarMahasiswa,
        seminarSiswa,
        seminarDosen,
        seminarUmum,
        mechaturaTotal,
        mechaturaPaid,
        mechaturaSumo,
        mechaturaTransporter,
    ] = await Promise.all([
        adminSupabase.from("seminar_registrations").select("id", { count: "exact", head: true }),
        adminSupabase.from("seminar_registrations").select("id", { count: "exact", head: true }).eq("status_akademika", "mahasiswa"),
        adminSupabase.from("seminar_registrations").select("id", { count: "exact", head: true }).eq("status_akademika", "siswa"),
        adminSupabase.from("seminar_registrations").select("id", { count: "exact", head: true }).eq("status_akademika", "dosen"),
        adminSupabase.from("seminar_registrations").select("id", { count: "exact", head: true }).eq("status_akademika", "umum"),
        adminSupabase.from("mechatura_registrations").select("id", { count: "exact", head: true }),
        adminSupabase.from("mechatura_registrations").select("id", { count: "exact", head: true }).in("payment_status", ["paid", "settled"]),
        adminSupabase.from("mechatura_registrations").select("id", { count: "exact", head: true }).eq("competition_type", "sumo"),
        adminSupabase.from("mechatura_registrations").select("id", { count: "exact", head: true }).eq("competition_type", "transporter"),
    ])
    const failedCount = [
        seminarTotal,
        seminarMahasiswa,
        seminarSiswa,
        seminarDosen,
        seminarUmum,
        mechaturaTotal,
        mechaturaPaid,
        mechaturaSumo,
        mechaturaTransporter,
    ].find((result) => result.error)

    if (failedCount?.error) {
        throw new Error(failedCount.error.message)
    }

    const totalRegistrations = seminarTotal.count ?? 0
    const mahasiswaCount = seminarMahasiswa.count ?? 0
    const siswaCount = seminarSiswa.count ?? 0
    const dosenCount = seminarDosen.count ?? 0
    const umumCount = seminarUmum.count ?? 0
    const totalMechaturaCount = mechaturaTotal.count ?? 0
    const mechaturaPaidCount = mechaturaPaid.count ?? 0
    const sumoCount = mechaturaSumo.count ?? 0
    const transporterCount = mechaturaTransporter.count ?? 0

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
