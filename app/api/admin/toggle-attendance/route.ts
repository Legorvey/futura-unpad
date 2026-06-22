import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase-admin"
import { invalidRequest, serverError } from "@/lib/http"
import { z } from "zod"

const toggleSchema = z.object({
  registration_id: z.string().uuid(),
  attended: z.boolean(),
  bulk: z.boolean().optional().default(false)
})

export async function POST(request: Request) {
    const { user, isAdmin } = await requireAdmin()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const parsed = toggleSchema.safeParse(await request.json().catch(() => null))

    if (!parsed.success) {
        return invalidRequest()
    }

    const adminSupabase = createAdminClient()
    const { registration_id, attended, bulk } = parsed.data

    try {
        // First fetch the registration to check if it's a main contact
        const { data: registration, error: fetchError } = await adminSupabase
            .from("seminar_registrations")
            .select("id, is_main_contact, group_id")
            .eq("id", registration_id)
            .maybeSingle()
            
        if (fetchError || !registration) {
            return NextResponse.json({ error: "Registration not found" }, { status: 404 })
        }

        const checkInTime = attended ? new Date().toISOString() : null

        // If it's a main contact for a group AND bulk is true, update everyone in the group
        if (registration.is_main_contact && registration.group_id && bulk) {
            const { error: updateError } = await adminSupabase
                .from("seminar_registrations")
                .update({ 
                    attended: attended, 
                    check_in_time: checkInTime 
                })
                .eq("group_id", registration.group_id)
                
            if (updateError) throw updateError
        } else {
            // Otherwise just update the specific individual
            const { error: updateError } = await adminSupabase
                .from("seminar_registrations")
                .update({ 
                    attended: attended, 
                    check_in_time: checkInTime 
                })
                .eq("id", registration.id)
                
            if (updateError) throw updateError
        }

        return NextResponse.json({ ok: true })
    } catch (e) {
        console.error("Failed to toggle attendance", e)
        return serverError()
    }
}
