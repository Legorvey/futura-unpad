"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ChevronLeft } from "lucide-react"

export function ProfileTabs() {
    const pathname = usePathname()

    if (pathname.includes("/profile/mechatura")) {
        return (
            <div className="mx-auto w-full max-w-[90rem] px-4 sm:px-8 -mb-2">
                <div className="px-2">
                    <Link href="/profile" className="inline-flex items-center text-sm font-medium text-white/70 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 px-3.5 py-2 rounded-full transition-all duration-300 shadow-sm backdrop-blur-sm group">
                        <ChevronLeft className="w-4 h-4 mr-1.5 opacity-70 group-hover:opacity-100 group-hover:-translate-x-0.5 transition-all" />
                        Kembali ke Profil
                    </Link>
                </div>
            </div>
        )
    }

    const navItems = [
        { name: "Pendaftaran Saya", href: "/profile" },
        { name: "Pengaturan Akun", href: "/profile/account" }
    ]

    return (
        <div className="mx-auto w-full max-w-5xl px-[18px] sm:px-8">
            <div className="space-y-3 mb-10">
                <h1 className="text-4xl sm:text-5xl font-medium tracking-[-0.05em] text-white">
                    Profil Saya
                </h1>
                <p className="max-w-xl text-base font-light tracking-tight text-white/50">
                    Kelola akun Futura Anda dan pantau status pendaftaran acara.
                </p>
            </div>
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
        </div>
    )
}
