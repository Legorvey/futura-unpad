import { redirect } from "next/navigation"
import { CalendarDays, Mail, UserRound, AtSign } from "lucide-react"

import { getCachedAuth } from "@/lib/auth"
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

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
})

const formatDate = (value?: string | null) => {
  if (!value) {
    return "-"
  }

  return dateFormatter.format(new Date(value))
}

export default async function AccountPage() {
  const { user, adminAccess } = await getCachedAuth()

  if (!user) {
    redirect("/login?next=/profile/account")
  }

  if (adminAccess) {
    redirect("/admin/profile")
  }

  const initials = getInitials(user.user_metadata?.display_name || user.user_metadata?.username, user.email)

  return (
    <div className="mx-auto w-full max-w-4xl">

      <div className="rounded-xl border border-border bg-card overflow-hidden max-w-4xl shadow-sm">
        {/* Banner Area */}
        <div className="h-32 w-full bg-gradient-to-r from-neutral-200 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 relative">
          <div className="absolute right-4 top-4">
            <EditProfileDialog
              initialDisplayName={user.user_metadata?.display_name || ""}
              initialUsername={user.user_metadata?.username || ""}
              initialEmail={user.email || ""}
              className="bg-background/80 backdrop-blur-sm hover:bg-background border-border shadow-sm"
            />
          </div>
        </div>

        {/* Profile Info Area */}
        <div className="px-6 sm:px-10 pb-10">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-background border-4 border-card text-3xl font-semibold text-foreground shadow-sm">
              {initials}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              {user.user_metadata?.display_name || user.user_metadata?.username || user.email?.split("@")[0] || "User"}
            </h2>
            <p className="text-muted-foreground">{user.email}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <Mail className="h-4 w-4" />
                Email Address
              </div>
              <p className="text-base text-foreground font-medium">{user.email ?? "-"}</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <UserRound className="h-4 w-4" />
                Display Name
              </div>
              <p className="text-base text-foreground font-medium">
                {user.user_metadata?.display_name || "-"}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <AtSign className="h-4 w-4" />
                Username
              </div>
              <p className="text-base text-foreground font-medium">
                {user.user_metadata?.username ? `@${user.user_metadata.username}` : "-"}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <CalendarDays className="h-4 w-4" />
                Member Since
              </div>
              <p className="text-base text-foreground font-medium">{formatDate(user.created_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
