"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { AdminEsaiRegistration } from "./_lib/esai-utils";
import { EsaiActions } from "./esai-actions";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { getEsaiDocumentUrl } from "./actions";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/utils";

function EssayFileButton({ path }: { path: string }) {
    const [loading, setLoading] = useState(false);

    const handleOpen = async () => {
        const newWindow = window.open("about:blank", "_blank");
        try {
            setLoading(true);
            const { url, error } = await getEsaiDocumentUrl(path);
            if (error || !url) {
                newWindow?.close();
                toast.error(error || "Gagal membuka dokumen");
                return;
            }
            if (newWindow) {
                newWindow.opener = null;
                newWindow.location.href = url;
            } else {
                window.location.href = url;
            }
        } catch {
            newWindow?.close();
            toast.error("Gagal membuka dokumen");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button 
            variant="ghost" 
            size="sm" 
            disabled={loading}
            className="h-7 px-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/60"
            onClick={handleOpen}
        >
            <FileText className="h-3.5 w-3.5 mr-1" />
            {loading ? "Membuka..." : "Buka"}
        </Button>
    );
}

export const getColumns = (searchParam?: string): ColumnDef<AdminEsaiRegistration>[] => [
    {
        accessorKey: "full_name",
        header: "Peserta",
        cell: ({ row }) => {
            const searchParts = searchParam?.toLowerCase().trim().split(/\s+/).filter(Boolean) || [];
            const isMatch = (str?: string | null) => searchParts.length > 0 && searchParts.every(part => str?.toLowerCase().includes(part));
            
            const participantName = row.original.full_name?.trim()
                ? row.original.full_name.trim()
                : (row.original.fallback_name?.trim() || "Tanpa Nama");
            const nameMatches = isMatch(row.original.full_name) || isMatch(row.original.fallback_name);

            return (
                <div className="min-w-0 flex flex-col min-w-[180px]">
                    <span className={`font-medium text-sm text-zinc-100 truncate ${nameMatches ? "bg-yellow-400/20 text-yellow-300 px-1 rounded" : ""}`}>
                        {participantName}
                    </span>
                    <span className="text-[11px] text-zinc-400 truncate">
                        {row.original.institution || "-"}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => {
            const searchParts = searchParam?.toLowerCase().trim().split(/\s+/).filter(Boolean) || [];
            const isMatch = (str?: string | null) => searchParts.length > 0 && searchParts.every(part => str?.toLowerCase().includes(part));
            const emailValue = row.original.email?.trim() || row.original.fallback_email?.trim() || null;
            const emailMatches = isMatch(emailValue);

            return (
                <div className={`text-xs text-zinc-300 font-mono ${emailMatches ? "bg-yellow-400/20 text-yellow-300 px-1 rounded" : ""}`}>
                    {emailValue || "-"}
                </div>
            );
        }
    },
    {
        id: "paper_and_subtheme",
        header: "Judul & Subtema",
        cell: ({ row }) => {
            const paperTitle = row.original.paper_title?.trim();
            const subTheme = row.original.sub_theme?.trim();

            const searchParts = searchParam?.toLowerCase().trim().split(/\s+/).filter(Boolean) || [];
            const isMatch = (str?: string | null) => searchParts.length > 0 && searchParts.every(part => str?.toLowerCase().includes(part));
            const titleMatches = isMatch(paperTitle);

            return (
                <div className="min-w-0 flex flex-col gap-0.5 max-w-[280px]">
                    <span 
                        className={`text-xs font-medium text-zinc-200 truncate ${titleMatches ? "bg-yellow-400/20 text-yellow-300 px-1 rounded w-fit" : ""}`}
                        title={paperTitle || undefined}
                    >
                        {paperTitle || <span className="text-zinc-500 italic font-normal">-</span>}
                    </span>
                    {subTheme && (
                        <span className="text-[11px] text-zinc-400 truncate" title={subTheme}>
                            {subTheme}
                        </span>
                    )}
                </div>
            );
        }
    },
    {
        id: "essay_file",
        header: "File",
        cell: ({ row }) => {
            const path = row.original.essay_paper_url;
            return path ? (
                <EssayFileButton path={path} />
            ) : (
                <span className="text-xs text-zinc-500 italic ml-2">-</span>
            );
        }
    },
    {
        accessorKey: "submission_status",
        header: "Status",
        cell: ({ row }) => {
            const status = (row.getValue("submission_status") as string) || "draft";
            
            if (status === "approved") {
                return (
                    <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                        Disetujui
                    </span>
                );
            } else if (status === "submitted") {
                return (
                    <span className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">
                        Disubmit
                    </span>
                );
            }
            return (
                <span className="inline-flex items-center rounded-full border border-zinc-700/50 bg-zinc-800/60 px-2.5 py-0.5 text-xs font-medium text-zinc-400">
                    Draft
                </span>
            );
        },
    },
    {
        accessorKey: "created_at",
        header: "Waktu",
        cell: ({ row }) => {
            const timestamp = row.original.created_at;
            return (
                <span suppressHydrationWarning className="text-xs text-zinc-400 font-mono whitespace-nowrap" title={timestamp || ""}>
                    {formatRelativeTime(timestamp)}
                </span>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <EsaiActions participant={row.original} />,
    },
];
