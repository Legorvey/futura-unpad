import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { rateLimited } from "@/lib/http";

export async function POST(request: Request) {
    const limit = await rateLimit(request, {
        key: "auth-verify-otp",
        limit: 10,
        windowSeconds: 300,
    });

    if (!limit.success) {
        return rateLimited(limit.retryAfter);
    }

    try {
        const { email, token, type = "signup" } = await request.json();

        if (!email || !token) {
            return NextResponse.json({ error: "Email and token are required" }, { status: 400 });
        }

        const emailLimit = await rateLimit(request, {
            key: `auth-verify-otp:${email}`,
            limit: 10,
            windowSeconds: 300,
        });

        if (!emailLimit.success) {
            return rateLimited(emailLimit.retryAfter);
        }

        const supabase = await createClient();

        const { error, data } = await supabase.auth.verifyOtp({
            email,
            token,
            type: type as any,
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        if (type === "signup") {
            // Successfully verified. We want them to log in manually, so we sign out the session
            await supabase.auth.signOut();

            const response = NextResponse.json({ ok: true });
            
            // Set a secure, short-lived flash cookie to display the success message on the login page
            // This prevents URL spoofing attacks (e.g. attacker sending /login?verified=true)
            response.cookies.set("email_verified_flash", "1", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 30, // Expires in 30 seconds
                path: "/login",
            });

            return response;
        }

        // For recovery, we want them to stay signed in so they can access /reset-password
        const response = NextResponse.json({ ok: true, session: data.session });
        
        if (type === "recovery") {
            const { PASSWORD_RECOVERY_COOKIE, PASSWORD_RECOVERY_MAX_AGE_SECONDS, passwordRecoveryCookieOptions } = await import("@/lib/password-recovery");
            response.cookies.set(PASSWORD_RECOVERY_COOKIE, "1", {
                ...passwordRecoveryCookieOptions,
                maxAge: PASSWORD_RECOVERY_MAX_AGE_SECONDS,
            });
        }
        
        return response;
    } catch (err: any) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
