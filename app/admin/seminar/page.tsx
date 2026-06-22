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
    
    const stats = {
        total: allParticipants.length,
        mahasiswa: allParticipants.filter((p) => p.status_akademika === "mahasiswa").length,
        siswa: allParticipants.filter((p) => p.status_akademika === "siswa").length,
        dosen: allParticipants.filter((p) => p.status_akademika === "dosen").length,
        umum: allParticipants.filter((p) => p.status_akademika === "umum").length,
    }
    
    const filteredParticipants = allParticipants.filter((participant) => {
        if (participant.is_main_contact === false) {
            return false;
        }

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
    }).map((participant) => {
        if ((participant.registration_type === "group" || participant.registration_type === "grup") && (participant as any).group_id) {
            participant.members = allParticipants.filter(p => p.is_main_contact === false && (p as any).group_id === (participant as any).group_id);
        }
        return participant;
    })

    return (
        <SeminarListClient 
            initialData={filteredParticipants} 
            searchParam={searchParam}
            categoryFilter={categoryFilter}
            stats={stats}
        />
    )
}
