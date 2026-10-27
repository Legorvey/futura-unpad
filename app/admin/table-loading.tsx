import { Search } from "lucide-react"

export default function TableLoading() {
    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 min-w-0 animate-pulse" role="status" aria-busy="true">
            {/* Header section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="h-8 w-36 sm:w-44 bg-zinc-800/80 rounded-lg"></div>
                    <div className="h-8 sm:h-9 w-24 sm:w-28 bg-zinc-900 border border-zinc-800 rounded-lg shrink-0"></div>
                </div>

                {/* Pill tabs skeleton */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div className="h-8 w-28 bg-zinc-800 rounded-lg shrink-0"></div>
                    <div className="h-8 w-24 bg-zinc-900 rounded-lg shrink-0"></div>
                    <div className="h-8 w-24 bg-zinc-900 rounded-lg shrink-0"></div>
                </div>
            </div>

            {/* Metrics grid - matching Resend mobile layout */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-4 border-y border-zinc-800/60">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col gap-1 min-w-0">
                        <div className="h-3 w-16 sm:w-20 bg-zinc-800/60 rounded"></div>
                        <div className="h-7 sm:h-8 w-12 sm:w-16 bg-zinc-800/80 rounded mt-0.5"></div>
                    </div>
                ))}
            </div>

            {/* Filters row skeleton */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 sm:gap-2.5 min-w-0 max-w-full">
                <div className="relative flex-1 min-w-0">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                    <div className="h-10 w-full rounded-xl border border-zinc-800/80 bg-zinc-950/80"></div>
                </div>

                <div className="grid grid-cols-2 gap-2 w-full lg:flex lg:w-auto lg:items-center">
                    <div className="h-10 w-full lg:w-28 rounded-xl border border-zinc-800/80 bg-zinc-950/80 shrink-0"></div>
                    <div className="h-10 w-full lg:w-28 rounded-xl border border-zinc-800/80 bg-zinc-950/80 shrink-0"></div>
                </div>

            </div>

            {/* Table skeleton */}
            <div className="w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-800">
                <div className="min-w-[800px] space-y-1.5 mt-4">
                    <div className="h-10 rounded-xl border border-zinc-800/80 bg-zinc-900/60"></div>
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <div key={i} className="h-14 border-b border-zinc-800/40 flex items-center px-4 gap-4">
                            <div className="space-y-1 flex-1">
                                <div className="h-3.5 w-36 bg-zinc-800/80 rounded"></div>
                                <div className="h-2.5 w-20 bg-zinc-800/40 rounded"></div>
                            </div>
                            <div className="h-5 w-20 rounded-full bg-zinc-800/60 border border-zinc-700/40"></div>
                            <div className="h-3.5 w-28 bg-zinc-800/40 rounded"></div>
                            <div className="h-3.5 w-16 bg-zinc-800/40 rounded font-mono"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination skeleton */}
            <div className="flex flex-col gap-3.5 border-t border-zinc-800/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center justify-between sm:justify-start gap-3">
                    <div className="h-8 w-24 rounded-lg bg-zinc-900 border border-zinc-800"></div>
                    <div className="h-4 w-28 bg-zinc-800/40 rounded sm:hidden"></div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6">
                    <div className="h-4 w-36 bg-zinc-800/60 rounded hidden sm:block"></div>
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg border border-zinc-800/80 bg-zinc-950/80"></div>
                        <div className="h-8 w-8 rounded-lg border border-zinc-800/80 bg-zinc-950/80"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
