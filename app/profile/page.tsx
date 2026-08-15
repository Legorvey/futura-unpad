import type { Metadata } from "next"
/* eslint-disable */
import Link from "next/link"
import { redirect } from "next/navigation"
import { Ticket, Bot, BookOpen, CheckCircle2, Clock, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  formatCurrency,
  isAcademicStatus,
  isCompletedPaymentStatus,
  isMechaturaCompetitionType,
  isPaymentStatus,
  mechaturaCompetitionLabels,
  paymentStatusLabels,
  statusLabels,
} from "@/lib/payment"
import { getCachedAuth } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase-admin"
import { createClient } from "@/utils/supabase/server"

type ProfileRegistration = {
  id: string
  nama_lengkap: string
  email: string
  no_telepon: string
  asal_institusi: string
  status_akademika: unknown
  created_at: string | null
  attended: boolean
  check_in_time: string | null
  registration_type: string | null
  group_id: string | null
  group_name: string | null
}

type ProfileMechaturaRegistration = {
  id: string
  team_name: string
  institution: string | null
  competition_type: unknown
  robot_name: string
  registration_status: string | null
  payment_status: string | null
  payment_amount: number | null
  midtrans_order_id: string
  created_at: string | null
  paid_at: string | null
  mechatura_members: ProfileMechaturaLeader[]
}

type ProfileMechaturaLeader = {
  full_name: string
  email: string | null
  phone: string | null
  is_leader: boolean
}

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
})

const formatDate = (value?: string | null) => {
  if (!value) {
    return "-"
  }

  return dateFormatter.format(new Date(value))
}

const isProfileGroupRegistration = (registration: ProfileRegistration | null | undefined) =>
  registration?.registration_type === "group" || registration?.registration_type === "grup"

export const metadata: Metadata = {
  title: "Profil Saya"
}

