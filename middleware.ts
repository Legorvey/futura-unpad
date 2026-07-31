import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // SECURITY & HARDENING: Ensure unopened registration forms are completely inaccessible.
  // Intercepting at the middleware layer prevents any unauthorized access, execution, 
  // or SSR bypass before the route is even processed.
  const path = request.nextUrl.pathname;
  
  if (path.startsWith("/seminar-nasional/form")) {
    return NextResponse.redirect(new URL("/seminar-nasional", request.url));
  }
  
  if (path.startsWith("/lomba-essay/form")) {
    return NextResponse.redirect(new URL("/lomba-essay", request.url));
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
