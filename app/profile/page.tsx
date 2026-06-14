import Link from "next/link"
import { redirect } from "next/navigation"
import { CalendarDays, Mail, ShieldCheck, Ticket, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  attendanceLabels,
  formatCurrency,
  isAcademicStatus,
  isAttendanceMethod,
  isPaymentStatus,
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
  presentasi_riset: unknown
  payment_status: string | null
  payment_amount: number | null
  xendit_external_id: string
  created_at: string | null
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
  const [{ data: adminUser }, { data: latestRegistration, error }] =
    await Promise.all([
      supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle(),
      adminSupabase
        .from("seminar_registrations")
        .select(
          "nama_lengkap,email,no_telepon,asal_institusi,status_akademika,presentasi_riset,payment_status,payment_amount,xendit_external_id,created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle<ProfileRegistration>(),
    ])

  if (error) {
    throw new Error(error.message)
  }

  const paymentStatus = isPaymentStatus(latestRegistration?.payment_status)
    ? latestRegistration.payment_status
    : "unpaid"
  const academicStatus = isAcademicStatus(latestRegistration?.status_akademika)
    ? latestRegistration.status_akademika
    : null
  const attendanceMethod = isAttendanceMethod(latestRegistration?.presentasi_riset)
    ? latestRegistration.presentasi_riset
    : null

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-6 py-12 sm:px-8">
      <section className="flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Profile</p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance">
            Your Futura account
          </h1>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Review your account details and your latest seminar registration.
          </p>
        </div>
        <Button asChild className="h-10 rounded-xl">
          <Link href="/transactions">View transactions</Link>
        </Button>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <UserRound className="h-5 w-5 text-muted-foreground" />
            </span>
            <div className="min-w-0">
              <h2 className="font-semibold">Account details</h2>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="break-all font-medium">{user.email ?? "-"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Role</p>
                <p className="font-medium">{adminUser ? "Admin" : "Participant"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Account created</p>
                <p className="font-medium">{formatDate(user.created_at)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Ticket className="h-5 w-5 text-muted-foreground" />
            </span>
            <div>
              <h2 className="font-semibold">Latest seminar registration</h2>
              <p className="text-sm text-muted-foreground">
                {latestRegistration
                  ? `Created ${formatDate(latestRegistration.created_at)}`
                  : "No linked registration yet."}
              </p>
            </div>
          </div>

          {latestRegistration ? (
            <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">{latestRegistration.nama_lengkap}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{latestRegistration.no_telepon}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Institution</p>
                <p className="font-medium">{latestRegistration.asal_institusi}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Payment</p>
                <p className="font-medium">{paymentStatusLabels[paymentStatus]}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Ticket</p>
                <p className="font-medium">
                  {academicStatus ? statusLabels[academicStatus] : "-"} /{" "}
                  {attendanceMethod ? attendanceLabels[attendanceMethod] : "-"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-medium">
                  {formatCurrency(latestRegistration.payment_amount ?? 0)}
                </p>
              </div>
              <div className="sm:col-span-2">
                <Button asChild variant="outline" className="h-10 rounded-xl">
                  <Link
                    href={`/payment?order_id=${encodeURIComponent(
                      latestRegistration.xendit_external_id
                    )}`}
                  >
                    Open payment details
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
              You have not registered for a seminar while signed in yet.
              <Button asChild className="mt-4 h-10 rounded-xl">
                <Link href="/registration">Register now</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
