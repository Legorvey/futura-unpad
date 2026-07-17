import { ChevronLeft, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingMechaturaDetails() {
    return (
        <div className="mx-auto w-full space-y-6 sm:space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4">
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-full shrink-0 mt-1 sm:mt-0" disabled>
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Button>
                    <div>
                        <h2 className="font-semibold text-xl sm:text-2xl tracking-tight line-clamp-1">Mechatura Team Details</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Loading complete details for one Mechatura registration...
                        </p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <Button variant="outline" className="xl:hidden w-full sm:w-auto" disabled>
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        Team Info & Docs
                    </Button>
                    <Skeleton className="h-9 w-32 rounded-[8px] hidden sm:block" />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-8">
                    <section className="overflow-hidden rounded-xl border border-border bg-card/90">
                        <div className="border-b border-border bg-card p-6">
                            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                Team People
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full rounded-md" />
                            ))}
                        </div>
                    </section>
                </div>

                <div className="hidden xl:block space-y-6">
                    <section className="rounded-xl border border-border bg-card p-5 flex flex-col">
                        <div className="flex items-center gap-2 border-b border-border pb-3 mb-2">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <div className="flex-1 divide-y divide-border/50">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-start justify-between gap-4 py-2">
                                    <Skeleton className="h-4 w-24 mt-1" />
                                    <Skeleton className="h-4 w-32 mt-1" />
                                </div>
                            ))}
                        </div>
                    </section>
                    
                    <section className="rounded-xl border border-border bg-card p-5 flex flex-col">
                        <div className="flex items-center gap-2 border-b border-border pb-3 mb-2">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <div className="flex-1 divide-y divide-border/50">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-start justify-between gap-4 py-2">
                                    <Skeleton className="h-4 w-24 mt-1" />
                                    <Skeleton className="h-4 w-32 mt-1" />
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="flex flex-col gap-4">
                        <Skeleton className="h-3 w-32 ml-1" />
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <Skeleton className="h-8 w-full sm:w-20 rounded-full" />
                            </div>
                        ))}
                    </section>
                </div>
            </div>
        </div>
    )
}
