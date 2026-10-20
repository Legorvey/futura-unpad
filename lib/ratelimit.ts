import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Only instantiate Redis if credentials are provided. This avoids crashing the build or app if env vars are missing.
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

// Generic sliding window rate limiter (e.g., for form submissions)
// Allows 5 requests per 10 seconds.
export const formRatelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(5, "10 s"),
      analytics: true,
      prefix: "@upstash/ratelimit:form",
    })
  : null;

// Stricter rate limiter for Authentication endpoints to prevent brute force
// Allows 5 requests per 1 minute.
export const authRatelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: true,
      prefix: "@upstash/ratelimit:auth",
    })
  : null;
