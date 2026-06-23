export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

import { createAdminClient } from "@/lib/supabase-admin"
import { requireAdminOrRedirect } from "@/lib/auth"
import SeminarListClient from "./seminar-list-client"
import type { Participants } from "./participants"

type AdminSearchParams = Promise<Record<string, string | string[] | undefined>>
type StatusFilter = "all" | "mahasiswa" | "siswa" | "dosen" | "umum"
type RegistrationTypeFilter = "all" | "individual" | "group"
type AttendanceFilter = "all" | "checked-in" | "pending" | "partial"

const statusFilters: StatusFilter[] = ["all", "mahasiswa", "siswa", "dosen", "umum"]
const typeFilters: RegistrationTypeFilter[] = ["all", "individual", "group"]
const attendanceFilters: AttendanceFilter[] = ["all", "checked-in", "pending", "partial"]

const firstParam = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value

const normalizeFilter = <T extends string>(value: string | undefined, filters: readonly T[], fallback: T) =>
    value && filters.includes(value as T) ? (value as T) : fallback

const isGroupRegistration = (participant: Participants) =>
    participant.registration_type === "group" || participant.registration_type === "grup"

const getAttendanceState = (participant: Participants): Exclude<AttendanceFilter, "all"> => {
    const attendees = [participant, ...(participant.members ?? [])]
    const checkedCount = attendees.filter((attendee) => attendee.attended).length

    if (checkedCount === 0) {
        return "pending"
    }

    if (checkedCount === attendees.length) {
        return "checked-in"
    }

    return "partial"
}

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

    const categoryFilter = normalizeFilter(categoryParam, statusFilters, "all")
    const typeFilter = normalizeFilter(typeParam, typeFilters, "all")
    const attendanceFilter = normalizeFilter(attendanceParam, attendanceFilters, "all")
    const searchFilter = (searchParam ?? "").trim().toLowerCase()

    await requireAdminOrRedirect()

    const adminSupabase = createAdminClient()
    const { data, error } = await adminSupabase
        .from("seminar_registrations")
        .select("*")
        .order("created_at", { ascending: true })
        .order("nama_lengkap", { ascending: true })

    if (error) {
        throw new Error(error.message)
    }

    const allParticipants = (data ?? []) as Participants[]
    const registrations = allParticipants
        .filter((participant) => participant.is_main_contact !== false)
        .map((participant) => {
            if (isGroupRegistration(participant) && participant.group_id) {
                return {
                    ...participant,
                    members: allParticipants.filter(
                        (p) => p.is_main_contact === false && p.group_id === participant.group_id
                    ),
                }
            }

            return participant
        })

    const stats = {
        totalRegistrations: registrations.length,
        totalAttendees: allParticipants.length,
        checkedInAttendees: allParticipants.filter((p) => p.attended).length,
        groupRegistrations: registrations.filter(isGroupRegistration).length,
        individualRegistrations: registrations.filter((p) => !isGroupRegistration(p)).length,
    }

    const filteredParticipants = registrations.filter((participant) => {
        const categoryMatches =
            categoryFilter === "all" ||
            participant.status_akademika === categoryFilter

        const typeMatches =
            typeFilter === "all" ||
            (typeFilter === "group" && isGroupRegistration(participant)) ||
            (typeFilter === "individual" && !isGroupRegistration(participant))

        const attendanceMatches =
            attendanceFilter === "all" ||
            getAttendanceState(participant) === attendanceFilter

        const searchMatches =
            !searchFilter ||
            [
                participant.group_name,
                participant.nama_lengkap,
                participant.email,
                participant.asal_institusi,
                participant.no_telepon,
            ]
                .some((value) =>
                    typeof value === "string" && value.toLowerCase().includes(searchFilter)
                )

        return categoryMatches && typeMatches && attendanceMatches && searchMatches
    })

    return (
        <SeminarListClient
            initialData={filteredParticipants}
            searchParam={searchParam}
            categoryFilter={categoryFilter}
            typeFilter={typeFilter}
            attendanceFilter={attendanceFilter}
            stats={stats}
        />
    )
}
