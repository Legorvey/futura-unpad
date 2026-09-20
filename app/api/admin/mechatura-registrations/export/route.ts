import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/lib/supabase-admin";
import {
    applyMechaturaFilters,
    categoryFilters,
    normalizeFilter,
    paymentFilters,
    submissionFilters,
    approvalFilters,
    batchFilters,
    toSearchPattern,
} from "@/app/admin/mechatura/_lib/mechatura-utils";
import { mechaturaCompetitionLabels, paymentStatusLabels } from "@/lib/payment";

export const dynamic = "force-dynamic";

const escapeCSV = (field: string | number | null | undefined) => {
    if (field === null || field === undefined) return "";
    let stringField = String(field);
    if (/^[=+\-@]/.test(stringField.trimStart())) {
        stringField = "'" + stringField;
    }
    if (stringField.includes(",") || stringField.includes('"') || stringField.includes("\n") || stringField.includes("\r")) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
};

const formatPaymentStatus = (status: string | null) =>
    status && status in paymentStatusLabels
        ? paymentStatusLabels[status as keyof typeof paymentStatusLabels]
        : paymentStatusLabels.unpaid;

const formatCompetition = (value: unknown) => {
    if (value === "robot_sumo") return mechaturaCompetitionLabels["sumo"];
    if (value === "robot_transporter") return mechaturaCompetitionLabels["transporter"];
    return String(value ?? "");
}

const chunk = <T,>(items: T[], size: number) => {
    const chunks: T[][] = [];
    for (let index = 0; index < items.length; index += size) {
        chunks.push(items.slice(index, index + size));
    }
    return chunks;
};

