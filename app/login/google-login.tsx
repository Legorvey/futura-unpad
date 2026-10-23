"use client"

import { createClient } from "@/utils/supabase/client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSafeRedirectPath, getSafeAdminRedirectPath } from "@/lib/navigation"
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"
import { AUTH_PERSISTENCE_COOKIE, SESSION_AUTH_PERSISTENCE } from "@/utils/supabase/auth-cookies"
import { toast } from "sonner"

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

    const handleSuccess = async (credentialResponse: { credential?: string }) => {
        if (onBeforeLogin && !onBeforeLogin()) {
            return
        }

        if (!credentialResponse.credential) {
            console.error("No credential received from Google")
            toast.error("Gagal masuk dengan Google. Silakan coba lagi.")
            return
        }

        setIsLoading(true)

        const secureFlag = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
        if (!keepSignedIn) {
            document.cookie = `${AUTH_PERSISTENCE_COOKIE}=${SESSION_AUTH_PERSISTENCE}; path=/; max-age=2592000; SameSite=Lax${secureFlag}`;
        } else {
            document.cookie = `${AUTH_PERSISTENCE_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag}`;
        }

        try {
            const { error } = await supabase.auth.signInWithIdToken({
                provider: "google",
                token: credentialResponse.credential,
            })

            if (error) {
                console.error("Supabase auth error:", error)
                toast.error("Gagal masuk dengan Google. Silakan coba lagi.")
                setIsLoading(false)
                return
            }

            const currentUrl = new URL(window.location.href);
            const rawNext = currentUrl.searchParams.get("next");

            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const [{ data: adminRecord }, { data: aalData }] = await Promise.all([
                    supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle(),
                    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
                ]);

                if (adminRecord) {
                    const adminDestination = getSafeAdminRedirectPath(rawNext, "/admin");
                    if (aalData?.nextLevel === "aal2" && aalData?.currentLevel !== "aal2") {
                        router.replace(`/login/mfa-verify?next=${encodeURIComponent(adminDestination)}`);
                        return;
                    }

                    if (aalData?.nextLevel !== "aal2") {
                        router.replace(`/login/mfa-enroll?next=${encodeURIComponent(adminDestination)}`);
                        return;
                    }

                    router.replace(adminDestination);
                    return;
                }
            }

            const nextPath = getSafeRedirectPath(rawNext, "/profile");
            router.replace(nextPath);

        } catch (error) {
            console.error("Unexpected error during Google login:", error)
            toast.error("Gagal masuk dengan Google. Silakan coba lagi.")
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
                        toast.error("Gagal masuk dengan Google. Silakan coba lagi.")
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
