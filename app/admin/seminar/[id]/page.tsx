import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { createAdminClient } from "@/lib/supabase-admin"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ParticipantActions, AttendanceCheckbox, type Participants } from "../participants"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

const seminarDetailColumns = [
    "id",
    "nama_lengkap",
    "email",
    "no_telepon",
    "asal_institusi",
    "status_akademika",
    "registration_type",
    "group_name",
    "group_id",
    "created_at",
    "is_main_contact",
    "attended",
    "check_in_time",
].join(",")
const pageSizeOptions = [10, 20, 30, 40] as const
const defaultPageSize = 10

type DetailSearchParams = Promise<Record<string, string | string[] | undefined>>

const firstParam = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value

const normalizePositiveInt = (value: string | undefined, fallback: number) => {
    const parsed = Number.parseInt(value ?? "", 10)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const normalizePageSize = (value: string | undefined) => {
    const requestedPageSize = normalizePositiveInt(value, defaultPageSize)

    return pageSizeOptions.includes(requestedPageSize as typeof pageSizeOptions[number])
        ? requestedPageSize
        : defaultPageSize
}

const buildDetailsPageHref = (id: string, page: number, pageSize: number) => {
    const query = new URLSearchParams()

    if (page > 1) {
        query.set("page", String(page))
    }

    if (pageSize !== defaultPageSize) {
        query.set("pageSize", String(pageSize))
    }

    const queryString = query.toString()
    return queryString ? `/admin/seminar/${id}?${queryString}` : `/admin/seminar/${id}`
}

const checkInFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
})

const formatCheckInTime = (timeStr: string | null | undefined) => {
    if (!timeStr) return "Not checked in"
    return checkInFormatter.format(new Date(timeStr))
}

const createdAtFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
})

const formatCreatedAt = (timeStr: string | null | undefined) => {
    if (!timeStr) return "Unknown"
    return createdAtFormatter.format(new Date(timeStr))
}

