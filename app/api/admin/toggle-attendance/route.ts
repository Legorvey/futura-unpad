import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase-admin"
import { invalidRequest, readJsonBody, serverError } from "@/lib/http"
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

    const body = await readJsonBody(request)

    if (!body.ok) {
        return body.response
    }

    const parsed = toggleSchema.safeParse(body.data)

    if (!parsed.success) {
        return invalidRequest()
    }

    const adminSupabase = createAdminClient()
    const { registration_id, attended, bulk } = parsed.data

    try {
        const checkInTime = attended ? new Date().toISOString() : null
        const attendancePatch = {
            attended,
            check_in_time: checkInTime,
        }

        const updateSingleRegistration = async () => {
            const { data: updatedRegistration, error: updateError } = await adminSupabase
                .from("seminar_registrations")
                .update(attendancePatch)
                .eq("id", registration_id)
                .select("id")
                .maybeSingle()

            if (updateError) {
                throw updateError
            }

            return updatedRegistration
        }

        if (!bulk) {
            const updatedRegistration = await updateSingleRegistration()

            if (!updatedRegistration) {
                return NextResponse.json({ error: "Registration not found" }, { status: 404 })
            }

            return NextResponse.json({ ok: true })
        }

        const { data: registration, error: fetchError } = await adminSupabase
            .from("seminar_registrations")
            .select("id, is_main_contact, group_id")
            .eq("id", registration_id)
            .maybeSingle()

        if (fetchError || !registration) {
            return NextResponse.json({ error: "Registration not found" }, { status: 404 })
        }

        if (registration.is_main_contact && registration.group_id) {
            const { error: updateError } = await adminSupabase
                .from("seminar_registrations")
                .update(attendancePatch)
                .eq("group_id", registration.group_id)
                
            if (updateError) throw updateError
        } else {
            await updateSingleRegistration()
        }

        return NextResponse.json({ ok: true })
    } catch (e) {
        console.error("Failed to toggle attendance", e)
        return serverError()
    }
}
