import { NextResponse } from "next/server";
import { invalidRequest, rateLimited } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const limit = await rateLimit(request, {
    key: "auth-login",
    limit: 8,
    windowSeconds: 60,
  });

  if (!limit.success) {
    return rateLimited(limit.retryAfter);
  }

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return invalidRequest();
  }

  const supabase = await createClient();
  
  let email = parsed.data.identifier;
  if (!email.includes('@')) {
    const { data: resolvedEmail } = await supabase.rpc('get_email_by_username', { p_username: parsed.data.identifier.toLowerCase() });
    if (!resolvedEmail) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }
    email = resolvedEmail;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });

  if (error) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