export default async function SeminarRegistrationDetails({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>
    searchParams: DetailSearchParams
}) {
    const { id } = await params
    const query = await searchParams
    const requestedPage = normalizePositiveInt(firstParam(query.page), 1)
    const pageSize = normalizePageSize(firstParam(query.pageSize))

    const adminSupabase = createAdminClient()
    const { data: registrationData, error } = await adminSupabase
        .from("seminar_registrations")
        .select(seminarDetailColumns)
        .eq("id", id)
        .single()

    if (error || !registrationData) {
        notFound()
    }

    const registration = registrationData as unknown as Participants
    const isGroup = registration.registration_type === "group" || registration.registration_type === "grup"
    const formattedDate = formatCreatedAt(registration.created_at)

    let members: Participants[] = []
    let totalMembers = 0
    let memberOffset = 0

    if (isGroup && registration.group_id) {
        const { count, error: countError } = await adminSupabase
            .from("seminar_registrations")
            .select("id", { count: "exact", head: true })
            .eq("group_id", registration.group_id)
            .eq("is_main_contact", false)

        if (countError) {
            throw new Error(countError.message)
        }

        totalMembers = count ?? 0
    }

    const totalAttendees = isGroup ? totalMembers + 1 : 1
    const totalPages = Math.max(1, Math.ceil(totalAttendees / pageSize))
    const page = Math.min(requestedPage, totalPages)
    const showMainContact = !isGroup || page === 1
    const memberStartIndex = showMainContact ? 0 : (page - 1) * pageSize - 1
    const membersToFetch = isGroup
        ? pageSize - (showMainContact ? 1 : 0)
        : 0
    memberOffset = Math.max(0, memberStartIndex)

    if (isGroup && registration.group_id && membersToFetch > 0) {
        const { data: memberData, error: memberError } = await adminSupabase
            .from("seminar_registrations")
            .select(seminarDetailColumns)
            .eq("group_id", registration.group_id)
            .eq("is_main_contact", false)
            .order("created_at", { ascending: true })
            .order("nama_lengkap", { ascending: true })
            .range(memberOffset, memberOffset + membersToFetch - 1)

        if (memberError) {
            throw new Error(memberError.message)
        }

        if (memberData) {
            members = memberData as unknown as Participants[]
        }
    }
    const currentPageRows = (showMainContact ? 1 : 0) + members.length
    const from = totalAttendees === 0 ? 0 : (page - 1) * pageSize + 1
    const to = Math.min(from + currentPageRows - 1, totalAttendees)



    return (
        <div className="mx-auto w-full max-w-6xl space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" asChild>
                    <Link href="/admin/seminar" prefetch={false}>
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
                    {isGroup && registration.group_name && (
                        <div>
                            <dt className="text-sm text-muted-foreground">Group Name</dt>
                            <dd className="mt-2 font-medium break-words">{registration.group_name}</dd>
                        </div>
                    )}
                    <div className="md:col-span-2 lg:col-span-1">
                        <dt className="text-sm text-muted-foreground">Registration ID</dt>
                        <dd className="mt-2 font-mono text-sm break-all">{registration.id}</dd>
                    </div>
                </dl>
            </section>

            <section className="overflow-hidden rounded-xl border border-border bg-card/90">
                <div className="p-6 border-b border-border bg-card">
                    <h3 className="font-medium text-muted-foreground text-sm uppercase tracking-wider">
                        Registered Attendees ({totalAttendees})
                    </h3>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">#</TableHead>
                            <TableHead className="h-12 px-4 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Checked In</TableHead>
                            <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name</TableHead>
                            <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Role</TableHead>
                            <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Institution</TableHead>
                            <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact</TableHead>
                            <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Arrival Time</TableHead>
                            <TableHead className="h-12 px-4 w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {showMainContact ? (
                            <TableRow>
                                <TableCell className="px-4 py-3 font-medium text-muted-foreground text-sm">1</TableCell>
                                <TableCell className="px-4 py-3">
                                    <div className="flex items-center justify-center">
                                        <AttendanceCheckbox participant={registration as Participants} />
                                    </div>
                                </TableCell>
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
                                    {registration.attended ? (
                                        <span className="inline-flex rounded-full bg-green-100 text-green-700 px-2.5 py-1 text-xs font-medium">
                                            {formatCheckInTime(registration.check_in_time)}
                                        </span>
                                    ) : (
                                        <span className="inline-flex rounded-full bg-zinc-100 text-zinc-600 px-2.5 py-1 text-xs font-medium">
                                            Not checked in
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                    <ParticipantActions participant={registration as Participants} hideViewDetails={true} />
                                </TableCell>
                            </TableRow>
                        ) : null}

                        {isGroup && members.map((member, idx) => (
                            <TableRow key={member.id}>
                                <TableCell className="px-4 py-3 font-medium text-muted-foreground text-sm">
                                    {memberOffset + idx + 2}
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                    <div className="flex items-center justify-center">
                                        <AttendanceCheckbox participant={member} />
                                    </div>
                                </TableCell>
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
                                    {member.attended ? (
                                        <span className="inline-flex rounded-full bg-green-100 text-green-700 px-2.5 py-1 text-xs font-medium">
                                            {formatCheckInTime(member.check_in_time)}
                                        </span>
                                    ) : (
                                        <span className="inline-flex rounded-full bg-zinc-100 text-zinc-600 px-2.5 py-1 text-xs font-medium">
                                            Not checked in
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                    <ParticipantActions participant={member} hideViewDetails={true} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {isGroup ? <div className="flex flex-col gap-4 border-t border-border p-5 sm:flex-row sm:items-center sm:justify-between">
                    <form action={`/admin/seminar/${registration.id}`} className="flex items-center gap-3">
                        <label className="text-sm text-muted-foreground" htmlFor="pageSize">
                            Rows per page
                        </label>
                        <select
                            id="pageSize"
                            name="pageSize"
                            defaultValue={String(pageSize)}
                            className="h-9 rounded-[8px] border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                            {pageSizeOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        <Button className="h-9 rounded-[8px] px-4">
                            Apply
                        </Button>
                    </form>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <p className="text-sm text-muted-foreground">
                            Showing {from}-{to} of {totalAttendees} attendees
                        </p>
                        <div className="flex items-center gap-3">
                            {page <= 1 ? (
                                <Button variant="outline" className="h-9 rounded-[8px]" disabled>
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>
                            ) : (
                                <Button variant="outline" className="h-9 rounded-[8px]" asChild>
                                    <Link href={buildDetailsPageHref(registration.id, page - 1, pageSize)} prefetch={false}>
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Link>
                                </Button>
                            )}
                            <span className="min-w-20 text-center text-sm text-muted-foreground">
                                Page {page} of {totalPages}
                            </span>
                            {page >= totalPages ? (
                                <Button variant="outline" className="h-9 rounded-[8px]" disabled>
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button variant="outline" className="h-9 rounded-[8px]" asChild>
                                    <Link href={buildDetailsPageHref(registration.id, page + 1, pageSize)} prefetch={false}>
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div> : null}
            </section>
        </div>
    )
}
