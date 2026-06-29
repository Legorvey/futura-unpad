export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

import { createAdminClient } from "@/lib/supabase-admin"
import {
    isMechaturaCompetitionType,
    isPaymentStatus,
    paymentStatusLabels,
    type PaymentStatus,
} from "@/lib/payment"
import MechaturaTable, { type AdminMechaturaRegistration, type AdminMechaturaLeader } from "./_components/mechatura-table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"



type AdminSearchParams = Promise<Record<string, string | string[] | undefined>>
type MechaturaCategoryFilter = "all" | "sumo" | "transporter"
type MechaturaPaymentFilter = PaymentStatus | "all"

const pageSizeOptions = [10, 20, 30, 40] as const
const defaultPageSize = 10
const completedStatuses: PaymentStatus[] = ["paid", "settled"]

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

const toSearchPattern = (value: string) => {
    const sanitized = value.replace(/[,%()]/g, " ").trim()
    return sanitized ? `%${sanitized}%` : ""
}

const toInList = (values: string[]) => `(${values.join(",")})`

const buildPageHref = ({
    page,
    pageSize,
    search,
    category,
    payment,
}: {
    page: number
    pageSize: number
    search?: string
    category: MechaturaCategoryFilter
    payment: MechaturaPaymentFilter
}) => {
    const query = new URLSearchParams()

    if (search?.trim()) query.set("search", search.trim())
    if (category !== "all") query.set("category", category)
    if (payment !== "all") query.set("payment", payment)
    if (page > 1) query.set("page", String(page))
    if (pageSize !== defaultPageSize) query.set("pageSize", String(pageSize))

    const queryString = query.toString()
    return queryString ? `/admin/mechatura?${queryString}` : "/admin/mechatura"
}

type FilterableQuery<T> = T & {
    eq: (column: string, value: unknown) => FilterableQuery<T>
    in: (column: string, values: unknown[]) => FilterableQuery<T>
    or: (filters: string) => FilterableQuery<T>
}

const applyMechaturaFilters = <T,>(
    query: T,
    {
        categoryFilter,
        paymentFilter,
        searchPattern,
        leaderRegistrationIds,
    }: {
        categoryFilter: MechaturaCategoryFilter
        paymentFilter: MechaturaPaymentFilter
        searchPattern: string
        leaderRegistrationIds: string[]
    }
) => {
    let filteredQuery = query as FilterableQuery<T>

    if (categoryFilter !== "all") {
        filteredQuery = filteredQuery.eq("competition_type", categoryFilter)
    }

    if (paymentFilter === "unpaid") {
        filteredQuery = filteredQuery.or("payment_status.eq.unpaid,payment_status.is.null")
    } else if (paymentFilter !== "all") {
        filteredQuery = filteredQuery.eq("payment_status", paymentFilter)
    }

    if (searchPattern) {
        const registrationFilters = [
            `team_id.ilike.${searchPattern}`,
            `team_name.ilike.${searchPattern}`,
            `institution.ilike.${searchPattern}`,
            `robot_name.ilike.${searchPattern}`,
        ]

        if (leaderRegistrationIds.length > 0) {
            registrationFilters.push(`id.in.${toInList(leaderRegistrationIds)}`)
        }

        filteredQuery = filteredQuery.or(registrationFilters.join(","))
    }

    return filteredQuery as T
}

