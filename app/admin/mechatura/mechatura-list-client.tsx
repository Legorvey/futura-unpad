"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mechaturaCompetitionLabels, paymentStatusLabels } from "@/lib/payment";
import { ChevronDown, ChevronLeft, ChevronRight, Download, Search, X, LayoutGrid, Swords, Truck, CircleDollarSign, Clock, CheckCircle2, BadgeCheck, XCircle, List, Ban, FileText } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import Link from "next/link";
import { DataTable } from "./data-table";
import { columns, type AdminMechaturaLeader, type AdminMechaturaRegistration } from "./teams";
import {
    buildMechaturaPageHref,
    pageSizeOptions,
    paymentFilters,
    type MechaturaCategoryFilter,
    type MechaturaPaymentFilter,
    type MechaturaStatusFilter,
    statusFilters,
} from "./_lib/mechatura-utils";

type MechaturaListClientProps = {
    registrations: AdminMechaturaRegistration[];
    leaders: AdminMechaturaLeader[];
    searchParam?: string;
    categoryFilter: MechaturaCategoryFilter;
    paymentFilter: MechaturaPaymentFilter;
    statusFilter: MechaturaStatusFilter;
    pageSize: number;
    pagination: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
        startItem: number;
        endItem: number;
    };
    stats: {
        totalTeams: number;
        paidTeams: number;
        sumoTeams: number;
        transporterTeams: number;
    };
};

const categoryOptions = [
    { value: "all", label: "Semua Kategori", icon: LayoutGrid },
    { value: "sumo", label: mechaturaCompetitionLabels.sumo, icon: Swords },
    { value: "transporter", label: mechaturaCompetitionLabels.transporter, icon: Truck },
];

const PaymentIcons: Record<string, React.ElementType> = {
    pending: Clock,
    paid: CheckCircle2,
    settled: BadgeCheck,
    expired: XCircle,
    failed: Ban,
    all: CircleDollarSign
};

