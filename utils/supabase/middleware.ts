import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import {
  AUTH_PERSISTENCE_COOKIE,
  isSessionAuthPersistence,
} from "@/utils/supabase/auth-cookies";

import { isAuthRequiredPath, buildLoginRedirectHref } from "@/lib/auth-routes";

export const updateSession = async (request: NextRequest) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Middleware error: Missing Supabase environment variables");
    return NextResponse.next();
  }
  const sessionOnly = isSessionAuthPersistence(
    request.cookies.get(AUTH_PERSISTENCE_COOKIE)?.value
  );

  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        Object.entries(headers).forEach(([key, value]) =>
          supabaseResponse.headers.set(key, value)
        );
        cookiesToSet.forEach(({ name, value, options }) => {
          if (sessionOnly && value) {
            const sessionOptions = { ...options };
            delete sessionOptions.maxAge;
            delete sessionOptions.expires;
            supabaseResponse.cookies.set(name, value, sessionOptions);
            return;
          }

          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = isAuthRequiredPath(pathname);

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  const hasRecoveryContext = request.cookies.has("futura_password_recovery");
  if (user && hasRecoveryContext && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/reset-password';
    
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  return supabaseResponse;
};
