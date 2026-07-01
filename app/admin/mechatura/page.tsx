export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { createAdminClient } from "@/lib/supabase-admin";
import MechaturaListClient from "./mechatura-list-client";
import type {
    AdminMechaturaLeader,
    AdminMechaturaRegistration,
} from "./_components/mechatura-table";
import {
    type AdminSearchParams,
    applyMechaturaFilters,
    categoryFilters,
    completedPaymentStatuses,
    firstParam,
    mechaturaRegistrationColumns,
    normalizeFilter,
    normalizePageSize,
    normalizePositiveInt,
    paymentFilters,
    toSearchPattern,
} from "./_lib/mechatura-utils";

export default async function MechaturaAdminPage({
    searchParams,
}: {
    searchParams: AdminSearchParams;
}) {
    const params = await searchParams;
    const categoryParam = firstParam(params.category);
    const paymentParam = firstParam(params.payment);
    const searchParam = firstParam(params.search);
    const pageParam = firstParam(params.page);
    const pageSizeParam = firstParam(params.pageSize);
    const categoryFilter = normalizeFilter(categoryParam, categoryFilters, "all");
    const paymentFilter = normalizeFilter(paymentParam, paymentFilters, "all");
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
        totalCountResult,
        paidCountResult,
        sumoCountResult,
        transporterCountResult,
    ] = await Promise.all([
        buildFilteredRegistrationQuery(mechaturaRegistrationColumns, { count: "exact" })
            .order("created_at", { ascending: false })
            .order("team_name", { ascending: true })
            .range(requestedFrom, requestedTo)
            .returns<AdminMechaturaRegistration[]>(),
        adminSupabase
            .from("mechatura_registrations")
            .select("id", { count: "exact", head: true }),
        adminSupabase
            .from("mechatura_registrations")
            .select("id", { count: "exact", head: true })
            .in("payment_status", completedPaymentStatuses),
        adminSupabase
            .from("mechatura_registrations")
            .select("id", { count: "exact", head: true })
            .eq("competition_type", "sumo"),
        adminSupabase
            .from("mechatura_registrations")
            .select("id", { count: "exact", head: true })
            .eq("competition_type", "transporter"),
    ]);

    if (
        pageError ||
        totalCountResult.error ||
        paidCountResult.error ||
        sumoCountResult.error ||
        transporterCountResult.error
    ) {
        throw new Error(
            pageError?.message ??
            totalCountResult.error?.message ??
            paidCountResult.error?.message ??
            sumoCountResult.error?.message ??
            transporterCountResult.error?.message
        );
    }

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
                totalTeams: totalCountResult.count ?? 0,
                paidTeams: paidCountResult.count ?? 0,
                sumoTeams: sumoCountResult.count ?? 0,
                transporterTeams: transporterCountResult.count ?? 0,
            }}
        />
    );
}
