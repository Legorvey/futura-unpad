"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function ProfileTabs() {
    const pathname = usePathname()

    const navItems = [
        { name: "Pendaftaran Saya", href: "/profile" },
        { name: "Pengaturan Akun", href: "/profile/account" }
    ]

    return (
        <div className="mb-8">
            <nav className="flex space-x-2 bg-white/[0.03] backdrop-blur-md border border-white/10 p-1.5 rounded-2xl w-fit" aria-label="Tabs">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            prefetch={false}
                            className={cn(
                                isActive
                                    ? "bg-white/10 text-white shadow-sm"
                                    : "text-white/50 hover:text-white hover:bg-white/[0.05]",
                                "rounded-xl py-2 px-4 text-sm font-medium tracking-tight transition-all duration-300"
                            )}
                        >
                            {item.name}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
