import { NextResponse } from "next/server";
import { z } from "zod";
import {
  NO_STORE_HEADERS,
  invalidRequest,
  isSameOriginRequest,
  jsonError,
  rateLimited,
  readJsonBody,
  serverError,
} from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import {
  hasSeminarRegistrationStarted,
  isSeminarRegistrationOpen,
} from "@/lib/seminar/config";
import { isSeminarEmailRegistered } from "@/lib/seminar/server-config";
import { emailSchema } from "@/lib/validation/auth";

export const runtime = "nodejs";

const checkEmailBodySchema = z.object({
  email: emailSchema,
});

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return jsonError("Forbidden", 403);
  }

  if (!isSeminarRegistrationOpen()) {
    return NextResponse.json(
      {
        error: hasSeminarRegistrationStarted()
          ? "Pendaftaran Seminar Nasional telah ditutup."
          : "Pendaftaran Seminar Nasional belum dibuka.",
      },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }

  const ipLimit = await rateLimit(request, {
    key: "seminar-email-check-ip",
    limit: 30,
    windowSeconds: 300,
  });

  if (!ipLimit.success) {
    return rateLimited(ipLimit.retryAfter);
  }

  const body = await readJsonBody(request, 4_096);
  if (!body.ok) {
    return body.response;
  }

  const parsed = checkEmailBodySchema.safeParse(body.data);
  if (!parsed.success) {
    return invalidRequest();
  }

  try {
    const alreadyRegistered = await isSeminarEmailRegistered(parsed.data.email);
    return NextResponse.json(
      alreadyRegistered
        ? {
            available: false,
            message:
              "Email ini sudah terdaftar pada Seminar Nasional. Satu email hanya dapat digunakan satu kali.",
          }
        : { available: true },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error(
      "Seminar email check failed",
      error instanceof Error ? error.message : error
    );
    return serverError();
  }
}
