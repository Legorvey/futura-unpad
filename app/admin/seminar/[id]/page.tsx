import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Info, Users, Clock, Fingerprint } from "lucide-react"
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
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { FileText } from "lucide-react"
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

const DetailItem = ({ label, value, wide }: { label: React.ReactNode; value: React.ReactNode; wide?: boolean }) => (
    <div className={`flex items-start justify-between gap-4 py-2 ${wide ? "md:col-span-2" : ""}`}>
        <dt className="text-sm text-muted-foreground shrink-0 flex items-center gap-1.5">{label}</dt>
        <dd className="text-sm font-medium text-right break-words">{value}</dd>
    </div>
);

const AdminSidebarContent = ({ registration, isGroup, formattedDate }: { registration: any, isGroup: boolean, formattedDate: string }) => (
    <div className="space-y-6">
        <section className="rounded-xl border border-border bg-card p-5 flex flex-col">
            <div className="flex items-center gap-2 border-b border-border pb-3 mb-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold tracking-tight text-sm">Registration Information</h3>
            </div>
            <dl className="flex-1 divide-y divide-border/50">
                <DetailItem label={<><Users className="h-3.5 w-3.5" /> Type</>} value={
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${isGroup ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                        {isGroup ? "Group" : "Individual"}
                    </span>
                } />
                <DetailItem label={<><Clock className="h-3.5 w-3.5" /> Registered At</>} value={formattedDate} />
                {isGroup && registration.group_name && (
                    <DetailItem label={<><Users className="h-3.5 w-3.5" /> Group Name</>} value={registration.group_name} />
                )}
                <DetailItem label={<><Fingerprint className="h-3.5 w-3.5" /> Reg. ID</>} value={<span className="font-mono">{registration.id}</span>} />
            </dl>
        </section>
    </div>
);

export const metadata: Metadata = {
  title: "Detail Peserta Seminar Admin"
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
        <div className="mx-auto w-full space-y-6 sm:space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4">
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-full shrink-0 mt-1 sm:mt-0" asChild>
                        <Link href="/admin/seminar" prefetch={false}>
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Back to Registrations</span>
                        </Link>
                    </Button>
                    <div>
                        <h2 className="font-semibold text-xl sm:text-2xl tracking-tight line-clamp-1">Registration Details</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Viewing complete details for this registration entry.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="xl:hidden w-full sm:w-auto">
                                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                Reg. Info
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-full sm:max-w-[480px] p-0 gap-0 flex flex-col border-l shadow-2xl bg-zinc-50 dark:bg-zinc-950">
                            <div className="flex-none p-4 sm:p-6 border-b border-border bg-background">
                                <SheetHeader className="p-0 text-left">
                                    <SheetTitle className="text-xl font-sans font-semibold">Registration Metadata</SheetTitle>
                                </SheetHeader>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                                <AdminSidebarContent registration={registration} isGroup={isGroup} formattedDate={formattedDate} />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column (Main Information) */}
                <div className="xl:col-span-2 space-y-8">
                    <section className="overflow-hidden rounded-xl border border-border bg-card/90">
                <div className="p-6 border-b border-border bg-card">
                    <h3 className="font-medium text-muted-foreground text-sm uppercase tracking-wider">
                        Registered Attendees ({totalAttendees})
                    </h3>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="h-12 px-4 whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground">#</TableHead>
                            <TableHead className="h-12 px-4 whitespace-nowrap text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Checked In</TableHead>
                            <TableHead className="h-12 px-4 whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name</TableHead>
                            <TableHead className="h-12 px-4 whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground">Role</TableHead>
                            <TableHead className="h-12 px-4 whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground">Institution</TableHead>
                            <TableHead className="h-12 px-4 whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact</TableHead>
                            <TableHead className="h-12 px-4 whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground">Arrival Time</TableHead>
                            <TableHead className="h-12 px-4 w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {showMainContact ? (
                            <TableRow>
                                <TableCell className="px-4 py-3 font-medium text-muted-foreground text-sm whitespace-nowrap">1</TableCell>
                                <TableCell className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center justify-center">
                                        <AttendanceCheckbox participant={registration as Participants} />
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-3 font-medium text-sm whitespace-nowrap">{registration.nama_lengkap}</TableCell>
                                <TableCell className="px-4 py-3 whitespace-nowrap">
                                    <span className="inline-flex rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium">
                                        Main Contact
                                    </span>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm whitespace-nowrap">
                                    <div className="font-medium">{registration.asal_institusi}</div>
                                    <div className="text-muted-foreground text-xs capitalize mt-1">{registration.status_akademika}</div>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-muted-foreground text-sm whitespace-nowrap">
                                    <div>{registration.email || "-"}</div>
                                    <div className="mt-1">{registration.no_telepon || "-"}</div>
                                </TableCell>
                                <TableCell className="px-4 py-3 whitespace-nowrap">
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
                                <TableCell className="px-4 py-3 font-medium text-muted-foreground text-sm whitespace-nowrap">
                                    {memberOffset + idx + 2}
                                </TableCell>
                                <TableCell className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center justify-center">
                                        <AttendanceCheckbox participant={member} />
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-3 font-medium text-sm whitespace-nowrap">{member.nama_lengkap}</TableCell>
                                <TableCell className="px-4 py-3 whitespace-nowrap">
                                    <span className="inline-flex rounded-full bg-zinc-100 text-zinc-700 px-2.5 py-1 text-xs font-medium">
                                        Member
                                    </span>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm whitespace-nowrap">
                                    <div className="font-medium">{member.asal_institusi || registration.asal_institusi}</div>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-muted-foreground text-sm whitespace-nowrap">-</TableCell>
                                <TableCell className="px-4 py-3 whitespace-nowrap">
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
                {isGroup ? <div className="flex flex-col gap-4 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <form action={`/admin/seminar/${registration.id}`} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <label htmlFor="pageSize" className="hidden sm:block font-medium text-foreground">
                            Rows per page
                        </label>
                        <label htmlFor="pageSize" className="sm:hidden font-medium text-foreground">
                            Rows
                        </label>
                        <select
                            id="pageSize"
                            name="pageSize"
                            defaultValue={String(pageSize)}
                            className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
                        >
                            {pageSizeOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        <Button type="submit" variant="outline" size="sm" className="h-8 px-3">
                            Apply
                        </Button>
                    </form>

                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8">
                        <div className="text-sm text-muted-foreground font-medium">
                            Showing {from}-{to} of {totalAttendees}
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                                Page {page} of {totalPages}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    disabled={page <= 1}
                                    asChild={page > 1}
                                >
                                    {page <= 1 ? (
                                        <ChevronLeft className="h-4 w-4" />
                                    ) : (
                                        <Link href={buildDetailsPageHref(registration.id, page - 1, pageSize)} prefetch={false}>
                                            <span className="sr-only">Go to previous page</span>
                                            <ChevronLeft className="h-4 w-4" />
                                        </Link>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    disabled={page >= totalPages}
                                    asChild={page < totalPages}
                                >
                                    {page >= totalPages ? (
                                        <ChevronRight className="h-4 w-4" />
                                    ) : (
                                        <Link href={buildDetailsPageHref(registration.id, page + 1, pageSize)} prefetch={false}>
                                            <span className="sr-only">Go to next page</span>
                                            <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div> : null}
                    </section>
                </div>

                {/* Right Column (Administrative Meta) - Hidden on Mobile, Shown on XL */}
                <div className="hidden xl:block">
                    <AdminSidebarContent registration={registration} isGroup={isGroup} formattedDate={formattedDate} />
                </div>
            </div>
        </div>
    )
}
