import { NextResponse } from "next/server";
import { invalidRequest, rateLimited } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { signupSchema } from "@/lib/validation";
import { createClient } from "@/utils/supabase/server";

const isExistingAccountResponse = (data: unknown) => {
  if (!data || typeof data !== "object" || !("user" in data)) {
    return false;
  }

  const user = (data as { user?: { identities?: unknown[] | null } | null }).user;

  return Array.isArray(user?.identities) && user.identities.length === 0;
};

const isExistingAccountError = (error: { message?: string } | null) => {
  const message = error?.message?.toLowerCase() ?? "";

  return (
    message.includes("already registered") ||
    message.includes("already exists") ||
    message.includes("user already")
  );
};

export async function POST(request: Request) {
  const limit = await rateLimit(request, {
    key: "auth-register",
    limit: 5,
    windowSeconds: 300,
  });

  if (!limit.success) {
    return rateLimited(limit.retryAfter);
  }

  const parsed = signupSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return invalidRequest();
  }

  const requestUrl = new URL(request.url);
  const redirectUrl = new URL("/auth/callback", requestUrl.origin);
  redirectUrl.searchParams.set("next", "/login?verified=1");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: redirectUrl.toString(),
    },
  });

  if (error) {
    if (isExistingAccountError(error)) {
      return NextResponse.json(
        { error: "This email is already registered. Please log in instead." },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Registration failed" }, { status: 400 });
  }

  if (isExistingAccountResponse(data)) {
    return NextResponse.json(
      { error: "This email is already registered. Please log in instead." },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true, authenticated: !!data.session });
}
