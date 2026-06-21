import Link from "next/link"
import { redirect } from "next/navigation"
import { CalendarDays, Mail, ShieldCheck, Ticket, UserRound, Bot, BookOpen, CheckCircle2, Clock, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  formatCurrency,
  isAcademicStatus,
  isMechaturaCompetitionType,
  isPaymentStatus,
  mechaturaCompetitionLabels,
  paymentStatusLabels,
  statusLabels,
} from "@/lib/payment"
import { createAdminClient } from "@/lib/supabase-admin"
import { createClient } from "@/utils/supabase/server"
import { EditProfileDialog } from "@/components/edit-profile-dialog"
import { QRCodeSVG } from "qrcode.react"
import { TicketDownloadButton, DownloadRegistrationData } from "./ticket-download-button"

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
  competition_type: unknown
  robot_name: string
  registration_status: string | null
  payment_status: string | null
  payment_amount: number | null
  xendit_external_id: string
  created_at: string | null
}

type ProfileMechaturaLeader = {
  full_name: string
  email: string | null
  phone: string | null
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

const formatDate = (value?: string | null) => {
  if (!value) {
    return "-"
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/profile")
  }

  const initials = getInitials(user.user_metadata?.display_name, user.email)

  const adminSupabase = createAdminClient()
  const [
    { data: adminUser },
    { data: latestRegistration, error },
    { data: latestMechaturaRegistration, error: mechaturaError },
  ] =
    await Promise.all([
      supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle(),
      adminSupabase
        .from("seminar_registrations")
        .select(
          "id,nama_lengkap,email,no_telepon,asal_institusi,status_akademika,created_at,attended,check_in_time,registration_type,group_id,group_name"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle<ProfileRegistration>(),
      adminSupabase
        .from("mechatura_registrations")
        .select(
          "id,team_name,competition_type,robot_name,registration_status,payment_status,payment_amount,xendit_external_id,created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle<ProfileMechaturaRegistration>(),
    ])

  if (error || mechaturaError) {
    throw new Error(error?.message ?? mechaturaError?.message)
  }

  const { data: mechaturaLeader } = latestMechaturaRegistration
    ? await adminSupabase
      .from("mechatura_members")
      .select("full_name,email,phone")
      .eq("registration_id", latestMechaturaRegistration.id)
      .eq("is_leader", true)
      .maybeSingle<ProfileMechaturaLeader>()
    : { data: null }

  let groupMembers: DownloadRegistrationData[] = []
  if (latestRegistration?.registration_type === "group" && latestRegistration.group_id) {
    const { data: membersData } = await adminSupabase
      .from("seminar_registrations")
      .select("id,nama_lengkap,email,no_telepon,asal_institusi,status_akademika,registration_type,group_name")
      .eq("group_id", latestRegistration.group_id)
      .eq("is_main_contact", false)
      
    if (membersData) {
      groupMembers = membersData as DownloadRegistrationData[]
    }
  }

  const academicStatus = isAcademicStatus(latestRegistration?.status_akademika)
    ? latestRegistration.status_akademika
    : null
  const mechaturaPaymentStatus = isPaymentStatus(
    latestMechaturaRegistration?.payment_status
  )
    ? latestMechaturaRegistration.payment_status
    : "unpaid"
  const mechaturaCompetition = isMechaturaCompetitionType(
    latestMechaturaRegistration?.competition_type
  )
    ? latestMechaturaRegistration.competition_type
    : null

  return (
    <div className="mx-auto w-full max-w-6xl">
      <section className="flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Your Dashboard
          </h1>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Manage your profile and track your Futura event registrations.
          </p>
        </div>
      </section>

      <div className="space-y-6 max-w-3xl">

          {/* SEMINAR CARD */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-background border border-border p-2 rounded-lg">
                  <Ticket className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold">National Seminar</h2>
                  <p className="text-xs text-muted-foreground">
                    {latestRegistration ? `Registered on ${formatDate(latestRegistration.created_at)}` : "No active registration"}
                  </p>
                </div>
              </div>
              {latestRegistration && (
                <div className="flex gap-2">
                  <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${latestRegistration.attended ? 'border-border bg-background text-foreground' : 'border-border bg-muted text-muted-foreground'}`}>
                    {latestRegistration.attended ? <CheckCircle2 className="w-3 h-3 mr-1.5 text-green-500" /> : <Clock className="w-3 h-3 mr-1.5 text-muted-foreground" />}
                    {latestRegistration.attended ? "Checked In" : "Waiting to Check In"}
                  </span>
                  <span className="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground">
                    <CheckCircle2 className="w-3 h-3 mr-1.5 text-muted-foreground" /> Active
                  </span>
                </div>
              )}
            </div>

            <div className="p-6">
              {latestRegistration ? (
                <>
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="grid gap-5 text-sm sm:grid-cols-2 flex-grow">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Participant Name</p>
                        <p className="font-medium">{latestRegistration.nama_lengkap}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Institution</p>
                        <p className="font-medium">{latestRegistration.asal_institusi}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Phone Number</p>
                        <p className="font-medium">{latestRegistration.no_telepon}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Status / Fee</p>
                        <p className="font-medium">
                          {academicStatus ? statusLabels[academicStatus] : "-"} <span className="text-muted-foreground font-normal ml-1">(Free)</span>
                        </p>
                      </div>
                    </div>
                    {latestRegistration.registration_type !== "group" && (
                      <div className="flex flex-col items-center justify-center self-start shrink-0 p-4 bg-white rounded-xl border border-border">
                          <QRCodeSVG value={latestRegistration.id} size={120} />
                          <p className="text-[10px] text-muted-foreground mt-3 uppercase font-semibold tracking-wider">Ticket QR</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-6">
                    <TicketDownloadButton 
                        mainContact={latestRegistration as DownloadRegistrationData} 
                        members={groupMembers} 
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <p className="text-sm text-muted-foreground mb-4">You haven't registered for the National Seminar yet.</p>
                  <Button asChild className="h-10 rounded-xl">
                    <Link href="/registration/seminar">Register for Seminar</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* MECHATURA CARD */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-background border border-border p-2 rounded-lg">
                  <Bot className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold">Mechatura Competition</h2>
                  <p className="text-xs text-muted-foreground">
                    {latestMechaturaRegistration ? `Registered on ${formatDate(latestMechaturaRegistration.created_at)}` : "No active registration"}
                  </p>
                </div>
              </div>
              {latestMechaturaRegistration && (
                <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${mechaturaPaymentStatus === 'paid' ? 'border-border bg-background text-foreground' : 'border-border bg-muted text-muted-foreground'}`}>
                  {mechaturaPaymentStatus === 'paid' ? <CheckCircle2 className="w-3 h-3 mr-1.5 text-muted-foreground" /> : <Clock className="w-3 h-3 mr-1.5 text-muted-foreground" />}
                  {paymentStatusLabels[mechaturaPaymentStatus]}
                </span>
              )}
            </div>

            <div className="p-6">
              {latestMechaturaRegistration ? (
                <div className="grid gap-5 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Team Name</p>
                    <p className="font-medium">{latestMechaturaRegistration.team_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Category</p>
                    <p className="font-medium">
                      {mechaturaCompetition ? mechaturaCompetitionLabels[mechaturaCompetition] : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Robot Name</p>
                    <p className="font-medium">{latestMechaturaRegistration.robot_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Team Leader</p>
                    <p className="font-medium">{mechaturaLeader?.full_name ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Registration Status</p>
                    <p className="font-medium capitalize">{latestMechaturaRegistration.registration_status?.replace('_', ' ') ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Amount Due</p>
                    <p className="font-medium">{formatCurrency(latestMechaturaRegistration.payment_amount ?? 0)}</p>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3 mt-4">
                    <Button asChild variant="secondary" className="h-10 rounded-xl w-full sm:w-auto">
                      <Link href={`/payment?order_id=${encodeURIComponent(latestMechaturaRegistration.xendit_external_id)}`}>
                        Open Payment Details <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <p className="text-sm text-muted-foreground mb-4">You haven't formed a team for the Mechatura Robotics Competition yet.</p>
                  <Button asChild className="h-10 rounded-xl">
                    <Link href="/registration/mechatura">Register Team</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* LOMBA KTI CARD (UI ONLY) */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-background border border-border p-2 rounded-lg">
                  <BookOpen className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold">Lomba KTI</h2>
                  <p className="text-xs text-muted-foreground">
                    Scientific Paper Competition
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">No active Lomba KTI registration found for this account.</p>
                <Button asChild className="h-10 rounded-xl">
                  <Link href="/registration/lomba-kti">Register for Lomba KTI</Link>
                </Button>
              </div>
            </div>
          </div>

        </div>
    </div>
  )
}
