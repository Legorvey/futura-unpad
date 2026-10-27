import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * SECURITY & HARDENING:
 * Seminar Nasional registration has NOT opened yet ("belum dibuka").
 * Any incoming POST request is rejected immediately with 403 Forbidden
 * before any parsing, authentication, or database operations occur,
 * completely securing the endpoint from unauthorized submissions.
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "Pendaftaran Seminar Nasional belum dibuka.",
    },
    { status: 403 }
  );
}
