import type { Metadata } from "next"
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

export const metadata: Metadata = {
  title: "Pengaturan Akun"
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
    <div className="mx-auto w-full max-w-5xl">

      <section className="relative rounded-3xl border border-white/10 bg-white/[0.02] p-[18px] sm:p-8 transition-colors hover:bg-white/[0.04]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 border-b border-white/10 pb-8">
          <div className="flex items-center gap-6">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white/[0.08] backdrop-blur-md border border-white/10 text-3xl font-medium text-white shadow-xl">
              {initials}
            </div>
            <div>
              <h2 className="text-3xl font-medium tracking-tight text-white mb-1">
                {user.user_metadata?.display_name || user.user_metadata?.username || user.email?.split("@")[0] || "User"}
              </h2>
              <p className="text-base tracking-tight text-white/50">{user.email}</p>
            </div>
          </div>
          <div>
            <EditProfileDialog
              initialDisplayName={user.user_metadata?.display_name || ""}
              initialUsername={user.user_metadata?.username || ""}
              initialEmail={user.email || ""}
              className="bg-white/[0.05] border-white/10 text-white hover:bg-white/[0.1] rounded-xl px-6 h-11"
            />
          </div>
        </div>

        <div className="px-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium tracking-tight text-white/40 mb-2">
                <Mail className="h-4 w-4" />
                Alamat Email
              </div>
              <div className="flex items-center gap-3">
                <p className="text-lg tracking-tight font-medium text-white">{user.email ?? "-"}</p>
                {user.email_confirmed_at && (
                  <span className="inline-flex items-center rounded-xl bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 text-xs font-medium tracking-tight text-green-400">
                    Terverifikasi
                  </span>
                )}
              </div>
              {user.new_email && (
                <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1.5 font-medium tracking-tight">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                  </span>
                  Menunggu verifikasi untuk: {user.new_email}
                </p>
              )}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium tracking-tight text-white/40 mb-2">
                <UserRound className="h-4 w-4" />
                Nama Tampilan
              </div>
              <p className="text-lg tracking-tight font-medium text-white">
                {user.user_metadata?.display_name || "-"}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium tracking-tight text-white/40 mb-2">
                <AtSign className="h-4 w-4" />
                Username
              </div>
              <p className="text-lg tracking-tight font-medium text-white">
                {user.user_metadata?.username ? `@${user.user_metadata.username}` : "-"}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium tracking-tight text-white/40 mb-2">
                <CalendarDays className="h-4 w-4" />
                Terdaftar Sejak
              </div>
              <p className="text-lg tracking-tight font-medium text-white">{formatDate(user.created_at)}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
