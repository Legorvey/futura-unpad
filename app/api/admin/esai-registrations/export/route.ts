import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: Request) {
    try {
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
        
        let csvContent = selectedCols.join(",") + "\n";

        // CSV Rows
        data.forEach(row => {
            const rowData = selectedCols.map(col => {
                let val = row[col] ?? "";
                if (typeof val === "string") {
                    val = val.replace(/"/g, '""');
                    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
                        val = `"${val}"`;
                    }
                }
                return val;
            });
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
