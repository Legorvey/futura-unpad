"use client"

import { createClient } from "@/utils/supabase/client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSafeRedirectPath } from "@/lib/navigation"
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"
import { AUTH_PERSISTENCE_COOKIE, SESSION_AUTH_PERSISTENCE } from "@/utils/supabase/auth-cookies"

// Ensure this environment variable is set
const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""

export default function GoogleLoginButton({
    keepSignedIn = true,
    onBeforeLogin,
}: {
    keepSignedIn?: boolean
    onBeforeLogin?: () => boolean
}) {
    const supabase = createClient()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleSuccess = async (credentialResponse: any) => {
        if (onBeforeLogin && !onBeforeLogin()) {
            return
        }

        if (!credentialResponse.credential) {
            console.error("No credential received from Google")
            alert("Google login failed. Please try again.")
            return
        }

        setIsLoading(true)

        if (!keepSignedIn) {
            document.cookie = `${AUTH_PERSISTENCE_COOKIE}=${SESSION_AUTH_PERSISTENCE}; path=/; max-age=2592000; SameSite=Lax`;
        } else {
            document.cookie = `${AUTH_PERSISTENCE_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }

        try {
            const { error } = await supabase.auth.signInWithIdToken({
                provider: "google",
                token: credentialResponse.credential,
            })

            if (error) {
                console.error("Supabase auth error:", error)
                alert("Google login failed. Please try again.")
                setIsLoading(false)
                return
            }

            // On success, manually redirect the user since we aren't using the server-side callback anymore
            const currentUrl = new URL(window.location.href)
            const nextPath = getSafeRedirectPath(currentUrl.searchParams.get("next") ?? "/profile")
            
            // Use router.replace to safely navigate without triggering duplicate route refresh race conditions
            router.replace(nextPath);

        } catch (error) {
            console.error("Unexpected error during Google login:", error)
            alert("Google login failed. Please try again.")
            setIsLoading(false)
        }
    }

    if (!clientId) {
        return (
            <div className="p-3 border border-red-500/50 bg-red-500/10 rounded-md text-red-500 text-sm text-center">
                Missing Google Client ID
            </div>
        )
    }

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <div className={`flex justify-center w-full ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={() => {
                        console.error("Google popup closed or failed")
                        alert("Google login failed. Please try again.")
                    }}
                    theme="outline"
                    size="large"
                    shape="rectangular"
                    text="continue_with"
                    logo_alignment="center"
                    width="400" // Google button max width is 400px
                />
            </div>
        </GoogleOAuthProvider>
    )
}
