export default function AdminLoading() {
    return (
        <div className="w-full space-y-8 animate-pulse">
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

            <section className="flex flex-col gap-4 rounded-xl border border-border p-6 bg-card">
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <div className="h-6 w-48 bg-muted rounded"></div>
                        <div className="h-4 w-64 bg-muted rounded"></div>
                    </div>
                    <div className="space-y-2 text-right">
                        <div className="h-8 w-32 bg-muted rounded ml-auto"></div>
                        <div className="h-4 w-40 bg-muted rounded ml-auto"></div>
                    </div>
                </div>
                <div className="mt-4 h-[300px] w-full bg-muted rounded"></div>
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
