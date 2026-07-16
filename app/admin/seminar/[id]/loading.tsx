import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingSeminarDetails() {
    return (
        <div className="mx-auto w-full max-w-6xl space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" disabled>
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
                <div>
                    <h2 className="font-semibold text-2xl tracking-tight">Registration Details</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Loading complete details for this registration entry...
                    </p>
                </div>
            </div>

            <section className="rounded-xl border border-border bg-card p-6">
                <dl className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <dt className="text-sm text-muted-foreground">Type</dt>
                        <dd className="mt-2"><Skeleton className="h-6 w-20 rounded-full" /></dd>
                    </div>
                    <div>
                        <dt className="text-sm text-muted-foreground">Registered At</dt>
                        <dd className="mt-2"><Skeleton className="h-5 w-32" /></dd>
                    </div>
                    <div>
                        <dt className="text-sm text-muted-foreground">Group Name</dt>
                        <dd className="mt-2"><Skeleton className="h-5 w-40" /></dd>
                    </div>
                    <div className="md:col-span-2 lg:col-span-1">
                        <dt className="text-sm text-muted-foreground">Registration ID</dt>
                        <dd className="mt-2"><Skeleton className="h-5 w-full max-w-[200px]" /></dd>
                    </div>
                </dl>
            </section>

            <section className="overflow-hidden rounded-xl border border-border bg-card/90">
                <div className="p-6 border-b border-border bg-card">
                    <h3 className="font-medium text-muted-foreground text-sm uppercase tracking-wider">
                        Registered Attendees
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
