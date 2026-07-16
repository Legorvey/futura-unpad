/* eslint-disable */
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Users, Trophy, Cpu, LogOut, ArrowLeft } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useSidebarStore } from "./use-sidebar-store"
import ConfirmDialog from "@/components/confirm-dialog"

const getInitials = (name?: string | null, email?: string | null) => {
    const str = name || email?.split("@")[0] || "U"
    return str.substring(0, 2).toUpperCase()
}

export function Sidebar() {
    const { isMobileOpen, setIsMobileOpen } = useSidebarStore()
    const { user, adminAccess, isLoading, signOut } = useAuth()
    const pathname = usePathname()
    const router = useRouter()
    const sidebarRef = useRef<HTMLDivElement>(null)
    const [logoutOpen, setLogoutOpen] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleLogout = async () => {
        setIsLoggingOut(true)
        const { error } = await signOut()

        if (error) {
            console.error(error)
            setIsLoggingOut(false)
            return
        }
        setIsLoggingOut(false)
        setLogoutOpen(false)
        
        if (pathname.startsWith("/admin")) {
            router.replace("/login")
        }
    }


    const navItems = [
        ...(adminAccess ? [
            { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
            { href: "/admin/seminar", label: "Seminar", icon: Users },
            { href: "/admin/lomba-essay", label: "Lomba Essay", icon: Trophy },
            { href: "/admin/mechatura", label: "Mechatura", icon: Cpu },
        ] : []),
        ...(!adminAccess ? [
            { href: "/profile", label: "Your Profile", icon: Users },
        ] : []),
    ]

    const sidebarContent = (
        <div className="flex h-full flex-col bg-card border-r border-border">
            <div className="flex h-14 items-center border-b border-border px-4 py-4">
                <Link href="/" prefetch={false} className="flex items-center gap-2 font-semibold">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Site</span>
                </Link>
            </div>
            
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start px-2 text-sm font-medium gap-1">
                    {isLoading ? (
                        <>
                            <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                            <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-4 w-28" />
                            </div>
                        </>
                    ) : (
                        navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href || (item.href !== "/admin" && item.href !== "/profile" && pathname.startsWith(item.href))
                            return (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setIsMobileOpen(false);
                                        router.push(item.href);
                                    }}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:text-primary cursor-pointer",
                                        isActive ? "bg-muted text-primary" : "text-muted-foreground"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </a>
                            )
                        })
                    )}
                </nav>
            </div>

            {isLoading ? (
                <div className="border-t border-border p-4">
                    <div className="flex items-center gap-3 mb-4 rounded-lg p-2">
                        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                        <div className="flex flex-col gap-2 overflow-hidden flex-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                    <Skeleton className="h-9 w-full rounded-md" />
                </div>
            ) : user ? (
                <div className="border-t border-border p-4">
                    <Link 
                        href={adminAccess ? "/admin/profile" : "/profile/account"} 
                        prefetch={false}
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center gap-3 mb-4 overflow-hidden rounded-lg p-2 transition-colors hover:bg-muted"
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border border-border font-semibold">
                            {getInitials(user.user_metadata?.display_name || user.user_metadata?.username, user.email)}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium truncate">
                                {user.user_metadata?.display_name || user.user_metadata?.username || user.email?.split("@")[0]}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                                {user.user_metadata?.username ? `@${user.user_metadata.username}` : user.email}
                            </span>
                        </div>
                    </Link>
                    <Button variant="outline" className="w-full justify-start gap-2 h-9" onClick={() => setLogoutOpen(true)}>
                        <LogOut className="h-4 w-4" />
                        Log out
                    </Button>
                    <ConfirmDialog
                        open={logoutOpen}
                        onOpenChange={setLogoutOpen}
                        title={adminAccess ? "Log out of admin?" : "Log out?"}
                        description={
                            adminAccess
                                ? "You will need to sign in again to manage registrations and view the admin dashboard."
                                : "You will need to sign in to your Futura account again."
                        }
                        confirmText="Log out"
                        cancelText="Stay signed in"
                        variant="destructive"
                        isLoading={isLoggingOut}
                        onConfirm={handleLogout}
                    />
                </div>
            ) : null}
        </div>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <aside 
                ref={sidebarRef}
                className="hidden md:flex flex-col md:w-64 fixed inset-y-0 left-0 z-10"
            >
                {sidebarContent}
            </aside>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                    onKeyDown={(e) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') setIsMobileOpen(false) }}
                    role="button"
                    tabIndex={0}
                    aria-label="Close sidebar"
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-3/4 max-w-sm bg-background transition-transform duration-300 ease-in-out md:hidden shadow-xl",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {sidebarContent}
            </aside>
        </>
    )
}
