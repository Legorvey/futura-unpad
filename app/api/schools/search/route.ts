import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q || q.length < 3) {
    return NextResponse.json([]);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const upstream = await fetch(
      `https://api-sekolah-indonesia.vercel.app/sekolah/s?sekolah=${encodeURIComponent(q)}`,
      { signal: controller.signal }
    );

    if (!upstream.ok) {
      return NextResponse.json([]);
    }

    const data = await upstream.json();
    // The API returns { dataSekolah: [...] }
    const list = Array.isArray(data) ? data : (data?.dataSekolah ?? []);
    return NextResponse.json(list);
  } catch {
    return NextResponse.json([]);
  } finally {
    clearTimeout(timeoutId);
  }
}
