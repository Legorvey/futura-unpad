import type { Metadata } from "next"
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { createAdminClient } from "@/lib/supabase-admin";
import { requireAdminOrRedirect } from "@/lib/auth";
import EsaiListClient from "./esai-list-client";
import {
    type AdminSearchParams,
    type AdminEsaiRegistration,
    applyEsaiFilters,
    firstParam,
    esaiRegistrationColumns,
    normalizeFilter,
    normalizePageSize,
    normalizePositiveInt,
    submissionFilters,
    toSearchPattern,
} from "./_lib/esai-utils";
import { Suspense } from "react"
import TableLoading from "../table-loading"

async function EsaiAdminData({
    searchParams,
}: {
    searchParams: AdminSearchParams;
}) {
    await requireAdminOrRedirect();
    const params = await searchParams;
    const searchParam = firstParam(params.search);
    const submissionParam = firstParam(params.submission);
    const pageParam = firstParam(params.page);
    const pageSizeParam = firstParam(params.pageSize);
    
    const submissionFilter = normalizeFilter(submissionParam, submissionFilters, "all");
    const searchFilter = (searchParam ?? "").trim();
    const searchPattern = toSearchPattern(searchFilter);
    const requestedPage = normalizePositiveInt(pageParam, 1);
    const pageSize = normalizePageSize(pageSizeParam);
    const requestedFrom = (requestedPage - 1) * pageSize;
    const requestedTo = requestedFrom + pageSize - 1;
    const supabaseAdmin = createAdminClient();

    const filterOptions = {
        submissionFilter,
        searchPattern,
    };
    
    const buildFilteredTeamQuery = (
        select: string,
        options?: { count?: "exact"; head?: boolean }
    ) =>
        applyEsaiFilters(
            supabaseAdmin.from("esai_registrations").select(select, options),
            filterOptions
        );

    const [
        { data: requestedPageData, error: pageError, count },
        { count: totalRegistrations },
        { count: submittedRegistrations },
        { count: approvedRegistrations },
    ] = await Promise.all([
        buildFilteredTeamQuery(esaiRegistrationColumns, { count: "exact" })
            .order("created_at", { ascending: false })
            .range(requestedFrom, requestedTo)
            .returns<AdminEsaiRegistration[]>(),
        supabaseAdmin.from("esai_registrations").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("esai_registrations").select("*", { count: "exact", head: true }).eq("submission_status", "submitted"),
        supabaseAdmin.from("esai_registrations").select("*", { count: "exact", head: true }).eq("submission_status", "approved"),
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
            await buildFilteredTeamQuery(esaiRegistrationColumns)
                .order("created_at", { ascending: false })
                .range((page - 1) * pageSize, page * pageSize - 1)
                .returns<AdminEsaiRegistration[]>();

        if (clampedPageError) {
            throw new Error(clampedPageError.message);
        }

        registrations = clampedPageData ?? [];
    }

    const from = (page - 1) * pageSize;

    return (
        <EsaiListClient
            registrations={registrations}
            searchParam={searchParam}
            submissionFilter={submissionFilter}
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
                totalParticipants: totalRegistrations ?? 0,
                approvedDocuments: approvedRegistrations ?? 0,
                submittedDocuments: submittedRegistrations ?? 0,
            }}
        />
    );
}

export const metadata: Metadata = {
  title: "Admin Lomba Esai"
}

export default function LombaEsaiAdminPage({ searchParams }: { searchParams: AdminSearchParams }) { 
    return (
        <Suspense fallback={<TableLoading />}>
            <EsaiAdminData searchParams={searchParams} />
        </Suspense>
    ) 
}
