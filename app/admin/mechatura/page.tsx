export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { createAdminClient } from "@/lib/supabase-admin";
import { isCompletedPaymentStatus } from "@/lib/payment";
import { requireAdminOrRedirect } from "@/lib/auth";
import MechaturaListClient from "./mechatura-list-client";
import type {
    AdminMechaturaLeader,
    AdminMechaturaRegistration,
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
            .select("registration_id")
            .eq("is_leader", true)
            .or(
                `full_name.ilike.${searchPattern},email.ilike.${searchPattern},phone.ilike.${searchPattern}`
            )
            .limit(10_000)
            .returns<Array<Pick<AdminMechaturaLeader, "registration_id">>>()
        : { data: [], error: null };

    if (leaderSearchError) {
        throw new Error(leaderSearchError.message);
    }

    const leaderRegistrationIds = Array.from(
        new Set((leaderSearchMatches ?? []).map((leader) => leader.registration_id))
    );
    const filterOptions = {
        categoryFilter,
        paymentFilter,
        statusFilter,
        searchPattern,
        leaderRegistrationIds,
    };
    const buildFilteredRegistrationQuery = (
        select: string,
        options?: { count?: "exact"; head?: boolean }
    ) =>
        applyMechaturaFilters(
            adminSupabase.from("mechatura_registrations").select(select, options),
            filterOptions
        );

    const [
        { data: requestedPageData, error: pageError, count },
        { data: statsData, error: statsError },
    ] = await Promise.all([
        buildFilteredRegistrationQuery(mechaturaRegistrationColumns, { count: "exact" })
            .order("created_at", { ascending: false })
            .order("team_name", { ascending: true })
            .range(requestedFrom, requestedTo)
            .returns<AdminMechaturaRegistration[]>(),
        adminSupabase.rpc("get_mechatura_stats"),
    ]);

    if (pageError || statsError) {
        throw new Error(pageError?.message ?? statsError?.message);
    }
    
    const { total: totalTeams, paid: paidTeams, sumo: sumoTeams, transporter: transporterTeams } = statsData;
    const totalFilteredRegistrations = count ?? requestedPageData?.length ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalFilteredRegistrations / pageSize));
    const page = Math.min(requestedPage, totalPages);
    let registrations = requestedPageData ?? [];

    if (page !== requestedPage) {
        const { data: clampedPageData, error: clampedPageError } =
            await buildFilteredRegistrationQuery(mechaturaRegistrationColumns)
                .order("created_at", { ascending: false })
                .order("team_name", { ascending: true })
                .range((page - 1) * pageSize, page * pageSize - 1)
                .returns<AdminMechaturaRegistration[]>();

        if (clampedPageError) {
            throw new Error(clampedPageError.message);
        }

        registrations = clampedPageData ?? [];
    }

    const { data: leaders, error: leadersError } = registrations.length
        ? await adminSupabase
            .from("mechatura_members")
            .select("registration_id,full_name,email,phone")
            .in(
                "registration_id",
                registrations.map((registration) => registration.id)
            )
            .eq("is_leader", true)
            .returns<AdminMechaturaLeader[]>()
        : { data: [], error: null };

    if (leadersError) {
        throw new Error(leadersError.message);
    }

    const from = (page - 1) * pageSize;

    return (
        <MechaturaListClient
            registrations={registrations}
            leaders={leaders ?? []}
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
                totalTeams,
                paidTeams,
                sumoTeams,
                transporterTeams,
            }}
        />
    );
}
export default function MechaturaAdminPage({ searchParams }: { searchParams: AdminSearchParams }) { return <Suspense fallback={<TableLoading />}><MechaturaAdminData searchParams={searchParams} /></Suspense> }
