/* eslint-disable */
"use client"

import { DataTable } from "./data-table"
import { columns } from "./participants"
import type { Participants } from "./participants"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Download, Scan, Search, X } from "lucide-react"
import { useRouter } from "next/navigation"
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
    const router = useRouter()
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

    const updateFilter = (key: string, value: string | undefined) => {
        const query = new URLSearchParams()
        
        const currentSearch = key === "search" ? value : searchParam
        const currentCategory = key === "category" ? value : (categoryFilter ?? "all")
        const currentType = key === "type" ? value : (typeFilter ?? "all")
        const currentAttendance = key === "attendance" ? value : (attendanceFilter ?? "all")
        const currentPageSize = key === "pageSize" ? Number(value) : pageSize

        if (currentSearch?.trim()) query.set("search", currentSearch.trim())
        if (currentCategory !== "all") query.set("category", currentCategory!)
        if (currentType !== "all") query.set("type", currentType!)
        if (currentAttendance !== "all") query.set("attendance", currentAttendance!)
        if (currentPageSize !== defaultPageSize) query.set("pageSize", String(currentPageSize))

        const queryString = query.toString()
        router.push(queryString ? `/admin/seminar?${queryString}` : "/admin/seminar")
    }

    const activeFilterPills = []
    if (searchParam?.trim()) {
        activeFilterPills.push({
            key: "search",
            label: `Search: "${searchParam}"`,
            onRemove: () => updateFilter("search", undefined)
        })
    }
    if ((categoryFilter ?? "all") !== "all") {
        const label = statusOptions.find(o => o.value === categoryFilter)?.label ?? categoryFilter
        activeFilterPills.push({
            key: "category",
            label: `Status: ${label}`,
            onRemove: () => updateFilter("category", "all")
        })
    }
    if ((typeFilter ?? "all") !== "all") {
        const label = typeOptions.find(o => o.value === typeFilter)?.label ?? typeFilter
        activeFilterPills.push({
            key: "type",
            label: `Type: ${label}`,
            onRemove: () => updateFilter("type", "all")
        })
    }
    if ((attendanceFilter ?? "all") !== "all") {
        const label = attendanceOptions.find(o => o.value === attendanceFilter)?.label ?? attendanceFilter
        activeFilterPills.push({
            key: "attendance",
            label: `Check-ins: ${label}`,
            onRemove: () => updateFilter("attendance", "all")
        })
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

            <div className="flex flex-col gap-5">
                <form action="/admin/seminar" className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-xl border border-border p-4 bg-card/50">
                    <div className="relative flex-1 w-full lg:max-w-xs">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            name="search"
                            defaultValue={searchParam ?? ""}
                            placeholder="Search registrations..."
                            className="h-10 w-full rounded-lg border border-input bg-background px-4 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <button type="submit" className="hidden">Search</button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Select name="category" value={categoryFilter ?? "all"} onValueChange={(v) => updateFilter("category", v)}>
                            <SelectTrigger className="h-10 w-[140px] rounded-lg bg-background">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select name="type" value={typeFilter ?? "all"} onValueChange={(v) => updateFilter("type", v)}>
                            <SelectTrigger className="h-10 w-[140px] rounded-lg bg-background">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                {typeOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select name="attendance" value={attendanceFilter ?? "all"} onValueChange={(v) => updateFilter("attendance", v)}>
                            <SelectTrigger className="h-10 w-[150px] rounded-lg bg-background">
                                <SelectValue placeholder="Check-ins" />
                            </SelectTrigger>
                            <SelectContent>
                                {attendanceOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select name="pageSize" value={String(pageSize)} onValueChange={(v) => updateFilter("pageSize", v)}>
                            <SelectTrigger className="h-10 w-[110px] rounded-lg bg-background">
                                <SelectValue placeholder="Rows" />
                            </SelectTrigger>
                            <SelectContent>
                                {pageSizeOptions.map((option) => (
                                    <SelectItem key={option} value={String(option)}>
                                        {option} rows
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </form>

                {activeFilterPills.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap px-1">
                        <span className="text-sm text-muted-foreground font-medium mr-1">Active filters:</span>
                        {activeFilterPills.map(pill => (
                            <div key={pill.key} className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground shadow-sm">
                                {pill.label}
                                <button 
                                    onClick={pill.onRemove} 
                                    className="rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" 
                                    type="button"
                                    aria-label="Remove filter"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                        <button 
                            type="button"
                            onClick={() => router.push("/admin/seminar")}
                            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 ml-2 transition-colors"
                        >
                            Clear all
                        </button>
                    </div>
                )}
            </div>

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
