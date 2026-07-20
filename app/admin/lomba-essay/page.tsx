import type { Metadata } from "next"
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

import { AlertCircle } from "lucide-react"
import { requireAdminOrRedirect } from "@/lib/auth"
import { Suspense } from "react"
import TableLoading from "../table-loading"
import { LombaEssayFilter } from "./lomba-essay-filter"

type AdminSearchParams = Promise<Record<string, string | string[] | undefined>>

async function LKTIAdminData({
    searchParams,
}: {
    searchParams: AdminSearchParams
}) {
    await requireAdminOrRedirect()
    const params = await searchParams
    const categoryParam = Array.isArray(params.category)
        ? params.category[0]
        : params.category
    const searchParam = Array.isArray(params.search)
        ? params.search[0]
        : params.search

    return (
        <div className="mx-auto w-full max-w-6xl space-y-8">
            <section className="rounded-xl bg-card">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h2 className="font-semibold text-2xl">Lomba Karya Tulis Ilmiah (LKTI)</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Cari dan filter peserta LKTI.
                        </p>
                    </div>
                    <LombaEssayFilter searchParam={searchParam} categoryParam={categoryParam} />
                </div>

                <div className="grid gap-3 border-y border-border py-6 mt-6 sm:grid-cols-4">
                    <div className="rounded-lg border border-border bg-card/90 p-5 opacity-50">
                        <p className="text-sm text-muted-foreground">Total Tim</p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">-</p>
                    </div>
                    <div className="rounded-lg border border-border p-5 opacity-50">
                        <p className="text-sm text-muted-foreground">Tim Lunas</p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">-</p>
                    </div>
                    <div className="rounded-lg border border-border p-5 opacity-50">
                        <p className="text-sm text-muted-foreground">Teknologi / Kesehatan</p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">-</p>
                    </div>
                    <div className="rounded-lg border border-border p-5 opacity-50">
                        <p className="text-sm text-muted-foreground">Lainnya</p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">-</p>
                    </div>
                </div>

                <div className="mt-6 rounded-[8px] border-1 border-amber-300 bg-amber-50 p-6">
                    <p className="text-sm font-medium text-amber-800 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Backend Belum Terintegrasi
                    </p>
                    <p className="mt-2 text-sm leading-6 text-amber-700">
                        Saat ini belum ada tabel basis data backend untuk pendaftaran Lomba Karya Tulis Ilmiah. Halaman ini akan menampilkan data peserta dan metrik nyata setelah integrasi selesai.
                    </p>
                </div>
            </section>
        </div>
    )
}
export const metadata: Metadata = {
  title: "Admin Lomba Essay"
}

export default function LKTIAdminPage({ searchParams }: { searchParams: AdminSearchParams }) { return <Suspense fallback={<TableLoading />}><LKTIAdminData searchParams={searchParams} /></Suspense> }
