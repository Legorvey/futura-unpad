import { redirect } from "next/navigation"
import { CalendarDays, Mail, UserRound } from "lucide-react"

import { createClient } from "@/utils/supabase/server"
import { EditProfileDialog } from "@/components/edit-profile-dialog"

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

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/profile/account")
  }

  const initials = getInitials(user.user_metadata?.display_name, user.email)

  return (
    <div className="mx-auto w-full max-w-3xl">
      <section className="flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Account Details
          </h1>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Manage your personal profile information and settings.
          </p>
        </div>
      </section>

      <div className="relative rounded-xl border border-border bg-card p-6 sm:p-10">
        <EditProfileDialog
          initialDisplayName={user.user_metadata?.display_name || user.email?.split("@")[0] || ""}
          initialEmail={user.email || ""}
        />
        <div className="flex flex-col items-center text-center space-y-4 mb-10">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted border border-border text-3xl font-semibold text-foreground">
            {initials}
          </div>
          <div>
            <h2 className="font-semibold text-xl text-foreground">Profile Details</h2>
            <p className="text-sm text-muted-foreground mt-1 truncate">{user.email}</p>
          </div>
        </div>

        <div className="space-y-6 text-sm max-w-sm mx-auto">
          <div className="flex items-center gap-4">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div className="overflow-hidden">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Email</p>
              <p className="font-medium truncate mt-0.5 text-base">{user.email ?? "-"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <UserRound className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Display Name</p>
              <p className="font-medium mt-0.5 text-base">{user.user_metadata?.display_name || user.email?.split("@")[0] || "-"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Joined</p>
              <p className="font-medium mt-0.5 text-base">{formatDate(user.created_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
