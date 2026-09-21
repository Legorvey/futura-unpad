"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { mechaturaCompetitionLabels, paymentStatusLabels } from "@/lib/payment";
import { ChevronDown, ChevronLeft, ChevronRight, Download, Search, X, LayoutGrid, Swords, Truck, CircleDollarSign, Clock, CheckCircle2, BadgeCheck, XCircle, List, Ban, FileText, Send } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import Link from "next/link";
import { DataTable } from "./data-table";
import { getColumns, type AdminMechaturaTeam } from "./teams";
import {
    buildMechaturaPageHref,
    pageSizeOptions,
    paymentFilters,
    submissionFilters,
    approvalFilters,
    batchFilters,
    type MechaturaCategoryFilter,
    type MechaturaPaymentFilter,
    type MechaturaSubmissionFilter,
    type MechaturaApprovalFilter,
    type MechaturaBatchFilter,
} from "./_lib/mechatura-utils";

type MechaturaListClientProps = {
    registrations: AdminMechaturaTeam[];
    searchParam?: string;
    categoryFilter: MechaturaCategoryFilter;
    paymentFilter: MechaturaPaymentFilter;
    submissionFilter: MechaturaSubmissionFilter;
    approvalFilter: MechaturaApprovalFilter;
    batchFilter: MechaturaBatchFilter;
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
    pending_verification: Clock,
    verified: CheckCircle2,
    all: CircleDollarSign
};

const COLUMN_LABELS: Record<string, string> = {
    id: "ID",
    join_code: "Kode Unik",
    name: "Nama Tim",
    category: "Kategori",
    created_at: "Waktu Daftar",
    payment_status: "Status Pembayaran",
    submission_status: "Status Pengumpulan",
    approval_status: "Verifikasi Admin",
    pembina_name: "Nama Pembina",
    pembina_phone: "No. WA Pembina",
    leader_name: "Nama Ketua",
    leader_phone: "No. WA Ketua",
    leader_email: "Email Ketua",
    leader_institution: "Instansi Ketua",
    leader_city: "Kota Ketua",
    leader_instagram: "Instagram Ketua",
    member_name: "Nama Anggota",
    member_phone: "No. WA Anggota",
    member_email: "Email Anggota",
    member_institution: "Instansi Anggota",
    member_city: "Kota Anggota",
    member_instagram: "Instagram Anggota",
};

const COLUMN_GROUPS = [
    {
        title: "Identitas Tim",
        keys: ["id", "join_code", "name", "category", "created_at"]
    },
    {
        title: "Status",
        keys: ["payment_status", "submission_status", "approval_status"]
    },
    {
        title: "Pembina",
        keys: ["pembina_name", "pembina_phone"]
    },
    {
        title: "Ketua",
        keys: ["leader_name", "leader_phone", "leader_email", "leader_institution", "leader_city", "leader_instagram"]
    },
    {
        title: "Anggota",
        keys: ["member_name", "member_phone", "member_email", "member_institution", "member_city", "member_instagram"]
    }
];

