export default function MechaturaLoading() {
  return (
    <div data-full-width className="w-full flex flex-col items-center pb-32 mechatura-wrapper text-white">
      <style dangerouslySetInnerHTML={{ __html: `
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
      <div className="relative w-full max-w-[90rem] px-4 sm:px-8 space-y-6">
          <section className="space-y-1.5 px-2">
              <h1 className="text-3xl font-extrabold tracking-[-0.05em] sm:text-4xl text-white">
                  Mechatura Dashboard
              </h1>
              <p className="max-w-2xl text-sm tracking-tight leading-relaxed text-blue-100/80 sm:text-base">
                  Kelola pendaftaran dan dokumen tim Anda.
              </p>
          </section>
          
          <section className="relative rounded-2xl border border-transparent lg:border-border bg-card text-card-foreground p-0 lg:p-8 lg:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#307FE2]/5 via-transparent to-amber-500/5 pointer-events-none hidden lg:block rounded-[inherit]" />
              <div className="relative">
                  <div className="flex flex-col lg:flex-row items-stretch gap-0 relative lg:-mx-8 lg:-my-8 h-full rounded-[inherit] animate-pulse">
                    
                    {/* Sidebar Skeleton */}
                    <div className="hidden lg:flex shrink-0 flex-col lg:relative lg:w-80 xl:w-96 lg:h-auto lg:bg-muted/10 lg:border-r lg:border-border/50 lg:rounded-l-2xl">
                      <div className="flex flex-col p-6 sm:p-8 lg:p-10 space-y-6">
                        <div className="p-5 md:p-6 rounded-2xl bg-card border border-border space-y-4">
                          <div className="h-6 w-40 bg-muted rounded mb-6"></div>
                          <div className="space-y-4">
                            <div className="flex justify-between py-3 border-b border-border/50">
                              <div className="h-4 w-32 bg-muted rounded"></div>
                              <div className="h-4 w-16 bg-muted rounded"></div>
                            </div>
                            <div className="flex justify-between py-3">
                              <div className="h-4 w-32 bg-muted rounded"></div>
                              <div className="h-4 w-16 bg-muted rounded"></div>
                            </div>
                          </div>
                        </div>
                        <div className="p-5 md:p-6 rounded-2xl bg-card border border-border space-y-5">
                          <div className="flex justify-between">
                            <div className="h-6 w-32 bg-muted rounded"></div>
                            <div className="h-4 w-20 bg-muted rounded"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-4 w-full bg-muted rounded"></div>
                            <div className="h-4 w-3/4 bg-muted rounded"></div>
                          </div>
                          <div className="space-y-2 mt-4">
                            <div className="h-4 w-48 bg-muted rounded"></div>
                            <div className="h-10 w-full bg-muted rounded-md"></div>
                          </div>
                          <div className="h-10 w-full bg-muted rounded-md mt-4"></div>
                        </div>
                      </div>
                    </div>

                    {/* Main Content Skeleton */}
                    <section className="flex-1 space-y-6 p-6 sm:p-8 lg:p-10 min-w-0 bg-background/50 rounded-2xl lg:rounded-l-none lg:rounded-r-2xl">
                      
                      {/* Team Header Section Skeleton */}
                      <div className="p-5 md:p-6 rounded-2xl bg-card border border-border flex flex-col md:flex-row md:items-start lg:items-center justify-between gap-6">
                        <div className="space-y-4 w-full">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-48 bg-muted rounded"></div>
                            <div className="h-4 w-16 bg-muted rounded"></div>
                          </div>
                          <div className="h-4 w-32 bg-muted rounded"></div>
                          <div className="h-10 w-40 bg-muted rounded mt-4"></div>
                        </div>
                        <div className="bg-muted/50 p-4 rounded-xl border border-border/50 flex items-center gap-6 min-w-[260px] justify-between">
                          <div className="space-y-2">
                            <div className="h-4 w-24 bg-muted rounded"></div>
                            <div className="h-6 w-32 bg-muted rounded"></div>
                          </div>
                          <div className="h-8 w-8 bg-muted rounded"></div>
                        </div>
                      </div>
                      
                      {/* Identity Section Skeleton */}
                      <div className="space-y-6 p-5 md:p-6 rounded-2xl bg-card border border-border">
                        <div className="space-y-3">
                          <div className="h-6 w-32 bg-muted rounded"></div>
                          <div className="h-4 w-3/4 bg-muted rounded"></div>
                          <div className="h-4 w-1/2 bg-muted rounded"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2"><div className="h-4 w-24 bg-muted rounded"></div><div className="h-10 w-full bg-muted rounded-md"></div></div>
                          <div className="space-y-2"><div className="h-4 w-32 bg-muted rounded"></div><div className="h-10 w-full bg-muted rounded-md"></div></div>
                          <div className="space-y-2"><div className="h-4 w-20 bg-muted rounded"></div><div className="h-10 w-full bg-muted rounded-md"></div></div>
                          <div className="space-y-2"><div className="h-4 w-28 bg-muted rounded"></div><div className="h-10 w-full bg-muted rounded-md"></div></div>
                          <div className="space-y-2"><div className="h-4 w-40 bg-muted rounded"></div><div className="h-10 w-full bg-muted rounded-md"></div></div>
                          <div className="space-y-2"><div className="h-4 w-48 bg-muted rounded"></div><div className="h-10 w-full bg-muted rounded-md"></div></div>
                        </div>
                        <div className="h-10 w-32 bg-muted rounded-md mt-4"></div>
                      </div>

                      {/* Robot Documents Section Skeleton */}
                      <div className="p-5 md:p-6 rounded-2xl bg-card border border-border space-y-5">
                        <div className="space-y-3">
                          <div className="h-6 w-48 bg-muted rounded"></div>
                          <div className="h-4 w-full bg-muted rounded"></div>
                          <div className="h-4 w-2/3 bg-muted rounded"></div>
                        </div>
                        <div className="space-y-2 mt-4">
                          <div className="h-4 w-48 bg-muted rounded"></div>
                          <div className="h-10 w-full bg-muted rounded-md"></div>
                        </div>
                        <div className="h-10 w-40 bg-muted rounded-md mt-4"></div>
                      </div>
                    </section>
                  </div>
              </div>
          </section>
      </div>
    </div>
  );
}
