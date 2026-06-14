"use client"

import { Button } from "../ui/button"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import UserProfileMenu from "@/components/user-profile-menu"

export default function Navbar() {
    const { user, isAdmin } = useAuth()

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
                    {isAdmin && (
                        <Link
                            href="/admin"
                            className=""
                        >
                            <Button>Admin Dashboard</Button>
                        </Link>
                    )}

                    <UserProfileMenu />
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
