import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { rateLimited } from "@/lib/http";

export const runtime = "nodejs";

const VALID_JENJANG = ["sd", "smp", "sma", "smk"] as const;
type Jenjang = (typeof VALID_JENJANG)[number];

type SchoolItem = {
  npsn?: string;
  sekolah?: string;
  bentuk?: string;
  status?: string;
  alamat_jalan?: string;
  kecamatan?: string;
  kabupaten_kota?: string;
  propinsi?: string;
};

interface ApiResponse {
  data: SchoolItem[];
  hasMore: boolean;
}

const searchQuerySchema = z.object({
  q: z.string().trim().max(100).catch(""),
  jenjang: z
    .string()
    .trim()
    .toLowerCase()
    .refine((v): v is Jenjang => (VALID_JENJANG as readonly string[]).includes(v))
    .optional()
    .catch(undefined),
  page: z.coerce.number().int().min(1).max(100).catch(1),
  perPage: z.coerce.number().int().min(1).max(50).catch(10),
});

function sanitizeSchoolItem(raw: unknown): SchoolItem | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const item = raw as Record<string, unknown>;
  const asString = (val: unknown) => (typeof val === "string" ? val : undefined);

  return {
    npsn: asString(item.npsn),
    sekolah: asString(item.sekolah),
    bentuk: asString(item.bentuk),
    status: asString(item.status),
    alamat_jalan: asString(item.alamat_jalan),
    kecamatan: asString(item.kecamatan),
    kabupaten_kota: asString(item.kabupaten_kota),
    propinsi: asString(item.propinsi),
  };
}

async function fetchWithTimeout(
  url: string,
  signal: AbortSignal
): Promise<Response> {
  return fetch(url, { signal, redirect: "error" });
}

export async function GET(request: NextRequest) {
  const limit = await rateLimit(request, {
    key: "schools-search",
    limit: 30,
    windowSeconds: 60,
  });

  if (!limit.success) {
    return rateLimited(limit.retryAfter);
  }

  const { searchParams } = new URL(request.url);
  const { q, jenjang, page, perPage } = searchQuerySchema.parse({
    q: searchParams.get("q") ?? "",
    jenjang: searchParams.get("jenjang") ?? undefined,
    page: searchParams.get("page") ?? "1",
    perPage: searchParams.get("perPage") ?? "10",
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  const empty: ApiResponse = { data: [], hasMore: false };

  try {
    let upstreamUrl: string;

    if (jenjang && q.length >= 3) {
      // The upstream specific jenjang endpoints (e.g. /sekolah/sma?sekolah=X) ignore the sekolah parameter.
      // So we MUST use the generic search endpoint /sekolah/s and filter locally.
      upstreamUrl = `https://api-sekolah-indonesia.vercel.app/sekolah/s?sekolah=${encodeURIComponent(q)}&page=${page}&perPage=100`;
    } else if (jenjang) {
      // Browse all schools of this jenjang (paginated, no query filter)
      upstreamUrl = `https://api-sekolah-indonesia.vercel.app/sekolah/${jenjang}?page=${page}&perPage=${perPage}`;
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

    const rawList: unknown[] = Array.isArray(body)
      ? body
      : Array.isArray(body?.dataSekolah)
        ? body.dataSekolah
        : [];

    let list: SchoolItem[] = rawList
      .map(sanitizeSchoolItem)
      .filter((item): item is SchoolItem => item !== null && Boolean(item.sekolah));

    let hasMore = list.length >= perPage;

    // If we searched by query AND jenjang, we fetched from the generic endpoint
    // and must filter by jenjang manually since the API doesn't support it.
    if (jenjang && q.length >= 3) {
      list = list.filter((item) => (item.bentuk?.toLowerCase() ?? "") === jenjang);
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
