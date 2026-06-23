"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Users, Trophy, Cpu, LogOut, ArrowLeft } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function Sidebar({ isMobileOpen, setIsMobileOpen, width, setWidth }: { isMobileOpen: boolean, setIsMobileOpen: (open: boolean) => void, width: number, setWidth: (width: number) => void }) {
    const { user, isAdmin, signOut } = useAuth()
    const pathname = usePathname()
    const router = useRouter()
    const [isResizing, setIsResizing] = useState(false)
    const sidebarRef = useRef<HTMLDivElement>(null)

    const handleLogout = async () => {
        const { error } = await signOut()

        if (error) {
            console.error(error)
            return
        }

        router.replace("/")
        router.refresh()
    }

    const startResizing = useCallback(() => {
        setIsResizing(true)
    }, [])

    const stopResizing = useCallback(() => {
        setIsResizing(false)
    }, [])

    const resize = useCallback((mouseMoveEvent: MouseEvent) => {
        if (isResizing) {
            const newWidth = mouseMoveEvent.clientX
            if (newWidth > 200 && newWidth < 400) {
                setWidth(newWidth)
            }
        }
    }, [isResizing])

    useEffect(() => {
        window.addEventListener("mousemove", resize)
        window.addEventListener("mouseup", stopResizing)
        return () => {
            window.removeEventListener("mousemove", resize)
            window.removeEventListener("mouseup", stopResizing)
        }
    }, [resize, stopResizing])

    const getInitials = (name?: string | null, email?: string | null) => {
        const str = name || email?.split("@")[0] || "U"
        return str.substring(0, 2).toUpperCase()
    }

    const navItems = [
        ...(isAdmin ? [
            { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
            { href: "/admin/seminar", label: "Seminar", icon: Users },
            { href: "/admin/lomba-kti", label: "LKTI", icon: Trophy },
            { href: "/admin/mechatura", label: "Mechatura", icon: Cpu },
        ] : []),
        { href: "/profile", label: "Your Profile", icon: Users },
    ]

    const sidebarContent = (
        <div className="flex h-full flex-col bg-card border-r border-border">
            <div className="flex h-14 items-center border-b border-border px-4 py-4">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Site</span>
                </Link>
            </div>
            
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start px-2 text-sm font-medium gap-1">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href || (item.href !== "/admin" && item.href !== "/profile" && pathname.startsWith(item.href))
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:text-primary",
                                    isActive ? "bg-muted text-primary" : "text-muted-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {user && (
                <div className="border-t border-border p-4">
                    <Link 
                        href="/profile/account" 
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
                    <Button variant="outline" className="w-full justify-start gap-2 h-9" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                        Log out
                    </Button>
                </div>
            )}
        </div>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <aside 
                ref={sidebarRef}
                className="hidden md:block fixed inset-y-0 left-0 z-10"
                style={{ width }}
            >
                {sidebarContent}
                {/* Resizer Handle */}
                <div
                    className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/20 transition-colors"
                    onMouseDown={startResizing}
                />
            </aside>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
                    onClick={() => setIsMobileOpen(false)}
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
