/* eslint-disable */
"use client"

import { DataTable } from "./data-table"
import { columns } from "./participants"
import type { Participants } from "./participants"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronLeft, ChevronRight, Download, Search, X, GraduationCap, Users, User, Briefcase, CheckCircle2, XCircle, List, Globe, Clock, Map, UserCheck, UsersRound, BookOpen } from "lucide-react"
import { useRouter } from "nextjs-toploader/app"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const statusOptions = [
    { value: "all", label: "All statuses", icon: UsersRound },
    { value: "mahasiswa", label: "Mahasiswa", icon: GraduationCap },
    { value: "siswa", label: "Siswa", icon: BookOpen },
    { value: "dosen", label: "Dosen", icon: Briefcase },
    { value: "umum", label: "Umum", icon: Globe },
]

const typeOptions = [
    { value: "all", label: "All types", icon: Map },
    { value: "individual", label: "Individual", icon: User },
    { value: "group", label: "Group", icon: Users },
]

const attendanceOptions = [
    { value: "all", label: "All check-ins", icon: UserCheck },
    { value: "checked-in", label: "Checked in", icon: CheckCircle2 },
    { value: "pending", label: "Not checked in", icon: XCircle },
    { value: "partial", label: "Partially checked in", icon: Clock },
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


    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        updateFilter("search", formData.get("search") as string)
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
                <form onSubmit={onSubmit} className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between rounded-xl border border-border/50 p-2.5 bg-card/40 backdrop-blur-md shadow-sm">
                    <div className="relative flex-1 w-full md:max-w-md">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            key={searchParam ?? "empty"}
                            name="search"
                            defaultValue={searchParam ?? ""}
                            placeholder="Search registrations..."
                            className="h-10 w-full rounded-lg border border-input bg-background px-4 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <button type="submit" className="sr-only">Search</button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button type="button" variant="outline" className="h-10 w-[160px] justify-between rounded-lg bg-background">
                                    <span className="truncate flex items-center gap-2">
                                        {(() => {
                                            const opt = statusOptions.find(o => o.value === (categoryFilter ?? "all"))
                                            const Icon = opt?.icon || UsersRound
                                            return <><Icon className="h-4 w-4" />{opt?.label || "Status"}</>
                                        })()}
                                    </span>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[160px]">
                                {statusOptions.map((option) => {
                                    const Icon = option.icon
                                    return (
                                        <DropdownMenuItem key={option.value} onSelect={() => updateFilter("category", option.value)}>
                                            <Icon className="mr-2 h-4 w-4" />
                                            {option.label}
                                        </DropdownMenuItem>
                                    )
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button type="button" variant="outline" className="h-10 w-[160px] justify-between rounded-lg bg-background">
                                    <span className="truncate flex items-center gap-2">
                                        {(() => {
                                            const opt = typeOptions.find(o => o.value === (typeFilter ?? "all"))
                                            const Icon = opt?.icon || Map
                                            return <><Icon className="h-4 w-4" />{opt?.label || "Type"}</>
                                        })()}
                                    </span>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[160px]">
                                {typeOptions.map((option) => {
                                    const Icon = option.icon
                                    return (
                                        <DropdownMenuItem key={option.value} onSelect={() => updateFilter("type", option.value)}>
                                            <Icon className="mr-2 h-4 w-4" />
                                            {option.label}
                                        </DropdownMenuItem>
                                    )
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button type="button" variant="outline" className="h-10 w-[190px] justify-between rounded-lg bg-background">
                                    <span className="truncate flex items-center gap-2">
                                        {(() => {
                                            const opt = attendanceOptions.find(o => o.value === (attendanceFilter ?? "all"))
                                            const Icon = opt?.icon || UserCheck
                                            return <><Icon className="h-4 w-4" />{opt?.label || "Check-ins"}</>
                                        })()}
                                    </span>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[190px]">
                                {attendanceOptions.map((option) => {
                                    const Icon = option.icon
                                    return (
                                        <DropdownMenuItem key={option.value} onSelect={() => updateFilter("attendance", option.value)}>
                                            <Icon className="mr-2 h-4 w-4" />
                                            {option.label}
                                        </DropdownMenuItem>
                                    )
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>


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
                            onClick={() => router.push(pageSize !== defaultPageSize ? `/admin/seminar?pageSize=${pageSize}` : "/admin/seminar")}
                            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 ml-2 transition-colors"
                        >
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            <DataTable columns={columns} data={participants} />

            <div className="flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground hidden sm:block">Rows per page</p>
                    <p className="font-medium text-foreground sm:hidden">Rows</p>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 w-[70px] justify-between px-2">
                                {pageSize}
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="top" align="start" className="w-[70px]">
                            {pageSizeOptions.map((option) => (
                                <DropdownMenuItem key={option} onSelect={() => updateFilter("pageSize", String(option))}>
                                    {option}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8">
                    <div className="text-sm text-muted-foreground font-medium">
                        Showing {pagination.startItem}-{pagination.endItem} of {pagination.totalItems}
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                            Page {pagination.page} of {pagination.totalPages}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                disabled={pagination.page <= 1}
                                asChild={pagination.page > 1}
                            >
                                {pagination.page <= 1 ? (
                                    <ChevronLeft className="h-4 w-4" />
                                ) : (
                                    <Link href={buildPageHref(pagination.page - 1)} prefetch={false}>
                                        <span className="sr-only">Go to previous page</span>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Link>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                disabled={pagination.page >= pagination.totalPages}
                                asChild={pagination.page < pagination.totalPages}
                            >
                                {pagination.page >= pagination.totalPages ? (
                                    <ChevronRight className="h-4 w-4" />
                                ) : (
                                    <Link href={buildPageHref(pagination.page + 1)} prefetch={false}>
                                        <span className="sr-only">Go to next page</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
