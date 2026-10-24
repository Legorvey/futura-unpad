import { rateLimit } from "@/lib/rate-limit";

// Generic rate limiter for form submissions (5 requests per 10 seconds)
export const formRatelimit = {
  limit: (identifier: string) =>
    rateLimit(identifier, {
      key: "form",
      limit: 5,
      windowSeconds: 10,
    }),
};

// Stricter rate limiter for authentication endpoints (5 requests per 1 minute)
export const authRatelimit = {
  limit: (identifier: string) =>
    rateLimit(identifier, {
      key: "auth",
      limit: 5,
      windowSeconds: 60,
    }),
};
