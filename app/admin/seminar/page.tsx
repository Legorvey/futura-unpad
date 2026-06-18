export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

import { createAdminClient } from "@/lib/supabase-admin"
import { requireAdminOrRedirect } from "@/lib/auth"
import SeminarListClient from "./seminar-list-client"
import type { Participants } from "./participants"

type AdminSearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function SeminarList({
    searchParams,
}: {
    searchParams: AdminSearchParams
}) {
    const params = await searchParams
    const categoryParam = Array.isArray(params.category)
        ? params.category[0]
        : params.category
    const searchParam = Array.isArray(params.search)
        ? params.search[0]
        : params.search
        
    const categoryFilter = categoryParam ?? "all"
    const searchFilter = (searchParam ?? "").trim().toLowerCase()

    await requireAdminOrRedirect()

    const adminSupabase = createAdminClient()
    const { data, error } = await adminSupabase
        .from("seminar_registrations")
        .select("*")
        .order("created_at", { ascending: true })

    if (error) {
        throw new Error(error.message)
    }

    const allParticipants = (data ?? []) as Participants[]
    
    const filteredParticipants = allParticipants.filter((participant) => {
        const categoryMatches =
            categoryFilter === "all" ||
            participant.status_akademika === categoryFilter
            
        const searchMatches =
            !searchFilter ||
            [
                participant.nama_lengkap,
                participant.email,
                participant.asal_institusi,
                participant.no_telepon,
            ]
                .filter(Boolean)
                .some((value) => value!.toLowerCase().includes(searchFilter))

        return categoryMatches && searchMatches
    })

    return (
        <SeminarListClient 
            initialData={filteredParticipants} 
            searchParam={searchParam}
            categoryFilter={categoryFilter}
        />
    )
}
