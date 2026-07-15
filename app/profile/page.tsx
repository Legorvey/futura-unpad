export const runtime = 'edge';
import Link from "next/link"
import { redirect } from "next/navigation"
import { Ticket, Bot, BookOpen, CheckCircle2, Clock, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ReceiptDownloadButton, type ReceiptData } from "@/components/registration/mechatura-invoice"
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
import { QRCodeSVG } from "qrcode.react"
import { TicketDownloadButton, type DownloadRegistrationData } from "./ticket-download-button"
import { MechaturaTicketDownloadButton } from "@/components/registration/mechatura-ticket-download-button"

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

const isProfileGroupRegistration = (registration: ProfileRegistration | null | undefined) =>
  registration?.registration_type === "group" || registration?.registration_type === "grup"

export default async function ProfilePage() {
  const { user, isAdmin } = await getCachedAuth()

  if (!user) {
    redirect("/login?next=/profile")
  }

  if (isAdmin) {
    redirect("/admin/profile")
  }

  const adminSupabase = createAdminClient()
  const [
    { data: latestRegistration, error },
    { data: latestMechaturaRegistration, error: mechaturaError },
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
        .from("mechatura_registrations")
        .select(
          "id,team_name,institution,competition_type,robot_name,registration_status,payment_status,payment_amount,midtrans_order_id,created_at,paid_at"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle<ProfileMechaturaRegistration>(),
    ])

  if (error || mechaturaError) {
    throw new Error(error?.message ?? mechaturaError?.message)
  }

  const mechaturaMembersPromise = latestMechaturaRegistration
    ? adminSupabase
      .from("mechatura_members")
      .select("full_name,email,phone,is_leader")
      .eq("registration_id", latestMechaturaRegistration.id)
      .order("is_leader", { ascending: false })
    : Promise.resolve({ data: [], error: null })

  const groupMembersPromise = isProfileGroupRegistration(latestRegistration) && latestRegistration?.group_id
    ? adminSupabase
      .from("seminar_registrations")
      .select("id,nama_lengkap,email,no_telepon,asal_institusi,status_akademika,registration_type,group_name,attended")
      .eq("group_id", latestRegistration.group_id)
      .eq("is_main_contact", false)
      .order("created_at", { ascending: true })
      .order("nama_lengkap", { ascending: true })
    : Promise.resolve({ data: [], error: null })

  const [
    { data: mechaturaMembersRaw, error: mechaturaMembersError },
    { data: membersData, error: membersError },
  ] = await Promise.all([mechaturaMembersPromise, groupMembersPromise])

  if (mechaturaMembersError || membersError) {
    throw new Error(mechaturaMembersError?.message ?? membersError?.message)
  }

  const mechaturaMembers = mechaturaMembersRaw || [];
  const mechaturaLeader = mechaturaMembers.find(m => m.is_leader);

  const groupMembers = (membersData ?? []) as DownloadRegistrationData[]
  const totalParticipants = latestRegistration ? 1 + groupMembers.length : 0
  const checkedInCount = latestRegistration ? (latestRegistration.attended ? 1 : 0) + groupMembers.filter(m => m.attended).length : 0

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
  const isMechaturaPaymentComplete = isCompletedPaymentStatus(
    mechaturaPaymentStatus
  )
  const mechaturaTicketLabel =
    latestMechaturaRegistration && mechaturaCompetition
      ? `${mechaturaCompetitionLabels[mechaturaCompetition]} - ${latestMechaturaRegistration.robot_name}`
      : latestMechaturaRegistration?.robot_name ?? "-"
  const mechaturaReceipt: ReceiptData | null =
    latestMechaturaRegistration && isMechaturaPaymentComplete
      ? {
        title: "Mechatura Event Registration",
        name: `${latestMechaturaRegistration.team_name} / ${mechaturaLeader?.full_name ?? "Team Leader"}`,
        email: mechaturaLeader?.email ?? user.email ?? "-",
        phone: mechaturaLeader?.phone ?? "-",
        institution: latestMechaturaRegistration.institution ?? "-",
        program: "Mechatura Robotics Competition",
        ticket: mechaturaTicketLabel,
        amount: formatCurrency(latestMechaturaRegistration.payment_amount ?? 0),
        paidAt: latestMechaturaRegistration.paid_at
          ? new Date(latestMechaturaRegistration.paid_at).toLocaleString("id-ID")
          : "-",
        invoiceId: latestMechaturaRegistration.midtrans_order_id,
        referenceId: latestMechaturaRegistration.midtrans_order_id,
        mechaturaDetails: {
          teamName: latestMechaturaRegistration.team_name || "-",
          robotName: latestMechaturaRegistration.robot_name || "-",
          competitionType: mechaturaCompetition ? mechaturaCompetitionLabels[mechaturaCompetition] : "-",
          members: mechaturaMembers.map(m => ({
            name: m.full_name || "-",
            email: m.email || "-",
            phone: m.phone || "-"
          }))
        }
      }
      : null

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="space-y-6">

        {/* SEMINAR CARD */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 pr-6">
              <div className="bg-background border border-border p-2 rounded-lg">
                <Ticket className="h-4 w-4 text-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">National Seminar</h2>
                <p className="text-xs text-muted-foreground">
                  {latestRegistration ? `Registered on ${formatDate(latestRegistration.created_at)}` : "No active registration"}
                </p>
              </div>
            </div>
            {latestRegistration && (
              <>
                <div className="flex lg:hidden gap-2">
                  <span className={`inline-flex items-center rounded-md border border-border p-2 text-xs font-semibold ${checkedInCount > 0 ? 'bg-background text-foreground' : 'bg-muted/30 text-muted-foreground'}`}>
                    {checkedInCount > 0 ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
                  </span>
                </div>
                <div className="hidden lg:flex gap-2">
                  <span className={`inline-flex items-center rounded-md border border-border py-2 px-3 text-xs font-semibold ${checkedInCount > 0 ? 'bg-background text-foreground' : 'bg-muted/30 text-muted-foreground'}`}>
                    {checkedInCount > 0 ? <CheckCircle2 className="w-4 h-4 mr-1.5 text-green-500" /> : <Clock className="w-4 h-4 mr-1.5 text-muted-foreground" />}
                    {latestRegistration.registration_type === "group" ? `${checkedInCount}/${totalParticipants} Checked In` : (latestRegistration.attended ? "Checked In" : "Waiting to Check In")}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="p-6">
            {latestRegistration ? (
              <>
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="grid gap-5 text-sm sm:grid-cols-2 flex-grow">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Participant Name</p>
                      <p className="font-medium text-foreground">{latestRegistration.nama_lengkap}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Institution</p>
                      <p className="font-medium text-foreground">{latestRegistration.asal_institusi}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Phone Number</p>
                      <p className="font-medium text-foreground">{latestRegistration.no_telepon}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Status / Fee</p>
                      <p className="font-medium text-foreground">
                        {academicStatus ? statusLabels[academicStatus] : "-"} <span className="text-muted-foreground font-normal ml-1">(Free)</span>
                      </p>
                    </div>
                  </div>
                  {latestRegistration.registration_type !== "group" && (
                    <div className="flex flex-col items-center justify-center self-start shrink-0 p-4 bg-background rounded-xl border border-border">
                      <div className="rounded-[8px] bg-white border border-border p-2">
                        <QRCodeSVG value={latestRegistration.id} size={120} />
                      </div>
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
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">You have not registered for the National Seminar yet.</p>
                <Button asChild className="h-10 rounded-xl">
                  <Link href="/seminar-nasional/form" prefetch={true}>Register for Seminar</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* MECHATURA CARD */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-background border border-border p-2 rounded-lg">
                <Bot className="h-4 w-4 text-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Mechatura Competition</h2>
                <p className="text-xs text-muted-foreground">
                  {latestMechaturaRegistration ? `Registered on ${formatDate(latestMechaturaRegistration.created_at)}` : "No active registration"}
                </p>
              </div>
            </div>
            {latestMechaturaRegistration && (
              <>
                <div className="flex lg:hidden gap-2">
                  <span className={`inline-flex items-center rounded-md border border-border p-2 text-xs font-semibold ${isMechaturaPaymentComplete ? 'bg-background text-foreground' : 'bg-muted/30 text-muted-foreground'}`}>
                    {isMechaturaPaymentComplete ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
                  </span>
                </div>
                <div className="hidden lg:flex gap-2">
                  <span className={`inline-flex items-center rounded-md border border-border py-2 px-3 text-xs font-semibold ${isMechaturaPaymentComplete ? 'bg-background text-foreground' : 'bg-muted/30 text-muted-foreground'}`}>
                    {isMechaturaPaymentComplete ? <CheckCircle2 className="w-4 h-4 mr-1.5 text-green-500" /> : <Clock className="w-4 h-4 mr-1.5 text-muted-foreground" />}
                    {paymentStatusLabels[mechaturaPaymentStatus]}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="p-6">
            {latestMechaturaRegistration ? (
              <>
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="grid gap-5 text-sm sm:grid-cols-2 flex-grow">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Team Name</p>
                      <p className="font-medium text-foreground">{latestMechaturaRegistration.team_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Category</p>
                      <p className="font-medium text-foreground">
                        {mechaturaCompetition ? mechaturaCompetitionLabels[mechaturaCompetition] : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Robot Name</p>
                      <p className="font-medium text-foreground">{latestMechaturaRegistration.robot_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Team Leader</p>
                      <p className="font-medium text-foreground">{mechaturaLeader?.full_name ?? "-"}</p>
                    </div>
                  </div>

                  {isMechaturaPaymentComplete && (
                    <div className="flex flex-col items-center justify-center self-start shrink-0 p-4 bg-background rounded-xl border border-border">
                      <div className="rounded-[8px] bg-white border border-border p-2">
                        <QRCodeSVG value={`mechatura:${latestMechaturaRegistration.id}`} size={120} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-3 uppercase font-semibold tracking-wider">Ticket QR</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  {mechaturaReceipt ? (
                    <ReceiptDownloadButton
                      receipt={mechaturaReceipt}
                      variant="outline"
                      className="w-full sm:flex-1 shrink-0 bg-background hover:bg-muted/50"
                    >
                      Save Invoice
                    </ReceiptDownloadButton>
                  ) : (
                    <Button asChild variant="outline" className="w-full sm:w-auto shrink-0 bg-background hover:bg-muted/50">
                      <Link href={`/payment?order_id=${encodeURIComponent(latestMechaturaRegistration.midtrans_order_id)}`}>
                        Open Payment Details <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  )}
                  {isMechaturaPaymentComplete && (
                    <MechaturaTicketDownloadButton
                      registrationId={latestMechaturaRegistration.id}
                      teamName={latestMechaturaRegistration.team_name}
                      institution={latestMechaturaRegistration.institution || "-"}
                      competitionType={mechaturaCompetition}
                      robotName={latestMechaturaRegistration.robot_name}
                      leaderName={mechaturaLeader?.full_name ?? "Leader"}
                      className="w-full sm:flex-1 shrink-0"
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">You have not formed a team for the Mechatura Robotics Competition yet.</p>
                <Button asChild className="h-10 rounded-xl">
                  <Link href="/mechatura/form" prefetch={true}>Register Team</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* LOMBA KTI CARD (UI ONLY) */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-background border border-border p-2 rounded-lg">
                <BookOpen className="h-4 w-4 text-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Lomba KTI</h2>
                <p className="text-xs text-muted-foreground">
                  Scientific Paper Competition
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">No active Lomba KTI registration found for this account.</p>
              <Button asChild className="h-10 rounded-xl">
                <Link href="/lomba-essay/form" prefetch={true}>Register for Lomba KTI</Link>
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
