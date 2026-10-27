"use client";

import { useState, useMemo } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronLeft, ChevronRight, Download, Search, X, Send, School, BookOpen, GraduationCap, Layers, Cpu, Leaf, Lightbulb } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import Link from "next/link";
import { DataTable } from "./data-table";
import { getColumns } from "./participants";
import {
    buildEsaiPageHref,
    pageSizeOptions,
    submissionFilters,
    type EsaiSubmissionFilter,
    type EsaiCategoryFilter,
    type EsaiSubthemeFilter,
    AdminEsaiRegistration
} from "./_lib/esai-utils";

type EsaiListClientProps = {
    registrations: AdminEsaiRegistration[];
    searchParam?: string;
    submissionFilter: EsaiSubmissionFilter;
    categoryFilter: EsaiCategoryFilter;
    subthemeFilter: EsaiSubthemeFilter;
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

const COLUMN_LABELS: Record<string, string> = {
    id: "ID Pendaftaran",
    user_id: "User ID",
    created_at: "Waktu Pendaftaran",
    full_name: "Nama Lengkap",
    institution: "Instansi",
    institution_category: "Kategori Instansi",
    city: "Kota",
    email: "Email",
    phone_number: "No. WA",
    paper_title: "Judul Karya Esai",
    sub_theme: "Subtema",
    submission_status: "Status Pengumpulan",
    essay_paper_url: "File Naskah Esai",
    identity_card_url: "File KTM / Identitas",
    instagram_twibbon_url: "File Bukti Twibbon",
    payment_proof_url: "File Bukti Pembayaran",
};

const COLUMN_GROUPS = [
    {
        title: "Identitas Peserta",
        keys: ["id", "user_id", "full_name", "institution", "institution_category", "city", "created_at"]
    },
    {
        title: "Kontak",
        keys: ["email", "phone_number"]
    },
    {
        title: "Karya Esai",
        keys: ["paper_title", "sub_theme"]
    },
    {
        title: "Status Pendaftaran",
        keys: ["submission_status"]
    },
    {
        title: "Dokumen Lampiran",
        keys: ["essay_paper_url", "identity_card_url", "instagram_twibbon_url", "payment_proof_url"]
    }
];

const categoryOptions = [
    { value: "all", label: "Semua Jenjang", icon: School },
    { value: "SMA", label: "SMA", icon: BookOpen },
    { value: "SMK", label: "SMK", icon: GraduationCap },
    { value: "perguruan_tinggi", label: "Perguruan Tinggi", icon: GraduationCap },
] as const;

const subthemeOptions = [
    { value: "all", label: "Semua Subtema", icon: Layers },
    { value: "digital", label: "Transformasi Digital", icon: Cpu },
    { value: "hijau", label: "Industri Hijau", icon: Leaf },
    { value: "talenta", label: "Talenta & Ekosistem", icon: Lightbulb },
] as const;

export default function EsaiListClient({
    registrations,
    searchParam,
    submissionFilter,
    categoryFilter,
    subthemeFilter,
    pageSize,
    pagination,
    stats,
}: EsaiListClientProps) {
    const router = useRouter();
    const hasActiveFilters =
        !!searchParam?.trim() || submissionFilter !== "all" || categoryFilter !== "all" || subthemeFilter !== "all";

    const [exportOpen, setExportOpen] = useState(false);
    const [exportFilterMode, setExportFilterMode] = useState<"all" | "filtered">(hasActiveFilters ? "filtered" : "all");

    const [localFilters, setLocalFilters] = useState({
        submission: submissionFilter,
        category: categoryFilter,
        subtheme: subthemeFilter,
    });

    const defaultCols: Record<string, boolean> = {
        id: true,
        user_id: true,
        created_at: true,
        full_name: true,
        institution: true,
        institution_category: true,
        city: true,
        email: true,
        phone_number: true,
        paper_title: true,
        sub_theme: true,
        submission_status: true,
        essay_paper_url: true,
        identity_card_url: true,
        instagram_twibbon_url: true,
        payment_proof_url: true,
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
            category: categoryFilter,
            subtheme: subthemeFilter,
        });

    const updateFilter = (key: string, value: string | undefined) => {
        const newHref = buildEsaiPageHref({
            page: 1, // reset to page 1 on filter change
            pageSize: key === "pageSize" ? Number(value) : pageSize,
            search: key === "search" ? value : searchParam,
            submission: key === "submission" ? (value as EsaiSubmissionFilter) : submissionFilter,
            category: key === "category" ? (value as EsaiCategoryFilter) : categoryFilter,
            subtheme: key === "subtheme" ? (value as EsaiSubthemeFilter) : subthemeFilter,
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
            label: `Status: ${label}`,
            onRemove: () => updateFilter("submission", "all")
        });
    }
    if (categoryFilter !== "all") {
        const cat = categoryOptions.find(c => c.value === categoryFilter);
        activeFilterPills.push({
            key: "category",
            label: `Jenjang: ${cat?.label ?? categoryFilter}`,
            onRemove: () => updateFilter("category", "all")
        });
    }
    if (subthemeFilter !== "all") {
        const st = subthemeOptions.find(s => s.value === subthemeFilter);
        activeFilterPills.push({
            key: "subtheme",
            label: `Subtema: ${st?.label ?? subthemeFilter}`,
            onRemove: () => updateFilter("subtheme", "all")
        });
    }

    const participantData = registrations;

    const columns = useMemo(() => getColumns(searchParam), [searchParam]);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        updateFilter("search", formData.get("search") as string);
    };

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 min-w-0">
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            Lomba Esai
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Dialog open={exportOpen} onOpenChange={(open) => {
                            setExportOpen(open);
                            if (open) {
                                setExportFilterMode(hasActiveFilters ? "filtered" : "all");
                                setLocalFilters({
                                    submission: submissionFilter,
                                    category: categoryFilter,
                                    subtheme: subthemeFilter,
                                });
                            }
                        }}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 sm:h-9 px-3 sm:px-3.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs sm:text-sm font-medium transition-colors shrink-0"
                                >
                                    <Download className="h-3.5 w-3.5 mr-1.5" />
                                    Ekspor CSV
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Ekspor Data Lomba Esai</DialogTitle>
                                    <DialogDescription>
                                        Pilih apakah Anda ingin mengekspor seluruh data peserta atau menggunakan filter. Anda juga dapat memilih kolom yang ingin diekspor.
                                    </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                                <div className="flex flex-col gap-2">
                                    <Label className="text-base font-semibold">Opsi Data</Label>
                                    <RadioGroup 
                                        className="flex flex-col gap-3 mt-2" 
                                        value={exportFilterMode} 
                                        onValueChange={(val) => setExportFilterMode(val as "all" | "filtered")}
                                    >
                                        <div className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                                            <RadioGroupItem value="all" id="mode-all" className="mt-1" />
                                            <label htmlFor="mode-all" className="flex flex-col cursor-pointer flex-1">
                                                <span className="font-medium">Semua Data</span>
                                                <span className="text-sm text-muted-foreground">Ekspor seluruh peserta terdaftar tanpa filter.</span>
                                            </label>
                                        </div>
                                        <div className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                                            <RadioGroupItem value="filtered" id="mode-filtered" className="mt-1" />
                                            <label htmlFor="mode-filtered" className="flex flex-col cursor-pointer flex-1">
                                                <span className="font-medium">Gunakan Filter</span>
                                                <span className="text-sm text-muted-foreground">Ekspor hanya peserta yang sesuai dengan pencarian dan filter.</span>
                                            </label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {exportFilterMode === "filtered" && (
                                    <div className="flex flex-col gap-3 p-4 border rounded-lg bg-muted/20">
                                        <Label className="font-semibold mb-1">Filter Ekspor</Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1.5">
                                                <Label className="text-xs">Status Dokumen</Label>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button type="button" variant="outline" className="h-10 w-full justify-between rounded-lg bg-background">
                                                            <span className="truncate flex items-center gap-2">
                                                                <Send className="h-4 w-4" />
                                                                {localFilters.submission === "all" ? "Semua Status" : 
                                                                 localFilters.submission === "draft" ? "Draft" : 
                                                                 localFilters.submission === "submitted" ? "Submitted" :
                                                                 localFilters.submission === "approved" ? "Disetujui" :
                                                                 (localFilters.submission as string).charAt(0).toUpperCase() + (localFilters.submission as string).slice(1)}
                                                            </span>
                                                            <ChevronDown className="h-4 w-4 opacity-50" />
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

                                            <div className="flex flex-col gap-1.5">
                                                <Label className="text-xs">Kategori Instansi / Jenjang</Label>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button type="button" variant="outline" className="h-10 w-full justify-between rounded-lg bg-background">
                                                            <span className="truncate flex items-center gap-2">
                                                                {(() => {
                                                                    const opt = categoryOptions.find(o => o.value === localFilters.category);
                                                                    const Icon = opt?.icon || School;
                                                                    return <><Icon className="h-4 w-4" />{opt?.label || "Semua Jenjang"}</>;
                                                                })()}
                                                            </span>
                                                            <ChevronDown className="h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-[200px]">
                                                        {categoryOptions.map((option) => (
                                                            <DropdownMenuItem key={option.value} onSelect={() => setLocalFilters(f => ({ ...f, category: option.value as EsaiCategoryFilter }))}>
                                                                <option.icon className="mr-2 h-4 w-4" />
                                                                {option.label}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                                                <Label className="text-xs">Subtema Esai</Label>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button type="button" variant="outline" className="h-10 w-full justify-between rounded-lg bg-background">
                                                            <span className="truncate flex items-center gap-2">
                                                                {(() => {
                                                                    const opt = subthemeOptions.find(o => o.value === localFilters.subtheme);
                                                                    const Icon = opt?.icon || Layers;
                                                                    return <><Icon className="h-4 w-4" />{opt?.label || "Semua Subtema"}</>;
                                                                })()}
                                                            </span>
                                                            <ChevronDown className="h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-[280px]">
                                                        {subthemeOptions.map((option) => (
                                                            <DropdownMenuItem key={option.value} onSelect={() => setLocalFilters(f => ({ ...f, subtheme: option.value as EsaiSubthemeFilter }))}>
                                                                <option.icon className="mr-2 h-4 w-4" />
                                                                {option.label}
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
                                                            <div key={k} className="flex items-center space-x-2">
                                                                <Checkbox 
                                                                    id={`col-${k}`} 
                                                                    checked={cols[k]} 
                                                                    onCheckedChange={(checked) => setCols(c => ({ ...c, [k]: !!checked }))}
                                                                />
                                                                <label
                                                                    htmlFor={`col-${k}`}
                                                                    className="text-sm font-medium leading-none cursor-pointer text-foreground/90 hover:text-foreground transition-colors"
                                                                >
                                                                    {COLUMN_LABELS[k] || k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                                </label>
                                                            </div>
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
                                        if (localFilters.category !== "all") query.set("category", localFilters.category);
                                        if (localFilters.subtheme !== "all") query.set("subtheme", localFilters.subtheme);
                                    }
                                    
                                    const selectedCols = Object.entries(cols).filter(([_, v]) => v).map(([k]) => k);
                                    if (selectedCols.length > 0 && selectedCols.length < Object.keys(cols).length) {
                                        query.set("cols", selectedCols.join(","));
                                    } else if (selectedCols.length === 0) {
                                        query.set("cols", "id");
                                    }

                                    const queryString = query.toString();
                                    const url = `/api/admin/esai-registrations/export${queryString ? `?${queryString}` : ""}`;
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

            {/* Resend-style Pill Tabs for Jenjang */}
            <div
                role="tablist"
                aria-label="Jenjang Peserta"
                className="flex items-center gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {categoryOptions.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        role="tab"
                        aria-selected={categoryFilter === option.value}
                        onClick={() => updateFilter("category", option.value)}
                        className={`rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap ${
                            categoryFilter === option.value
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-y border-zinc-800/60">
                {metrics.map((metric, idx) => (
                    <div key={metric.label} className={`min-w-0 ${idx === 0 ? "col-span-2 sm:col-span-1" : ""}`}>
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
                        placeholder="Search nama peserta, email, atau institusi..."
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
                                    {submissionFilter === "all" ? "Semua Status" : 
                                     submissionFilter === "draft" ? "Draft" : 
                                     submissionFilter === "submitted" ? "Submitted" : "Disetujui"}
                                </span>
                                <ChevronDown className="h-3.5 w-3.5 text-zinc-500 shrink-0 ml-1.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-[160px] bg-zinc-900 border-zinc-800 text-zinc-200">
                            {submissionFilters.map((status) => (
                                <DropdownMenuItem key={status} onSelect={() => updateFilter("submission", status)}>
                                    {status === "all" ? "Semua Status" : 
                                     status === "draft" ? "Draft" : 
                                     status === "submitted" ? "Submitted" : "Disetujui"}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button type="button" variant="outline" className="w-full lg:w-auto h-10 px-3 rounded-xl bg-zinc-950/80 border-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-900/60 text-xs sm:text-sm font-medium flex items-center justify-between gap-1.5 transition-colors shrink-0">
                                <span className="truncate">
                                    {subthemeOptions.find(o => o.value === subthemeFilter)?.label || "Semua Subtema"}
                                </span>
                                <ChevronDown className="h-3.5 w-3.5 text-zinc-500 shrink-0 ml-1.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-[200px] bg-zinc-900 border-zinc-800 text-zinc-200">
                            {subthemeOptions.map((option) => (
                                <DropdownMenuItem key={option.value} onSelect={() => updateFilter("subtheme", option.value)}>
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
                        onClick={() => router.push(buildEsaiPageHref({ page: 1, pageSize, search: undefined, submission: "all", category: "all", subtheme: "all" }))}
                        className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-2 ml-2 transition-colors"
                    >
                        Hapus semua
                    </button>
                </div>
            )}

            <DataTable columns={columns} data={participantData} />

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
    );
}
