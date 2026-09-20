export type AdminSearchParams = Promise<Record<string, string | string[] | undefined>>;
export type EsaiSubmissionFilter = "all" | "draft" | "submitted" | "approved";

export const submissionFilters: EsaiSubmissionFilter[] = ["all", "draft", "submitted", "approved"];
export const pageSizeOptions = [10, 20, 30, 40] as const;
export const defaultPageSize = 10;

export const esaiRegistrationColumns = [
    "id",
    "user_id",
    "full_name",
    "institution",
    "email",
    "phone_number",
    "submission_status",
    "created_at", "essay_paper_url", "identity_card_url", "instagram_twibbon_url", "payment_proof_url",
].join(",");

export const firstParam = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

export const normalizeFilter = <T extends string>(
    value: string | undefined,
    filters: readonly T[],
    fallback: T
) => (value && filters.includes(value as T) ? (value as T) : fallback);

export const normalizePositiveInt = (value: string | undefined, fallback: number) => {
    if (!value) return fallback;
    const num = parseInt(value, 10);
    return !isNaN(num) && num > 0 ? num : fallback;
};

export const normalizePageSize = (value: string | undefined) => {
    const size = normalizePositiveInt(value, defaultPageSize);
    return pageSizeOptions.includes(size as any) ? size : defaultPageSize;
};

export type AdminEsaiRegistration = {
    id: string;
    user_id: string;
    full_name: string | null;
    institution: string | null;
    email: string | null;
    phone_number: string | null;
    payment_proof_url: string | null;
    submission_status: string | null;
    created_at: string; essay_paper_url: string | null; identity_card_url: string | null; instagram_twibbon_url: string | null;
};

export const toSearchPattern = (search: string) => {
    if (!search) return null;
    const pattern = search.replace(/[%_]/g, "\\$&"); // Escape LIKE wildcards
    const safePattern = pattern.replace(/"/g, '\\"'); // Escape double quotes for PostgREST
    return `"%${safePattern}%"`; // Wrap in double quotes
};

type FilterOptions = {
    submissionFilter: EsaiSubmissionFilter;
    searchPattern: string | null;
};

export const applyEsaiFilters = <T>(query: T, options: FilterOptions): T => {
    const { submissionFilter, searchPattern } = options;
    let q = query as any;

    if (submissionFilter && submissionFilter !== "all") {
        q = q.eq("submission_status", submissionFilter);
    }
    
    if (searchPattern) {
        q = q.or(`full_name.ilike.${searchPattern},institution.ilike.${searchPattern},email.ilike.${searchPattern}`);
    }

    return q as T;
};

export const buildEsaiPageHref = ({
    page,
    pageSize,
    search,
    submission,
}: {
    page: number;
    pageSize: number;
    search?: string;
    submission: EsaiSubmissionFilter;
}) => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", page.toString());
    if (pageSize !== defaultPageSize) params.set("pageSize", pageSize.toString());
    if (search?.trim()) params.set("search", search.trim());
    if (submission !== "all") params.set("submission", submission);

    const qs = params.toString();
    return `/admin/lomba-esai${qs ? "?" + qs : ""}`;
};
