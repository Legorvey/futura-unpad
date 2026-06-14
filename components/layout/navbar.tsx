"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import Link from "next/link"
import { LogOutIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import ConfirmDialog from "@/components/confirm-dialog"

export default function Navbar() {
    const router = useRouter()
    const pathname = usePathname()
    const { user, isAdmin, signOut } = useAuth()
    const [logoutOpen, setLogoutOpen] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const logoutDialog = isAdmin
        ? {
            title: "Log out of admin?",
            description:
                "You will need to sign in again to manage registrations and view the admin dashboard.",
        }
        : {
            title: "Log out?",
            description: "You will need to sign in to your Futura account again.",
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

        if (pathname.startsWith("/admin") || pathname.startsWith("/seminar-list")) {
            router.replace("/login")
            return
        }
    }

    return (
        <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-6 py-3 sm:px-8">
            <div className="flex items-center gap-8">
                {isAdmin ? (
                    <Link href="/" className="flex items-center gap-2 text-base font-semibold tracking-tight">
                        Admin Futura
                    </Link>
                ) : (
                    <Link href="/" className="flex items-center gap-2 text-base font-semibold tracking-tight">
                        Futura
                    </Link>
                )}

                <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
                    <Link href="/#details" className="transition hover:text-foreground">
                        Details
                    </Link>
                    <Link href="/registration" className="transition hover:text-foreground">
                        Registration
                    </Link>
                </nav>
            </div>

            {user ? (
                <div className="flex min-w-0 items-center gap-3">
                    <p className="hidden truncate text-sm text-muted-foreground sm:block">
                        Welcome, {user.email}
                    </p>

                    {isAdmin && (
                        <Link
                            href="/admin"
                            className=""
                        >
                            <Button>Admin Dashboard</Button>
                        </Link>
                    )}

                    <Button
                        onClick={() => setLogoutOpen(true)}
                        variant="destructive"
                        size="sm"
                        disabled={isLoggingOut}
                    >
                        <span className="sr-only">Log out</span>
                        <LogOutIcon />
                    </Button>
                    <ConfirmDialog
                        open={logoutOpen}
                        onOpenChange={setLogoutOpen}
                        title={logoutDialog.title}
                        description={logoutDialog.description}
                        confirmText="Log out"
                        cancelText="Stay signed in"
                        variant="destructive"
                        isLoading={isLoggingOut}
                        onConfirm={logout}
                    />
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <Link
                        href="/login"
                        className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                    >
                        Log in
                    </Link>
                    <Button
                        asChild
                        size="sm"
                    >
                        <Link href="/register">Register</Link>
                    </Button>
                </div>
            )}
            </div>
        </header>
    )
}
