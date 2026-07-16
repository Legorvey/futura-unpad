import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingMechaturaDetails() {
    return (
        <div className="mx-auto w-full max-w-6xl space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" disabled>
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
                <div>
                    <h2 className="font-semibold text-2xl tracking-tight">Mechatura Team Details</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Loading complete details for one Mechatura registration...
                    </p>
                </div>
            </div>

            <section className="rounded-xl border border-border bg-card p-6">
                <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                    {Array.from({ length: 11 }).map((_, i) => (
                        <div key={i}>
                            <dt className="text-sm text-muted-foreground">
                                <Skeleton className="h-4 w-24 mb-2" />
                            </dt>
                            <dd className="mt-2">
                                <Skeleton className="h-5 w-48" />
                            </dd>
                        </div>
                    ))}
                </dl>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-5">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-5 w-32" />
                        </div>
                        <div className="mt-4">
                            <Skeleton className="h-9 w-36 rounded-[8px]" />
                        </div>
                    </div>
                ))}
            </section>

            <section className="overflow-hidden rounded-xl border border-border bg-card/90">
                <div className="border-b border-border bg-card p-6">
                    <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                        Team People
                    </h3>
                </div>
                <div className="p-6 space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full rounded-md" />
                    ))}
                </div>
            </section>
        </div>
    )
}