export default function MechaturaListClient({
    registrations,
    searchParam,
    categoryFilter,
    paymentFilter,
    submissionFilter,
    approvalFilter,
    batchFilter,
    pageSize,
    pagination,
    stats,
}: MechaturaListClientProps) {
    const router = useRouter();
    const hasActiveFilters =
        !!searchParam?.trim() || categoryFilter !== "all" || paymentFilter !== "all" || submissionFilter !== "all" || approvalFilter !== "all" || batchFilter !== "all";

    const [exportOpen, setExportOpen] = useState(false);
    const [exportFilterMode, setExportFilterMode] = useState<"all" | "filtered">(hasActiveFilters ? "filtered" : "all");

    const [localFilters, setLocalFilters] = useState({
        category: categoryFilter,
        payment: paymentFilter,
        submission: submissionFilter,
        approval: approvalFilter,
        batch: batchFilter,
    });

    const defaultCols = {
        id: true,
        join_code: true,
        name: true,
        category: true,
        created_at: true,
        payment_status: true,
        submission_status: true,
        approval_status: true,
        pembina_name: true,
        pembina_phone: true,
        leader_name: true,
        leader_phone: true,
        leader_email: true,
        leader_institution: true,
        leader_city: true,
        leader_instagram: true,
        member_name: true,
        member_phone: true,
        member_email: true,
        member_institution: true,
        member_city: true,
        member_instagram: true,
    };
    const [cols, setCols] = useState(defaultCols);

    const metrics = [
        { label: "Total tim", value: stats.totalTeams },
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
            submission: submissionFilter,
            approval: approvalFilter,
            batch: batchFilter,
        });

    const updateFilter = (key: string, value: string | undefined) => {
        const newHref = buildMechaturaPageHref({
            page: 1, // reset to page 1 on filter change
            pageSize: key === "pageSize" ? Number(value) : pageSize,
            search: key === "search" ? value : searchParam,
            category: key === "category" ? (value as any) : categoryFilter,
            payment: key === "payment" ? (value as any) : paymentFilter,
            submission: key === "submission" ? (value as any) : submissionFilter,
            approval: key === "approval" ? (value as any) : approvalFilter,
            batch: key === "batch" ? (value as any) : batchFilter,
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
    if (submissionFilter !== "all") {
        const label = submissionFilter === "draft" ? "Draft" : 
                      submissionFilter === "submitted" ? "Submitted" : 
                      (submissionFilter as string).charAt(0).toUpperCase() + (submissionFilter as string).slice(1);
        activeFilterPills.push({
            key: "submission",
            label: `Submission: ${label}`,
            onRemove: () => updateFilter("submission", "all")
        });
    }
    if (approvalFilter !== "all") {
        const label = approvalFilter === "pending" ? "Menunggu" : 
                      approvalFilter === "approved" ? "Disetujui" :
                      approvalFilter === "revision" ? "Revisi" :
                      (approvalFilter as string).charAt(0).toUpperCase() + (approvalFilter as string).slice(1);
        activeFilterPills.push({
            key: "approval",
            label: `Approval: ${label}`,
            onRemove: () => updateFilter("approval", "all")
        });
    }
    if (batchFilter !== "all") {
        const label = batchFilter === "batch1" ? "Batch 1" : "Batch 2";
        activeFilterPills.push({
            key: "batch",
            label: `Batch: ${label}`,
            onRemove: () => updateFilter("batch", "all")
        });
    }

    const teamData = registrations;

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
                        Kelola tim kompetisi robotik, ketua, dan status pendaftaran.
                    </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Dialog open={exportOpen} onOpenChange={(open) => {
                        setExportOpen(open);
                        if (open) {
                            setExportFilterMode(hasActiveFilters ? "filtered" : "all");
                            setLocalFilters({
                                category: categoryFilter,
                                payment: paymentFilter,
                                submission: submissionFilter,
                                approval: approvalFilter,
                                batch: batchFilter,
                            });
                            setCols(defaultCols);
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="h-11 rounded-[8px] px-5">
                                <Download className="h-4 w-4 mr-2" />
                                Ekspor CSV
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Ekspor Data Tim Mechatura</DialogTitle>
                                <DialogDescription>
                                    Pilih apakah Anda ingin mengekspor seluruh data tim atau menggunakan filter. Anda juga dapat memilih kolom yang ingin diekspor.
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
                                                <span className="text-sm text-muted-foreground">Ekspor seluruh tim terdaftar tanpa filter.</span>
                                            </label>
                                        </div>
                                        <div className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                                            <RadioGroupItem value="filtered" id="mode-filtered" className="mt-1" />
                                            <label htmlFor="mode-filtered" className="flex flex-col cursor-pointer flex-1">
                                                <span className="font-medium">Gunakan Filter</span>
                                                <span className="text-sm text-muted-foreground">Ekspor hanya tim yang sesuai dengan pencarian dan filter.</span>
                                            </label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {exportFilterMode === "filtered" && (
                                    <div className="flex flex-col gap-3 p-4 border rounded-lg bg-muted/20">
                                        <Label className="font-semibold mb-1">Filter Ekspor</Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1.5">
                                                <Label className="text-xs">Kategori</Label>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button type="button" variant="outline" className="h-10 w-full justify-between rounded-lg bg-background">
                                                            <span className="truncate flex items-center gap-2 text-xs">
                                                                {(() => {
                                                                    const ActiveIcon = categoryOptions.find(o => o.value === localFilters.category)?.icon || LayoutGrid;
                                                                    return <ActiveIcon className="h-3 w-3" />;
                                                                })()}
                                                                {categoryOptions.find(o => o.value === localFilters.category)?.label || "Semua Kategori"}
                                                            </span>
                                                            <ChevronDown className="h-3 w-3 opacity-50" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-[200px]">
                                                        {categoryOptions.map((option) => (
                                                            <DropdownMenuItem key={option.value} onSelect={() => setLocalFilters(f => ({ ...f, category: option.value as MechaturaCategoryFilter }))}>
                                                                <option.icon className="mr-2 h-4 w-4" />
                                                                {option.label}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            
                                            <div className="flex flex-col gap-1.5">
                                                <Label className="text-xs">Pengumpulan</Label>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button type="button" variant="outline" className="h-10 w-full justify-between rounded-lg bg-background">
                                                            <span className="truncate flex items-center gap-2 text-xs">
                                                                <Send className="h-3 w-3" />
                                                                {localFilters.submission === "all" ? "Semua Submit" : 
                                                                 localFilters.submission === "draft" ? "Draft" : 
                                                                 localFilters.submission === "submitted" ? "Submitted" :
                                                                 (localFilters.submission as string).charAt(0).toUpperCase() + (localFilters.submission as string).slice(1)}
                                                            </span>
                                                            <ChevronDown className="h-3 w-3 opacity-50" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-[200px]">
                                                        {submissionFilters.map((status) => (
                                                            <DropdownMenuItem key={status} onSelect={() => setLocalFilters(f => ({ ...f, submission: status as MechaturaSubmissionFilter }))}>
                                                                <Send className="mr-2 h-4 w-4" />
                                                                {status === "all" ? "Semua Submit" : 
                                                                 status === "draft" ? "Draft" : 
                                                                 status === "submitted" ? "Submitted" :
                                                                 (status as string).charAt(0).toUpperCase() + (status as string).slice(1)}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <Label className="text-xs">Verifikasi Admin</Label>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button type="button" variant="outline" className="h-10 w-full justify-between rounded-lg bg-background">
                                                            <span className="truncate flex items-center gap-2 text-xs">
                                                                <FileText className="h-3 w-3" />
                                                                {localFilters.approval === "all" ? "Semua Approval" : 
                                                                 localFilters.approval === "pending" ? "Menunggu" : 
                                                                 localFilters.approval === "approved" ? "Disetujui" :
                                                                 localFilters.approval === "revision" ? "Revisi" :
                                                                 (localFilters.approval as string).charAt(0).toUpperCase() + (localFilters.approval as string).slice(1)}
                                                            </span>
                                                            <ChevronDown className="h-3 w-3 opacity-50" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-[200px]">
                                                        {approvalFilters.map((status) => (
                                                            <DropdownMenuItem key={status} onSelect={() => setLocalFilters(f => ({ ...f, approval: status as MechaturaApprovalFilter }))}>
                                                                <FileText className="mr-2 h-4 w-4" />
                                                                {status === "all" ? "Semua Approval" : 
                                                                 status === "pending" ? "Menunggu" : 
                                                                 status === "approved" ? "Disetujui" :
                                                                 status === "revision" ? "Revisi" :
                                                                 (status as string).charAt(0).toUpperCase() + (status as string).slice(1)}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <Label className="text-xs">Batch</Label>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button type="button" variant="outline" className="h-10 w-full justify-between rounded-lg bg-background">
                                                            <span className="truncate flex items-center gap-2 text-xs">
                                                                <FileText className="h-3 w-3" />
                                                                {localFilters.batch === "all" ? "Semua Batch" : 
                                                                 localFilters.batch === "batch1" ? "Batch 1" : "Batch 2"}
                                                            </span>
                                                            <ChevronDown className="h-3 w-3 opacity-50" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-[200px]">
                                                        {batchFilters.map((status) => (
                                                            <DropdownMenuItem key={status} onSelect={() => setLocalFilters(f => ({ ...f, batch: status as MechaturaBatchFilter }))}>
                                                                <FileText className="mr-2 h-4 w-4" />
                                                                {status === "all" ? "Semua Batch" : 
                                                                 status === "batch1" ? "Batch 1" : "Batch 2"}
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
                                        if (localFilters.category !== "all") query.set("category", localFilters.category);
                                        if (localFilters.submission !== "all") query.set("submission", localFilters.submission);
                                        if (localFilters.approval !== "all") query.set("approval", localFilters.approval);
                                        if (localFilters.batch !== "all") query.set("batch", localFilters.batch);
                                    }
                                    
                                    const selectedCols = Object.entries(cols).filter(([_, v]) => v).map(([k]) => k);
                                    if (selectedCols.length > 0 && selectedCols.length < Object.keys(cols).length) {
                                        query.set("cols", selectedCols.join(","));
                                    } else if (selectedCols.length === 0) {
                                        query.set("cols", "id");
                                    }

                                    const queryString = query.toString();
                                    const url = `/api/admin/mechatura-registrations/export${queryString ? `?${queryString}` : ""}`;
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
                    <div className="relative flex-1 w-full xl:max-w-[280px]">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            key={searchParam ?? "empty"}
                            name="search"
                            defaultValue={searchParam ?? ""}
                            placeholder="Cari tim, institusi, atau nama anggota..."
                            className="h-10 w-full rounded-lg border border-input bg-background px-4 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <button type="submit" className="sr-only">Cari</button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button type="button" variant="outline" className="h-10 w-[140px] justify-between rounded-lg bg-background">
                                    <span className="truncate flex items-center gap-2 text-xs">
                                        {(() => {
                                            const ActiveIcon = categoryOptions.find(o => o.value === categoryFilter)?.icon || LayoutGrid;
                                            return <ActiveIcon className="h-3 w-3" />;
                                        })()}
                                        {categoryOptions.find(o => o.value === categoryFilter)?.label || "Semua Kat."}
                                    </span>
                                    <ChevronDown className="h-3 w-3 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[160px]">
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
                                <Button type="button" variant="outline" className="h-10 w-[140px] justify-between rounded-lg bg-background">
                                    <span className="truncate flex items-center gap-2 text-xs">
                                        <Send className="h-3 w-3" />
                                        {submissionFilter === "all" ? "Semua Submit" : 
                                         submissionFilter === "draft" ? "Draft" : 
                                         submissionFilter === "submitted" ? "Submitted" :
                                         (submissionFilter as string).charAt(0).toUpperCase() + (submissionFilter as string).slice(1)}
                                    </span>
                                    <ChevronDown className="h-3 w-3 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[160px]">
                                {submissionFilters.map((status) => (
                                    <DropdownMenuItem key={status} onSelect={() => updateFilter("submission", status)}>
                                        <Send className="mr-2 h-4 w-4" />
                                        {status === "all" ? "Semua Submit" : 
                                         status === "draft" ? "Draft" : 
                                         status === "submitted" ? "Submitted" :
                                         (status as string).charAt(0).toUpperCase() + (status as string).slice(1)}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button type="button" variant="outline" className="h-10 w-[140px] justify-between rounded-lg bg-background">
                                    <span className="truncate flex items-center gap-2 text-xs">
                                        <FileText className="h-3 w-3" />
                                        {approvalFilter === "all" ? "Semua Approval" : 
                                         approvalFilter === "pending" ? "Menunggu" : 
                                         approvalFilter === "approved" ? "Disetujui" :
                                         approvalFilter === "revision" ? "Revisi" :
                                         (approvalFilter as string).charAt(0).toUpperCase() + (approvalFilter as string).slice(1)}
                                    </span>
                                    <ChevronDown className="h-3 w-3 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[160px]">
                                {approvalFilters.map((status) => (
                                    <DropdownMenuItem key={status} onSelect={() => updateFilter("approval", status)}>
                                        <FileText className="mr-2 h-4 w-4" />
                                        {status === "all" ? "Semua Approval" : 
                                         status === "pending" ? "Menunggu" : 
                                         status === "approved" ? "Disetujui" :
                                         status === "revision" ? "Revisi" :
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
                            onClick={() => router.push(buildMechaturaPageHref({ page: 1, pageSize, search: undefined, category: "all", payment: "all", submission: "all", approval: "all", batch: "all" }))}
                            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 ml-2 transition-colors"
                        >
                            Hapus semua
                        </button>
                    </div>
                )}
            </div>

            <Tabs 
                value={batchFilter} 
                onValueChange={(value) => updateFilter("batch", value)}
                className="w-full"
            >
                <div className="flex items-center justify-between mb-4">
                    <TabsList>
                        <TabsTrigger value="all">Semua Batch</TabsTrigger>
                        <TabsTrigger value="batch1">Batch 1</TabsTrigger>
                        <TabsTrigger value="batch2">Batch 2</TabsTrigger>
                    </TabsList>
                </div>
                
                <DataTable columns={getColumns(searchParam)} data={teamData} />
            </Tabs>

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
