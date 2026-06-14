import { NextResponse } from "next/server";

export const jsonError = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });

export const invalidRequest = () => jsonError("Invalid request", 400);

export const serverError = () => jsonError("Something went wrong", 500);

export const rateLimited = (retryAfter: number) =>
  NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfter.toString(),
      },
    }
  );
