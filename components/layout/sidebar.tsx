"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "nextjs-toploader/app"
import {
    LayoutDashboard,
    Users,
    Trophy,
    Cpu,
    LogOut,
    ArrowLeft,
    ChevronsUpDown,
    User as UserIcon,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Sidebar as ShadcnSidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar"
import ConfirmDialog from "@/components/confirm-dialog"

const getInitials = (name?: string | null, email?: string | null) => {
    const str = (name || email?.split("@")[0] || "U").trim()
    return str.substring(0, 2).toUpperCase()
}

export function Sidebar() {
    const { user, adminAccess, isLoading, signOut } = useAuth()
    const { isMobile, setOpenMobile } = useSidebar()
    const pathname = usePathname()
    const router = useRouter()
    const [logoutOpen, setLogoutOpen] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            const { error } = await signOut()
            if (error) {
                throw error
            }
            setLogoutOpen(false)
            router.replace("/login")
        } catch (err) {
            console.error("Logout failed:", err)
            throw err
        } finally {
            setIsLoggingOut(false)
        }
    }

    const navItems = [
        ...(adminAccess
            ? [
                  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
                  { href: "/admin/seminar", label: "Seminar", icon: Users },
                  { href: "/admin/lomba-esai", label: "Lomba Esai", icon: Trophy },
                  { href: "/admin/mechatura", label: "Mechatura", icon: Cpu },
              ]
            : []),
        ...(!adminAccess
            ? [
                  { href: "/profile", label: "Profil Anda", icon: Users },
              ]
            : []),
    ]

    return (
        <ShadcnSidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
            {/* Header */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            size="default"
                            tooltip="Kembali ke Website"
                            className="text-zinc-400 hover:text-white hover:bg-sidebar-accent/70 font-medium transition-colors gap-2.5 md:gap-3.5 px-2.5 md:px-3"
                        >
                            <Link href="/" prefetch={false} onClick={() => isMobile && setOpenMobile(false)}>
                                <ArrowLeft className="size-4 md:size-5" />
                                <span className="text-sm md:text-[15px] font-medium">Kembali ke Website</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Navigation Menu */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-[11px] md:text-xs font-medium text-zinc-400/80">
                        Menu Utama
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {isLoading ? (
                                <>
                                    <div className="flex items-center gap-2.5 md:gap-3.5 rounded-lg px-2.5 py-2 md:py-2.5">
                                        <Skeleton className="size-4 md:size-5 rounded-md" />
                                        <Skeleton className="h-4 md:h-5 w-24" />
                                    </div>
                                    <div className="flex items-center gap-2.5 md:gap-3.5 rounded-lg px-2.5 py-2 md:py-2.5">
                                        <Skeleton className="size-4 md:size-5 rounded-md" />
                                        <Skeleton className="h-4 md:h-5 w-20" />
                                    </div>
                                    <div className="flex items-center gap-2.5 md:gap-3.5 rounded-lg px-2.5 py-2 md:py-2.5">
                                        <Skeleton className="size-4 md:size-5 rounded-md" />
                                        <Skeleton className="h-4 md:h-5 w-28" />
                                    </div>
                                    <div className="flex items-center gap-2.5 md:gap-3.5 rounded-lg px-2.5 py-2 md:py-2.5">
                                        <Skeleton className="size-4 md:size-5 rounded-md" />
                                        <Skeleton className="h-4 md:h-5 w-24" />
                                    </div>
                                </>
                            ) : (
                                navItems.map((item) => {
                                    const Icon = item.icon
                                    const isActive =
                                        pathname === item.href ||
                                        (item.href !== "/admin" &&
                                            item.href !== "/profile" &&
                                            pathname.startsWith(item.href))

                                    return (
                                        <SidebarMenuItem key={item.href}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive}
                                                tooltip={item.label}
                                                className={cn(
                                                    "gap-2.5 md:gap-3.5 px-2.5 md:px-3 font-medium transition-colors",
                                                    isActive
                                                        ? "bg-sidebar-accent text-white"
                                                        : "text-zinc-400 hover:bg-sidebar-accent/70 hover:text-white"
                                                )}
                                            >
                                                <Link
                                                    href={item.href}
                                                    onClick={() => isMobile && setOpenMobile(false)}
                                                >
                                                    <Icon className="size-4 md:size-5" />
                                                    <span className="text-sm md:text-[15px]">{item.label}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Footer: Official shadcn NavUser pattern */}
            <SidebarFooter>
                {isLoading ? (
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <div className="flex items-center gap-2.5 md:gap-3.5 p-2">
                                <Skeleton className="size-8 md:size-9 rounded-lg shrink-0" />
                                <div className="grid flex-1 gap-1">
                                    <Skeleton className="h-3.5 md:h-4 w-28" />
                                    <Skeleton className="h-3 md:h-3.5 w-36" />
                                </div>
                            </div>
                        </SidebarMenuItem>
                    </SidebarMenu>
                ) : user ? (
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton
                                        size="lg"
                                        className="h-12 md:h-14 gap-2.5 md:gap-3.5 px-2.5 md:px-3 text-zinc-400 hover:text-white data-[state=open]:bg-sidebar-accent data-[state=open]:text-white font-medium transition-colors"
                                    >
                                        <Avatar className="size-8 md:size-9 rounded-lg">
                                            <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-medium">
                                                {getInitials(
                                                    user.user_metadata?.display_name || user.user_metadata?.username,
                                                    user.email
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate text-sm md:text-[15px] font-medium text-zinc-200 group-hover:text-white">
                                                {user.user_metadata?.display_name ||
                                                    user.user_metadata?.username ||
                                                    user.email?.split("@")[0]}
                                            </span>
                                            <span className="truncate text-[11px] md:text-xs text-zinc-400">
                                                {user.email}
                                            </span>
                                        </div>
                                        <ChevronsUpDown className="ml-auto size-4 md:size-4.5 text-zinc-400 group-hover:text-white" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                                    side={isMobile ? "bottom" : "right"}
                                    align="end"
                                    sideOffset={4}
                                >
                                    <DropdownMenuLabel className="p-0 font-normal">
                                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                            <Avatar className="size-8 md:size-9 rounded-lg">
                                                <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-medium">
                                                    {getInitials(
                                                        user.user_metadata?.display_name || user.user_metadata?.username,
                                                        user.email
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="grid flex-1 text-left text-sm leading-tight">
                                                <span className="truncate text-sm md:text-[15px] font-medium text-white">
                                                    {user.user_metadata?.display_name ||
                                                        user.user_metadata?.username ||
                                                        user.email?.split("@")[0]}
                                                </span>
                                                <span className="truncate text-[11px] md:text-xs text-zinc-400">
                                                    {user.email}
                                                </span>
                                            </div>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem asChild className="py-2 text-xs md:text-sm text-zinc-300 hover:text-white focus:text-white">
                                            <Link
                                                href={adminAccess ? "/admin/profile" : "/profile"}
                                                onClick={() => isMobile && setOpenMobile(false)}
                                                className="cursor-pointer"
                                            >
                                                <UserIcon className="mr-2 size-4 md:size-4.5" />
                                                <span>Profil Akun</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => setLogoutOpen(true)}
                                        className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer py-2 text-xs md:text-sm"
                                    >
                                        <LogOut className="mr-2 size-4 md:size-4.5" />
                                        <span>Keluar Akun</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <ConfirmDialog
                                open={logoutOpen}
                                onOpenChange={setLogoutOpen}
                                title={adminAccess ? "Keluar dari admin?" : "Keluar akun?"}
                                description={
                                    adminAccess
                                        ? "Anda harus masuk kembali untuk mengelola pendaftaran dan melihat dashboard admin."
                                        : "Anda harus masuk kembali untuk mengakses akun Futura Anda."
                                }
                                confirmText="Keluar"
                                cancelText="Batal"
                                variant="destructive"
                                contentClassName="bg-white text-slate-900 border-slate-200"
                                isLoading={isLoggingOut}
                                onConfirm={handleLogout}
                            />
                        </SidebarMenuItem>
                    </SidebarMenu>
                ) : null}
            </SidebarFooter>

            <SidebarRail />
        </ShadcnSidebar>
    )
}
