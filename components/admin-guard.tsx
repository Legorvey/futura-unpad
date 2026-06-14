"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

export default function AdminGuard({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const { user, isAdmin, isLoading } = useAuth()

    useEffect(() => {
        if (isLoading) {
            return
        }

        if (!user) {
            router.replace("/login")
            return
        }

        if (!isAdmin) {
            router.replace("/")
        }
    }, [isAdmin, isLoading, router, user])

    if (isLoading || !user || !isAdmin) return <p>Checking access...</p>

    return <>{children}</>
}
