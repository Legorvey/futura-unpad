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

const getClientIp = (request: Request) => {
  // In Vercel deployments, x-vercel-forwarded-for is injected by edge proxies and cannot be forged by client
  const vercelForwardedFor = request.headers.get("x-vercel-forwarded-for");
  if (vercelForwardedFor) {
    return vercelForwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Take the last hop appended by the trusted reverse proxy to avoid client-spoofed prefix
    const parts = forwardedFor.split(",").map((p) => p.trim()).filter(Boolean);
    return parts[parts.length - 1] || "unknown";
  }

  return "unknown";
};

const getRateLimitKey = (target: Request | string, key: string) => {
  const targetId = typeof target === "string" ? target : getClientIp(target);
  return `rate-limit:${key}:${targetId}`;
};

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

const rateLimitWithUpstash = async (
  key: string,
  options: RateLimitOptions
): Promise<RateLimitResult | null> => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  try {
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, options.windowSeconds, "NX"],
      ]),
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as Array<{ result?: unknown }>;
    const count = Number(data[0]?.result ?? 0);

    return {
      success: count <= options.limit,
      retryAfter: options.windowSeconds,
    };
  } catch (error) {
    console.error("Upstash rate limit error:", error);
    return null;
  }
};

export const rateLimit = async (
  target: Request | string,
  options: RateLimitOptions
): Promise<RateLimitResult> => {
  const key = getRateLimitKey(target, options.key);
  const upstashResult = await rateLimitWithUpstash(key, options);

  if (upstashResult) {
    return upstashResult;
  }

  return rateLimitWithMemory(key, options);
};
