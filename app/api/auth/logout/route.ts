import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { AUTH_PERSISTENCE_COOKIE } from "@/utils/supabase/auth-cookies";

/**
 * POST /api/auth/logout
 *
 * Authoritative server-side session termination endpoint used by the MFA exit guard.
 * Calling supabase.auth.signOut() from the server revokes the session record and
 * refresh token family in GoTrue's auth.sessions table. The response also issues
 * explicit Set-Cookie headers with Max-Age=0 to purge all Supabase chunked auth
 * cookies and custom Futura persistence cookies from the browser.
 *
 * This is keepalive-compatible so it can be called reliably during navigation events.
 */
export async function POST() {
  const supabase = await createClient();

  // Revoke the GoTrue session & refresh token family server-side
  await supabase.auth.signOut({ scope: "local" });

  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  const response = NextResponse.json({ ok: true });

  // Eradicate all Supabase chunked auth cookies and custom persistence cookies.
  // Supabase SSR stores sessions in chunks: sb-<ref>-auth-token.0, .1, etc.
  for (const cookie of allCookies) {
    if (
      cookie.name.startsWith("sb-") ||
      cookie.name === AUTH_PERSISTENCE_COOKIE ||
      cookie.name === "futura_password_recovery" ||
      cookie.name === "email_verified_flash"
    ) {
      response.cookies.set(cookie.name, "", {
        path: "/",
        maxAge: 0,
        expires: new Date(0),
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }
  }

  return response;
}
