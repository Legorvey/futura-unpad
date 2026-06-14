"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import {
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  LogOutIcon,
  ReceiptText,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react"

import { type AuthUser, useAuth } from "@/components/auth-provider"
import ConfirmDialog from "@/components/confirm-dialog"
import { Button } from "@/components/ui/button"

function getInitials(user: AuthUser) {
  const emailName = user.email?.split("@")[0] ?? "U"
  const parts = emailName
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)

  if (parts.length === 0) {
    return "U"
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export default function UserProfileMenu() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAdmin, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const initials = useMemo(() => (user ? getInitials(user) : "U"), [user])

  if (!user) {
    return null
  }

  const logout = async () => {
    setIsLoggingOut(true)
    const { error } = await signOut()

    if (error) {
      console.error(error)
      setIsLoggingOut(false)
      throw new Error("Logout failed. Please try again.")
    }

    setIsLoggingOut(false)
    setOpen(false)

    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/seminar-list") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/transactions")
    ) {
      router.replace("/login")
      return
    }

    router.refresh()
  }

  return (
    <>
      <div
        className="relative"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false)
          }
        }}
      >
        <Button
          asChild
          variant="ghost"
          className="h-10 rounded-full px-2 py-1.5"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label="Open profile dashboard"
        >
          <Link href="/profile">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-foreground">
              {initials}
            </span>
            <span className="hidden max-w-36 truncate text-sm font-medium text-muted-foreground lg:block">
              {user.email}
            </span>
          </Link>
        </Button>

        {open ? (
          <div className="absolute right-0 top-full z-50 w-80 pt-2">
            <div
              role="menu"
              className="overflow-hidden rounded-xl bg-popover p-2 text-popover-foreground shadow-lg ring-1 ring-foreground/10"
            >
              <div className="px-3 py-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted text-sm font-semibold text-foreground">
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      Futura account
                    </p>
                    <p className="truncate text-xs font-normal text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="-mx-1 my-1 h-px bg-border" />

              <div className="space-y-1">
                <ProfileMenuLink href="/profile" onSelect={() => setOpen(false)}>
                  <User className="h-4 w-4" />
                  View profile
                </ProfileMenuLink>
                <ProfileMenuLink href="/transactions" onSelect={() => setOpen(false)}>
                  <ReceiptText className="h-4 w-4" />
                  Seminar transactions
                </ProfileMenuLink>
                <ProfileMenuLink href="/registration" onSelect={() => setOpen(false)}>
                  <CreditCard className="h-4 w-4" />
                  Register another seminar
                </ProfileMenuLink>
              </div>

              <div className="-mx-1 my-1 h-px bg-border" />

              <div className="space-y-1">
                {isAdmin ? (
                  <ProfileMenuLink href="/admin" onSelect={() => setOpen(false)}>
                    <LayoutDashboard className="h-4 w-4" />
                    Admin dashboard
                  </ProfileMenuLink>
                ) : null}
                <ProfileMenuLink href="/reset-password" onSelect={() => setOpen(false)}>
                  <ShieldCheck className="h-4 w-4" />
                  Password & security
                </ProfileMenuLink>
                <ProfileMenuLink href="/forgot-password" onSelect={() => setOpen(false)}>
                  <Settings className="h-4 w-4" />
                  Account recovery
                </ProfileMenuLink>
                <ProfileMenuLink href="/#details" onSelect={() => setOpen(false)}>
                  <HelpCircle className="h-4 w-4" />
                  Seminar details
                </ProfileMenuLink>
              </div>

              <div className="-mx-1 my-1 h-px bg-border" />

              <button
                type="button"
                role="menuitem"
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-destructive outline-none transition-colors hover:bg-destructive/10 focus:bg-destructive/10"
                onClick={() => {
                  setOpen(false)
                  setLogoutOpen(true)
                }}
              >
                <LogOutIcon className="h-4 w-4" />
                Log out
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title={isAdmin ? "Log out of admin?" : "Log out?"}
        description={
          isAdmin
            ? "You will need to sign in again to manage registrations and view the admin dashboard."
            : "You will need to sign in to your Futura account again."
        }
        confirmText="Log out"
        cancelText="Stay signed in"
        variant="destructive"
        isLoading={isLoggingOut}
        onConfirm={logout}
      />
    </>
  )
}

function ProfileMenuLink({
  href,
  children,
  onSelect,
}: {
  href: string
  children: React.ReactNode
  onSelect: () => void
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
      onClick={onSelect}
    >
      {children}
    </Link>
  )
}