export default async function MechaturaAdminPage({
    searchParams,
}: {
    searchParams: AdminSearchParams
}) {
    const params = await searchParams
    const categoryParam = firstParam(params.category)
    const paymentParam = firstParam(params.payment)
    const searchParam = firstParam(params.search)
    const pageParam = firstParam(params.page)
    const pageSizeParam = firstParam(params.pageSize)
    const categoryFilter: MechaturaCategoryFilter = isMechaturaCompetitionType(categoryParam)
        ? categoryParam
        : "all"
    const paymentFilter: MechaturaPaymentFilter = isPaymentStatus(paymentParam) ? paymentParam : "all"
    const searchFilter = (searchParam ?? "").trim()
    const searchPattern = toSearchPattern(searchFilter)
    const requestedPage = normalizePositiveInt(pageParam, 1)
    const pageSize = normalizePageSize(pageSizeParam)
    const requestedFrom = (requestedPage - 1) * pageSize
    const requestedTo = requestedFrom + pageSize - 1

    const adminSupabase = createAdminClient()
    const paymentStatuses: PaymentStatus[] = [
        "unpaid",
        "pending",
        "paid",
        "settled",
        "failed",
        "expired",
        "cancelled",
    ]

    const { data: leaderSearchMatches, error: leaderSearchError } = searchPattern
        ? await adminSupabase
            .from("mechatura_members")
            .select("registration_id")
            .eq("is_leader", true)
            .or(`full_name.ilike.${searchPattern},email.ilike.${searchPattern}`)
            .limit(10_000)
            .returns<Array<Pick<AdminMechaturaLeader, "registration_id">>>()
        : { data: [], error: null }

    if (leaderSearchError) {
        throw new Error(leaderSearchError.message)
    }

    const leaderRegistrationIds = Array.from(
        new Set((leaderSearchMatches ?? []).map((leader) => leader.registration_id))
    )
    const filterOptions = {
        categoryFilter,
        paymentFilter,
        searchPattern,
        leaderRegistrationIds,
    }
    const registrationColumns =
        "id,team_id,team_name,institution,competition_type,robot_name,registration_status,payment_status,payment_amount,created_at"
    const buildFilteredRegistrationQuery = (
        select: string,
        options?: { count?: "exact"; head?: boolean }
    ) =>
        applyMechaturaFilters(
            adminSupabase.from("mechatura_registrations").select(select, options),
            filterOptions
        )

    const [
        { data: requestedPageData, error: pageError, count },
        paidCountResult,
        sumoCountResult,
        transporterCountResult,
    ] = await Promise.all([
        buildFilteredRegistrationQuery(registrationColumns, { count: "exact" })
            .order("created_at", { ascending: false })
            .order("team_name", { ascending: true })
            .range(requestedFrom, requestedTo)
            .returns<AdminMechaturaRegistration[]>(),
        buildFilteredRegistrationQuery("id", { count: "exact", head: true })
            .in("payment_status", completedStatuses),
        buildFilteredRegistrationQuery("id", { count: "exact", head: true })
            .eq("competition_type", "sumo"),
        buildFilteredRegistrationQuery("id", { count: "exact", head: true })
            .eq("competition_type", "transporter"),
    ])

    if (
        pageError ||
        paidCountResult.error ||
        sumoCountResult.error ||
        transporterCountResult.error
    ) {
        throw new Error(
            pageError?.message ??
            paidCountResult.error?.message ??
            sumoCountResult.error?.message ??
            transporterCountResult.error?.message
        )
    }

    const totalFilteredRegistrations = count ?? requestedPageData?.length ?? 0
    const totalPages = Math.max(1, Math.ceil(totalFilteredRegistrations / pageSize))
    const page = Math.min(requestedPage, totalPages)
    let mechaturaRegistrations = requestedPageData ?? []

    if (page !== requestedPage) {
        const { data: clampedPageData, error: clampedPageError } =
            await buildFilteredRegistrationQuery(registrationColumns)
                .order("created_at", { ascending: false })
                .order("team_name", { ascending: true })
                .range((page - 1) * pageSize, page * pageSize - 1)
                .returns<AdminMechaturaRegistration[]>()

        if (clampedPageError) {
            throw new Error(clampedPageError.message)
        }

        mechaturaRegistrations = clampedPageData ?? []
    }

    const { data: leaders, error: leadersError } = mechaturaRegistrations.length
        ? await adminSupabase
            .from("mechatura_members")
            .select("registration_id,full_name,email")
            .in(
                "registration_id",
                mechaturaRegistrations.map((registration) => registration.id)
            )
            .eq("is_leader", true)
            .returns<AdminMechaturaLeader[]>()
        : { data: [], error: null }

    if (leadersError) {
        throw new Error(leadersError.message)
    }

    const leaderByRegistrationId = new Map(
        (leaders ?? []).map((leader) => [leader.registration_id, leader])
    )
    const from = (page - 1) * pageSize
    const mechaturaPaidCount = paidCountResult.count ?? 0
    const sumoCount = sumoCountResult.count ?? 0
    const transporterCount = transporterCountResult.count ?? 0

    return (
        <div className="mx-auto w-full max-w-6xl space-y-8">
            <section className="rounded-xl bg-card">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h2 className="font-semibold text-2xl">Mechatura Teams</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Search and filter robotics competition registrations.
                        </p>
                    </div>

                    <form className="grid gap-3 sm:grid-cols-2 lg:min-w-[680px] lg:grid-cols-4" action="/admin/mechatura">
                        <input
                            name="search"
                            defaultValue={searchParam ?? ""}
                            placeholder="Search team, robot, leader"
                            className="h-10 rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        />
                        <Select name="category" defaultValue={categoryFilter}>
                            <SelectTrigger className="w-full h-10 rounded-xl">
                                <SelectValue placeholder="All categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All categories</SelectItem>
                                <SelectItem value="sumo">Robot Sumo</SelectItem>
                                <SelectItem value="transporter">Robot Transporter</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select name="payment" defaultValue={paymentFilter}>
                            <SelectTrigger className="w-full h-10 rounded-xl">
                                <SelectValue placeholder="All payments" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All payments</SelectItem>
                                {paymentStatuses.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {paymentStatusLabels[status]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select name="pageSize" defaultValue={String(pageSize)}>
                            <SelectTrigger className="w-full h-10 rounded-xl">
                                <SelectValue placeholder="Rows per page" />
                            </SelectTrigger>
                            <SelectContent>
                                {pageSizeOptions.map((option) => (
                                    <SelectItem key={option} value={String(option)}>
                                        {option} per page
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button className="h-10 rounded-xl sm:col-span-2 lg:col-span-4">
                            Apply filters
                        </Button>
                    </form>
                </div>

                <div className="grid gap-3 border-y border-border py-6 mt-6 sm:grid-cols-4">
                    <div className="rounded-lg border border-border bg-card/90 p-5">
                        <p className="text-sm text-muted-foreground">Total Teams</p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">{totalFilteredRegistrations}</p>
                    </div>
                    <div className="rounded-lg border border-border p-5">
                        <p className="text-sm text-muted-foreground">Paid Teams</p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">{mechaturaPaidCount}</p>
                    </div>
                    <div className="rounded-lg border border-border p-5">
                        <p className="text-sm text-muted-foreground">Robot Sumo</p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">{sumoCount}</p>
                    </div>
                    <div className="rounded-lg border border-border p-5">
                        <p className="text-sm text-muted-foreground">Robot Transporter</p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">{transporterCount}</p>
                    </div>
                </div>

                <MechaturaTable 
                    registrations={mechaturaRegistrations as AdminMechaturaRegistration[]} 
                    leaderByRegistrationId={leaderByRegistrationId as Map<string, AdminMechaturaLeader>} 
                />

                <div className="flex flex-col gap-4 border-t border-border pt-5 mt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {totalFilteredRegistrations === 0 ? 0 : from + 1}-{Math.min(from + pageSize, totalFilteredRegistrations)} of {totalFilteredRegistrations} teams
                    </p>
                    <div className="flex items-center gap-3">
                        {page <= 1 ? (
                            <Button variant="outline" className="h-9 rounded-[8px]" disabled>
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                        ) : (
                            <Button variant="outline" className="h-9 rounded-[8px]" asChild>
                                <Link href={buildPageHref({
                                    page: page - 1,
                                    pageSize,
                                    search: searchParam,
                                    category: categoryFilter,
                                    payment: paymentFilter,
                                })}>
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
                                <Link href={buildPageHref({
                                    page: page + 1,
                                    pageSize,
                                    search: searchParam,
                                    category: categoryFilter,
                                    payment: paymentFilter,
                                })}>
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}
