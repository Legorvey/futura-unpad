import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const VALID_JENJANG = ["sd", "smp", "sma", "smk"] as const;
type Jenjang = (typeof VALID_JENJANG)[number];

interface ApiResponse {
  data: Record<string, unknown>[];
  hasMore: boolean;
}

async function fetchWithTimeout(
  url: string,
  signal: AbortSignal
): Promise<Response> {
  return fetch(url, { signal });
}

export async function GET(request: NextRequest) {
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
      // Search by name within a specific jenjang
      upstreamUrl = `https://api-sekolah-indonesia.vercel.app/sekolah/${jenjangRaw}?sekolah=${encodeURIComponent(q)}&page=${page}&perPage=${perPage}`;
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

    // API shape: { dataSekolah: [...] } or bare array
    const list: Record<string, unknown>[] = Array.isArray(body)
      ? body
      : Array.isArray(body?.dataSekolah)
        ? body.dataSekolah
        : [];

    const hasMore = list.length >= perPage;

    return NextResponse.json({ data: list, hasMore } satisfies ApiResponse);
  } catch {
    return NextResponse.json(empty);
  } finally {
    clearTimeout(timeoutId);
  }
}
