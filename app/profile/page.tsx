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
        .select("id, mechatura_teams(id, name, created_at, payment_status, category)")
        .eq("user_id", user.id)
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

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="space-y-6">
        
        {/* SEMINAR */}
        <section className="relative rounded-3xl border border-white/10 bg-white/[0.02] p-[18px] sm:p-8 transition-colors hover:bg-white/[0.04]">
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
        <section className="relative rounded-3xl border border-white/10 bg-white/[0.02] p-[18px] sm:p-8 transition-colors hover:bg-white/[0.04]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-white/10 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/[0.08] backdrop-blur-md rounded-2xl border border-white/10">
                <Bot className="h-6 w-6 text-[#307FE2]" />
              </div>
              <div>
                <h2 className="text-2xl font-medium tracking-tight text-white mb-1">Mechatura</h2>
                <p className="text-sm tracking-tight text-white/50">
                  {mechaturaTeam ? `Terdaftar pada ${formatDate(mechaturaTeam.created_at)}` : "Belum bergabung di tim manapun"}
                </p>
              </div>
            </div>
            {mechaturaTeam && (
              <div className="flex items-center">
                <span className={`inline-flex items-center rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${mechaturaTeam.payment_status === 'verified' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'}`}>
                  {mechaturaTeam.payment_status === 'verified' ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Clock className="w-4 h-4 mr-2" />}
                  {mechaturaTeam.payment_status.replace('_', ' ')}
                </span>
              </div>
            )}
          </div>

          <div className="px-2">
            {mechaturaTeam ? (
              <div className="flex flex-col sm:flex-row items-center justify-between py-6">
                <div>
                  <p className="text-lg font-medium text-white mb-1">{mechaturaTeam.name}</p>
                  <p className="text-sm text-white/60 capitalize">Kategori: {mechaturaTeam.category.replace('_', ' ')}</p>
                </div>
                <Button asChild className="h-12 px-8 rounded-xl bg-[#307FE2] text-white hover:bg-[#307FE2]/90 font-medium mt-4 sm:mt-0">
                  <Link href="/profile/mechatura" prefetch={true}>Buka Dashboard Tim <ChevronRight className="w-4 h-4 ml-2" /></Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-xl font-medium tracking-tight text-white mb-3">Tim Belum Dibentuk</p>
                <p className="text-base tracking-tight text-white/50 max-w-md mb-6">Anda belum membentuk tim atau bergabung dalam Kompetisi Robotika Mechatura.</p>
                <Button asChild className="h-12 px-8 rounded-xl bg-white text-black hover:bg-white/90 font-medium">
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
