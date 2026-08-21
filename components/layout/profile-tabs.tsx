"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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

    return (
        <div className="mx-auto w-full max-w-[90rem] px-4 sm:px-8">
            <div className="space-y-1.5 mb-10 px-2">
                <h1 className="text-3xl font-semibold text-white">
                    Profil Saya
                </h1>
                <p className="max-w-2xl text-sm text-white/70 sm:text-base">
                    Kelola akun Futura Anda dan pantau status pendaftaran acara.
                </p>
            </div>
        </div>
    )
}
