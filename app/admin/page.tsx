import type { Metadata } from "next"
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

import {
    Users,
    Cpu,
    Trophy,
} from "lucide-react"
import { createAdminClient } from "@/lib/supabase-admin"
import { requireAdminOrRedirect } from "@/lib/auth"
import { Suspense } from "react"
import AdminLoading from "./admin-loading"

async function AdminDashboardData() {
    const { user } = await requireAdminOrRedirect()
    const adminSupabase = createAdminClient()

    // Fetch counts directly using PostgREST
    const countResults = await Promise.all([
        adminSupabase.from("seminar_registrations").select("*", { count: "exact", head: true }),
        adminSupabase.from("seminar_registrations").select("*", { count: "exact", head: true }).eq("status_akademika", "mahasiswa"),
        adminSupabase.from("seminar_registrations").select("*", { count: "exact", head: true }).eq("status_akademika", "siswa"),
        adminSupabase.from("seminar_registrations").select("*", { count: "exact", head: true }).eq("status_akademika", "dosen"),
        adminSupabase.from("seminar_registrations").select("*", { count: "exact", head: true }).eq("status_akademika", "umum"),
        adminSupabase.from("mechatura_teams").select("*", { count: "exact", head: true }),
        adminSupabase.from("mechatura_teams").select("*", { count: "exact", head: true }).eq("admin_approval_status", "approved"),
        adminSupabase.from("mechatura_teams").select("*", { count: "exact", head: true }).eq("category", "robot_sumo"),
        adminSupabase.from("mechatura_teams").select("*", { count: "exact", head: true }).eq("category", "robot_transporter"),
        adminSupabase.from("esai_registrations").select("*", { count: "exact", head: true }),
        adminSupabase.from("esai_registrations").select("*", { count: "exact", head: true }).eq("submission_status", "approved"),
        adminSupabase.from("esai_registrations").select("*", { count: "exact", head: true }).eq("submission_status", "submitted"),
        adminSupabase.from("esai_registrations").select("*", { count: "exact", head: true }).eq("submission_status", "draft"),
    ]);

    for (const res of countResults) {
        if (res.error) {
            console.error("Dashboard count query error:", res.error);
        }
    }

    const [
        { count: seminarTotal },
        { count: seminarMahasiswa },
        { count: seminarSiswa },
        { count: seminarDosen },
        { count: seminarUmum },
        { count: mechaturaTotal },
        { count: mechaturaPaid },
        { count: mechaturaSumo },
        { count: mechaturaTransporter },
        { count: esaiTotal },
        { count: esaiApproved },
        { count: esaiSubmitted },
        { count: esaiDraft },
    ] = countResults;

    return (
        <div className="mx-auto w-full max-w-7xl space-y-8 min-w-0">
            <section className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:pb-8 lg:flex-row lg:items-end lg:justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />
                <div className="space-y-3 relative z-10">
                    <div className="space-y-1.5 sm:space-y-2">
                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-balance bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent">
                            Ringkasan Futura
                        </h1>
                        <p className="max-w-xl text-xs sm:text-sm md:text-base font-medium leading-relaxed text-muted-foreground/80">
                            Selamat datang kembali, <span className="text-foreground">{user.email}</span>. Pantau kemajuan pendaftaran dari satu tempat.
                        </p>
                    </div>
                </div>
            </section>

            <section className="relative z-10">
                <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                    Seminar
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                    <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3.5 sm:p-5 hover:border-zinc-700 transition-colors relative overflow-hidden">
                        <div className="flex items-center justify-between gap-1">
                            <p className="text-[10px] sm:text-xs font-medium text-zinc-400 uppercase tracking-wider truncate">Total Pendaftar</p>
                            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-500 shrink-0" />
                        </div>
                        <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100">
                            {seminarTotal ?? 0}
                        </p>
                    </div>

                    <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3.5 sm:p-5 hover:border-zinc-700 transition-colors relative overflow-hidden">
                        <div className="flex items-center justify-between gap-1">
                            <p className="text-[10px] sm:text-xs font-medium text-zinc-400 uppercase tracking-wider truncate">Mahasiswa</p>
                        </div>
                        <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100">
                            {seminarMahasiswa ?? 0}
                        </p>
                    </div>

                    <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3.5 sm:p-5 hover:border-zinc-700 transition-colors relative overflow-hidden">
                        <div className="flex items-center justify-between gap-1">
                            <p className="text-[10px] sm:text-xs font-medium text-zinc-400 uppercase tracking-wider truncate">Siswa</p>
                        </div>
                        <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100">
                            {seminarSiswa ?? 0}
                        </p>
                    </div>

                    <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3.5 sm:p-5 hover:border-zinc-700 transition-colors relative overflow-hidden">
                        <div className="flex items-center justify-between gap-1">
                            <p className="text-[10px] sm:text-xs font-medium text-zinc-400 uppercase tracking-wider truncate">Dosen / Umum</p>
                        </div>
                        <p className="mt-2 sm:mt-3 text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-zinc-100">
                            {seminarDosen ?? 0} / {seminarUmum ?? 0}
                        </p>
                    </div>
                </div>
            </section>

            <section className="relative z-10">
                <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                    Mechatura
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                    <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3.5 sm:p-5 hover:border-zinc-700 transition-colors relative overflow-hidden">
                        <div className="flex items-center justify-between gap-1">
                            <p className="text-[10px] sm:text-xs font-medium text-zinc-400 uppercase tracking-wider truncate">Total Tim</p>
                            <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-500 shrink-0" />
                        </div>
                        <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100">
                            {mechaturaTotal ?? 0}
                        </p>
                    </div>
                    <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3.5 sm:p-5 hover:border-emerald-500/30 transition-colors relative overflow-hidden">
                        <div className="flex items-center justify-between gap-1">
                            <p className="text-[10px] sm:text-xs font-medium text-zinc-400 uppercase tracking-wider truncate">Tim Disetujui</p>
                        </div>
                        <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-emerald-400">
                            {mechaturaPaid ?? 0}
                        </p>
                    </div>
                    <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3.5 sm:p-5 hover:border-zinc-700 transition-colors relative overflow-hidden">
                        <div className="flex items-center justify-between gap-1">
                            <p className="text-[10px] sm:text-xs font-medium text-zinc-400 uppercase tracking-wider truncate">Robot Sumo</p>
                        </div>
                        <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100">
                            {mechaturaSumo ?? 0}
                        </p>
                    </div>
                    <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3.5 sm:p-5 hover:border-zinc-700 transition-colors relative overflow-hidden">
                        <div className="flex items-center justify-between gap-1">
                            <p className="text-[10px] sm:text-xs font-medium text-zinc-400 uppercase tracking-wider truncate">Robot Transporter</p>
                        </div>
                        <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100">
                            {mechaturaTransporter ?? 0}
                        </p>
                    </div>
                </div>
            </section>

            <section className="relative z-10">
                <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                    Lomba Esai
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                    <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3.5 sm:p-5 hover:border-zinc-700 transition-colors relative overflow-hidden">
                        <div className="flex items-center justify-between gap-1">
                            <p className="text-[10px] sm:text-xs font-medium text-zinc-400 uppercase tracking-wider truncate">Total Peserta</p>
                            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-500 shrink-0" />
                        </div>
                        <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100">
                            {esaiTotal ?? 0}
                        </p>
                    </div>
                    <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3.5 sm:p-5 hover:border-emerald-500/30 transition-colors relative overflow-hidden">
                        <div className="flex items-center justify-between gap-1">
                            <p className="text-[10px] sm:text-xs font-medium text-zinc-400 uppercase tracking-wider truncate">Dokumen Disetujui</p>
                        </div>
                        <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-emerald-400">
                            {esaiApproved ?? 0}
                        </p>
                    </div>
                    <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3.5 sm:p-5 hover:border-zinc-700 transition-colors relative overflow-hidden">
                        <div className="flex items-center justify-between gap-1">
                            <p className="text-[10px] sm:text-xs font-medium text-zinc-400 uppercase tracking-wider truncate">Pendaftaran Disubmit</p>
                        </div>
                        <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100">
                            {esaiSubmitted ?? 0}
                        </p>
                    </div>
                    <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3.5 sm:p-5 hover:border-zinc-700 transition-colors relative overflow-hidden">
                        <div className="flex items-center justify-between gap-1">
                            <p className="text-[10px] sm:text-xs font-medium text-zinc-400 uppercase tracking-wider truncate">Draft</p>
                        </div>
                        <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100">
                            {esaiDraft ?? 0}
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
