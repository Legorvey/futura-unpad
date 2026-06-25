export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

import { requireAdminOrRedirect } from "@/lib/auth"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type AdminSearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function LKTIAdminPage({
    searchParams,
}: {
    searchParams: AdminSearchParams
}) {
    const params = await searchParams
    const categoryParam = Array.isArray(params.category)
        ? params.category[0]
        : params.category
    const searchParam = Array.isArray(params.search)
        ? params.search[0]
        : params.search

    await requireAdminOrRedirect()

    return (
        <div className="mx-auto w-full max-w-6xl space-y-8">
            <section className="rounded-xl bg-card">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h2 className="font-semibold text-2xl">Lomba Karya Tulis Ilmiah (LKTI)</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Search and filter LKTI participants.
                        </p>
                    </div>
                    <form className="grid gap-3 sm:grid-cols-2 lg:min-w-[400px]" action="/admin/lomba-kti">
                        <input
                            name="search"
                            defaultValue={searchParam ?? ""}
                            placeholder="Search team, name, paper title"
                            className="h-10 rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        />
                        <div className="flex gap-3">
                            <Select name="category" defaultValue={categoryParam ?? "all"}>
                                <SelectTrigger className="w-full h-10 rounded-xl">
                                    <SelectValue placeholder="All Sub-Themes" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sub-Themes</SelectItem>
                                    <SelectItem value="teknologi">Teknologi</SelectItem>
                                    <SelectItem value="kesehatan">Kesehatan</SelectItem>
                                    <SelectItem value="ekonomi">Ekonomi</SelectItem>
                                    <SelectItem value="sosial">Sosial</SelectItem>
                                    <SelectItem value="pendidikan">Pendidikan</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button className="h-10 rounded-xl px-6">
                                Apply
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="grid gap-3 border-y border-border py-6 mt-6 sm:grid-cols-4">
                    <div className="rounded-lg border border-border bg-card/90 p-5 opacity-50">
                        <p className="text-sm text-muted-foreground">Total Teams</p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">-</p>
                    </div>
                    <div className="rounded-lg border border-border p-5 opacity-50">
                        <p className="text-sm text-muted-foreground">Paid Teams</p>
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
                        Backend Not Integrated Yet
                    </p>
                    <p className="mt-2 text-sm leading-6 text-amber-700">
                        There is currently no backend database table for Lomba Karya Tulis Ilmiah registrations. This page will display participant data and real metrics once the integration is complete.
                    </p>
                </div>
            </section>
        </div>
    )
}
