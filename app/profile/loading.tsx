export default function ProfileLoading() {
    return (
        <div className="mx-auto w-full max-w-5xl">
            <div className="space-y-6 animate-pulse">
                
                {/* Skeleton Card 1 (Seminar) */}
                <section className="relative rounded-3xl border border-white/10 bg-white/[0.02] p-[18px] sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-white/10 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-white/5 rounded-2xl"></div>
                            <div className="space-y-2">
                                <div className="h-6 w-40 bg-white/5 rounded"></div>
                                <div className="h-4 w-56 bg-white/5 rounded"></div>
                            </div>
                        </div>
                        <div className="h-9 w-32 bg-white/5 rounded-xl hidden sm:block"></div>
                    </div>
                    <div className="px-2">
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i}>
                                    <div className="h-4 w-24 bg-white/5 rounded mb-3"></div>
                                    <div className="h-6 w-32 bg-white/5 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Skeleton Card 2 (Mechatura) */}
                <section className="relative rounded-3xl border border-white/10 bg-white/[0.02] p-[18px] sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-white/10 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-white/5 rounded-2xl"></div>
                            <div className="space-y-2">
                                <div className="h-6 w-48 bg-white/5 rounded"></div>
                                <div className="h-4 w-56 bg-white/5 rounded"></div>
                            </div>
                        </div>
                        <div className="h-9 w-32 bg-white/5 rounded-xl hidden sm:block"></div>
                    </div>
                    <div className="px-2">
                        <div className="space-y-10">
                            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i}>
                                        <div className="h-4 w-24 bg-white/5 rounded mb-3"></div>
                                        <div className="h-6 w-32 bg-white/5 rounded"></div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <div className="h-12 w-full sm:w-56 bg-white/5 rounded-xl"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Skeleton Card 3 (Lomba KTI) */}
                <section className="relative rounded-3xl border border-white/10 bg-white/[0.02] p-[18px] sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-white/10 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-white/5 rounded-2xl"></div>
                            <div className="space-y-2">
                                <div className="h-6 w-32 bg-white/5 rounded"></div>
                                <div className="h-4 w-48 bg-white/5 rounded"></div>
                            </div>
                        </div>
                    </div>
                    <div className="px-2">
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="h-6 w-64 bg-white/5 rounded mb-3"></div>
                            <div className="h-4 w-80 bg-white/5 rounded"></div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
