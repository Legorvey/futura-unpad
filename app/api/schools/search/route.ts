import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const VALID_JENJANG = ["sd", "smp", "sma", "smk"] as const;
type Jenjang = (typeof VALID_JENJANG)[number];

interface ApiResponse {
  data: Record<string, unknown>[];
  hasMore: boolean;
}

// Simple in-memory rate limiter (best-effort for serverless)
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();
const RATE_LIMIT_MAX = 20; // Max requests per minute
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

async function fetchWithTimeout(
  url: string,
  signal: AbortSignal
): Promise<Response> {
  return fetch(url, { signal });
}

export async function GET(request: NextRequest) {
  // Rate Limiting Check
  const ip = request.headers.get("x-forwarded-for") ?? "unknown-ip";
  const now = Date.now();
  const limitRecord = rateLimitMap.get(ip);

  if (limitRecord) {
    if (now > limitRecord.expiresAt) {
      rateLimitMap.set(ip, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
    } else {
      if (limitRecord.count >= RATE_LIMIT_MAX) {
        return new NextResponse("Too Many Requests", { status: 429 });
      }
      limitRecord.count += 1;
    }
  } else {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
  }

  // Cleanup old entries to prevent memory leak
  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.expiresAt < now) {
        rateLimitMap.delete(key);
      }
    }
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const jenjangRaw = searchParams.get("jenjang")?.toLowerCase() ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const perPage = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("perPage") ?? "10", 10))
  );

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  const empty: ApiResponse = { data: [], hasMore: false };

  try {
    const isValidJenjang = VALID_JENJANG.includes(jenjangRaw as Jenjang);

    let upstreamUrl: string;

    if (isValidJenjang && q.length >= 3) {
      // The upstream specific jenjang endpoints (e.g. /sekolah/sma?sekolah=X) ignore the sekolah parameter.
      // So we MUST use the generic search endpoint /sekolah/s and filter locally.
      upstreamUrl = `https://api-sekolah-indonesia.vercel.app/sekolah/s?sekolah=${encodeURIComponent(q)}&page=${page}&perPage=100`;
    } else if (isValidJenjang) {
      // Browse all schools of this jenjang (paginated, no query filter)
      upstreamUrl = `https://api-sekolah-indonesia.vercel.app/sekolah/${jenjangRaw}?page=${page}&perPage=${perPage}`;
    } else if (q.length >= 3) {
      // Generic search across all schools
      upstreamUrl = `https://api-sekolah-indonesia.vercel.app/sekolah/s?sekolah=${encodeURIComponent(q)}&page=${page}&perPage=${perPage}`;
    } else {
      return NextResponse.json(empty);
    }

    const upstream = await fetchWithTimeout(upstreamUrl, controller.signal);

    if (!upstream.ok) {
      return NextResponse.json(empty);
    }

    const body = await upstream.json();

    let list: Record<string, unknown>[] = Array.isArray(body)
      ? body
      : Array.isArray(body?.dataSekolah)
        ? body.dataSekolah
        : [];

    let hasMore = list.length >= perPage;

    // If we searched by query AND jenjang, we fetched from the generic endpoint
    // and must filter by jenjang manually since the API doesn't support it.
    if (isValidJenjang && q.length >= 3) {
      list = list.filter((item) => {
        const bentuk = (item.bentuk as string)?.toLowerCase() ?? "";
        // 'smp' matches 'smp', 'sma' matches 'sma', etc.
        // The API returns 'SMA', 'SMK', 'SD', 'SMP'
        return bentuk === jenjangRaw;
      });
      // We requested 100 items from upstream, but we'll paginate them manually for the client
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      hasMore = list.length > endIndex;
      list = list.slice(startIndex, endIndex);
    }

    return NextResponse.json({ data: list, hasMore } satisfies ApiResponse);
  } catch {
    return NextResponse.json(empty);
  } finally {
    clearTimeout(timeoutId);
  }
}
