import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
                body {
                    background-color: #00205B !important;
                }
                .mechatura-wrapper {
                    --background: #f1f5f9;
                    --foreground: #0f172a;
                    --card: #f8fafc;
                    --card-foreground: #0f172a;
                    --popover: #f8fafc;
                    --popover-foreground: #0f172a;
                    --primary: #fbbf24;
                    --primary-foreground: #0f172a;
                    --secondary: #e2e8f0;
                    --secondary-foreground: #0f172a;
                    --muted: #e2e8f0;
                    --muted-foreground: #64748b;
                    --accent: #e2e8f0;
                    --accent-foreground: #0f172a;
                    --border: #cbd5e1;
                    --input: #cbd5e1;
                    --ring: #fbbf24;
                }
            `}} />
            
            {/* Static Aurora Ribbons Background */}
            <div className="fixed inset-0 z-[-2] pointer-events-none overflow-hidden bg-[#00205B]">
                <div className="absolute top-[20%] left-[-10vw] w-[120vw] h-[15vh] bg-[#307FE2] blur-[60px] rounded-[100%] opacity-20 transform translate-y-0 rotate-[-2deg] skew-y-[2deg]" />
                <div className="absolute top-[45%] right-[-10vw] w-[130vw] h-[12vh] bg-[#307FE2] blur-[50px] rounded-[100%] opacity-20 transform translate-y-[2vh] rotate-[3deg] skew-y-[-2deg]" />
                <div className="absolute bottom-[25%] left-[-15vw] w-[140vw] h-[18vh] bg-[#307FE2] blur-[70px] rounded-[100%] opacity-20 transform translate-y-[-3vh] rotate-[-1deg] skew-y-[1deg]" />
            </div>

            <main className="relative flex min-h-screen w-full flex-col items-center overflow-clip pb-32 pt-24 mechatura-wrapper text-white">
                
                <div className="relative w-full max-w-6xl px-4 sm:px-8 space-y-10">
                    {/* Headline Skeleton */}
                    <section className="flex flex-col items-center text-center space-y-4">
                        <Skeleton className="h-10 sm:h-12 lg:h-14 w-80 sm:w-[480px] max-w-full rounded-2xl bg-white/10" />
                        <div className="space-y-2 flex flex-col items-center w-full max-w-2xl">
                            <Skeleton className="h-4 sm:h-5 w-full max-w-lg rounded-lg bg-white/10" />
                            <Skeleton className="h-4 sm:h-5 w-3/4 max-w-sm rounded-lg bg-white/10" />
                        </div>
                    </section>

                    <section className="relative rounded-3xl border border-transparent lg:border-border bg-card text-card-foreground p-0 lg:p-12 lg:shadow-2xl overflow-clip">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#307FE2]/5 via-transparent to-amber-500/5 pointer-events-none hidden lg:block" />
                        <div className="relative">
                            
                            <div className="flex flex-col lg:flex-row items-stretch gap-0 relative lg:-mx-12 lg:-my-12 h-full rounded-[inherit] overflow-clip">
                                {/* Sidebar Skeleton */}
                                <div className="shrink-0 lg:relative lg:w-72 xl:w-80 lg:h-[600px] lg:translate-x-0 lg:bg-muted/10 lg:border-r lg:border-border/50 hidden lg:flex flex-col p-6 sm:p-8">
                                    <div className="space-y-8 flex-1 flex flex-col">
                                        <div className="space-y-2">
                                            <Skeleton className="h-6 w-24" />
                                            <Skeleton className="h-4 w-full" />
                                        </div>
                                        <div className="space-y-4 mt-8">
                                            <Skeleton className="h-4 w-16 mb-4" />
                                            <ul className="space-y-6">
                                                {Array.from({ length: 4 }).map((_, i) => (
                                                <li key={i} className="flex items-start gap-4">
                                                    <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                                                    <Skeleton className="h-5 w-32 mt-1" />
                                                </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Content Skeleton */}
                                <section className="flex-1 space-y-6 p-4 sm:p-8 lg:p-12 transition-all duration-300 min-w-0">
                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <Skeleton className="h-8 w-64 max-w-full" />
                                            <Skeleton className="h-4 w-96 max-w-full" />
                                        </div>
                                        
                                        <div className="space-y-6 mt-8">
                                            {Array.from({ length: 4 }).map((_, i) => (
                                            <div key={i} className="space-y-2">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-11 w-full rounded-md" />
                                            </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-end pt-8">
                                            <Skeleton className="h-11 w-32 rounded-xl" />
                                        </div>
                                    </div>
                                </section>
                            </div>

                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}
