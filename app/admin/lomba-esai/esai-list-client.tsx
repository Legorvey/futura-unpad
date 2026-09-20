"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronDown, ChevronLeft, ChevronRight, Download, Search, X, Clock, CheckCircle2, FileText, Send, User } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import Link from "next/link";
import { DataTable } from "./data-table";
import { getColumns } from "./participants";
import {
    buildEsaiPageHref,
    pageSizeOptions,
    submissionFilters,
    type EsaiSubmissionFilter,
    AdminEsaiRegistration
} from "./_lib/esai-utils";

type EsaiListClientProps = {
    registrations: AdminEsaiRegistration[];
    searchParam?: string;
    submissionFilter: EsaiSubmissionFilter;
    pageSize: number;
    pagination: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
        startItem: number;
        endItem: number;
    };
    stats: { totalParticipants: number; approvedDocuments: number; submittedDocuments: number; };
};

const COLUMN_GROUPS = [
    {
        title: "Identitas Peserta",
        keys: ["id", "full_name", "institution", "city", "created_at"]
    },
    {
        title: "Kontak",
        keys: ["email", "phone_number"]
    },
    {
        title: "Status Pendaftaran",
        keys: ["submission_status"]
    }
];

export default function EsaiListClient({
    registrations,
    searchParam,
    submissionFilter,
    pageSize,
    pagination,
    stats,
}: EsaiListClientProps) {
    const router = useRouter();
    const hasActiveFilters =
        !!searchParam?.trim() || submissionFilter !== "all";

    const [exportOpen, setExportOpen] = useState(false);
    const [exportFilterMode, setExportFilterMode] = useState<"all" | "filtered">(hasActiveFilters ? "filtered" : "all");

    const [localFilters, setLocalFilters] = useState({
        submission: submissionFilter,
    });

    const defaultCols = {
        id: true,
        full_name: true,
        institution: true,
        city: true,
        created_at: true,
        email: true,
        phone_number: true,
        submission_status: true,
    };
    const [cols, setCols] = useState(defaultCols);

    const metrics = [
        { label: "Total Peserta", value: stats.totalParticipants },
        { label: "Dokumen Disetujui", value: stats.approvedDocuments },
        { label: "Pendaftaran Disubmit", value: stats.submittedDocuments },
    ];
    
    const buildPageHref = (page: number, nextPageSize = pageSize) =>
        buildEsaiPageHref({
            page,
            pageSize: nextPageSize,
            search: searchParam,
            submission: submissionFilter,
        });

    const updateFilter = (key: string, value: string | undefined) => {
        const newHref = buildEsaiPageHref({
            page: 1, // reset to page 1 on filter change
            pageSize: key === "pageSize" ? Number(value) : pageSize,
            search: key === "search" ? value : searchParam,
            submission: key === "submission" ? (value as any) : submissionFilter,
        });
        router.push(newHref);
    };

    const activeFilterPills: Array<{ key: string; label: string; onRemove: () => void }> = [];
    if (searchParam?.trim()) {
        activeFilterPills.push({
            key: "search",
            label: `Search: "${searchParam.trim()}"`,
            onRemove: () => updateFilter("search", undefined)
        });
    }
    if (submissionFilter !== "all") {
        const label = submissionFilter === "draft" ? "Draft" : 
                      submissionFilter === "submitted" ? "Submitted" : 
                      submissionFilter === "approved" ? "Disetujui" :
                      (submissionFilter as string).charAt(0).toUpperCase() + (submissionFilter as string).slice(1);
        activeFilterPills.push({
            key: "submission",
            label: `Submission: ${label}`,
            onRemove: () => updateFilter("submission", "all")
        });
    }

    const participantData = registrations;

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        updateFilter("search", formData.get("search") as string);
    };

    return (
        <div className="mx-auto w-full max-w-7xl space-y-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h2 className="font-semibold text-2xl tracking-tight">Peserta Lomba Esai</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Kelola data pendaftaran dan status dokumen Lomba Esai Nasional.
                    </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Dialog open={exportOpen} onOpenChange={(open) => {
                        setExportOpen(open);
                        if (open) {
                            setExportFilterMode(hasActiveFilters ? "filtered" : "all");
                            setLocalFilters({
                                submission: submissionFilter,
                            });
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="h-11 rounded-[8px] px-5">
                                <Download className="h-4 w-4 mr-2" />
                                Ekspor CSV
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Ekspor Data Lomba Esai</DialogTitle>
                                <DialogDescription>
                                    Pilih opsi untuk mengekspor data peserta Lomba Esai.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                                <div className="flex flex-col gap-2">
                                    <Label className="text-base font-semibold">Opsi Data</Label>
                                    <RadioGroup 
                                        className="flex flex-col gap-3 mt-2" 
                                        value={exportFilterMode} 
                                        onValueChange={(v: "all" | "filtered") => setExportFilterMode(v)}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="all" id="r1" />
                                            <Label htmlFor="r1" className="font-normal cursor-pointer">Semua Peserta ({stats.totalParticipants})</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="filtered" id="r2" disabled={!hasActiveFilters} />
                                            <Label htmlFor="r2" className={`font-normal cursor-pointer ${!hasActiveFilters ? "text-muted-foreground" : ""}`}>
                                                Hanya yang difilter ({pagination.totalItems})
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {exportFilterMode === "filtered" && (
                                    <div className="flex flex-col gap-3 p-4 border rounded-lg bg-muted/20">
                                        <Label className="font-semibold mb-1">Filter Ekspor</Label>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="flex flex-col gap-1.5">
                                                <Label className="text-xs">Status Dokumen</Label>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button type="button" variant="outline" className="h-10 w-full justify-between rounded-lg bg-background">
                                                            <span className="truncate flex items-center gap-2 text-xs">
                                                                <Send className="h-3 w-3" />
                                                                {localFilters.submission === "all" ? "Semua Status" : 
                                                                 localFilters.submission === "draft" ? "Draft" : 
                                                                 localFilters.submission === "submitted" ? "Submitted" :
                                                                 localFilters.submission === "approved" ? "Disetujui" :
                                                                 (localFilters.submission as string).charAt(0).toUpperCase() + (localFilters.submission as string).slice(1)}
                                                            </span>
                                                            <ChevronDown className="h-3 w-3 opacity-50" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-[200px]">
                                                        {submissionFilters.map((status) => (
                                                            <DropdownMenuItem key={status} onSelect={() => setLocalFilters(f => ({ ...f, submission: status as EsaiSubmissionFilter }))}>
                                                                <Send className="mr-2 h-4 w-4" />
                                                                {status === "all" ? "Semua Status" : 
                                                                 status === "draft" ? "Draft" : 
                                                                 status === "submitted" ? "Submitted" :
                                                                 status === "approved" ? "Disetujui" :
                                                                 (status as string).charAt(0).toUpperCase() + (status as string).slice(1)}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-base font-semibold">Pilih Kolom Ekspor</Label>
                                        <Button variant="ghost" size="sm" onClick={() => {
                                            const allSelected = Object.values(cols).every(Boolean);
                                            const newVal = Object.fromEntries(Object.keys(cols).map(k => [k, !allSelected])) as typeof cols;
                                            setCols(newVal);
                                        }}>
                                            {Object.values(cols).every(Boolean) ? "Batalkan Semua" : "Pilih Semua"}
                                        </Button>
                                    </div>
                                    <div className="flex flex-col gap-6 p-4 border rounded-lg bg-muted/10">
                                        {COLUMN_GROUPS.map(group => (
                                            <div key={group.title} className="flex flex-col gap-2">
                                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{group.title}</Label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-4">
                                                    {group.keys.map((key) => {
                                                        const k = key as keyof typeof cols;
                                                        return (
                                                            <label key={key} className="flex items-center gap-2 cursor-pointer group/col">
                                                                <div className="flex h-5 items-center">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        className="rounded border-gray-300 text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                                                        checked={cols[k]}
                                                                        onChange={(e) => setCols(prev => ({ ...prev, [k]: e.target.checked }))}
                                                                    />
                                                                </div>
                                                                <span className="text-sm text-foreground/90 group-hover/col:text-foreground">{key.replace(/_/g, " ")}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setExportOpen(false)}>Batal</Button>
                                <Button onClick={() => {
                                    const query = new URLSearchParams();
                                    if (exportFilterMode === "filtered") {
                                        if (searchParam?.trim()) query.set("search", searchParam.trim());
                                        if (localFilters.submission !== "all") query.set("submission", localFilters.submission);
                                    }
                                    
                                    const selectedCols = Object.entries(cols).filter(([_, v]) => v).map(([k]) => k);
                                    if (selectedCols.length > 0 && selectedCols.length < Object.keys(cols).length) {
                                        query.set("cols", selectedCols.join(","));
                                    } else if (selectedCols.length === 0) {
                                        query.set("cols", "id");
                                    }

                                    const queryString = query.toString();
                                    const url = `/api/admin/esai-registrations/export${queryString ? "?" + queryString : ""}`;
                                    window.open(url, "_blank");
                                    setExportOpen(false);
                                }}>
                                    Unduh CSV
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-y-8 border-y border-border py-7 sm:grid-cols-2 xl:grid-cols-2">
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
                    <div className="relative flex-1 w-full xl:max-w-[280px]">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            key={searchParam ?? "empty"}
                            name="search"
                            defaultValue={searchParam ?? ""}
                            placeholder="Cari peserta, ID, atau institusi..."
                            className="h-10 w-full rounded-lg border border-input bg-background px-4 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <button type="submit" className="sr-only">Cari</button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button type="button" variant="outline" className="h-10 w-[140px] justify-between rounded-lg bg-background">
                                    <span className="truncate flex items-center gap-2 text-xs">
                                        <Send className="h-3 w-3" />
                                        {submissionFilter === "all" ? "Semua Dok." : 
                                         submissionFilter === "draft" ? "Draft" : 
                                         submissionFilter === "submitted" ? "Submitted" :
                                         submissionFilter === "approved" ? "Disetujui" :
                                         (submissionFilter as string).charAt(0).toUpperCase() + (submissionFilter as string).slice(1)}
                                    </span>
                                    <ChevronDown className="h-3 w-3 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[160px]">
                                {submissionFilters.map((status) => (
                                    <DropdownMenuItem key={status} onSelect={() => updateFilter("submission", status)}>
                                        <Send className="mr-2 h-4 w-4" />
                                        {status === "all" ? "Semua Status" : 
                                         status === "draft" ? "Draft" : 
                                         status === "submitted" ? "Submitted" :
                                         status === "approved" ? "Disetujui" :
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
                            onClick={() => router.push(buildEsaiPageHref({ page: 1, pageSize, search: undefined, submission: "all" }))}
                            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 ml-2 transition-colors"
                        >
                            Hapus semua
                        </button>
                    </div>
                )}
            </div>

            <DataTable columns={getColumns(searchParam)} data={participantData} />

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
