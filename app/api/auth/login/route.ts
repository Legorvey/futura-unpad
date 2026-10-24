import { NextResponse } from "next/server";
import { invalidRequest, rateLimited, readJsonBody } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";
import {
  AUTH_PERSISTENCE_COOKIE,
  SESSION_AUTH_PERSISTENCE,
  authPersistenceCookieOptions,
  getAuthCookiePersistence,
} from "@/utils/supabase/auth-cookies";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const limit = await rateLimit(request, {
    key: "auth-login",
    limit: 8,
    windowSeconds: 60,
  });

  if (!limit.success) {
    return rateLimited(limit.retryAfter);
  }

  const body = await readJsonBody(request);

  if (!body.ok) {
    return body.response;
  }

  const parsed = loginSchema.safeParse(body.data);

  if (!parsed.success) {
    return invalidRequest();
  }

  // Account-level throttling (anti-bruteforce across distributed IPs/proxies).
  // A slot is consumed only when credentials are rejected, so an attacker cannot
  // deny a legitimate user access to their own account.
  const normalizedIdentifier = parsed.data.identifier.toLowerCase().trim();
  const consumeIdentifierFailure = () =>
    rateLimit(normalizedIdentifier, {
      key: "auth-login-identifier",
      limit: 5,
      windowSeconds: 300,
    });

  const keepSignedIn = parsed.data.keepSignedIn ?? true;

  const supabase = await createClient({
    authCookiePersistence: getAuthCookiePersistence(keepSignedIn),
  });
  
  const GENERIC_AUTH_ERROR = "Email/username atau kata sandi tidak valid";

  let email = parsed.data.identifier;
  if (!email.includes('@')) {
    const { data: resolvedEmail } = await supabase.rpc('get_email_by_username', { p_username: normalizedIdentifier });
    if (!resolvedEmail) {
      const accountLimit = await consumeIdentifierFailure();

      if (!accountLimit.success) {
        return rateLimited(accountLimit.retryAfter);
      }

      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
    }
    email = resolvedEmail;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });

  if (error) {
    const accountLimit = await consumeIdentifierFailure();

    if (!accountLimit.success) {
      return rateLimited(accountLimit.retryAfter);
    }

    return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
  }

  const cookieStore = await cookies();

  if (keepSignedIn) {
    cookieStore.set(AUTH_PERSISTENCE_COOKIE, "", {
      ...authPersistenceCookieOptions,
      maxAge: 0,
    });
  } else {
    cookieStore.set(
      AUTH_PERSISTENCE_COOKIE,
      SESSION_AUTH_PERSISTENCE,
      authPersistenceCookieOptions
    );
  }

  let adminAccess = false;
  let requiresMfa = false;
  let requiresMfaEnrollment = false;

  if (error === null) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: adminData } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (adminData) {
        const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aal?.nextLevel === "aal2" && aal?.currentLevel !== "aal2") {
          requiresMfa = true;
        } else if (aal?.currentLevel === "aal2") {
          adminAccess = true;
        } else {
          requiresMfaEnrollment = true;
        }
      }
    }
  }

  return NextResponse.json({
    ok: true,
    adminAccess,
    requiresMfa,
    requiresMfaEnrollment,
  });
}
