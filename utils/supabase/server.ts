import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { AuthCookiePersistence } from "@/utils/supabase/auth-cookies";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

type CreateClientOptions = {
  authCookiePersistence?: AuthCookiePersistence;
};

export const createClient = async (options: CreateClientOptions = {}) => {
  const cookieStore = await cookies();
  const sessionOnly = options.authCookiePersistence === "session";

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

export const createAdminClient = () => {
  return createServerClient(supabaseUrl!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {},
    },
  });
};
