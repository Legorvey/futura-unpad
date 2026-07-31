export default function AccountLoading() {
    return (
        <div className="mx-auto w-full max-w-5xl">
            <div className="animate-pulse">
                
                <section className="relative rounded-3xl border border-white/10 bg-white/[0.02] p-[18px] sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 border-b border-white/10 pb-8">
                        <div className="flex items-center gap-6">
                            {/* Avatar Skeleton */}
                            <div className="h-24 w-24 shrink-0 rounded-full bg-white/5 border border-white/10"></div>
                            <div className="space-y-3">
                                <div className="h-8 w-48 bg-white/5 rounded"></div>
                                <div className="h-5 w-56 bg-white/5 rounded"></div>
                            </div>
                        </div>
                        <div>
                            {/* Edit Button Skeleton */}
                            <div className="h-11 w-32 bg-white/5 rounded-xl"></div>
                        </div>
                    </div>

                    <div className="px-2">
                        <div className="h-6 w-48 bg-white/5 rounded mb-8"></div>
                        
                        {/* 2x2 Grid Skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 bg-white/5 rounded"></div>
                                        <div className="h-4 w-32 bg-white/5 rounded"></div>
                                    </div>
                                    <div className="h-6 w-48 bg-white/5 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
