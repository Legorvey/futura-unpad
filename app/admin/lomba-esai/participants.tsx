"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AdminEsaiRegistration } from "./_lib/esai-utils";
import { EsaiActions } from "./esai-actions";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { getEsaiDocumentUrl } from "./actions";
import { toast } from "sonner";

export const getColumns = (searchParam?: string): ColumnDef<AdminEsaiRegistration>[] => [
    {
        id: "index",
        header: "#",
        cell: ({ row }) => (
            <div className="text-muted-foreground">{row.index + 1}</div>
        ),
    },
    {
        accessorKey: "full_name",
        header: "Peserta",
        cell: ({ row }) => {
            const searchParts = searchParam?.toLowerCase().trim().split(/\s+/).filter(Boolean) || [];
            const isMatch = (str?: string | null) => searchParts.length > 0 && searchParts.every(part => str?.toLowerCase().includes(part));
            
            const nameMatches = isMatch(row.original.full_name);
            const idMatches = isMatch(row.original.id);
            
            return (
                <div className="min-w-0 flex flex-col gap-1 items-start">
                    <span className={`font-medium ${nameMatches ? "bg-yellow-200 text-yellow-900 px-1 rounded-sm" : ""}`}>
                        {row.original.full_name || "Tanpa Nama"}
                    </span>
                    <span className={`text-xs text-muted-foreground tracking-wide uppercase ${idMatches ? "bg-yellow-200 text-yellow-900 px-1 rounded-sm font-medium" : ""}`}>
                        ID: {row.original.id.substring(0, 8)}...
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "institution",
        header: "Instansi",
        cell: ({ row }) => {
            const searchParts = searchParam?.toLowerCase().trim().split(/\s+/).filter(Boolean) || [];
            const isMatch = (str?: string | null) => searchParts.length > 0 && searchParts.every(part => str?.toLowerCase().includes(part));
            const instMatches = isMatch(row.original.institution);

            return (
                <div className="min-w-0 flex flex-col gap-1 items-start">
                    <span className={`font-medium text-[13px] ${instMatches ? "bg-yellow-200 text-yellow-900 px-1 rounded-sm" : ""}`}>
                        {row.original.institution || "-"}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "phone_number",
        header: "No. WA",
        cell: ({ row }) => (
            <div className="text-[13px] font-medium text-foreground">
                {row.original.phone_number || "-"}
            </div>
        )
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => {
            const searchParts = searchParam?.toLowerCase().trim().split(/\s+/).filter(Boolean) || [];
            const isMatch = (str?: string | null) => searchParts.length > 0 && searchParts.every(part => str?.toLowerCase().includes(part));
            const emailMatches = isMatch(row.original.email);

            return (
                <div className={`text-[13px] text-muted-foreground ${emailMatches ? "bg-yellow-200 text-yellow-900 px-1 rounded-sm font-medium" : ""}`}>
                    {row.original.email || "-"}
                </div>
            );
        }
    },
    {
        id: "essay_file",
        header: "File Esai",
        cell: ({ row }) => {
            const path = row.original.essay_paper_url;
            return path ? (
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-primary font-medium"
                    onClick={async () => {
                        const { url, error } = await getEsaiDocumentUrl(path);
                        if (error || !url) {
                            toast.error(error || "Gagal membuka dokumen");
                            return;
                        }
                        window.open(url, '_blank');
                    }}
                >
                    <FileText className="h-4 w-4 mr-1.5" />
                    Buka
                </Button>
            ) : (
                <span className="text-xs text-muted-foreground italic ml-2">N/A</span>
            );
        }
    },
    {
        accessorKey: "submission_status",
        header: "Dokumen",
        cell: ({ row }) => {
            const status = (row.getValue("submission_status") as string) || "draft";
            
            if (status === "approved") {
                return <span className="inline-flex rounded-md border px-2 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-800/50">Disetujui</span>;
            } else if (status === "submitted") {
                return <span className="inline-flex rounded-md border px-2 py-0.5 text-[10px] font-medium bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800/50">Disubmit</span>;
            }
            return <span className="inline-flex rounded-md border px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">Draft</span>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <EsaiActions participant={row.original} />,
    },
];
