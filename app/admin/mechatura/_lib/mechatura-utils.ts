import {
    completedPaymentStatuses as sharedCompletedPaymentStatuses,
    type MechaturaCompetitionType,
    type PaymentStatus,
} from "@/lib/payment";

export type AdminSearchParams = Promise<Record<string, string | string[] | undefined>>;
export type MechaturaCategoryFilter = "all" | MechaturaCompetitionType;
export type MechaturaPaymentFilter = "all" | PaymentStatus;
export type MechaturaSubmissionFilter = "all" | "draft" | "submitted";
export type MechaturaApprovalFilter = "all" | "pending" | "approved" | "rejected";

export const categoryFilters: MechaturaCategoryFilter[] = ["all", "sumo", "transporter"];
export const submissionFilters: MechaturaSubmissionFilter[] = ["all", "draft", "submitted"];
export const approvalFilters: MechaturaApprovalFilter[] = ["all", "pending", "approved", "rejected"];
export const paymentFilters: MechaturaPaymentFilter[] = [
    "all",
    "unpaid",
    "pending_verification",
    "verified",
];
const completedPaymentStatuses = [...sharedCompletedPaymentStatuses];
export const pageSizeOptions = [10, 20, 30, 40] as const;
export const defaultPageSize = 10;

export const mechaturaRegistrationColumns = [
    "id",
    "join_code",
    "name",
    "category",
    "payment_status",
    "payment_proof_link",
    "robot_document_link",
    "submission_status",
    "admin_approval_status",
    "created_at",
    "mechatura_members(id, user_id, is_leader, full_name, phone_number, institution, city, instagram_username, student_id_link, created_at)",
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
    if (!sanitized) return "";
    const wildcarded = sanitized.replace(/\s+/g, "%");
    return `%${wildcarded}%`;
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
        submissionFilter,
        approvalFilter,
        searchPattern,
        memberRegistrationIds,
    }: {
        categoryFilter: MechaturaCategoryFilter;
        paymentFilter: MechaturaPaymentFilter;
        submissionFilter: MechaturaSubmissionFilter;
        approvalFilter: MechaturaApprovalFilter;
        searchPattern: string;
        memberRegistrationIds: string[];
    }
) => {
    let filteredQuery = query as FilterableQuery<T>;

    if (categoryFilter !== "all") {
        const categoryMap: Record<string, string> = {
            "sumo": "robot_sumo",
            "transporter": "robot_transporter",
        };
        filteredQuery = filteredQuery.eq("category", categoryMap[categoryFilter] || categoryFilter);
    }

    if (submissionFilter !== "all") {
        filteredQuery = filteredQuery.eq("submission_status", submissionFilter);
    }

    if (approvalFilter !== "all") {
        filteredQuery = filteredQuery.eq("admin_approval_status", approvalFilter);
    }

    if (paymentFilter === "unpaid") {
        filteredQuery = filteredQuery.or("payment_status.eq.unpaid,payment_status.is.null");
    } else if (paymentFilter !== "all") {
        filteredQuery = filteredQuery.eq("payment_status", paymentFilter);
    }

    if (searchPattern) {
        const registrationFilters = [
            `join_code.ilike.${searchPattern}`,
            `name.ilike.${searchPattern}`,
        ];

        if (memberRegistrationIds.length > 0) {
            registrationFilters.push(`id.in.${toInList(memberRegistrationIds)}`);
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
    submission,
    approval,
}: {
    page: number;
    pageSize: number;
    search?: string;
    category: MechaturaCategoryFilter;
    payment: MechaturaPaymentFilter;
    submission: MechaturaSubmissionFilter;
    approval: MechaturaApprovalFilter;
}) => {
    const query = new URLSearchParams();

    if (search?.trim()) query.set("search", search.trim());
    if (category !== "all") query.set("category", category);
    if (payment !== "all") query.set("payment", payment);
    if (submission !== "all") query.set("submission", submission);
    if (approval !== "all") query.set("approval", approval);
    if (page > 1) query.set("page", String(page));
    if (pageSize !== defaultPageSize) query.set("pageSize", String(pageSize));

    const queryString = query.toString();
    return queryString ? `/admin/mechatura?${queryString}` : "/admin/mechatura";
};
