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

    // Batch fetch user data only for registrations missing full_name or email
    const uniqueUserIds = Array.from(new Set(
        registrations
            .filter(r => !r.full_name?.trim() || !r.email?.trim())
            .map(r => r.user_id)
            .filter(Boolean)
    ));

    const fallbackInfoByUserId = new Map<string, { name: string | null; email: string | null }>();
    const fetchBatchSize = 10;

    for (let i = 0; i < uniqueUserIds.length; i += fetchBatchSize) {
        const batch = uniqueUserIds.slice(i, i + fetchBatchSize);
        await Promise.all(batch.map(async (userId) => {
            try {
                const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId as string);
                if (userData?.user) {
                    const meta = userData.user.user_metadata || {};
                    const name = meta.display_name?.trim() || 
                                 meta.username?.trim() || 
                                 userData.user.email?.trim() || 
                                 meta.full_name?.trim() || 
                                 meta.name?.trim() || 
                                 null;
                    fallbackInfoByUserId.set(userId as string, {
                        name,
                        email: userData.user.email || null,
                    });
                }
            } catch (e) {
                // ignore
            }
        }));
    }

    const enrichedRegistrations = registrations.map((reg) => {
        const fallback = reg.user_id ? fallbackInfoByUserId.get(reg.user_id) : undefined;
        return {
            ...reg,
            fallback_name: fallback?.name ?? null,
            fallback_email: fallback?.email ?? null,
        };
    });

    const from = (page - 1) * pageSize;

    return (
        <EsaiListClient
            registrations={enrichedRegistrations}
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
