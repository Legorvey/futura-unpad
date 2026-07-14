import { Search } from "lucide-react"

export default function TableLoading() {
    return (
        <div className="mx-auto w-full max-w-7xl space-y-8 animate-pulse">
            {/* Header section */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                    <div className="h-8 w-48 bg-muted rounded-md"></div>
                    <div className="h-4 w-72 bg-muted rounded-md"></div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="h-11 w-32 bg-muted rounded-[8px]"></div>
                    <div className="h-11 w-36 bg-muted rounded-[8px]"></div>
                </div>
            </div>

            {/* Metrics grid */}
            <div className="grid gap-y-8 border-y border-border py-7 sm:grid-cols-2 xl:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={`flex items-center gap-4 sm:px-4 xl:px-8 ${i === 1 ? "sm:pl-0" : ""} ${i < 4 ? "xl:border-r xl:border-border" : ""}`}
                    >
                        <div className="flex items-baseline gap-3 w-full">
                            <div className="h-9 w-12 bg-muted rounded-md"></div>
                            <div className="h-4 w-24 bg-muted rounded-md"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters section skeleton */}
            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-xl border border-border p-4 bg-card/50">
                    <div className="relative flex-1 w-full lg:max-w-md">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/30" />
                        <div className="h-10 w-full rounded-lg border border-input bg-muted/50"></div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="h-10 w-[140px] rounded-lg bg-muted/50"></div>
                        <div className="h-10 w-[140px] rounded-lg bg-muted/50"></div>
                        <div className="h-10 w-[140px] rounded-lg bg-muted/50"></div>
                    </div>
                </div>
            </div>

            {/* Table skeleton */}
            <div className="rounded-md border border-border overflow-hidden mt-6">
                <div className="h-12 border-b border-border bg-muted/30"></div>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                    <div key={i} className="h-16 border-b border-border/50 bg-transparent flex items-center px-4 gap-4">
                        <div className="h-4 w-1/4 bg-muted/60 rounded"></div>
                        <div className="h-4 w-1/4 bg-muted/60 rounded"></div>
                        <div className="h-4 w-1/4 bg-muted/60 rounded"></div>
                        <div className="h-4 w-1/4 bg-muted/60 rounded"></div>
                    </div>
                ))}
            </div>

            {/* Pagination skeleton */}
            <div className="flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="h-4 w-40 bg-muted rounded"></div>
                <div className="flex items-center gap-3">
                    <div className="h-9 w-24 bg-muted rounded-[8px]"></div>
                    <div className="h-4 w-20 bg-muted rounded mx-2"></div>
                    <div className="h-9 w-24 bg-muted rounded-[8px]"></div>
                </div>
            </div>
        </div>
    )
}