export async function GET(request: NextRequest) {
    const { user, adminAccess } = await requireAdmin();
    if (!user || !adminAccess) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category") ?? undefined;
    const paymentParam = searchParams.get("payment") ?? undefined;
    const searchParam = searchParams.get("search") ?? undefined;
    const submissionParam = searchParams.get("submission") ?? undefined;
    const approvalParam = searchParams.get("approval") ?? undefined;
    const batchParam = searchParams.get("batch") ?? undefined;

    const categoryFilter = normalizeFilter(categoryParam, categoryFilters, "all");
    const paymentFilter = normalizeFilter(paymentParam, paymentFilters, "all");
    const submissionFilter = normalizeFilter(submissionParam, submissionFilters, "all");
    const approvalFilter = normalizeFilter(approvalParam, approvalFilters, "all");
    const batchFilter = normalizeFilter(batchParam, batchFilters, "all");
    const searchPattern = toSearchPattern(searchParam ?? "");

    const supabase = await createClient();

    // First fetch members that match search pattern
    const { data: memberSearchMatches } = searchPattern
        ? await supabase
            .from("mechatura_members")
            .select("team_id")
            .or(`full_name.ilike.${searchPattern},phone_number.ilike.${searchPattern}`)
            .limit(100)
            .returns<Array<{ team_id: string }>>()
        : { data: [] };

    const memberTeamIds = Array.from(new Set((memberSearchMatches ?? []).map((m) => m.team_id)));
    const filterOptions = {
        categoryFilter,
        paymentFilter,
        submissionFilter,
        approvalFilter,
        batchFilter,
        searchPattern,
        memberRegistrationIds: memberTeamIds,
    };

    const buildQuery = () => applyMechaturaFilters(
        supabase.from("mechatura_teams").select("*"),
        filterOptions
    );

    const registrations: any[] = [];
    const batchSize = 1000;
    let offset = 0;

    while (true) {
        const { data, error } = await buildQuery()
            .order("created_at", { ascending: false })
            .order("name", { ascending: true })
            .range(offset, offset + batchSize - 1);

        if (error) {
            return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 });
        }
        registrations.push(...(data ?? []));
        if (!data || data.length < batchSize) break;
        offset += batchSize;
    }

    const members: any[] = [];
    const teamIds = registrations.map((r) => r.id);
    const memberChunkSize = 150;

    for (const ids of chunk(teamIds, memberChunkSize)) {
        const { data, error } = await supabase
            .from("mechatura_members")
            .select("*")
            .in("team_id", ids)
            .order("is_leader", { ascending: false })
            .order("full_name", { ascending: true });

        if (error) {
            return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
        }
        members.push(...(data ?? []));
    }

    // Attempt to fetch emails for members
    const uniqueUserIds = Array.from(new Set(members.map(m => m.user_id).filter(Boolean)));
    const emailsByUserId = new Map<string, string>();
    const adminSupabase = createAdminClient();
    let page = 1;
    let hasNextPage = true;
    while (hasNextPage) {
        const { data, error } = await adminSupabase.auth.admin.listUsers({ page, perPage: 1000 });
        if (error || !data.users.length) break;
        for (const u of data.users) {
            if (u.email && uniqueUserIds.includes(u.id)) {
                emailsByUserId.set(u.id, u.email);
            }
        }
        hasNextPage = data.users.length === 1000;
        page++;
    }

    const membersByTeamId = new Map<string, any[]>();
    for (const member of members) {
        member.email = member.user_id ? (emailsByUserId.get(member.user_id) || "") : "";
        const teamMembers = membersByTeamId.get(member.team_id) ?? [];
        teamMembers.push(member);
        membersByTeamId.set(member.team_id, teamMembers);
    }

    const colsParam = searchParams.get("cols");
    const requestedCols = colsParam ? colsParam.split(",") : [];
    const shouldExport = (col: string) => requestedCols.length === 0 || requestedCols.includes(col);

    const headers: string[] = [];
    if (shouldExport("id")) headers.push("ID");
    if (shouldExport("join_code")) headers.push("Kode Unik");
    if (shouldExport("name")) headers.push("Nama Tim");
    if (shouldExport("category")) headers.push("Kategori");
    if (shouldExport("pembina_name")) headers.push("Nama Pembina");
    if (shouldExport("pembina_phone")) headers.push("No. WA Pembina");
    if (shouldExport("leader_name")) headers.push("Nama Ketua");
    if (shouldExport("leader_phone")) headers.push("No. WA Ketua");
    if (shouldExport("leader_email")) headers.push("Email Ketua");
    if (shouldExport("leader_institution")) headers.push("Instansi Ketua");
    if (shouldExport("leader_city")) headers.push("Kota Ketua");
    if (shouldExport("leader_instagram")) headers.push("Instagram Ketua");
    if (shouldExport("payment_status")) headers.push("Status Pembayaran");
    if (shouldExport("submission_status")) headers.push("Status Pengumpulan");
    if (shouldExport("approval_status")) headers.push("Verifikasi Admin");
    if (shouldExport("created_at")) headers.push("Waktu Daftar");

    let maxMembers = 0;
    const teamsWithMembers = registrations.map((team) => {
        const teamMembers = membersByTeamId.get(team.id) ?? [];
        const leader = teamMembers.find((m) => m.is_leader);
        const membersOnly = teamMembers.filter((m) => !m.is_leader);
        if (membersOnly.length > maxMembers) maxMembers = membersOnly.length;
        return { team, leader, membersOnly };
    });

    for (let i = 0; i < maxMembers; i++) {
        if (shouldExport("member_name")) headers.push(`Nama Anggota ${i + 1}`);
        if (shouldExport("member_phone")) headers.push(`No. WA Anggota ${i + 1}`);
        if (shouldExport("member_email")) headers.push(`Email Anggota ${i + 1}`);
        if (shouldExport("member_institution")) headers.push(`Instansi Anggota ${i + 1}`);
        if (shouldExport("member_city")) headers.push(`Kota Anggota ${i + 1}`);
        if (shouldExport("member_instagram")) headers.push(`Instagram Anggota ${i + 1}`);
    }

    const rows = teamsWithMembers.map(({ team, leader, membersOnly }) => {
        let date = "";
        if (team.created_at) {
            const d = new Date(team.created_at);
            date = new Intl.DateTimeFormat("id-ID", {
                timeZone: "Asia/Jakarta",
                year: "numeric", month: "2-digit", day: "2-digit",
                hour: "2-digit", minute: "2-digit", second: "2-digit",
                hour12: false
            }).format(d).replace(/\./g, ":").replace(",", "");
        }

        const baseRow: string[] = [];
        if (shouldExport("id")) baseRow.push(escapeCSV(team.id));
        if (shouldExport("join_code")) baseRow.push(escapeCSV(team.join_code));
        if (shouldExport("name")) baseRow.push(escapeCSV(team.name));
        if (shouldExport("category")) baseRow.push(escapeCSV(formatCompetition(team.category)));
        if (shouldExport("pembina_name")) baseRow.push(escapeCSV(team.pembina_name));
        if (shouldExport("pembina_phone")) baseRow.push(escapeCSV(team.pembina_phone));
        if (shouldExport("leader_name")) baseRow.push(escapeCSV(leader?.full_name));
        if (shouldExport("leader_phone")) baseRow.push(escapeCSV(leader?.phone_number));
        if (shouldExport("leader_email")) baseRow.push(escapeCSV(leader?.email));
        if (shouldExport("leader_institution")) baseRow.push(escapeCSV(leader?.institution));
        if (shouldExport("leader_city")) baseRow.push(escapeCSV(leader?.city));
        if (shouldExport("leader_instagram")) baseRow.push(escapeCSV(leader?.instagram_username));
        if (shouldExport("payment_status")) baseRow.push(escapeCSV(formatPaymentStatus(team.payment_status)));
        if (shouldExport("submission_status")) baseRow.push(escapeCSV(team.submission_status));
        if (shouldExport("approval_status")) baseRow.push(escapeCSV(team.admin_approval_status));
        if (shouldExport("created_at")) baseRow.push(escapeCSV(date));

        const memberCols: string[] = [];
        for (let i = 0; i < maxMembers; i++) {
            const m = membersOnly[i];
            if (shouldExport("member_name")) memberCols.push(escapeCSV(m?.full_name));
            if (shouldExport("member_phone")) memberCols.push(escapeCSV(m?.phone_number));
            if (shouldExport("member_email")) memberCols.push(escapeCSV(m?.email));
            if (shouldExport("member_institution")) memberCols.push(escapeCSV(m?.institution));
            if (shouldExport("member_city")) memberCols.push(escapeCSV(m?.city));
            if (shouldExport("member_instagram")) memberCols.push(escapeCSV(m?.instagram_username));
        }

        return [...baseRow, ...memberCols].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csvContent, {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="mechatura-teams-${new Date().toISOString().split("T")[0]}.csv"`,
        },
    });
}