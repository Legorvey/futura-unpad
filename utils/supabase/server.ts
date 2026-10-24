import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {
  AUTH_PERSISTENCE_COOKIE,
  isSessionAuthPersistence,
  type AuthCookiePersistence,
} from "@/utils/supabase/auth-cookies";

export { createAdminClient } from "@/lib/supabase-admin";

// Environment variables read dynamically inside the function

type CreateClientOptions = {
  authCookiePersistence?: AuthCookiePersistence;
};

export const createClient = async (options: CreateClientOptions = {}) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const cookieStore = await cookies();
  const sessionOnly = options.authCookiePersistence
    ? options.authCookiePersistence === "session"
    : isSessionAuthPersistence(cookieStore.get(AUTH_PERSISTENCE_COOKIE)?.value);

  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            if (sessionOnly && value) {
              const sessionOptions = { ...options };
              delete sessionOptions.maxAge;
              delete sessionOptions.expires;
              cookieStore.set(name, value, sessionOptions);
              return;
            }

            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies directly. Middleware keeps
          // sessions fresh for those reads.
        }
      },
    },
  });
};

/**
 * Creates an isolated, stateless Supabase client that never reads or writes
 * cookies. Use this for step-up password verification (`signInWithPassword`)
 * so an active AAL2 session cookie is never downgraded to AAL1 or have its
 * persistence attributes overwritten.
 */
export const createStatelessClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL and anon key must be configured");
  }

  return createSupabaseJsClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};
