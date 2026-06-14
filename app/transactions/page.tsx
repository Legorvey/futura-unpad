import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowUpRight, ReceiptText } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  attendanceLabels,
  formatCurrency,
  isAcademicStatus,
  isAttendanceMethod,
  isPaymentStatus,
  paymentStatusLabels,
  statusLabels,
  type PaymentStatus,
} from "@/lib/payment"
import { createAdminClient } from "@/lib/supabase-admin"
import { createClient } from "@/utils/supabase/server"

type Transaction = {
  id: string
  nama_lengkap: string
  status_akademika: unknown
  presentasi_riset: unknown
  payment_status: string | null
  payment_amount: number | null
  paid_at: string | null
  xendit_external_id: string
  created_at: string | null
}

const statusClassName: Record<PaymentStatus, string> = {
  unpaid: "border-zinc-200 bg-zinc-50 text-zinc-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  failed: "border-red-200 bg-red-50 text-red-700",
  expired: "border-slate-200 bg-slate-50 text-slate-700",
  cancelled: "border-neutral-200 bg-neutral-50 text-neutral-700",
  settled: "border-blue-200 bg-blue-50 text-blue-700",
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

export default async function TransactionsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/transactions")
  }

  const adminSupabase = createAdminClient()
  const { data, error } = await adminSupabase
    .from("seminar_registrations")
    .select(
      "id,nama_lengkap,status_akademika,presentasi_riset,payment_status,payment_amount,paid_at,xendit_external_id,created_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<Transaction[]>()

  if (error) {
    throw new Error(error.message)
  }

  const transactions = data ?? []

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-12 sm:px-8">
      <section className="flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Transactions
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance">
            Your seminar transactions
          </h1>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Track registrations, payment status, receipts, and pending seminar
            payments for your account.
          </p>
        </div>
        <Button asChild className="h-10 rounded-xl">
          <Link href="/registration">Register another seminar</Link>
        </Button>
      </section>

      {transactions.length === 0 ? (
        <section className="rounded-xl border border-dashed border-border p-8 text-center">
          <ReceiptText className="mx-auto h-8 w-8 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">No transactions yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Registrations made while signed in will appear here. Guest
            registrations are not automatically linked to your account.
          </p>
          <Button asChild className="mt-6 h-10 rounded-xl">
            <Link href="/registration">Start registration</Link>
          </Button>
        </section>
      ) : (
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="hidden grid-cols-[1.1fr_1fr_120px_160px_120px] gap-4 border-b border-border px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground lg:grid">
            <span>Seminar</span>
            <span>Ticket</span>
            <span>Amount</span>
            <span>Status</span>
            <span className="text-right">Action</span>
          </div>

          <div className="divide-y divide-border">
            {transactions.map((transaction) => {
              const status = isPaymentStatus(transaction.payment_status)
                ? transaction.payment_status
                : "unpaid"
              const academicStatus = isAcademicStatus(transaction.status_akademika)
                ? transaction.status_akademika
                : null
              const attendanceMethod = isAttendanceMethod(
                transaction.presentasi_riset
              )
                ? transaction.presentasi_riset
                : null
              const isPaid = status === "paid" || status === "settled"
              const actionHref = isPaid
                ? `/payment/success?order_id=${encodeURIComponent(
                    transaction.xendit_external_id
                  )}`
                : `/payment?order_id=${encodeURIComponent(
                    transaction.xendit_external_id
                  )}`

              return (
                <article
                  key={transaction.id}
                  className="grid gap-4 px-5 py-5 lg:grid-cols-[1.1fr_1fr_120px_160px_120px] lg:items-center"
                >
                  <div>
                    <h2 className="font-medium">Futura Seminar Registration</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {transaction.nama_lengkap} - Created{" "}
                      {formatDate(transaction.created_at)}
                    </p>
                    {transaction.paid_at ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Paid {formatDate(transaction.paid_at)}
                      </p>
                    ) : null}
                  </div>

                  <div className="text-sm">
                    <p className="font-medium">
                      {academicStatus ? statusLabels[academicStatus] : "-"}
                    </p>
                    <p className="text-muted-foreground">
                      {attendanceMethod ? attendanceLabels[attendanceMethod] : "-"}
                    </p>
                  </div>

                  <p className="text-sm font-medium">
                    {formatCurrency(transaction.payment_amount ?? 0)}
                  </p>

                  <span
                    className={`w-fit rounded-full border px-2.5 py-1 text-xs font-medium ${statusClassName[status]}`}
                  >
                    {paymentStatusLabels[status]}
                  </span>

                  <div className="lg:text-right">
                    <Button
                      asChild
                      variant={isPaid ? "outline" : "default"}
                      className="h-9 rounded-xl"
                    >
                      <Link href={actionHref}>
                        {isPaid ? "Receipt" : "Pay"}
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}
    </main>
  )
}
