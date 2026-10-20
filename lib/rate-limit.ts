import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitOptions = {
  key: string;
  limit: number;
  windowSeconds: number;
};

type RateLimitResult = {
  success: boolean;
  retryAfter: number;
};

type MemoryEntry = {
  count: number;
  resetAt: number;
};

const memoryStore = new Map<string, MemoryEntry>();

// Clean up expired entries every 10 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memoryStore.entries()) {
    if (value.resetAt <= now) {
      memoryStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

export const getClientIp = (request: Request | { headers: Headers }) => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
};

const getRateLimitKey = (request: Request | { headers: Headers }, key: string) =>
  `rate-limit:${key}:${getClientIp(request)}`;

const rateLimitWithMemory = (
  key: string,
  options: RateLimitOptions
): RateLimitResult => {
  const now = Date.now();
  const existing = memoryStore.get(key);

  if (!existing || existing.resetAt <= now) {
    memoryStore.set(key, {
      count: 1,
      resetAt: now + options.windowSeconds * 1000,
    });
    return { success: true, retryAfter: options.windowSeconds };
  }

  existing.count += 1;
  return {
    success: existing.count <= options.limit,
    retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
};

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

// Cache instances to avoid recreating them
const limiterCache = new Map<string, Ratelimit>();

const getUpstashLimiter = (limit: number, windowSeconds: number) => {
  const cacheKey = `${limit}:${windowSeconds}`;
  if (limiterCache.has(cacheKey)) {
    return limiterCache.get(cacheKey)!;
  }
  if (!redis) return null;

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
    analytics: true,
    prefix: "@upstash/ratelimit:api",
  });
  limiterCache.set(cacheKey, limiter);
  return limiter;
};

export const rateLimit = async (
  request: Request | { headers: Headers },
  options: RateLimitOptions
): Promise<RateLimitResult> => {
  const key = getRateLimitKey(request, options.key);
  
  const limiter = getUpstashLimiter(options.limit, options.windowSeconds);
  if (limiter) {
    const { success, reset } = await limiter.limit(key);
    return {
      success,
      retryAfter: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
    };
  }

  return rateLimitWithMemory(key, options);
};
