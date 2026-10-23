import { NextResponse } from "next/server";
import { invalidRequest, rateLimited, readJsonBody } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { cookies } from "next/headers";
import {
  AUTH_PERSISTENCE_COOKIE,
  SESSION_AUTH_PERSISTENCE,
} from "@/utils/supabase/auth-cookies";

const verifyMfaSchema = z.object({
  factorId: z.string().uuid("ID faktor tidak valid"),
  challengeId: z.string().uuid("ID challenge tidak valid").optional(),
  code: z.string().regex(/^\d{6}$/, "Kode verifikasi harus 6 digit angka"),
});

export async function POST(request: Request) {
  // IP-level rate limiting to prevent flood attacks
  const ipLimit = await rateLimit(request, {
    key: "auth-mfa-verify-ip",
    limit: 10,
    windowSeconds: 60,
  });

  if (!ipLimit.success) {
    return rateLimited(ipLimit.retryAfter);
  }

  const body = await readJsonBody(request);
  if (!body.ok) {
    return body.response;
  }

  const parsed = verifyMfaSchema.safeParse(body.data);
  if (!parsed.success) {
    return invalidRequest();
  }

  // Preserve user's auth cookie persistence preference (session-only vs persistent)
  const cookieStore = await cookies();
  const isSessionOnly =
    cookieStore.get(AUTH_PERSISTENCE_COOKIE)?.value === SESSION_AUTH_PERSISTENCE;

  const supabase = await createClient({
    authCookiePersistence: isSessionOnly ? "session" : "persistent",
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Sesi tidak valid atau telah berakhir" },
      {
        status: 401,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  }

  // Account-level rate limiting (anti-bruteforce across distributed IPs/proxies)
  // Max 5 attempts per 5 minutes per user account
  const accountLimit = await rateLimit(user.id, {
    key: "auth-mfa-verify-account",
    limit: 5,
    windowSeconds: 300,
  });

  if (!accountLimit.success) {
    return rateLimited(accountLimit.retryAfter);
  }

  let challengeId = parsed.data.challengeId;
  if (!challengeId) {
    const challenge = await supabase.auth.mfa.challenge({
      factorId: parsed.data.factorId,
    });
    if (challenge.error) {
      return NextResponse.json(
        { error: challenge.error.message },
        {
          status: 400,
          headers: { "Cache-Control": "no-store, max-age=0" },
        }
      );
    }
    challengeId = challenge.data.id;
  }

  const { data, error } = await supabase.auth.mfa.verify({
    factorId: parsed.data.factorId,
    challengeId,
    code: parsed.data.code,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message || "Kode verifikasi tidak valid" },
      {
        status: 401,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  }

  return NextResponse.json(
    { ok: true, data },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
