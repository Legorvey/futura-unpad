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

type ProfileRegistration = {
  nama_lengkap: string
  email: string
  no_telepon: string
  asal_institusi: string
  status_akademika: unknown
  created_at: string | null
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
          "nama_lengkap,email,no_telepon,asal_institusi,status_akademika,created_at"
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
    <main className="mx-auto w-full max-w-6xl px-6 py-12 sm:px-8">
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

      <div className="grid gap-8 lg:grid-cols-[1fr_2fr] items-start">

        {/* LEFT COLUMN: Profile Info */}
        <div className="space-y-6 lg:sticky lg:top-8">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex flex-col items-center text-center space-y-4 mb-8">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted border border-border">
                <UserRound className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-lg text-foreground">Account Details</h2>
                <p className="text-sm text-muted-foreground mt-1 truncate max-w-[200px]">{user.email}</p>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div className="overflow-hidden">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Email</p>
                  <p className="font-medium truncate mt-0.5">{user.email ?? "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Role</p>
                  <p className="font-medium mt-0.5">{adminUser ? "Administrator" : "Participant"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Joined</p>
                  <p className="font-medium mt-0.5">{formatDate(user.created_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Registrations */}
        <div className="space-y-6">

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
                <span className="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground">
                  <CheckCircle2 className="w-3 h-3 mr-1.5 text-muted-foreground" /> Active
                </span>
              )}
            </div>

            <div className="p-6">
              {latestRegistration ? (
                <div className="grid gap-5 text-sm sm:grid-cols-2">
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
    </main>
  )
}
