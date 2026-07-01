"use client"

import Link from "next/link"
import React, { forwardRef, useMemo, useState } from "react"
import {
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  LogOutIcon,
  ReceiptText,
  ShieldCheck,
  User,
} from "lucide-react"

import { type AuthUser, useAuth } from "@/components/auth-provider"
import ConfirmDialog from "@/components/confirm-dialog"
import { Button } from "@/components/ui/button"

function getInitials(user: AuthUser) {
  const displayName = (user.user_metadata?.display_name || user.user_metadata?.username || user.email?.split("@")[0]) ?? "U"
  const parts = displayName
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)

  if (parts.length === 0) {
    return "U"
  }

  return parts
    .slice(0, 2)
    .map((part: string) => part[0]?.toUpperCase())
    .join("")
}

export const UserProfileButton = forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<"button">>((props, ref) => {
  const { user } = useAuth()
  const initials = useMemo(() => (user ? getInitials(user) : "U"), [user])

  if (!user) {
    return null
  }

  return (
    <Button
      variant="ghost"
      className="h-10 rounded-full px-2 py-1.5"
      aria-haspopup="menu"
      aria-label="Open profile dashboard"
      ref={ref}
      {...props}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-foreground">
        {initials}
      </span>
      <span className="hidden max-w-36 truncate text-sm font-medium text-muted-foreground lg:block">
        {user.user_metadata?.display_name || user.user_metadata?.username || user.email?.split("@")[0] || user.email}
      </span>
    </Button>
  )
})
UserProfileButton.displayName = "UserProfileButton"

export function UserProfileDropdown({ onClose }: { onClose?: () => void }) {
  const { user, isAdmin, signOut } = useAuth()
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
  }

  return (
    <>
      <div className="w-full flex flex-col gap-1 p-2">
        <div className="px-3 py-2">
          <div className="flex items-center gap-3 md:flex-row-reverse flex-row md:text-right">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-sm font-semibold text-foreground">
              {initials}
            </span>
            <div className="min-w-0 flex-1 text-left md:text-right">
              <p className="truncate text-sm font-semibold text-foreground">
                {user.user_metadata?.display_name || user.user_metadata?.username || user.email?.split("@")[0] || "Futura account"}
              </p>
              <p className="truncate text-xs font-normal text-muted-foreground">
                {user.user_metadata?.username ? `@${user.user_metadata.username}` : user.email}
              </p>
            </div>
          </div>
        </div>

        <div className="-mx-1 my-1 h-px bg-border/50" />

        <div className="space-y-1">
          <ProfileMenuLink href="/profile" onClick={onClose}>
            <User className="h-4 w-4" />
            View profile
          </ProfileMenuLink>
          <ProfileMenuLink href="/profile" onClick={onClose}>
            <ReceiptText className="h-4 w-4" />
            View registrations
          </ProfileMenuLink>
          <ProfileMenuLink href="/registration" onClick={onClose}>
            <CreditCard className="h-4 w-4" />
            Register for events
          </ProfileMenuLink>
        </div>

        <div className="-mx-1 my-1 h-px bg-border/50" />

        <div className="space-y-1">
          {isAdmin ? (
            <ProfileMenuLink href="/admin" onClick={onClose}>
              <LayoutDashboard className="h-4 w-4" />
              Admin dashboard
            </ProfileMenuLink>
          ) : null}
          <ProfileMenuLink href="/forgot-password" onClick={onClose}>
            <ShieldCheck className="h-4 w-4" />
            Account recovery
          </ProfileMenuLink>
          <ProfileMenuLink href="/#details" onClick={onClose}>
            <HelpCircle className="h-4 w-4" />
            Seminar details
          </ProfileMenuLink>
        </div>

        <div className="-mx-1 my-1 h-px bg-border/50" />

        <button
          type="button"
          role="menuitem"
          className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-destructive outline-none transition-colors hover:bg-destructive/10 focus:bg-destructive/10 flex-row md:flex-row-reverse text-left md:text-right"
          onClick={() => setLogoutOpen(true)}
        >
          <LogOutIcon className="h-4 w-4" />
          <span>Log out</span>
        </button>
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
  onClick,
  children,
}: {
  href: string
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      role="menuitem"
      className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex-row md:flex-row-reverse text-left md:text-right"
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type !== 'span') {
          return child;
        }
        return <span className="flex-1">{child}</span>;
      })}
    </Link>
  )
}
