export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

import { createAdminClient } from "@/lib/supabase-admin"
import SeminarListClient from "./seminar-list-client"
import type { Participants } from "./participants"

import {
    type AdminSearchParams,
    statusFilters,
    typeFilters,
    attendanceFilters,
    pageSizeOptions,
    defaultPageSize,
    seminarListColumns,
    seminarStatsColumns,
    seminarCandidateColumns,
    seminarAttendanceColumns,
    firstParam,
    normalizeFilter,
    normalizePositiveInt,
    toSearchPattern,
    isGroupRegistration,
    getAttendanceState,
    getSeminarStats,
    attachGroupMembers,
} from "./_lib/seminar-utils"

export default async function SeminarList({
    searchParams,
}: {
    searchParams: AdminSearchParams
}) {
    const params = await searchParams
    const categoryParam = firstParam(params.category)
    const typeParam = firstParam(params.type)
    const attendanceParam = firstParam(params.attendance)
    const searchParam = firstParam(params.search)
    const pageParam = firstParam(params.page)
    const pageSizeParam = firstParam(params.pageSize)

    const categoryFilter = normalizeFilter(categoryParam, statusFilters, "all")
    const typeFilter = normalizeFilter(typeParam, typeFilters, "all")
    const attendanceFilter = normalizeFilter(attendanceParam, attendanceFilters, "all")
    const searchFilter = (searchParam ?? "").trim().toLowerCase()
    const requestedPage = normalizePositiveInt(pageParam, 1)
    const requestedPageSize = normalizePositiveInt(pageSizeParam, defaultPageSize)
    const pageSize = pageSizeOptions.includes(requestedPageSize as typeof pageSizeOptions[number])
        ? requestedPageSize
        : defaultPageSize

    const adminSupabase = createAdminClient()
    const searchPattern = toSearchPattern(searchFilter)
    const statsPromise = adminSupabase
        .from("seminar_registrations")
        .select(seminarStatsColumns)

    if (attendanceFilter === "all") {
        const requestedFrom = (requestedPage - 1) * pageSize
        const requestedTo = requestedFrom + pageSize - 1
        let pageQuery = adminSupabase
            .from("seminar_registrations")
            .select(seminarListColumns, { count: "exact" })
            .eq("is_main_contact", true)

        if (categoryFilter !== "all") {
            pageQuery = pageQuery.eq("status_akademika", categoryFilter)
        }

        if (typeFilter === "group") {
            pageQuery = pageQuery.in("registration_type", ["group", "grup"])
        } else if (typeFilter === "individual") {
            pageQuery = pageQuery.eq("registration_type", "individual")
        }

        if (searchPattern) {
            pageQuery = pageQuery.or(
                [
                    `group_name.ilike.${searchPattern}`,
                    `nama_lengkap.ilike.${searchPattern}`,
                    `email.ilike.${searchPattern}`,
                    `asal_institusi.ilike.${searchPattern}`,
                    `no_telepon.ilike.${searchPattern}`,
                ].join(",")
            )
        }

        const [
            { data: statsData, error: statsError },
            { data: requestedPageData, error: pageError, count },
        ] = await Promise.all([
            statsPromise,
            pageQuery
                .order("created_at", { ascending: true })
                .order("nama_lengkap", { ascending: true })
                .range(requestedFrom, requestedTo),
        ])

        if (statsError || pageError) {
            throw new Error(statsError?.message ?? pageError?.message)
        }

        const totalFilteredRegistrations = count ?? requestedPageData?.length ?? 0
        const totalPages = Math.max(1, Math.ceil(totalFilteredRegistrations / pageSize))
        const page = Math.min(requestedPage, totalPages)
        let pageData = requestedPageData

        if (page !== requestedPage) {
            let clampedPageQuery = adminSupabase
                .from("seminar_registrations")
                .select(seminarListColumns)
                .eq("is_main_contact", true)

            if (categoryFilter !== "all") {
                clampedPageQuery = clampedPageQuery.eq("status_akademika", categoryFilter)
            }

            if (typeFilter === "group") {
                clampedPageQuery = clampedPageQuery.in("registration_type", ["group", "grup"])
            } else if (typeFilter === "individual") {
                clampedPageQuery = clampedPageQuery.eq("registration_type", "individual")
            }

            if (searchPattern) {
                clampedPageQuery = clampedPageQuery.or(
                    [
                        `group_name.ilike.${searchPattern}`,
                        `nama_lengkap.ilike.${searchPattern}`,
                        `email.ilike.${searchPattern}`,
                        `asal_institusi.ilike.${searchPattern}`,
                        `no_telepon.ilike.${searchPattern}`,
                    ].join(",")
                )
            }

            const { data: clampedPageData, error: clampedPageError } = await clampedPageQuery
                .order("created_at", { ascending: true })
                .order("nama_lengkap", { ascending: true })
                .range((page - 1) * pageSize, page * pageSize - 1)

            if (clampedPageError) {
                throw new Error(clampedPageError.message)
            }

            pageData = clampedPageData
        }
        const mainParticipants = (pageData ?? []) as unknown as Participants[]
        const pageGroupIds = Array.from(
            new Set(
                mainParticipants
                    .filter((participant) => isGroupRegistration(participant) && participant.group_id)
                    .map((participant) => participant.group_id as string)
            )
        )
        const { data: memberData, error: memberError } = pageGroupIds.length > 0
            ? await adminSupabase
                .from("seminar_registrations")
                .select(seminarListColumns)
                .in("group_id", pageGroupIds)
                .eq("is_main_contact", false)
                .order("created_at", { ascending: true })
                .order("nama_lengkap", { ascending: true })
            : { data: [], error: null }

        if (memberError) {
            throw new Error(memberError.message)
        }

        const from = (page - 1) * pageSize

        return (
            <SeminarListClient
                initialData={attachGroupMembers(
                    mainParticipants,
                    (memberData ?? []) as unknown as Participants[]
                )}
                searchParam={searchParam}
                categoryFilter={categoryFilter}
                typeFilter={typeFilter}
                attendanceFilter={attendanceFilter}
                pageSize={pageSize}
                pagination={{
                    page,
                    pageSize,
                    totalItems: totalFilteredRegistrations,
                    totalPages,
                    startItem: totalFilteredRegistrations === 0 ? 0 : from + 1,
                    endItem: Math.min(from + pageSize, totalFilteredRegistrations),
                }}
                stats={getSeminarStats((statsData ?? []) as unknown as Participants[])}
            />
        )
    }

    let registrationsQuery = adminSupabase
        .from("seminar_registrations")
        .select(seminarCandidateColumns)
        .eq("is_main_contact", true)

    if (categoryFilter !== "all") {
        registrationsQuery = registrationsQuery.eq("status_akademika", categoryFilter)
    }

    if (typeFilter === "group") {
        registrationsQuery = registrationsQuery.in("registration_type", ["group", "grup"])
    } else if (typeFilter === "individual") {
        registrationsQuery = registrationsQuery.eq("registration_type", "individual")
    }

    if (searchPattern) {
        registrationsQuery = registrationsQuery.or(
            [
                `group_name.ilike.${searchPattern}`,
                `nama_lengkap.ilike.${searchPattern}`,
                `email.ilike.${searchPattern}`,
                `asal_institusi.ilike.${searchPattern}`,
                `no_telepon.ilike.${searchPattern}`,
            ].join(",")
        )
    }

    const orderedCandidateQuery = registrationsQuery
        .order("created_at", { ascending: true })
        .order("nama_lengkap", { ascending: true })

    const [
        { data: statsData, error: statsError },
        { data: candidateData, error },
    ] = await Promise.all([
        statsPromise,
        orderedCandidateQuery,
    ])

    if (statsError || error) {
        throw new Error(statsError?.message ?? error?.message)
    }

    const candidateParticipants = (candidateData ?? []) as unknown as Participants[]
    const candidateGroupIds = Array.from(
        new Set(
            candidateParticipants
                .filter((participant) => isGroupRegistration(participant) && participant.group_id)
                .map((participant) => participant.group_id as string)
        )
    )

    const { data: attendanceMemberData, error: attendanceMemberError } = candidateGroupIds.length > 0
        ? await adminSupabase
            .from("seminar_registrations")
            .select(seminarAttendanceColumns)
            .in("group_id", candidateGroupIds)
            .eq("is_main_contact", false)
        : { data: [], error: null }

    if (attendanceMemberError) {
        throw new Error(attendanceMemberError.message)
    }

    const allParticipants = (statsData ?? []) as unknown as Participants[]
    const attendanceMembers = (attendanceMemberData ?? []) as unknown as Participants[]
    const attendanceMembersByGroup = new Map<string, Participants[]>()

    for (const participant of attendanceMembers) {
        if (participant.group_id) {
            const members = attendanceMembersByGroup.get(participant.group_id) ?? []
            members.push(participant)
            attendanceMembersByGroup.set(participant.group_id, members)
        }
    }

    const registrations = candidateParticipants
        .map((participant) => {
            if (isGroupRegistration(participant) && participant.group_id) {
                return {
                    ...participant,
                    members: attendanceMembersByGroup.get(participant.group_id) ?? [],
                }
            }

            return participant
        })

    const stats = {
        totalRegistrations: allParticipants.length,
        checkedInAttendees: allParticipants.filter((p) => p.attended).length,
        groupRegistrations: allParticipants
            .filter((p) => p.is_main_contact !== false)
            .filter(isGroupRegistration).length,
        individualRegistrations: allParticipants
            .filter((p) => p.is_main_contact !== false)
            .filter((p) => !isGroupRegistration(p)).length,
    }

    const filteredParticipants = registrations.filter((participant) => {
        return getAttendanceState(participant) === attendanceFilter
    })
    const totalFilteredRegistrations = filteredParticipants.length
    const totalPages = Math.max(1, Math.ceil(totalFilteredRegistrations / pageSize))
    const page = Math.min(requestedPage, totalPages)
    const from = (page - 1) * pageSize
    const to = from + pageSize
    const currentPageCandidates = filteredParticipants.slice(from, to)
    const pageRegistrationIds = currentPageCandidates.map((participant) => participant.id)
    const { data: pageRegistrationData, error: pageRegistrationError } = pageRegistrationIds.length > 0
        ? await adminSupabase
            .from("seminar_registrations")
            .select(seminarListColumns)
            .in("id", pageRegistrationIds)
            .order("created_at", { ascending: true })
            .order("nama_lengkap", { ascending: true })
        : { data: [], error: null }

    if (pageRegistrationError) {
        throw new Error(pageRegistrationError.message)
    }

    const pageRegistrationById = new Map(
        ((pageRegistrationData ?? []) as unknown as Participants[]).map((participant) => [
            participant.id,
            participant,
        ])
    )
    const currentPageParticipants = currentPageCandidates
        .map((participant) => pageRegistrationById.get(participant.id))
        .filter((participant): participant is Participants => Boolean(participant))
    const pageGroupIds = Array.from(
        new Set(
            currentPageParticipants
                .filter((participant) => isGroupRegistration(participant) && participant.group_id)
                .map((participant) => participant.group_id as string)
        )
    )
    const { data: memberData, error: memberError } = pageGroupIds.length > 0
        ? await adminSupabase
            .from("seminar_registrations")
            .select(seminarListColumns)
            .in("group_id", pageGroupIds)
            .eq("is_main_contact", false)
            .order("created_at", { ascending: true })
            .order("nama_lengkap", { ascending: true })
        : { data: [], error: null }

    if (memberError) {
        throw new Error(memberError.message)
    }

    const pageMembers = (memberData ?? []) as unknown as Participants[]
    const pageMembersByGroup = new Map<string, Participants[]>()

    for (const participant of pageMembers) {
        if (participant.is_main_contact === false && participant.group_id) {
            const members = pageMembersByGroup.get(participant.group_id) ?? []
            members.push(participant)
            pageMembersByGroup.set(participant.group_id, members)
        }
    }

    const paginatedParticipants = currentPageParticipants.map((participant) => {
        if (isGroupRegistration(participant) && participant.group_id) {
            return {
                ...participant,
                members: pageMembersByGroup.get(participant.group_id) ?? [],
            }
        }

        return participant
    })

    return (
        <SeminarListClient
            initialData={paginatedParticipants}
            searchParam={searchParam}
            categoryFilter={categoryFilter}
            typeFilter={typeFilter}
            attendanceFilter={attendanceFilter}
            pageSize={pageSize}
            pagination={{
                page,
                pageSize,
                totalItems: totalFilteredRegistrations,
                totalPages,
                startItem: totalFilteredRegistrations === 0 ? 0 : from + 1,
                endItem: Math.min(to, totalFilteredRegistrations),
            }}
            stats={stats}
        />
    )
}
