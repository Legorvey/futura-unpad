export default function AdminLoading() {
    return (
        <div className="mx-auto w-full max-w-7xl space-y-8 min-w-0 animate-pulse" role="status" aria-busy="true">
            <section className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:pb-8 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3 w-full">
                    <div className="space-y-2">
                        <div className="h-8 sm:h-10 w-48 sm:w-64 bg-zinc-800/80 rounded"></div>
                        <div className="h-4 w-3/4 max-w-xl bg-zinc-800/40 rounded"></div>
                    </div>
                </div>
            </section>

            <section>
                <div className="h-6 w-28 bg-zinc-800/80 rounded mb-3 sm:mb-4"></div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3.5 sm:p-5">
                            <div className="flex items-center justify-between gap-1">
                                <div className="h-3 w-16 sm:w-24 bg-zinc-800/80 rounded"></div>
                                <div className="h-3.5 w-3.5 bg-zinc-800/40 rounded"></div>
                            </div>
                            <div className="mt-3 h-7 sm:h-9 w-12 sm:w-16 bg-zinc-800/80 rounded"></div>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <div className="h-6 w-28 bg-zinc-800/80 rounded mb-3 sm:mb-4"></div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3.5 sm:p-5">
                            <div className="flex items-center justify-between gap-1">
                                <div className="h-3 w-16 sm:w-24 bg-zinc-800/80 rounded"></div>
                            </div>
                            <div className="mt-3 h-7 sm:h-9 w-12 sm:w-16 bg-zinc-800/80 rounded"></div>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <div className="h-6 w-28 bg-zinc-800/80 rounded mb-3 sm:mb-4"></div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3.5 sm:p-5">
                            <div className="flex items-center justify-between gap-1">
                                <div className="h-3 w-16 sm:w-24 bg-zinc-800/80 rounded"></div>
                            </div>
                            <div className="mt-3 h-7 sm:h-9 w-12 sm:w-16 bg-zinc-800/80 rounded"></div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
