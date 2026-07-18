import type { z } from "zod";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export async function fetchJson<TSchema extends z.ZodType>(
  input: RequestInfo | URL,
  schema: TSchema,
  init?: RequestInit
): Promise<z.infer<TSchema>> {
  const response = await fetch(input, {
    credentials: "same-origin",
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body &&
      typeof body === "object" &&
      "error" in body &&
      typeof body.error === "string"
        ? body.error
        : "Request failed";

    throw new ApiError(message, response.status, body);
  }

  return schema.parse(body);
}

export function postJson<TSchema extends z.ZodType>(
  input: RequestInfo | URL,
  schema: TSchema,
  body?: unknown,
  init?: RequestInit
) {
  return fetchJson(input, schema, {
    credentials: "same-origin",
    ...init,
    method: init?.method ?? "POST",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
