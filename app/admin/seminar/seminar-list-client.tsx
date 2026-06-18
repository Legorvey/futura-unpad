"use client"

import { DataTable } from "./data-table"
import { columns } from "./participants"
import type { Participants } from "./participants"
import { Button } from "@/components/ui/button"
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
}: {
    initialData: Participants[]
    searchParam?: string
    categoryFilter?: string
}) {
    const participants = initialData
    const studentCount = participants.filter(
        (participant) =>
            participant.status_akademika === "mahasiswa" ||
            participant.status_akademika === "siswa"
    ).length
    const educatorCount = participants.filter(
        (participant) => participant.status_akademika === "dosen"
    ).length

    return (
        <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-10 sm:px-8">
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
                        <div className="flex gap-3">
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
                        </div>
                    </form>
                </div>

                <div className="grid gap-3 border-y border-border py-6 mt-6 sm:grid-cols-3">
                    <div className="rounded-lg border border-border bg-card/90 p-5">
                        <p className="text-sm text-muted-foreground">Total registrations</p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">{participants.length}</p>
                    </div>
                    <div className="rounded-lg border border-border p-5">
                        <p className="text-sm text-muted-foreground">Students (Mhs/Siswa)</p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">{studentCount}</p>
                    </div>
                    <div className="rounded-lg border border-border p-5">
                        <p className="text-sm text-muted-foreground">Educators (Dosen)</p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">{educatorCount}</p>
                    </div>
                </div>

                <div className="mt-6">
                    <DataTable columns={columns} data={participants} />
                </div>
            </section>
        </main>
    )
}
