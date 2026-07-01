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
import { ChevronLeft, ChevronRight, Download, Search, X } from "lucide-react";
import Link from "next/link";
import MechaturaTable, {
    type AdminMechaturaLeader,
    type AdminMechaturaRegistration,
} from "./_components/mechatura-table";
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

    return (
        <div className="mx-auto w-full max-w-7xl space-y-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h2 className="font-semibold text-2xl tracking-tight">Mechatura Teams</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage robotics competition teams, leaders, and payment status.
                    </p>
                </div>
                <Button variant="outline" className="h-11 rounded-[8px] px-5" asChild>
                    <a href="/api/admin/mechatura-registrations/export" download>
                        <Download className="h-4 w-4" />
                        Export CSV
                    </a>
                </Button>
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

            <form action="/admin/mechatura">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
                    <label className="xl:flex-1">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                name="search"
                                defaultValue={searchParam ?? ""}
                                placeholder="Search teams, robots, institutions, leaders"
                                className="h-9 w-full rounded-[8px] border border-input bg-transparent px-4 pl-11 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                            />
                        </div>
                    </label>

                    <div className="grid gap-4 sm:grid-cols-2 xl:w-[570px] xl:grid-cols-3">
                        <Select name="category" defaultValue={categoryFilter}>
                            <SelectTrigger className="h-12 w-full rounded-[8px] px-4">
                                <SelectValue placeholder="All categories" />
                            </SelectTrigger>
                            <SelectContent>
                                {categoryOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select name="payment" defaultValue={paymentFilter}>
                            <SelectTrigger className="h-12 w-full rounded-[8px] px-4">
                                <SelectValue placeholder="All payments" />
                            </SelectTrigger>
                            <SelectContent>
                                {paymentFilters.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status === "all" ? "All payments" : paymentStatusLabels[status]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

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

                    <div className="flex flex-col gap-3 sm:flex-row xl:shrink-0">
                        <Button className="rounded-[8px] px-6">Apply</Button>
                        {hasActiveFilters ? (
                            <Button variant="outline" className="rounded-[8px] px-5" asChild>
                                <Link href="/admin/mechatura">
                                    <X className="h-4 w-4" />
                                    Reset
                                </Link>
                            </Button>
                        ) : null}
                    </div>
                </div>
            </form>

            <MechaturaTable
                registrations={registrations}
                leaderByRegistrationId={leaderByRegistrationId}
            />

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
                            <Link href={buildPageHref(pagination.page - 1)}>
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
                            <Link href={buildPageHref(pagination.page + 1)}>
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
