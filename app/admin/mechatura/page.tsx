import type { Metadata } from "next"
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isCompletedPaymentStatus } from "@/lib/payment";
import { requireAdminOrRedirect } from "@/lib/auth";
import MechaturaListClient from "./mechatura-list-client";
import type {
    AdminMechaturaTeam,
} from "./teams";
import {
    type AdminSearchParams,
    applyMechaturaFilters,
    categoryFilters,
    firstParam,
    mechaturaRegistrationColumns,
    normalizeFilter,
    normalizePageSize,
    normalizePositiveInt,
    paymentFilters,
    submissionFilters,
    approvalFilters,
    batchFilters,
    toSearchPattern,
} from "./_lib/mechatura-utils";
import { Suspense } from "react"
import TableLoading from "../table-loading"

async function MechaturaAdminData({
    searchParams,
}: {
    searchParams: AdminSearchParams;
}) {
    await requireAdminOrRedirect();
    const params = await searchParams;
    const categoryParam = firstParam(params.category);
    const paymentParam = firstParam(params.payment);
    const searchParam = firstParam(params.search);
    const submissionParam = firstParam(params.submission);
    const approvalParam = firstParam(params.approval);
    const batchParam = firstParam(params.batch);
    const pageParam = firstParam(params.page);
    const pageSizeParam = firstParam(params.pageSize);
    const categoryFilter = normalizeFilter(categoryParam, categoryFilters, "all");
    const paymentFilter = normalizeFilter(paymentParam, paymentFilters, "all");
    const submissionFilter = normalizeFilter(submissionParam, submissionFilters, "all");
    const approvalFilter = normalizeFilter(approvalParam, approvalFilters, "all");
    const batchFilter = normalizeFilter(batchParam, batchFilters, "all");
    const searchFilter = (searchParam ?? "").trim();
    const searchPattern = toSearchPattern(searchFilter);
    const requestedPage = normalizePositiveInt(pageParam, 1);
    const pageSize = normalizePageSize(pageSizeParam);
    const requestedFrom = (requestedPage - 1) * pageSize;
    const requestedTo = requestedFrom + pageSize - 1;
    const supabase = await createClient();

    const { data: memberSearchMatches, error: memberSearchError } = searchPattern
        ? await supabase
            .from("mechatura_members")
            .select("team_id")
            .or(
                `full_name.ilike.${searchPattern},phone_number.ilike.${searchPattern}`
            )
            .limit(100)
            .returns<Array<{ team_id: string }>>()
        : { data: [], error: null };

    if (memberSearchError) {
        throw new Error(memberSearchError.message);
    }

    const memberTeamIds = Array.from(
        new Set((memberSearchMatches ?? []).map((member) => member.team_id))
    );
    const filterOptions = {
        categoryFilter,
        paymentFilter,
        submissionFilter,
        approvalFilter,
        batchFilter,
        searchPattern,
        memberRegistrationIds: memberTeamIds,
    };
    const buildFilteredTeamQuery = (
        select: string,
        options?: { count?: "exact"; head?: boolean }
    ) =>
        applyMechaturaFilters(
            supabase.from("mechatura_teams").select(select, options),
            filterOptions
        );

    const [
        { data: requestedPageData, error: pageError, count },
        { count: totalTeams },
        { count: paidTeams },
        { count: sumoTeams },
        { count: transporterTeams },
    ] = await Promise.all([
        buildFilteredTeamQuery(mechaturaRegistrationColumns, { count: "exact" })
            .order("created_at", { ascending: false })
            .order("name", { ascending: true })
            .range(requestedFrom, requestedTo)
            .returns<AdminMechaturaTeam[]>(),
        supabase.from("mechatura_teams").select("*", { count: 'exact', head: true }),
        supabase.from("mechatura_teams").select("*", { count: 'exact', head: true }).in("payment_status", ["paid", "settled", "verified"]),
        supabase.from("mechatura_teams").select("*", { count: 'exact', head: true }).eq("category", "robot_sumo"),
        supabase.from("mechatura_teams").select("*", { count: 'exact', head: true }).eq("category", "robot_transporter"),
    ]);

    if (pageError) {
        throw new Error(pageError.message);
    }
    
    const totalFilteredRegistrations = count ?? requestedPageData?.length ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalFilteredRegistrations / pageSize));
    const page = Math.min(requestedPage, totalPages);
    let registrations = requestedPageData ?? [];

    if (page !== requestedPage) {
        const { data: clampedPageData, error: clampedPageError } =
            await buildFilteredTeamQuery(mechaturaRegistrationColumns)
                .order("created_at", { ascending: false })
                .order("name", { ascending: true })
                .range((page - 1) * pageSize, page * pageSize - 1)
                .returns<AdminMechaturaTeam[]>();

        if (clampedPageError) {
            throw new Error(clampedPageError.message);
        }

        registrations = clampedPageData ?? [];
    }

    const adminSupabase = createAdminClient();
    
    // Batch fetch user data to prevent N+1 auth requests
    const uniqueUserIds = Array.from(new Set(
        registrations.flatMap(team => (team.mechatura_members || []).map(m => m.user_id).filter(Boolean))
    ));
    
    const fallbackNamesByUserId = new Map<string, string>();
    const fetchBatchSize = 10;
    
    for (let i = 0; i < uniqueUserIds.length; i += fetchBatchSize) {
        const batch = uniqueUserIds.slice(i, i + fetchBatchSize);
        await Promise.all(batch.map(async (userId) => {
            try {
                const { data: userData } = await adminSupabase.auth.admin.getUserById(userId as string);
                if (userData?.user) {
                    const meta = userData.user.user_metadata || {};
                    const name = meta.display_name || meta.username || userData.user.email || null;
                    if (name) fallbackNamesByUserId.set(userId as string, name);
                }
            } catch (e) {
                // ignore
            }
        }));
    }

    const enrichedRegistrations = registrations.map((team) => {
        if (!team.mechatura_members) return team;
        const enrichedMembers = team.mechatura_members.map((m) => {
            let fallback_name = null;
            if (m.user_id && fallbackNamesByUserId.has(m.user_id)) {
                fallback_name = fallbackNamesByUserId.get(m.user_id);
            }
            return { ...m, fallback_name };
        });
        return { ...team, mechatura_members: enrichedMembers };
    });

    const from = (page - 1) * pageSize;

    return (
        <MechaturaListClient
            registrations={enrichedRegistrations}
            searchParam={searchParam}
            categoryFilter={categoryFilter}
            paymentFilter={paymentFilter}
            submissionFilter={submissionFilter}
            approvalFilter={approvalFilter}
            batchFilter={batchFilter}
            pageSize={pageSize}
            pagination={{
                page,
                pageSize,
                totalItems: totalFilteredRegistrations,
                totalPages,
                startItem: totalFilteredRegistrations === 0 ? 0 : from + 1,
                endItem: Math.min(from + pageSize, totalFilteredRegistrations),
            }}
            stats={{
                totalTeams: totalTeams ?? 0,
                paidTeams: paidTeams ?? 0,
                sumoTeams: sumoTeams ?? 0,
                transporterTeams: transporterTeams ?? 0,
            }}
        />
    );
}
export const metadata: Metadata = {
  title: "Admin Mechatura"
}

export default function MechaturaAdminPage({ searchParams }: { searchParams: AdminSearchParams }) { return <Suspense fallback={<TableLoading />}><MechaturaAdminData searchParams={searchParams} /></Suspense> }
