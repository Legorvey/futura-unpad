import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase-admin"
import { invalidRequest, rateLimited, readJsonBody, serverError } from "@/lib/http"
import { rateLimit } from "@/lib/rate-limit"
import { z } from "zod"

const verifyRegistrationSchema = z.object({
  registration_id: z.uuid()
})

export async function POST(request: Request) {
    const limit = await rateLimit(request, {
        key: "admin-verify-registration",
        limit: 30,
        windowSeconds: 60,
    })

    if (!limit.success) {
        return rateLimited(limit.retryAfter)
    }

    const { user, adminAccess } = await requireAdmin()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!adminAccess) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await readJsonBody(request)

    if (!body.ok) {
        return body.response
    }

    const parsed = verifyRegistrationSchema.safeParse(body.data)

    if (!parsed.success) {
        return invalidRequest()
    }

    const adminSupabase = createAdminClient()

    const { data: updatedRegistration, error: updateError } = await adminSupabase
        .from("seminar_registrations")
        .update({
            attended: true,
            check_in_time: new Date().toISOString()
        })
        .eq("id", parsed.data.registration_id)
        .or("attended.eq.false,attended.is.null")
        .select("nama_lengkap")
        .maybeSingle()

    if (updateError) {
        console.error("Verification update failed", updateError.message)
        return serverError()
    }

    if (updatedRegistration) {
        return NextResponse.json({ ok: true, participant: { nama_lengkap: updatedRegistration.nama_lengkap } })
    }

    const { data: registration, error: fetchError } = await adminSupabase
        .from("seminar_registrations")
        .select("attended")
        .eq("id", parsed.data.registration_id)
        .maybeSingle()

    if (fetchError || !registration) {
        return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    if (registration.attended) {
        return NextResponse.json({ error: "Participant already checked in" }, { status: 409 })
    }

    return serverError()
}
