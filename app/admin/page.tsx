import type { Metadata } from "next"
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

import {
    CheckCircle2,
    Clock3,
    Users,
    Cpu,
    Trophy,
} from "lucide-react"
import { createAdminClient } from "@/lib/supabase-admin"
import { requireAdminOrRedirect } from "@/lib/auth"
import { Suspense } from "react"
import AdminLoading from "./admin-loading"
import { RevenueChart, type RevenueData } from "./revenue-chart"

async function AdminDashboardData() {
    const { user } = await requireAdminOrRedirect()
    const adminSupabase = createAdminClient()

    const [
        { data: stats, error: statsError },
        { data: revenueData, error: revenueError }
    ] = await Promise.all([
        adminSupabase.rpc("get_admin_dashboard_stats"),
        adminSupabase.rpc("get_daily_revenue").returns<RevenueData[]>()
    ])
    
    if (statsError || revenueError) {
        throw new Error(statsError?.message ?? revenueError?.message);
    }

    const {
        seminar_total: totalRegistrations,
        seminar_mahasiswa: mahasiswaCount,
        seminar_siswa: siswaCount,
        seminar_dosen: dosenCount,
        seminar_umum: umumCount,
        mechatura_total: totalMechaturaCount,
        mechatura_paid: mechaturaPaidCount,
        mechatura_sumo: sumoCount,
        mechatura_transporter: transporterCount
    } = stats;

    return (
        <div className="mx-auto w-full max-w-7xl space-y-8">
            <section className="flex flex-col gap-5 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />
                <div className="space-y-3 relative z-10">
                    <div className="space-y-2">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-balance bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent">
                            Ringkasan Futura
                        </h1>
                        <p className="max-w-xl text-sm md:text-base font-medium leading-relaxed text-muted-foreground/80">
                            Selamat datang kembali, <span className="text-foreground">{user.email}</span>. Pantau kemajuan pendaftaran dan kesehatan pembayaran dari satu tempat.
                        </p>
                    </div>
                </div>
            </section>

            <section>
                <RevenueChart data={Array.isArray(revenueData) ? revenueData : []} />
            </section>

            <section className="relative z-10">
                <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
                    Seminar
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="group rounded-2xl border border-white/5 bg-card/40 backdrop-blur-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-foreground/5 hover:border-foreground/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                            <Users className="w-24 h-24 text-primary" strokeWidth={1} />
                        </div>
                        <div className="flex items-center justify-between gap-3 relative z-10">
                            <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Pendaftar</p>
                        </div>
                        <p className="mt-4 text-4xl font-semibold tracking-tight text-foreground relative z-10">
                            {totalRegistrations}
                        </p>
                    </div>

                    <div className="group rounded-2xl border border-white/5 bg-card/40 backdrop-blur-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-foreground/5 hover:border-foreground/20 relative overflow-hidden">
                        <div className="flex items-center justify-between gap-3 relative z-10">
                            <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Mahasiswa</p>
                        </div>
                        <p className="mt-4 text-4xl font-semibold tracking-tight text-foreground relative z-10">
                            {mahasiswaCount}
                        </p>
                    </div>

                    <div className="group rounded-2xl border border-white/5 bg-card/40 backdrop-blur-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-foreground/5 hover:border-foreground/20 relative overflow-hidden">
                        <div className="flex items-center justify-between gap-3 relative z-10">
                            <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Siswa</p>
                        </div>
                        <p className="mt-4 text-4xl font-semibold tracking-tight text-foreground relative z-10">
                            {siswaCount}
                        </p>
                    </div>

                    <div className="group rounded-2xl border border-white/5 bg-card/40 backdrop-blur-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-foreground/5 hover:border-foreground/20 relative overflow-hidden">
                        <div className="flex items-center justify-between gap-3 relative z-10">
                            <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Dosen / Umum</p>
                        </div>
                        <p className="mt-4 text-4xl font-semibold tracking-tight text-foreground relative z-10">
                            {dosenCount} / {umumCount}
                        </p>
                    </div>
                </div>
            </section>

            <section className="relative z-10">
                <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
                    Mechatura
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="group rounded-2xl border border-white/5 bg-card/40 backdrop-blur-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-foreground/5 hover:border-foreground/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                            <Cpu className="w-24 h-24 text-primary" strokeWidth={1} />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors relative z-10">Total Tim</p>
                        <p className="mt-4 text-4xl font-semibold tracking-tight text-foreground relative z-10">
                            {totalMechaturaCount}
                        </p>
                    </div>
                    <div className="group rounded-2xl border border-white/5 bg-card/40 backdrop-blur-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/5 hover:border-emerald-500/20 relative overflow-hidden">
                        <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors relative z-10">Tim Lunas</p>
                        <p className="mt-4 text-4xl font-semibold tracking-tight text-emerald-400 relative z-10 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                            {mechaturaPaidCount}
                        </p>
                    </div>
                    <div className="group rounded-2xl border border-white/5 bg-card/40 backdrop-blur-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-foreground/5 hover:border-foreground/20 relative overflow-hidden">
                        <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors relative z-10">Robot Sumo</p>
                        <p className="mt-4 text-4xl font-semibold tracking-tight text-foreground relative z-10">
                            {sumoCount}
                        </p>
                    </div>
                    <div className="group rounded-2xl border border-white/5 bg-card/40 backdrop-blur-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-foreground/5 hover:border-foreground/20 relative overflow-hidden">
                        <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors relative z-10">Robot Transporter</p>
                        <p className="mt-4 text-4xl font-semibold tracking-tight text-foreground relative z-10">
                            {transporterCount}
                        </p>
                    </div>
                </div>
            </section>

            <section className="relative z-10">
                <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
                    Lomba Essay
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="group rounded-2xl border border-white/5 bg-card/40 backdrop-blur-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-foreground/5 hover:border-foreground/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                            <Trophy className="w-24 h-24 text-primary" strokeWidth={1} />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors relative z-10">Total Tim</p>
                        <p className="mt-4 text-4xl font-semibold tracking-tight text-muted-foreground relative z-10">
                            -
                        </p>
                    </div>
                    <div className="group rounded-2xl border border-white/5 bg-card/40 backdrop-blur-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/5 hover:border-emerald-500/20 relative overflow-hidden">
                        <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors relative z-10">Tim Lunas</p>
                        <p className="mt-4 text-4xl font-semibold tracking-tight text-muted-foreground relative z-10">
                            -
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}
export const metadata: Metadata = {
  title: "Dashboard Admin"
}

export default function AdminPage() { return <Suspense fallback={<AdminLoading />}><AdminDashboardData /></Suspense> }
