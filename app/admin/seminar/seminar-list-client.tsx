"use client"

import { DataTable } from "./data-table"
import { columns } from "./participants"
import type { Participants } from "./participants"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Download, Scan, Search, X } from "lucide-react"
import Link from "next/link"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const statusOptions = [
    { value: "all", label: "All statuses" },
    { value: "mahasiswa", label: "Mahasiswa" },
    { value: "siswa", label: "Siswa" },
    { value: "dosen", label: "Dosen" },
    { value: "umum", label: "Umum" },
]

const typeOptions = [
    { value: "all", label: "All types" },
    { value: "individual", label: "Individual" },
    { value: "group", label: "Group" },
]

const attendanceOptions = [
    { value: "all", label: "All check-ins" },
    { value: "checked-in", label: "Checked in" },
    { value: "pending", label: "Not checked in" },
    { value: "partial", label: "Partially checked in" },
]

const pageSizeOptions = [10, 20, 30, 40]
const defaultPageSize = 10

export default function SeminarListClient({
    initialData,
    searchParam,
    categoryFilter,
    typeFilter,
    attendanceFilter,
    pageSize,
    pagination,
    stats,
}: {
    initialData: Participants[]
    searchParam?: string
    categoryFilter?: string
    typeFilter?: string
    attendanceFilter?: string
    pageSize: number
    pagination: {
        page: number
        pageSize: number
        totalItems: number
        totalPages: number
        startItem: number
        endItem: number
    }
    stats: {
        totalRegistrations: number
        checkedInAttendees: number
        groupRegistrations: number
        individualRegistrations: number
    }
}) {
    const participants = initialData
    const hasActiveFilters =
        !!searchParam?.trim() ||
        (categoryFilter ?? "all") !== "all" ||
        (typeFilter ?? "all") !== "all" ||
        (attendanceFilter ?? "all") !== "all"

    const metrics = [
        {
            label: "Total",
            value: stats.totalRegistrations,
        },
        {
            label: "Checked in",
            value: stats.checkedInAttendees,
        },
        {
            label: "Group",
            value: stats.groupRegistrations,
        },
        {
            label: "Individual",
            value: stats.individualRegistrations,
        },
    ]
    const buildPageHref = (page: number, nextPageSize = pageSize) => {
        const query = new URLSearchParams()

        if (searchParam?.trim()) query.set("search", searchParam.trim())
        if ((categoryFilter ?? "all") !== "all") query.set("category", categoryFilter!)
        if ((typeFilter ?? "all") !== "all") query.set("type", typeFilter!)
        if ((attendanceFilter ?? "all") !== "all") query.set("attendance", attendanceFilter!)
        if (page > 1) query.set("page", String(page))
        if (nextPageSize !== defaultPageSize) query.set("pageSize", String(nextPageSize))

        const queryString = query.toString()
        return queryString ? `/admin/seminar?${queryString}` : "/admin/seminar"
    }

    return (
        <div className="mx-auto w-full max-w-7xl space-y-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h2 className="font-semibold text-2xl tracking-tight">Seminar Registrations</h2>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button variant="outline" className="h-11 rounded-[8px] px-5" asChild>
                        <a href="/api/admin/seminar-registrations/export" download>
                            <Download className="h-4 w-4" />
                            Export CSV
                        </a>
                    </Button>
                    <Button className="h-11 rounded-[8px] px-5 bg-blue-600 text-white hover:bg-blue-700" asChild>
                        <Link href="/admin/scanner" prefetch={false}>
                            <Scan className="h-4 w-4" />
                            Open Scanner
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-y-8 border-y border-border py-7 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric, index) => {

                    return (
                        <div
                            key={metric.label}
                            className={`flex items-center gap-4 sm:px-4 xl:px-8 ${index === 0 ? "sm:pl-0" : ""} ${index < metrics.length - 1 ? "xl:border-r xl:border-border" : ""}`}
                        >
                            <div className="min-w-0">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-3xl font-semibold tracking-tight">{metric.value}</span>
                                    <span className="text-sm text-muted-foreground">{metric.label}</span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <form action="/admin/seminar">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
                    <label className="xl:flex-1">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                name="search"
                                defaultValue={searchParam ?? ""}
                                placeholder="Search registrations"
                                className="h-9 w-full rounded-[8px] border border-input bg-transparent px-4 pl-11 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                            />
                        </div>
                    </label>

                    <div className="grid gap-4 sm:grid-cols-2 xl:w-[760px] xl:grid-cols-4">
                        <div>
                            <Select name="category" defaultValue={categoryFilter ?? "all"}>
                                <SelectTrigger className="h-12 w-full rounded-[8px] px-4">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Select name="type" defaultValue={typeFilter ?? "all"}>
                                <SelectTrigger className="h-12 w-full rounded-[8px] px-4">
                                    <SelectValue placeholder="All types" />
                                </SelectTrigger>
                                <SelectContent>
                                    {typeOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Select name="attendance" defaultValue={attendanceFilter ?? "all"}>
                                <SelectTrigger className="h-12 w-full rounded-[8px] px-4">
                                    <SelectValue placeholder="All check-ins" />
                                </SelectTrigger>
                                <SelectContent>
                                    {attendanceOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Select name="pageSize" defaultValue={String(pageSize)}>
                                <SelectTrigger className="h-12 w-full rounded-[8px] px-4">
                                    <SelectValue placeholder="Rows per page" />
                                </SelectTrigger>
                                <SelectContent>
                                    {pageSizeOptions.map((option) => (
                                        <SelectItem key={option} value={String(option)}>
                                            {option} per page
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row xl:shrink-0">
                        <Button className="rounded-[8px] px-6">
                            Apply
                        </Button>
                        {hasActiveFilters ? (
                            <Button variant="outline" className="rounded-[8px] px-5" asChild>
                                <Link href="/admin/seminar" prefetch={false}>
                                    <X className="h-4 w-4" />
                                    Reset
                                </Link>
                            </Button>
                        ) : null}
                    </div>
                </div>
            </form>

            <DataTable columns={columns} data={participants} />

            <div className="flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing {pagination.startItem}-{pagination.endItem} of {pagination.totalItems} registrations
                </p>
                <div className="flex items-center gap-3">
                    {pagination.page <= 1 ? (
                        <Button variant="outline" className="h-9 rounded-[8px]" disabled>
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                    ) : (
                        <Button variant="outline" className="h-9 rounded-[8px]" asChild>
                            <Link href={buildPageHref(pagination.page - 1)} prefetch={false}>
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Link>
                        </Button>
                    )}

                    <span className="min-w-20 text-center text-sm text-muted-foreground">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>

                    {pagination.page >= pagination.totalPages ? (
                        <Button variant="outline" className="h-9 rounded-[8px]" disabled>
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button variant="outline" className="h-9 rounded-[8px]" asChild>
                            <Link href={buildPageHref(pagination.page + 1)} prefetch={false}>
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
