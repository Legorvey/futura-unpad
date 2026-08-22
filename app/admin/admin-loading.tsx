export default function AdminLoading() {
    return (
        <div className="mx-auto w-full max-w-7xl space-y-8 animate-pulse">
            <section className="flex flex-col gap-5 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3 w-full">
                    <div className="h-4 w-32 bg-muted rounded"></div>
                    <div className="space-y-2">
                        <div className="h-10 w-64 bg-muted rounded"></div>
                        <div className="h-4 w-3/4 max-w-xl bg-muted rounded"></div>
                        <div className="h-4 w-1/2 max-w-xl bg-muted rounded"></div>
                    </div>
                </div>
            </section>

            <section>
                <div className="h-7 w-32 bg-muted rounded mb-5"></div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="rounded-xl border border-border p-5">
                            <div className="flex items-center justify-between gap-3">
                                <div className="h-4 w-24 bg-muted rounded"></div>
                                <div className="h-4 w-4 bg-muted rounded"></div>
                            </div>
                            <div className="mt-4 h-9 w-16 bg-muted rounded"></div>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <div className="h-7 w-32 bg-muted rounded mb-5"></div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="rounded-xl border border-border p-5">
                            <div className="h-4 w-24 bg-muted rounded"></div>
                            <div className="mt-4 h-9 w-16 bg-muted rounded"></div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
