import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * SECURITY & HARDENING:
 * Mechatura registration is completely closed.
 * Any incoming POST request is rejected immediately with 403 Forbidden
 * before any parsing, authentication, storage, or database operations occur.
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "Pendaftaran Mechatura telah resmi ditutup.",
    },
    { status: 403 }
  );
}
