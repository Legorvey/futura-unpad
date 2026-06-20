import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { createAdminClient } from "@/lib/supabase-admin"
import { requireAdminOrRedirect } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ParticipantActions, type Participants } from "../participants"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

export default async function SeminarRegistrationDetails({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    await requireAdminOrRedirect()

    const adminSupabase = createAdminClient()
    const { data: registration, error } = await adminSupabase
        .from("seminar_registrations")
        .select("*")
        .eq("id", id)
        .single()

    if (error || !registration) {
        notFound()
    }

    const isGroup = registration.registration_type === "group" || registration.registration_type === "grup"
    const formattedDate = registration.created_at
        ? new Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(new Date(registration.created_at))
        : "Unknown"

    let members: Participants[] = []

    if (isGroup && registration.group_id) {
        const { data: memberData } = await adminSupabase
            .from("seminar_registrations")
            .select("*")
            .eq("group_id", registration.group_id)
            .eq("is_main_contact", false)
            .order("created_at", { ascending: true })

        if (memberData) {
            members = memberData as Participants[]
        }
    }

    return (
        <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-10 sm:px-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" asChild>
                    <Link href="/admin/seminar">
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Back to Registrations</span>
                    </Link>
                </Button>
                <div>
                    <h2 className="font-semibold text-2xl tracking-tight">Registration Details</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Viewing complete details for this registration entry.
                    </p>
                </div>
            </div>

            <section className="rounded-xl border border-border bg-card p-6">
                <dl className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <dt className="text-sm text-muted-foreground">Type</dt>
                        <dd className="mt-2">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${isGroup ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                                {isGroup ? "Group" : "Individual"}
                            </span>
                        </dd>
                    </div>
                    <div>
                        <dt className="text-sm text-muted-foreground">Registered At</dt>
                        <dd className="mt-2 font-medium">{formattedDate}</dd>
                    </div>
                    <div className="md:col-span-2">
                        <dt className="text-sm text-muted-foreground">Registration ID</dt>
                        <dd className="mt-2 font-mono text-sm break-all">{registration.id}</dd>
                    </div>
                </dl>
            </section>

            <section className="overflow-hidden rounded-xl border border-border bg-card/90">
                <div className="p-6 border-b border-border bg-card">
                    <h3 className="font-medium text-muted-foreground text-sm uppercase tracking-wider">
                        Registered Attendees ({isGroup ? members.length + 1 : 1})
                    </h3>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">#</TableHead>
                            <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name</TableHead>
                            <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Role</TableHead>
                            <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Institution</TableHead>
                            <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact</TableHead>
                            <TableHead className="h-12 px-4 w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Main Contact Person */}
                        <TableRow>
                            <TableCell className="px-4 py-3 font-medium text-muted-foreground text-sm">1</TableCell>
                            <TableCell className="px-4 py-3 font-medium text-sm">{registration.nama_lengkap}</TableCell>
                            <TableCell className="px-4 py-3">
                                <span className="inline-flex rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium">
                                    Main Contact
                                </span>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-sm">
                                <div className="font-medium">{registration.asal_institusi}</div>
                                <div className="text-muted-foreground text-xs capitalize mt-1">{registration.status_akademika}</div>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-muted-foreground text-sm">
                                <div>{registration.email || "-"}</div>
                                <div className="mt-1">{registration.no_telepon || "-"}</div>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                                <ParticipantActions participant={registration as Participants} hideViewDetails={true} />
                            </TableCell>
                        </TableRow>

                        {/* Additional Members */}
                        {isGroup && members.map((member, idx) => (
                            <TableRow key={idx}>
                                <TableCell className="px-4 py-3 font-medium text-muted-foreground text-sm">{idx + 2}</TableCell>
                                <TableCell className="px-4 py-3 font-medium text-sm">{member.nama_lengkap}</TableCell>
                                <TableCell className="px-4 py-3">
                                    <span className="inline-flex rounded-full bg-zinc-100 text-zinc-700 px-2.5 py-1 text-xs font-medium">
                                        Member
                                    </span>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm">
                                    <div className="font-medium">{member.asal_institusi || registration.asal_institusi}</div>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-muted-foreground text-sm">-</TableCell>
                                <TableCell className="px-4 py-3">
                                    <ParticipantActions participant={member} hideViewDetails={true} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </section>
        </main>
    )
}
