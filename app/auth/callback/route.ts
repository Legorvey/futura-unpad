/* eslint-disable */
import { NextResponse } from "next/server"
import {
    PASSWORD_RECOVERY_COOKIE,
    PASSWORD_RECOVERY_MAX_AGE_SECONDS,
    passwordRecoveryCookieOptions,
} from "@/lib/password-recovery"
import {
    AUTH_PERSISTENCE_COOKIE,
    SESSION_AUTH_PERSISTENCE,
    authPersistenceCookieOptions,
    getAuthCookiePersistence,
} from "@/utils/supabase/auth-cookies"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

const safeRedirectPath = (value: string | null) => {
    if (
        !value ||
        !value.startsWith("/") ||
        value.startsWith("//") ||
        value.startsWith("/\\") ||
        value.startsWith("/auth/callback")
    ) {
        return "/"
    }

    return value
}

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")
    const safeNextUrl = safeRedirectPath(requestUrl.searchParams.get("next"))
    const keepSignedInParam = requestUrl.searchParams.get("keep_signed_in")
    const keepSignedIn = keepSignedInParam === null || keepSignedInParam === "1"
    const isPasswordRecoveryRedirect =
        new URL(safeNextUrl, requestUrl.origin).pathname === "/reset-password"

    const token_hash = requestUrl.searchParams.get("token_hash")
    const type = requestUrl.searchParams.get("type") as any

    const supabase = await createClient({
        authCookiePersistence: getAuthCookiePersistence(keepSignedIn),
    })

    let isEmailChangeFlow = false

    if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type })
        if (error) {
            if (type === "recovery") {
                await supabase.auth.signOut()
                const response = NextResponse.redirect(new URL("/reset-password?error=oauth_failed", requestUrl.origin))
                response.cookies.delete(PASSWORD_RECOVERY_COOKIE)
                return response
            }
            return NextResponse.redirect(new URL("/login?error=oauth_failed", requestUrl.origin))
        }

        if (type === 'signup') {
            await supabase.auth.signOut()
            const response = NextResponse.redirect(new URL("/login", requestUrl.origin))
            
            response.cookies.set("email_verified_flash", "1", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 30, // Expires in 30 seconds
                path: "/login",
            });
            
            return response;
        }

        if (type === 'email_change') {
            isEmailChangeFlow = true
        }
    } else if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
            return NextResponse.redirect(new URL("/login?error=oauth_failed", requestUrl.origin))
        }
    } else {
        return NextResponse.redirect(new URL("/login?error=missing_code", requestUrl.origin))
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user && !user.user_metadata?.username) {
        const emailPrefix = user.email?.split("@")[0]
        const googleName = user.user_metadata?.full_name || user.user_metadata?.name
        const newDisplayName = googleName || emailPrefix || "User"

        // Only update if they don't have a custom display name yet
        if (!user.user_metadata?.display_name || user.user_metadata?.display_name === emailPrefix) {
            if (user.user_metadata?.display_name !== newDisplayName) {
                await supabase.auth.updateUser({
                    data: { display_name: newDisplayName }
                })
            }
        }
    }

    let finalNextUrl = safeNextUrl
    if (user && !isPasswordRecoveryRedirect) {
        const { data: adminData } = await supabase
            .from("admin_users")
            .select("user_id")
            .eq("user_id", user.id)
            .maybeSingle()
            
        if (adminData && (!safeNextUrl || safeNextUrl === "/profile")) {
            finalNextUrl = "/admin"
        }
    }

    if (user && isEmailChangeFlow) {
        const urlObj = new URL(finalNextUrl, requestUrl.origin);
        if (user.new_email) {
            urlObj.searchParams.set("email_change", "pending");
        } else {
            urlObj.searchParams.set("email_change", "success");
        }
        finalNextUrl = urlObj.pathname + urlObj.search + urlObj.hash;
    }

    const cookieStore = await cookies()
    if (keepSignedIn) {
        cookieStore.set(AUTH_PERSISTENCE_COOKIE, "", {
            ...authPersistenceCookieOptions,
            maxAge: 0,
        })
    } else {
        cookieStore.set(
            AUTH_PERSISTENCE_COOKIE,
            SESSION_AUTH_PERSISTENCE,
            authPersistenceCookieOptions
        )
    }

    const response = NextResponse.redirect(new URL(finalNextUrl, requestUrl.origin))

    if (isPasswordRecoveryRedirect) {
        response.cookies.set(PASSWORD_RECOVERY_COOKIE, "1", {
            ...passwordRecoveryCookieOptions,
            maxAge: PASSWORD_RECOVERY_MAX_AGE_SECONDS,
        })
    } else {
        response.cookies.set(PASSWORD_RECOVERY_COOKIE, "", {
            ...passwordRecoveryCookieOptions,
            maxAge: 0,
        })
    }

    return response
}