export default async function ProfilePage() {
  const { user, adminAccess } = await getCachedAuth()

  if (!user) {
    redirect("/login?next=/profile")
  }

  if (adminAccess) {
    redirect("/admin")
  }

  const supabase = await createClient()
  const adminSupabase = createAdminClient()

  const [
    { data: latestRegistration, error },
    { data: latestMechaturaMembership, error: mechaturaError },
  ] =
    await Promise.all([
      adminSupabase
        .from("seminar_registrations")
        .select(
          "id,nama_lengkap,email,no_telepon,asal_institusi,status_akademika,created_at,attended,check_in_time,registration_type,group_id,group_name"
        )
        .eq("user_id", user.id)
        .eq("is_main_contact", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle<ProfileRegistration>(),
      adminSupabase
        .from("mechatura_members")
        .select("id, is_leader, full_name, mechatura_teams(id, name, created_at, payment_status, category, mechatura_members(id, is_leader, full_name))")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle(),
    ])

  if (error || mechaturaError) {
    throw new Error(error?.message ?? mechaturaError?.message)
  }

  const groupMembersPromise = isProfileGroupRegistration(latestRegistration) && latestRegistration?.group_id
    ? adminSupabase
      .from("seminar_registrations")
      .select("id,nama_lengkap,email,no_telepon,asal_institusi,status_akademika,registration_type,group_name,attended")
      .eq("group_id", latestRegistration.group_id)
      .eq("is_main_contact", false)
      .order("created_at", { ascending: true })
      .order("nama_lengkap", { ascending: true })
    : Promise.resolve({ data: [], error: null })

  const { data: membersData, error: membersError } = await groupMembersPromise

  if (membersError) {
    throw new Error(membersError.message)
  }

  const groupMembers = membersData ?? []
  const totalParticipants = latestRegistration ? 1 + groupMembers.length : 0
  const checkedInCount = latestRegistration ? (latestRegistration.attended ? 1 : 0) + groupMembers.filter(m => m.attended).length : 0

  const academicStatus = isAcademicStatus(latestRegistration?.status_akademika)
    ? latestRegistration.status_akademika
    : null

  const hasMechaturaTeam = !!latestMechaturaMembership?.mechatura_teams;
  const mechaturaTeam = Array.isArray(latestMechaturaMembership?.mechatura_teams)
    ? latestMechaturaMembership?.mechatura_teams[0]
    : latestMechaturaMembership?.mechatura_teams;

  let mechaturaRoleText = "";
  let mechaturaMemberCount = 0;
  if (latestMechaturaMembership && mechaturaTeam && Array.isArray(mechaturaTeam.mechatura_members)) {
    mechaturaMemberCount = mechaturaTeam.mechatura_members.length;
    if (latestMechaturaMembership.is_leader) {
      mechaturaRoleText = "Ketua";
    } else {
      const sortedNonLeaders = mechaturaTeam.mechatura_members
        .filter((m: any) => !m.is_leader)
        .sort((a: any, b: any) => a.id.localeCompare(b.id));
      const myIndex = sortedNonLeaders.findIndex((m: any) => m.id === latestMechaturaMembership.id);
      mechaturaRoleText = myIndex !== -1 ? `Anggota ${myIndex + 1}` : "Anggota";
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="space-y-6">

        {/* SEMINAR */}
        <section className="relative rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur p-[18px] sm:p-8 transition-colors hover:bg-white/[0.04]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-white/10 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/[0.08] backdrop-blur-md rounded-2xl border border-white/10">
                <Ticket className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <h2 className="text-2xl font-medium tracking-tight text-white mb-1">Seminar Nasional</h2>
                <p className="text-sm tracking-tight text-white/50">
                  {latestRegistration ? `Terdaftar pada ${formatDate(latestRegistration.created_at)}` : "Pendaftaran saat ini belum dibuka"}
                </p>
              </div>
            </div>
            {latestRegistration && (
              <div className="flex items-center">
                <span className={`inline-flex items-center rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${checkedInCount > 0 ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-white/5 border-white/10 text-white/60'}`}>
                  {checkedInCount > 0 ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Clock className="w-4 h-4 mr-2" />}
                  {latestRegistration.registration_type === "group" ? `${checkedInCount}/${totalParticipants} Hadir` : (latestRegistration.attended ? "Hadir" : "Menunggu Kehadiran")}
                </span>
              </div>
            )}
          </div>

          <div className="px-2">
            {latestRegistration ? (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-sm text-white/40 tracking-tight mb-2">Nama Peserta</p>
                  <p className="text-lg font-medium tracking-tight text-white">{latestRegistration.nama_lengkap}</p>
                </div>
                <div>
                  <p className="text-sm text-white/40 tracking-tight mb-2">Asal Institusi</p>
                  <p className="text-lg font-medium tracking-tight text-white">{latestRegistration.asal_institusi}</p>
                </div>
                <div>
                  <p className="text-sm text-white/40 tracking-tight mb-2">Nomor Telepon</p>
                  <p className="text-lg font-medium tracking-tight text-white">{latestRegistration.no_telepon}</p>
                </div>
                <div>
                  <p className="text-sm text-white/40 tracking-tight mb-2">Status & Biaya</p>
                  <p className="text-lg font-medium tracking-tight text-white">
                    {academicStatus ? statusLabels[academicStatus] : "-"} <span className="text-white/40 font-normal ml-1">(Gratis)</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-xl font-medium tracking-tight text-white mb-3">Pendaftaran Belum Dibuka</p>
                <p className="text-base tracking-tight text-white/50 max-w-md mb-6">Pendaftaran Seminar Nasional saat ini belum dibuka. Lihat detail selengkapnya dengan mengklik tombol di bawah.</p>
                <Button asChild className="h-12 px-8 rounded-xl bg-white text-black hover:bg-white/90 font-medium">
                  <Link href="/seminar-nasional" prefetch={true}>Lihat Detail Acara</Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* MECHATURA */}
        <section className="relative overflow-hidden rounded-3xl border border-[#307FE2]/30 bg-gradient-to-b from-white/[0.04] to-transparent p-[18px] sm:p-8 transition-all hover:border-[#307FE2]/50 hover:shadow-[0_0_40px_rgba(48,127,226,0.15)] group/card">
          {/* Decorative Glows */}
          <div className="absolute top-0 right-0 -mt-24 -mr-24 h-[300px] w-[300px] rounded-full bg-[#307FE2]/20 blur-[100px] pointer-events-none opacity-50 group-hover/card:opacity-80 transition-opacity duration-700" />
          <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-[250px] w-[250px] rounded-full bg-[#307FE2]/10 blur-[80px] pointer-events-none opacity-30 group-hover/card:opacity-60 transition-opacity duration-700" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-white/10 pb-6">
            <div className="flex items-center gap-5">
              <div className="p-3.5 bg-gradient-to-br from-[#307FE2]/20 to-transparent backdrop-blur-md rounded-2xl border border-[#307FE2]/30 shadow-[0_0_20px_rgba(48,127,226,0.2)]">
                <Bot className="h-7 w-7 text-[#5fa3fa]" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <h2 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">Mechatura</h2>
                  {mechaturaTeam && (
                    <span className="rounded-full bg-gradient-to-r from-[#307FE2]/20 to-[#307FE2]/10 px-3 py-0.5 text-xs font-bold text-[#5fa3fa] border border-[#307FE2]/30 capitalize shadow-sm backdrop-blur-md tracking-wide">
                      {mechaturaTeam.category.replace('_', ' ')}
                    </span>
                  )}
                </div>
                <p className="text-sm tracking-tight text-white/50 font-medium">
                  {mechaturaTeam ? `Terdaftar pada ${formatDate(mechaturaTeam.created_at)}` : "Belum bergabung di tim manapun"}
                </p>
              </div>
            </div>
            {mechaturaTeam && (
              <div className="flex items-center">
                <span className={`inline-flex items-center rounded-xl border px-3.5 py-1.5 text-sm font-bold transition-colors shadow-sm ${mechaturaTeam.payment_status === 'verified' ? 'bg-gradient-to-r from-green-500/20 to-green-500/10 border-green-500/30 text-green-400' : 'bg-gradient-to-r from-yellow-500/20 to-yellow-500/10 border-yellow-500/30 text-yellow-400'}`}>
                  {mechaturaTeam.payment_status === 'verified' ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Clock className="w-4 h-4 mr-2" />}
                  {mechaturaTeam.payment_status.charAt(0).toUpperCase() + mechaturaTeam.payment_status.slice(1).replace('_', ' ')}
                </span>
              </div>
            )}
          </div>

          <div className="relative z-10 px-2">
            {mechaturaTeam ? (
              <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
                <div className="flex flex-col h-full justify-between gap-8 py-1">
                  <div>
                    <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">Nama Tim</h3>
                    <p className="text-3xl font-bold text-white tracking-tight drop-shadow-sm">{mechaturaTeam.name}</p>
                  </div>

                  <div>
                    <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2.5">Status Keanggotaan</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 border border-white/20 shadow-inner">
                        {latestMechaturaMembership?.is_leader ? <span className="text-[11px] leading-none">👑</span> : <span className="text-[11px] leading-none">👤</span>}
                      </div>
                      <p className="text-lg font-medium text-white/90">{mechaturaRoleText}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col w-full sm:w-auto sm:min-w-[280px]">
                  <Button asChild className="relative w-full h-12 px-6 rounded-xl bg-gradient-to-b from-[#307FE2] to-[#2060B2] text-white font-medium transition-all group overflow-hidden shadow-[0_0_20px_rgba(48,127,226,0.3)] hover:shadow-[0_0_30px_rgba(48,127,226,0.5)] border border-[#4d94eb] hover:border-white/50 mb-5">
                    <Link href="/profile/mechatura" prefetch={true}>
                      <span className="relative z-10 flex items-center justify-center w-full">
                        Buka Dashboard Tim <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1.5" />
                      </span>
                    </Link>
                  </Button>

                  <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-4.5 shadow-inner backdrop-blur-md relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <div className="p-1">
                      <div className="flex items-center justify-between mb-3.5">
                        <p className="text-[11px] text-white/50 font-bold uppercase tracking-[0.2em]">Anggota Tim</p>
                        <div className="flex items-center gap-1.5 bg-white/5 rounded-md px-2 py-0.5 border border-white/10">
                          <span className="text-xs font-bold text-white">{mechaturaMemberCount}</span>
                          <span className="text-xs font-medium text-white/40">/ 3</span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden border border-white/5 shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-[#2060B2] to-[#4d94eb] rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(48,127,226,0.8)] relative"
                          style={{ width: `${(mechaturaMemberCount / 3) * 100}%` }}
                        >
                          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] opacity-50" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-xl font-medium tracking-tight text-white mb-3">Tim Belum Dibentuk</p>
                <p className="text-base tracking-tight text-white/50 max-w-md mb-6">Anda belum membentuk tim atau bergabung dalam Kompetisi Robotika Mechatura.</p>
                <Button asChild className="h-12 px-8 rounded-xl bg-white text-black hover:bg-white/90 font-medium shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all">
                  <Link href="/mechatura" prefetch={true}>Daftar Sekarang</Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* LOMBA KTI */}
        <section className="relative rounded-3xl border border-white/10 bg-white/[0.02] p-[18px] sm:p-8 transition-colors hover:bg-white/[0.04]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-white/10 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/[0.08] backdrop-blur-md rounded-2xl border border-white/10">
                <BookOpen className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-medium tracking-tight text-white mb-1">Lomba Esai</h2>
                <p className="text-sm tracking-tight text-white/50">
                  Pendaftaran saat ini belum dibuka
                </p>
              </div>
            </div>
          </div>

          <div className="px-2">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-xl font-medium tracking-tight text-white mb-3">Pendaftaran Belum Dibuka</p>
              <p className="text-base tracking-tight text-white/50 max-w-md mb-6">Pendaftaran Lomba Esai saat ini belum dibuka. Lihat detail selengkapnya dengan mengklik tombol di bawah.</p>
              <Button asChild className="h-12 px-8 rounded-xl bg-white text-black hover:bg-white/90 font-medium">
                <Link href="/lomba-esai" prefetch={true}>Lihat Detail Acara</Link>
              </Button>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
