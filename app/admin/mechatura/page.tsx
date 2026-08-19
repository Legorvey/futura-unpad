import type { Metadata } from "next"
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

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
    statusFilters,
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
    const statusParam = firstParam(params.status);
    const pageParam = firstParam(params.page);
    const pageSizeParam = firstParam(params.pageSize);
    const categoryFilter = normalizeFilter(categoryParam, categoryFilters, "all");
    const paymentFilter = normalizeFilter(paymentParam, paymentFilters, "all");
    const statusFilter = normalizeFilter(statusParam, statusFilters, "all");
    const searchFilter = (searchParam ?? "").trim();
    const searchPattern = toSearchPattern(searchFilter);
    const requestedPage = normalizePositiveInt(pageParam, 1);
    const pageSize = normalizePageSize(pageSizeParam);
    const requestedFrom = (requestedPage - 1) * pageSize;
    const requestedTo = requestedFrom + pageSize - 1;
    const adminSupabase = createAdminClient();

    const { data: leaderSearchMatches, error: leaderSearchError } = searchPattern
        ? await adminSupabase
            .from("mechatura_members")
            .select("team_id")
            .eq("is_leader", true)
            .or(
                `full_name.ilike.${searchPattern},phone_number.ilike.${searchPattern}`
            )
            .limit(10_000)
            .returns<Array<{ team_id: string }>>()
        : { data: [], error: null };

    if (leaderSearchError) {
        throw new Error(leaderSearchError.message);
    }

    const leaderTeamIds = Array.from(
        new Set((leaderSearchMatches ?? []).map((leader) => leader.team_id))
    );
    const filterOptions = {
        categoryFilter,
        paymentFilter,
        statusFilter,
        searchPattern,
        leaderRegistrationIds: leaderTeamIds,
    };
    const buildFilteredTeamQuery = (
        select: string,
        options?: { count?: "exact"; head?: boolean }
    ) =>
        applyMechaturaFilters(
            adminSupabase.from("mechatura_teams").select(select, options),
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
        adminSupabase.from("mechatura_teams").select("*", { count: 'exact', head: true }),
        adminSupabase.from("mechatura_teams").select("*", { count: 'exact', head: true }).in("payment_status", ["paid", "settled", "verified"]),
        adminSupabase.from("mechatura_teams").select("*", { count: 'exact', head: true }).eq("category", "robot_sumo"),
        adminSupabase.from("mechatura_teams").select("*", { count: 'exact', head: true }).eq("category", "robot_transporter"),
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

    const enrichedRegistrations = await Promise.all(
        registrations.map(async (team) => {
            if (!team.mechatura_members) return team;
            
            const enrichedMembers = await Promise.all(
                team.mechatura_members.map(async (m) => {
                    let fallback_name = null;
                    if (m.user_id) {
                        try {
                            const { data: userData } = await adminSupabase.auth.admin.getUserById(m.user_id);
                            if (userData?.user) {
                                const meta = userData.user.user_metadata || {};
                                fallback_name = meta.display_name || meta.username || userData.user.email || null;
                            }
                        } catch (e) {
                            // ignore error
                        }
                    }
                    return { ...m, fallback_name };
                })
            );
            
            return { ...team, mechatura_members: enrichedMembers };
        })
    );

    const from = (page - 1) * pageSize;

    return (
        <MechaturaListClient
            registrations={enrichedRegistrations}
            searchParam={searchParam}
            categoryFilter={categoryFilter}
            paymentFilter={paymentFilter}
            statusFilter={statusFilter}
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
