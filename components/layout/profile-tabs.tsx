/* eslint-disable */
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function ProfileTabs() {
    const pathname = usePathname()

    const navItems = [
        { name: "My Registrations", href: "/profile" },
        { name: "Account Settings", href: "/profile/account" }
    ]

    return (
        <div className="mb-8 border-b border-border">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            prefetch={false}
                            className={cn(
                                isActive
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                                "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors"
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
