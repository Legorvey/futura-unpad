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
        const { email, token } = await request.json();

        if (!email || !token) {
            return NextResponse.json({ error: "Email and token are required" }, { status: 400 });
        }

        const supabase = await createClient();

        const { error, data } = await supabase.auth.verifyOtp({
            email,
            token,
            type: "signup",
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

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
    } catch (err: any) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
