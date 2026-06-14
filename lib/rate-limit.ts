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

const getClientIp = (request: Request) => {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
};

const getRateLimitKey = (request: Request, key: string) =>
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

const rateLimitWithUpstash = async (
  key: string,
  options: RateLimitOptions
): Promise<RateLimitResult | null> => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, options.windowSeconds],
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
};

export const rateLimit = async (
  request: Request,
  options: RateLimitOptions
): Promise<RateLimitResult> => {
  const key = getRateLimitKey(request, options.key);
  const upstashResult = await rateLimitWithUpstash(key, options);

  if (upstashResult) {
    return upstashResult;
  }

  return rateLimitWithMemory(key, options);
};
