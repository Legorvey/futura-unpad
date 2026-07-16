"use client"

import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import Image from "next/image"

const getSafeRedirectPath = (value: string | null) => {
    if (
        !value ||
        !value.startsWith("/") ||
        value.startsWith("//") ||
        value.startsWith("/login") ||
        value === "/register" ||
        value.startsWith("/register?") ||
        value.startsWith("/auth/callback")
    ) {
        return "/profile"
    }

    return value
}

export default function GoogleLoginButton({
    keepSignedIn = true,
    onBeforeLogin,
}: {
    keepSignedIn?: boolean
    onBeforeLogin?: () => boolean
}) {
    const supabase = createClient()
    const [isLoading, setIsLoading] = useState(false)



    const loginWithGoogle = async () => {
        if (onBeforeLogin && !onBeforeLogin()) {
            return
        }

        setIsLoading(true)

        const currentUrl = new URL(window.location.href)
        const callbackUrl = new URL("/auth/callback", window.location.origin)
        callbackUrl.searchParams.set("next", getSafeRedirectPath(currentUrl.searchParams.get("next") ?? "/profile"))

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: callbackUrl.toString(),
            },
        })

        if (error) {
            console.error(error)
            alert("Google login failed. Please try again.")
            setIsLoading(false)
        }
    }

    return (
        <Button
            type="button"
            variant="outline"
            className="h-11 rounded-[8px] cursor-pointer space-x-1"
            disabled={isLoading}
            onClick={loginWithGoogle}
        >
            <Image 
                src="/google_icon.svg" 
                alt="Google Icon"
                width={22}
                height={22}
            />
            <p>{isLoading ? "Redirecting..." : "Continue with Google"}</p>
        </Button>
    )
}
