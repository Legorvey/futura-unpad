import type { MechaturaCompetitionType, PaymentStatus } from "@/lib/payment";

export type AdminSearchParams = Promise<Record<string, string | string[] | undefined>>;
export type MechaturaCategoryFilter = "all" | MechaturaCompetitionType;
export type MechaturaPaymentFilter = "all" | PaymentStatus;

export const categoryFilters: MechaturaCategoryFilter[] = ["all", "sumo", "transporter"];
export const paymentFilters: MechaturaPaymentFilter[] = [
    "all",
    "unpaid",
    "pending",
    "paid",
    "settled",
    "failed",
    "expired",
    "cancelled",
];
export const completedPaymentStatuses: PaymentStatus[] = ["paid", "settled"];
export const pageSizeOptions = [10, 20, 30, 40] as const;
export const defaultPageSize = 10;

export const mechaturaRegistrationColumns = [
    "id",
    "team_id",
    "team_name",
    "institution",
    "competition_type",
    "robot_name",
    "payment_status",
    "created_at",
].join(",");

export const firstParam = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

export const normalizeFilter = <T extends string>(
    value: string | undefined,
    filters: readonly T[],
    fallback: T
) => (value && filters.includes(value as T) ? (value as T) : fallback);

export const normalizePositiveInt = (value: string | undefined, fallback: number) => {
    const parsed = Number.parseInt(value ?? "", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const normalizePageSize = (value: string | undefined) => {
    const requestedPageSize = normalizePositiveInt(value, defaultPageSize);

    return pageSizeOptions.includes(requestedPageSize as typeof pageSizeOptions[number])
        ? requestedPageSize
        : defaultPageSize;
};

export const toSearchPattern = (value: string) => {
    const sanitized = value.replace(/[,%()]/g, " ").trim();
    return sanitized ? `%${sanitized}%` : "";
};

export const toInList = (values: string[]) => `(${values.join(",")})`;

type FilterableQuery<T> = T & {
    eq: (column: string, value: unknown) => FilterableQuery<T>;
    in: (column: string, values: unknown[]) => FilterableQuery<T>;
    or: (filters: string) => FilterableQuery<T>;
};

export const applyMechaturaFilters = <T,>(
    query: T,
    {
        categoryFilter,
        paymentFilter,
        searchPattern,
        leaderRegistrationIds,
    }: {
        categoryFilter: MechaturaCategoryFilter;
        paymentFilter: MechaturaPaymentFilter;
        searchPattern: string;
        leaderRegistrationIds: string[];
    }
) => {
    let filteredQuery = query as FilterableQuery<T>;

    if (categoryFilter !== "all") {
        filteredQuery = filteredQuery.eq("competition_type", categoryFilter);
    }

    if (paymentFilter === "unpaid") {
        filteredQuery = filteredQuery.or("payment_status.eq.unpaid,payment_status.is.null");
    } else if (paymentFilter !== "all") {
        filteredQuery = filteredQuery.eq("payment_status", paymentFilter);
    }

    if (searchPattern) {
        const registrationFilters = [
            `team_id.ilike.${searchPattern}`,
            `team_name.ilike.${searchPattern}`,
            `institution.ilike.${searchPattern}`,
            `robot_name.ilike.${searchPattern}`,
        ];

        if (leaderRegistrationIds.length > 0) {
            registrationFilters.push(`id.in.${toInList(leaderRegistrationIds)}`);
        }

        filteredQuery = filteredQuery.or(registrationFilters.join(","));
    }

    return filteredQuery as T;
};

export const buildMechaturaPageHref = ({
    page,
    pageSize,
    search,
    category,
    payment,
}: {
    page: number;
    pageSize: number;
    search?: string;
    category: MechaturaCategoryFilter;
    payment: MechaturaPaymentFilter;
}) => {
    const query = new URLSearchParams();

    if (search?.trim()) query.set("search", search.trim());
    if (category !== "all") query.set("category", category);
    if (payment !== "all") query.set("payment", payment);
    if (page > 1) query.set("page", String(page));
    if (pageSize !== defaultPageSize) query.set("pageSize", String(pageSize));

    const queryString = query.toString();
    return queryString ? `/admin/mechatura?${queryString}` : "/admin/mechatura";
};
