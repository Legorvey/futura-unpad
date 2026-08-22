import type { Metadata } from "next"
/* eslint-disable */
import Link from "next/link"
import { redirect } from "next/navigation"
import { Ticket, Bot, BookOpen, CheckCircle2, Clock, ChevronRight, Crown, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditProfileDialog } from "@/components/edit-profile-dialog"
import ProfileDashboardSidebar from "./sidebar"
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

const getInitials = (displayName: string | null | undefined, email: string | null | undefined) => {
  const nameToUse = displayName || email?.split("@")[0] || "U"
  const parts = nameToUse
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)

  if (parts.length === 0) return "U"

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
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
        .select("id, is_leader, full_name, mechatura_teams(id, name, created_at, payment_status, category, submission_status, admin_approval_status, mechatura_members(id, is_leader, full_name))")
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



  const displayName = user.user_metadata?.display_name || user.user_metadata?.username || user.email?.split('@')[0] || 'Pengguna';

  const lightThemeVars = {
    '--background': '#f8fafc',
    '--foreground': '#0f172a',
    '--card': '#ffffff',
    '--card-foreground': '#0f172a',
    '--popover': '#ffffff',
    '--popover-foreground': '#0f172a',
    '--primary': '#fbbf24',
    '--primary-foreground': '#0f172a',
    '--secondary': '#f1f5f9',
    '--secondary-foreground': '#0f172a',
    '--muted': '#f8fafc',
    '--muted-foreground': '#64748b',
    '--accent': '#f1f5f9',
    '--accent-foreground': '#0f172a',
    '--border': '#e2e8f0',
    '--input': '#e2e8f0',
    '--ring': '#fbbf24',
    '--radius': '0.75rem',
  } as React.CSSProperties;

  const initials = getInitials(user.user_metadata?.display_name || user.user_metadata?.username, user.email)

  return (
    <div data-full-width className="w-full flex flex-col items-center pb-32 text-foreground" style={lightThemeVars}>
      <div className="relative w-full max-w-[90rem] px-4 sm:px-8 space-y-6">

        <section className="relative rounded-2xl border border-transparent lg:border-border bg-card text-card-foreground p-0 lg:p-8 lg:shadow-xl">
          <div className="flex flex-col lg:flex-row items-stretch gap-0 relative lg:-mx-8 lg:-my-8 h-full rounded-[inherit]">
            
            {/* LEFT COLUMN: Profile Account Details */}
            <ProfileDashboardSidebar>
              <div className="p-5 md:p-6 rounded-2xl bg-card border border-border">
                <div className="flex flex-col items-center text-center gap-4 mb-6 pb-6 border-b border-border">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-2xl font-medium text-primary">
                    {initials}
                  </div>
                  <div className="w-full">
                    <h2 className="text-xl font-semibold text-foreground mb-1 flex items-center justify-center gap-2">
                      {user.user_metadata?.display_name || user.user_metadata?.username || user.email?.split("@")[0] || "Pengguna"}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-5">{user.email}</p>
                    <EditProfileDialog
                      initialDisplayName={user.user_metadata?.display_name || ""}
                      initialUsername={user.user_metadata?.username || ""}
                      initialEmail={user.email || ""}
                      className="border border-border bg-transparent text-foreground hover:bg-muted font-medium px-5 h-9 rounded-md w-full"
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Alamat Email</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{user.email ?? "-"}</p>
                      {user.email_confirmed_at && (
                        <span className="shrink-0 inline-flex items-center rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-[9px] font-semibold text-green-700 uppercase">
                          Terverifikasi
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Username</p>
                    <p className="text-sm font-medium text-foreground">
                      {user.user_metadata?.username ? `@${user.user_metadata.username}` : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Terdaftar Sejak</p>
                    <p className="text-sm font-medium text-foreground">{formatDate(user.created_at)}</p>
                  </div>
                </div>
              </div>
            </ProfileDashboardSidebar>

            {/* RIGHT COLUMN: Registrations */}
            <section className="flex-1 space-y-6 p-6 sm:p-8 lg:p-10 transition-all duration-300 min-w-0 bg-background/50 rounded-2xl lg:rounded-l-none lg:rounded-r-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Acara & Pendaftaran</h3>
              </div>
              
        {/* MECHATURA */}
        <section className="bg-card text-card-foreground border border-border rounded-2xl overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border p-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-lg font-medium text-foreground">Mechatura</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Kompetisi Robotika tingkat Nasional
              </p>
            </div>
            {mechaturaTeam ? (
              <span className={`inline-flex w-max self-start sm:self-auto items-center rounded-full border px-3 py-1 text-xs font-medium ${
                mechaturaTeam.submission_status === 'submitted'
                  ? mechaturaTeam.admin_approval_status === 'approved'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : mechaturaTeam.admin_approval_status === "revision"
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}>
                {mechaturaTeam.submission_status === 'submitted' ? (
                  mechaturaTeam.admin_approval_status === "approved" ? "Disetujui" : mechaturaTeam.admin_approval_status === "revision" ? "Revisi" : "Menunggu Verifikasi"
                ) : (
                  'Draft'
                )}
              </span>
            ) : (
               <span className="inline-flex w-max self-start sm:self-auto items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
                 Belum Mendaftar
               </span>
            )}
          </div>

          <div className="p-6">
            {mechaturaTeam ? (
              <div className="flex flex-col sm:flex-row items-end justify-between gap-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-6 flex-1 w-full sm:w-auto">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Kategori</p>
                    <p className="text-sm font-medium text-foreground capitalize">{mechaturaTeam.category.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Nama Tim</p>
                    <p className="text-sm font-medium text-foreground">{mechaturaTeam.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Peran</p>
                    <p className="text-sm font-medium text-foreground">{mechaturaRoleText}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Anggota</p>
                    <p className="text-sm font-medium text-foreground">{mechaturaMemberCount} dari 3</p>
                  </div>
                </div>
                <div className="w-full sm:w-auto shrink-0 mt-4 sm:mt-0">
                  <Button asChild className="w-full sm:w-auto h-9 px-5 bg-amber-500 hover:bg-amber-600 text-white font-medium">
                    <Link href="/profile/mechatura" prefetch={true}>
                      Kelola Tim
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">Anda belum membentuk atau bergabung dengan tim Mechatura.</p>
                <Button asChild className="w-full sm:w-auto h-9 px-5 bg-amber-500 hover:bg-amber-600 text-white font-medium">
                  <Link href="/mechatura" prefetch={true}>Daftar Sekarang</Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* SEMINAR */}
        <section className="bg-card text-card-foreground border border-border rounded-2xl overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border p-6">
            <div>
              <h2 className="text-lg font-medium text-foreground mb-1">Seminar Nasional</h2>
              <p className="text-sm text-muted-foreground">
                {latestRegistration ? `Terdaftar pada ${formatDate(latestRegistration.created_at)}` : "Sesi inspiratif dan teknologi"}
              </p>
            </div>
            {latestRegistration ? (
              <span className={`inline-flex w-max self-start sm:self-auto items-center rounded-full border px-3 py-1 text-xs font-medium ${checkedInCount > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                {latestRegistration.registration_type === "group" ? `${checkedInCount}/${totalParticipants} Hadir` : (latestRegistration.attended ? "Hadir" : "Menunggu Kehadiran")}
              </span>
            ) : (
               <span className="inline-flex w-max self-start sm:self-auto items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
                 Segera Dibuka
               </span>
            )}
          </div>

          <div className="p-6">
            {latestRegistration ? (
              <div className="flex flex-col sm:flex-row items-end justify-between gap-6">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-6 flex-1 w-full sm:w-auto">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Nama Peserta</p>
                    <p className="text-sm font-medium text-foreground">{latestRegistration.nama_lengkap}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Registrasi</p>
                    <p className="text-sm font-medium text-foreground capitalize">
                      {latestRegistration.registration_type === "group" && latestRegistration.group_name
                        ? `Grup (${latestRegistration.group_name})`
                        : latestRegistration.registration_type || "-"}
                    </p>
                  </div>
                </div>
                <div className="w-full sm:w-auto shrink-0 mt-4 sm:mt-0">
                  <Button asChild variant="outline" className="w-full sm:w-auto h-9 px-5 bg-background hover:bg-muted text-foreground border-border font-medium">
                    <Link href="/profile/seminar" prefetch={true}>Detail Registrasi</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">Pendaftaran Seminar Nasional saat ini belum dibuka.</p>
                <Button asChild variant="outline" className="w-full sm:w-auto h-9 px-5 bg-background hover:bg-muted text-foreground border-border font-medium">
                  <Link href="/seminar" prefetch={true}>Detail Acara</Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* LOMBA KTI */}
        <section className="bg-card text-card-foreground border border-border rounded-2xl overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border p-6">
            <div>
              <h2 className="text-lg font-medium text-foreground mb-1">Lomba Esai</h2>
              <p className="text-sm text-muted-foreground">
                Kompetisi esai tingkat Nasional
              </p>
            </div>
             <span className="inline-flex w-max self-start sm:self-auto items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
               Segera Dibuka
             </span>
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">Pendaftaran Lomba Esai saat ini belum dibuka.</p>
              <Button asChild variant="outline" className="w-full sm:w-auto h-9 px-5 bg-background hover:bg-muted text-foreground border-border font-medium">
                <Link href="/lomba-esai" prefetch={true}>Detail Acara</Link>
              </Button>
            </div>
          </div>
        </section>
            </section>
          </div>
        </section>
      </div>
    </div>
  )
}