export default function MechaturaListClient({
    registrations,
    leaders,
    searchParam,
    categoryFilter,
    paymentFilter,
    statusFilter,
    pageSize,
    pagination,
    stats,
}: MechaturaListClientProps) {
    const router = useRouter();
    const hasActiveFilters =
        !!searchParam?.trim() || categoryFilter !== "all" || paymentFilter !== "all" || statusFilter !== "all";
    const leaderByRegistrationId = new Map(
        leaders.map((leader) => [leader.registration_id, leader])
    );
    const metrics = [
        { label: "Total tim", value: stats.totalTeams },
        { label: "Tim lunas", value: stats.paidTeams },
        { label: "Robot Sumo", value: stats.sumoTeams },
        { label: "Robot Transporter", value: stats.transporterTeams },
    ];
    const buildPageHref = (page: number, nextPageSize = pageSize) =>
        buildMechaturaPageHref({
            page,
            pageSize: nextPageSize,
            search: searchParam,
            category: categoryFilter,
            payment: paymentFilter,
            status: statusFilter,
        });

    const updateFilter = (key: string, value: string | undefined) => {
        const newHref = buildMechaturaPageHref({
            page: 1, // reset to page 1 on filter change
            pageSize: key === "pageSize" ? Number(value) : pageSize,
            search: key === "search" ? value : searchParam,
            category: key === "category" ? (value as any) : categoryFilter,
            payment: key === "payment" ? (value as any) : paymentFilter,
            status: key === "status" ? (value as any) : statusFilter,
        });
        router.push(newHref);
    };

    const activeFilterPills = [];
    if (searchParam?.trim()) {
        activeFilterPills.push({
            key: "search",
            label: `Search: "${searchParam}"`,
            onRemove: () => updateFilter("search", undefined)
        });
    }
    if (categoryFilter !== "all") {
        const label = categoryOptions.find(o => o.value === categoryFilter)?.label;
        activeFilterPills.push({
            key: "category",
            label: `Category: ${label}`,
            onRemove: () => updateFilter("category", "all")
        });
    }
    if (paymentFilter !== "all") {
        const label = paymentStatusLabels[paymentFilter as keyof typeof paymentStatusLabels] ?? paymentFilter;
        activeFilterPills.push({
            key: "payment",
            label: `Payment: ${label}`,
            onRemove: () => updateFilter("payment", "all")
        });
    }
    if (statusFilter !== "all") {
        const label = statusFilter === "waiting_payment" ? "Menunggu Pembayaran" : 
                      statusFilter === "approved" ? "Disetujui" :
                      statusFilter === "rejected" ? "Ditolak" :
                      statusFilter === "registered" ? "Terdaftar" :
                      (statusFilter as string).charAt(0).toUpperCase() + (statusFilter as string).slice(1);
        activeFilterPills.push({
            key: "status",
            label: `Status: ${label}`,
            onRemove: () => updateFilter("status", "all")
        });
    }

    const teamData = registrations.map((reg) => ({
        ...reg,
        leader: leaderByRegistrationId.get(reg.id),
    }));

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        updateFilter("search", formData.get("search") as string);
    };

    return (
        <div className="mx-auto w-full max-w-7xl space-y-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h2 className="font-semibold text-2xl tracking-tight">Tim Mechatura</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Kelola tim kompetisi robotik, ketua, dan status pembayaran.
                    </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button variant="outline" className="h-11 rounded-[8px] px-5" asChild>
                        <a href="/api/admin/mechatura-registrations/export" download>
                            <Download className="h-4 w-4 mr-2" />
                            Ekspor CSV
                        </a>
                    </Button>
                </div>
            </div>

            <div className="grid gap-y-8 border-y border-border py-7 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric, index) => (
                    <div
                        key={metric.label}
                        className={`flex items-center gap-4 sm:px-4 xl:px-8 ${index === 0 ? "sm:pl-0" : ""} ${index < metrics.length - 1 ? "xl:border-r xl:border-border" : ""}`}
                    >
                        <div className="min-w-0">
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-semibold tracking-tight">
                                    {metric.value}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {metric.label}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-5">
                <form onSubmit={onSubmit} className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between rounded-xl border border-border/50 p-2.5 bg-card/40 backdrop-blur-md shadow-sm">
                    <div className="relative flex-1 w-full xl:max-w-md">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            key={searchParam ?? "empty"}
                            name="search"
                            defaultValue={searchParam ?? ""}
                            placeholder="Cari tim, institusi..."
                            className="h-10 w-full rounded-lg border border-input bg-background px-4 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        {/* Hidden submit button to allow Enter key to submit */}
                        <button type="submit" className="sr-only">Cari</button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button type="button" variant="outline" className="h-10 w-[180px] justify-between rounded-lg bg-background">
                                    <span className="truncate flex items-center gap-2">
                                        {(() => {
                                            const ActiveIcon = categoryOptions.find(o => o.value === categoryFilter)?.icon || LayoutGrid;
                                            return <ActiveIcon className="h-4 w-4" />;
                                        })()}
                                        {categoryOptions.find(o => o.value === categoryFilter)?.label || "Semua Tipe"}
                                    </span>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[180px]">
                                {categoryOptions.map((option) => (
                                    <DropdownMenuItem key={option.value} onSelect={() => updateFilter("category", option.value)}>
                                        <option.icon className="mr-2 h-4 w-4" />
                                        {option.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button type="button" variant="outline" className="h-10 w-[180px] justify-between rounded-lg bg-background">
                                    <span className="truncate flex items-center gap-2">
                                        {(() => {
                                            const ActiveIcon = PaymentIcons[paymentFilter] || CircleDollarSign;
                                            return <ActiveIcon className="h-4 w-4" />;
                                        })()}
                                        {paymentFilter === "all" ? "Semua Pembayaran" : paymentStatusLabels[paymentFilter as keyof typeof paymentStatusLabels]}
                                    </span>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[180px]">
                                {paymentFilters.map((status) => (
                                    <DropdownMenuItem key={status} onSelect={() => updateFilter("payment", status)}>
                                        {(() => {
                                            const OptionIcon = PaymentIcons[status] || CircleDollarSign;
                                            return <OptionIcon className="mr-2 h-4 w-4" />;
                                        })()}
                                        {status === "all" ? "Semua Pembayaran" : paymentStatusLabels[status as keyof typeof paymentStatusLabels]}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button type="button" variant="outline" className="h-10 w-[180px] justify-between rounded-lg bg-background">
                                    <span className="truncate flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        {statusFilter === "all" ? "Semua Status" : 
                                         statusFilter === "waiting_payment" ? "Menunggu Pembayaran" : 
                                         statusFilter === "approved" ? "Disetujui" :
                                         statusFilter === "rejected" ? "Ditolak" :
                                         statusFilter === "registered" ? "Terdaftar" :
                                         (statusFilter as string).charAt(0).toUpperCase() + (statusFilter as string).slice(1)}
                                    </span>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[180px]">
                                {statusFilters.map((status) => (
                                    <DropdownMenuItem key={status} onSelect={() => updateFilter("status", status)}>
                                        <FileText className="mr-2 h-4 w-4" />
                                        {status === "all" ? "Semua Status" : 
                                         status === "waiting_payment" ? "Menunggu Pembayaran" : 
                                         status === "approved" ? "Disetujui" :
                                         status === "rejected" ? "Ditolak" :
                                         status === "registered" ? "Terdaftar" :
                                         (status as string).charAt(0).toUpperCase() + (status as string).slice(1)}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>


                    </div>
                </form>

                {activeFilterPills.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap px-1">
                        <span className="text-sm text-muted-foreground font-medium mr-1">Filter aktif:</span>
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
                            onClick={() => router.push(buildMechaturaPageHref({ page: 1, pageSize, search: undefined, category: "all", payment: "all", status: "all" }))}
                            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 ml-2 transition-colors"
                        >
                            Hapus semua
                        </button>
                    </div>
                )}
            </div>

            <DataTable columns={columns} data={teamData} />

            <div className="flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground hidden sm:block">Baris per halaman</p>
                    <p className="font-medium text-foreground sm:hidden">Baris</p>
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
                        Menampilkan {pagination.startItem}-{pagination.endItem} dari {pagination.totalItems}
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                            Halaman {pagination.page} dari {pagination.totalPages}
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
    );
}
