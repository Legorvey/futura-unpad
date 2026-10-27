"use client"

import { DataTable } from "./data-table"
import { columns } from "./participants"
import type { Participants } from "./participants"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronLeft, ChevronRight, Download, Search, X, GraduationCap, Users, User, Briefcase, CheckCircle2, XCircle, Globe, Clock, Map, UserCheck, UsersRound, BookOpen } from "lucide-react"
import { useRouter } from "nextjs-toploader/app"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const statusOptions = [
    { value: "all", label: "Semua status", icon: UsersRound },
    { value: "mahasiswa", label: "Mahasiswa", icon: GraduationCap },
    { value: "siswa", label: "Siswa", icon: BookOpen },
    { value: "dosen", label: "Dosen", icon: Briefcase },
    { value: "umum", label: "Umum", icon: Globe },
]

const typeOptions = [
    { value: "all", label: "Semua tipe", icon: Map },
    { value: "individual", label: "Individu", icon: User },
    { value: "group", label: "Grup", icon: Users },
]

const attendanceOptions = [
    { value: "all", label: "Semua check-in", icon: UserCheck },
    { value: "checked-in", label: "Sudah check-in", icon: CheckCircle2 },
    { value: "pending", label: "Belum check-in", icon: XCircle },
    { value: "partial", label: "Check-in sebagian", icon: Clock },
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
            label: "Check-in",
            value: stats.checkedInAttendees,
        },
        {
            label: "Grup",
            value: stats.groupRegistrations,
        },
        {
            label: "Individu",
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
            label: `Cari: "${searchParam}"`,
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
            label: `Tipe: ${label}`,
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
        <div className="mx-auto w-full max-w-7xl space-y-6 min-w-0">
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            Seminar
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 sm:h-9 px-3 sm:px-3.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs sm:text-sm font-medium transition-colors shrink-0"
                            asChild
                        >
                            <a href="/api/admin/seminar-registrations/export" download>
                                <Download className="h-3.5 w-3.5 mr-1.5" />
                                Ekspor CSV
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Resend-style Pill Tabs for Registration Type */}
                <div
                    role="tablist"
                    aria-label="Tipe Pendaftaran"
                    className="flex items-center gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                    {typeOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            role="tab"
                            aria-selected={(typeFilter ?? "all") === option.value}
                            onClick={() => updateFilter("type", option.value)}
                            className={`rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap ${
                                (typeFilter ?? "all") === option.value
                                    ? "bg-zinc-800 text-white dark:bg-zinc-800 dark:text-zinc-100 shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Metrics strip - matching Resend mobile layout */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-4 border-y border-zinc-800/60">
                {metrics.map((metric) => (
                    <div key={metric.label} className="min-w-0">
                        <div className="flex flex-col gap-1">
                            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-400 truncate">
                                {metric.label}
                            </span>
                            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                                {metric.value}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Resend-style Filter Bar */}
            <form onSubmit={onSubmit} className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 sm:gap-2.5 min-w-0 max-w-full">
                <div className="relative flex-1 min-w-0">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <input
                        key={searchParam ?? "empty"}
                        name="search"
                        defaultValue={searchParam ?? ""}
                        placeholder="Search nama, email, atau institusi..."
                        className="h-10 w-full rounded-xl border border-zinc-800/80 bg-zinc-950/80 px-3 pl-9 text-sm text-zinc-200 placeholder:text-zinc-500 outline-none transition-colors focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
                    />
                    <button type="submit" className="sr-only">Cari</button>
                </div>

                {/* Filter Dropdowns Grid: 2 columns on mobile/tablet, flex row on desktop */}
                <div className="grid grid-cols-2 gap-2 w-full lg:flex lg:w-auto lg:items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button type="button" variant="outline" className="w-full lg:w-auto h-10 px-3 rounded-xl bg-zinc-950/80 border-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-900/60 text-xs sm:text-sm font-medium flex items-center justify-between gap-1.5 transition-colors shrink-0">
                                <span className="truncate">
                                    {statusOptions.find(o => o.value === (categoryFilter ?? "all"))?.label || "Status Civitas"}
                                </span>
                                <ChevronDown className="h-3.5 w-3.5 text-zinc-500 shrink-0 ml-1.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-[160px] bg-zinc-900 border-zinc-800 text-zinc-200">
                            {statusOptions.map((option) => (
                                <DropdownMenuItem key={option.value} onSelect={() => updateFilter("category", option.value)}>
                                    {option.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button type="button" variant="outline" className="w-full lg:w-auto h-10 px-3 rounded-xl bg-zinc-950/80 border-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-900/60 text-xs sm:text-sm font-medium flex items-center justify-between gap-1.5 transition-colors shrink-0">
                                <span className="truncate">
                                    {attendanceOptions.find(o => o.value === (attendanceFilter ?? "all"))?.label || "Check-in"}
                                </span>
                                <ChevronDown className="h-3.5 w-3.5 text-zinc-500 shrink-0 ml-1.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-[160px] bg-zinc-900 border-zinc-800 text-zinc-200">
                            {attendanceOptions.map((option) => (
                                <DropdownMenuItem key={option.value} onSelect={() => updateFilter("attendance", option.value)}>
                                    {option.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                </div>

            </form>

            {activeFilterPills.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs text-zinc-500 font-medium">Filter aktif:</span>
                    {activeFilterPills.map(pill => (
                        <div key={pill.key} className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/70 px-2.5 py-0.5 text-xs text-zinc-300">
                            {pill.label}
                            <button 
                                onClick={pill.onRemove} 
                                className="rounded-full p-0.5 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-colors" 
                                type="button"
                                aria-label="Remove filter"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                    <button 
                        type="button"
                        onClick={() => router.push(pageSize !== defaultPageSize ? `/admin/seminar?pageSize=${pageSize}` : "/admin/seminar")}
                        className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-2 ml-2 transition-colors"
                    >
                        Hapus semua
                    </button>
                </div>
            )}

            <DataTable columns={columns} data={participants} />

            <div className="flex flex-col gap-3.5 border-t border-zinc-800/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center justify-between sm:justify-start gap-3 text-sm text-zinc-400">
                    <div className="flex items-center gap-2">
                        <p className="font-medium text-zinc-300 hidden sm:block">Baris per halaman</p>
                        <p className="font-medium text-zinc-300 sm:hidden">Baris</p>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 w-[70px] justify-between px-2 bg-zinc-950/80 border-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-900/60">
                                    {pageSize}
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top" align="start" className="w-[70px] bg-zinc-900 border-zinc-800 text-zinc-200">
                                {pageSizeOptions.map((option) => (
                                    <DropdownMenuItem key={option} onSelect={() => updateFilter("pageSize", String(option))}>
                                        {option}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="text-xs text-zinc-400 sm:hidden font-medium">
                        {pagination.startItem}-{pagination.endItem} dari {pagination.totalItems}
                    </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 lg:gap-8">
                    <div className="hidden sm:block text-sm text-zinc-400 font-medium">
                        Menampilkan {pagination.startItem}-{pagination.endItem} dari {pagination.totalItems}
                    </div>
                    
                    <div className="flex items-center gap-3 w-full justify-between sm:w-auto">
                        <div className="text-xs sm:text-sm font-medium text-zinc-300">
                            Hal. {pagination.page} / {pagination.totalPages}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0 bg-zinc-950/80 border-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-900/60"
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
                                className="h-8 w-8 p-0 bg-zinc-950/80 border-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-900/60"
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
