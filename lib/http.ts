import { NextResponse } from "next/server";

export const jsonError = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });

export const invalidRequest = () => jsonError("Invalid request", 400);

export const payloadTooLarge = () => jsonError("Payload too large", 413);

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

type JsonBodyResult =
  | { ok: true; data: unknown }
  | { ok: false; response: NextResponse };

const jsonByteLength = (value: string) => new TextEncoder().encode(value).length;

export const readJsonBody = async (
  request: Request,
  maxBytes = 16_384
): Promise<JsonBodyResult> => {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return { ok: false, response: invalidRequest() };
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return { ok: false, response: payloadTooLarge() };
  }

  const bodyText = await request.text().catch(() => null);

  if (bodyText === null) {
    return { ok: false, response: invalidRequest() };
  }

  if (jsonByteLength(bodyText) > maxBytes) {
    return { ok: false, response: payloadTooLarge() };
  }

  try {
    return { ok: true, data: JSON.parse(bodyText) };
  } catch {
    return { ok: false, response: invalidRequest() };
  }
};
