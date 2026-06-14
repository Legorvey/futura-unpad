import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

const getSafeRedirectPath = (value: string | null) => {
    if (
        !value ||
        !value.startsWith("/") ||
        value.startsWith("//") ||
        value.startsWith("/auth/callback")
    ) {
        return "/"
    }

    return value
}

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")
    const next = getSafeRedirectPath(requestUrl.searchParams.get("next"))

    if (!code) {
        return NextResponse.redirect(new URL("/login?error=missing_code", request.url))
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
        return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url))
    }

    return NextResponse.redirect(new URL(next, request.url))
}
