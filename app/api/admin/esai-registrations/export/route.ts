import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { rateLimited } from "@/lib/http";

export const dynamic = "force-dynamic";

const escapeCSV = (field: unknown) => {
    if (field === null || field === undefined) return "";
    let stringField = String(field);

    // Prevent CSV Formula Injection
    if (/^[=+\-@\t\r]/.test(stringField.trimStart())) {
        stringField = "'" + stringField;
    }

    if (
        stringField.includes(",") ||
        stringField.includes('"') ||
        stringField.includes("\n") ||
        stringField.includes("\r")
    ) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
};

export async function GET(request: Request) {
    try {
        const limit = await rateLimit(request, {
            key: "admin-export-esai",
            limit: 15,
            windowSeconds: 60,
        });

        if (!limit.success) {
            return rateLimited(limit.retryAfter);
        }

        const { adminAccess } = await requireAdmin(); 
        if (!adminAccess) return new NextResponse("Unauthorized", { status: 401 });

        const { searchParams } = new URL(request.url);
        
        const search = searchParams.get("search");
        const submission = searchParams.get("submission");
        const cols = searchParams.get("cols");

        const supabaseAdmin = createAdminClient();
        let query = supabaseAdmin.from("esai_registrations").select("*");

        if (submission && submission !== "all") {
            query = query.eq("submission_status", submission);
        }

        if (search) {
            const pattern = `"%${search.replace(/[%_]/g, "\\$&").replace(/"/g, "\\\"")}%"`;
            query = query.or(`full_name.ilike.${pattern},institution.ilike.${pattern},email.ilike.${pattern}`);
        }

        const { data, error } = await query;

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            return new NextResponse("Tidak ada data untuk diekspor", { status: 404 });
        }

        // CSV Header
        const selectedCols = cols ? cols.split(",") : ["id", "full_name", "institution", "submission_status"];
        
        let csvContent = selectedCols.map(c => escapeCSV(c)).join(",") + "\n";

        // CSV Rows
        data.forEach(row => {
            const rowData = selectedCols.map(col => escapeCSV(row[col] ?? ""));
            csvContent += rowData.join(",") + "\n";
        });

        return new NextResponse(csvContent, {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="data-peserta-esai-${new Date().toISOString().split("T")[0]}.csv"`
            }
        });

    } catch (error) {
        console.error("Export error:", error);
        return new NextResponse("Terjadi kesalahan saat mengekspor data", { status: 500 });
    }
}
