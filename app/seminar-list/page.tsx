import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase-admin"
import { createClient } from "@/utils/supabase/server"
import SeminarListClient from "./seminar-list-client"
import type { Participants } from "./participants"

export default async function SeminarList() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login?next=/seminar-list")
    }

    const { data: adminUser } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle()

    if (!adminUser) {
        redirect("/")
    }

    const adminSupabase = createAdminClient()
    const { data, error } = await adminSupabase
        .from("seminar_registrations")
        .select("*")
        .order("created_at", { ascending: true })

    if (error) {
        throw new Error(error.message)
    }

    return <SeminarListClient initialData={(data ?? []) as Participants[]} />
}
