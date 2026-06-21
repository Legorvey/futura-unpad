"use client"

import { DataTable } from "./data-table"
import { columns } from "./participants"
import type { Participants } from "./participants"
import { Button } from "@/components/ui/button"
import { Download, Scan } from "lucide-react"
import Link from "next/link"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function SeminarListClient({
    initialData,
    searchParam,
    categoryFilter,
    stats,
}: {
    initialData: Participants[]
    searchParam?: string
    categoryFilter?: string
    stats: {
        total: number
        mahasiswa: number
        siswa: number
        dosen: number
        umum: number
    }
}) {
    const participants = initialData

    return (
        <div className="mx-auto w-full max-w-6xl space-y-8">
            <section className="rounded-xl bg-card">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h2 className="font-semibold text-2xl">Seminar Registrations</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Search and filter free seminar registrations.
                        </p>
                    </div>
                    <form className="grid gap-3 sm:grid-cols-2 lg:min-w-[400px]" action="/admin/seminar">
                        <input
                            name="search"
                            defaultValue={searchParam ?? ""}
                            placeholder="Search name, email, phone"
                            className="h-10 rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        />
                        <div className="flex flex-wrap gap-3">
                            <Select name="category" defaultValue={categoryFilter ?? "all"}>
                                <SelectTrigger className="w-full h-10 rounded-xl">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                                    <SelectItem value="siswa">Siswa</SelectItem>
                                    <SelectItem value="dosen">Dosen</SelectItem>
                                    <SelectItem value="umum">Umum</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button className="h-10 rounded-xl px-6">
                                Apply
                            </Button>
                            <Button variant="outline" className="h-10 rounded-xl px-4 shrink-0" asChild>
                                <a href="/api/admin/seminar-registrations/export" download>
                                    <Download className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Export CSV</span>
                                </a>
                            </Button>
                            <Button className="h-10 rounded-xl px-4 shrink-0 bg-blue-600 hover:bg-blue-700 text-white" asChild>
                                <Link href="/admin/scanner">
                                    <Scan className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Open Scanner</span>
                                </Link>
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="grid gap-3 border-y border-border py-6 mt-6 grid-cols-2 md:grid-cols-5">
                    <div className="rounded-lg border border-border bg-card/90 p-5">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">{stats.total}</p>
                    </div>
                    <div className="rounded-lg border border-border p-5">
                        <p className="text-sm text-muted-foreground">Mahasiswa</p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">{stats.mahasiswa}</p>
                    </div>
                    <div className="rounded-lg border border-border p-5">
                        <p className="text-sm text-muted-foreground">Siswa</p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">{stats.siswa}</p>
                    </div>
                    <div className="rounded-lg border border-border p-5">
                        <p className="text-sm text-muted-foreground">Dosen</p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">{stats.dosen}</p>
                    </div>
                    <div className="rounded-lg border border-border p-5">
                        <p className="text-sm text-muted-foreground">Umum</p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">{stats.umum}</p>
                    </div>
                </div>

                <div className="mt-6">
                    <DataTable columns={columns} data={participants} />
                </div>
            </section>
        </div>
    )
}
