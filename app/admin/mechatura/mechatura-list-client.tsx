"use client";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { mechaturaCompetitionLabels, paymentStatusLabels } from "@/lib/payment";
import { ChevronLeft, ChevronRight, Download, Scan, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DataTable } from "./data-table";
import { columns, type AdminMechaturaLeader, type AdminMechaturaRegistration } from "./teams";
import {
    buildMechaturaPageHref,
    pageSizeOptions,
    paymentFilters,
    type MechaturaCategoryFilter,
    type MechaturaPaymentFilter,
} from "./_lib/mechatura-utils";

type MechaturaListClientProps = {
    registrations: AdminMechaturaRegistration[];
    leaders: AdminMechaturaLeader[];
    searchParam?: string;
    categoryFilter: MechaturaCategoryFilter;
    paymentFilter: MechaturaPaymentFilter;
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
    { value: "all", label: "All categories" },
    { value: "sumo", label: mechaturaCompetitionLabels.sumo },
    { value: "transporter", label: mechaturaCompetitionLabels.transporter },
] satisfies Array<{ value: MechaturaCategoryFilter; label: string }>;

export default function MechaturaListClient({
    registrations,
    leaders,
    searchParam,
    categoryFilter,
    paymentFilter,
    pageSize,
    pagination,
    stats,
}: MechaturaListClientProps) {
    const router = useRouter();
    const hasActiveFilters =
        !!searchParam?.trim() || categoryFilter !== "all" || paymentFilter !== "all";
    const leaderByRegistrationId = new Map(
        leaders.map((leader) => [leader.registration_id, leader])
    );
    const metrics = [
        { label: "Total teams", value: stats.totalTeams },
        { label: "Paid teams", value: stats.paidTeams },
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
        });

    const updateFilter = (key: string, value: string | undefined) => {
        const newHref = buildMechaturaPageHref({
            page: 1, // reset to page 1 on filter change
            pageSize: key === "pageSize" ? Number(value) : pageSize,
            search: key === "search" ? value : searchParam,
            category: key === "category" ? (value as any) : categoryFilter,
            payment: key === "payment" ? (value as any) : paymentFilter,
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

    const teamData = registrations.map((reg) => ({
        ...reg,
        leader: leaderByRegistrationId.get(reg.id),
    }));

    return (
        <div className="mx-auto w-full max-w-7xl space-y-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h2 className="font-semibold text-2xl tracking-tight">Mechatura Teams</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage robotics competition teams, leaders, and payment status.
                    </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button variant="outline" className="h-11 rounded-[8px] px-5" asChild>
                        <a href="/api/admin/mechatura-registrations/export" download>
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                        </a>
                    </Button>
                    <Button className="h-11 rounded-[8px] px-5 bg-blue-600 text-white hover:bg-blue-700" asChild>
                        <Link href="/admin/scanner" prefetch={false}>
                            <Scan className="h-4 w-4 mr-2" />
                            Open Scanner
                        </Link>
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
                <form action="/admin/mechatura" className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-xl border border-border p-4 bg-card/50">
                    <div className="relative flex-1 w-full lg:max-w-md">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            name="search"
                            defaultValue={searchParam ?? ""}
                            placeholder="Search teams, institutions..."
                            className="h-10 w-full rounded-lg border border-input bg-background px-4 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        {/* Hidden submit button to allow Enter key to submit */}
                        <button type="submit" className="hidden">Search</button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Select name="category" value={categoryFilter} onValueChange={(v) => updateFilter("category", v)}>
                            <SelectTrigger className="h-10 w-[160px] rounded-lg bg-background">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categoryOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select name="payment" value={paymentFilter} onValueChange={(v) => updateFilter("payment", v)}>
                            <SelectTrigger className="h-10 w-[160px] rounded-lg bg-background">
                                <SelectValue placeholder="Payment" />
                            </SelectTrigger>
                            <SelectContent>
                                {paymentFilters.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status === "all" ? "All payments" : paymentStatusLabels[status]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select name="pageSize" value={String(pageSize)} onValueChange={(v) => updateFilter("pageSize", v)}>
                            <SelectTrigger className="h-10 w-[140px] rounded-lg bg-background">
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
                            onClick={() => router.push(buildMechaturaPageHref({ page: 1, pageSize, search: undefined, category: "all", payment: "all" }))}
                            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 ml-2 transition-colors"
                        >
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            <DataTable columns={columns} data={teamData} />

            <div className="flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing {pagination.startItem}-{pagination.endItem} of {pagination.totalItems} teams
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
    );
}
