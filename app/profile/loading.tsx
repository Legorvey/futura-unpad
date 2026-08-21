export default function ProfileLoading() {
  const lightThemeVars = {
    '--background': '#f8fafc',
    '--foreground': '#0f172a',
    '--card': '#ffffff',
    '--card-foreground': '#0f172a',
    '--popover': '#ffffff',
    '--popover-foreground': '#0f172a',
    '--primary': '#fbbf24',
    '--primary-foreground': '#0f172a',
    '--secondary': '#f1f5f9',
    '--secondary-foreground': '#0f172a',
    '--muted': '#f8fafc',
    '--muted-foreground': '#64748b',
    '--accent': '#f1f5f9',
    '--accent-foreground': '#0f172a',
    '--border': '#e2e8f0',
    '--input': '#e2e8f0',
    '--ring': '#fbbf24',
    '--radius': '0.75rem',
  } as React.CSSProperties;

  return (
    <div data-full-width className="w-full flex flex-col items-center pb-32 text-foreground" style={lightThemeVars}>
      <div className="relative w-full max-w-[90rem] px-4 sm:px-8 space-y-6">
        
        <section className="relative rounded-2xl border border-transparent lg:border-border bg-card text-card-foreground p-0 lg:p-8 lg:shadow-xl">
          <div className="flex flex-col lg:flex-row items-stretch gap-0 relative lg:-mx-8 lg:-my-8 h-full rounded-[inherit] animate-pulse">
            
            {/* LEFT COLUMN: Profile Account Details Skeleton */}
            <div className="hidden lg:flex shrink-0 flex-col lg:relative lg:w-80 xl:w-96 lg:h-auto lg:bg-muted/10 lg:border-r lg:border-border/50 lg:rounded-l-2xl">
              <div className="flex flex-col p-6 sm:p-8 lg:p-10 space-y-6">
                <div className="p-5 md:p-6 rounded-2xl bg-card border border-border">
                <div className="flex flex-col items-center text-center gap-4 mb-6 pb-6 border-b border-border">
                  <div className="h-20 w-20 shrink-0 rounded-full bg-slate-200/50"></div>
                  <div className="w-full flex flex-col items-center space-y-2 mt-2">
                    <div className="h-6 w-32 bg-slate-200/50 rounded"></div>
                    <div className="h-4 w-48 bg-slate-200/50 rounded mb-3"></div>
                    <div className="h-9 w-full bg-slate-200/50 rounded-md mt-4"></div>
                  </div>
                </div>

                <div className="space-y-6 mt-6">
                  <div>
                    <div className="h-3 w-20 bg-slate-200/50 rounded mb-2"></div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="h-4 w-40 bg-slate-200/50 rounded"></div>
                      <div className="h-4 w-16 bg-slate-200/50 rounded-full shrink-0"></div>
                    </div>
                  </div>
                  <div>
                    <div className="h-3 w-20 bg-slate-200/50 rounded mb-2"></div>
                    <div className="h-4 w-24 bg-slate-200/50 rounded"></div>
                  </div>
                  <div>
                    <div className="h-3 w-24 bg-slate-200/50 rounded mb-2"></div>
                    <div className="h-4 w-32 bg-slate-200/50 rounded"></div>
                  </div>
                </div>
              </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Registrations Skeleton */}
            <section className="flex-1 space-y-6 p-6 sm:p-8 lg:p-10 transition-all duration-300 min-w-0 bg-background/50 rounded-2xl lg:rounded-l-none lg:rounded-r-2xl w-full">
              <div className="flex items-center justify-between">
                <div className="h-6 w-48 bg-slate-200/50 rounded"></div>
              </div>
              
              {/* Skeleton Card 1 (Mechatura) */}
              <section className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border p-6">
                  <div className="space-y-2">
                    <div className="h-6 w-32 bg-slate-200/50 rounded"></div>
                    <div className="h-4 w-48 bg-slate-200/50 rounded"></div>
                  </div>
                  <div className="h-6 w-24 bg-slate-200/50 rounded-full"></div>
                </div>

                <div className="p-6">
                  <div className="flex flex-col sm:flex-row items-end justify-between gap-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-6 flex-1 w-full sm:w-auto">
                      <div>
                        <div className="h-3 w-20 bg-slate-200/50 rounded mb-2"></div>
                        <div className="h-4 w-24 bg-slate-200/50 rounded"></div>
                      </div>
                      <div>
                        <div className="h-3 w-20 bg-slate-200/50 rounded mb-2"></div>
                        <div className="h-4 w-32 bg-slate-200/50 rounded"></div>
                      </div>
                      <div>
                        <div className="h-3 w-16 bg-slate-200/50 rounded mb-2"></div>
                        <div className="h-4 w-20 bg-slate-200/50 rounded"></div>
                      </div>
                      <div>
                        <div className="h-3 w-16 bg-slate-200/50 rounded mb-2"></div>
                        <div className="h-4 w-20 bg-slate-200/50 rounded"></div>
                      </div>
                    </div>
                    <div className="w-full sm:w-auto shrink-0 mt-4 sm:mt-0">
                      <div className="h-9 w-full sm:w-32 bg-slate-200/50 rounded-md"></div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Skeleton Card 2 (Seminar) */}
              <section className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border p-6">
                  <div className="space-y-2">
                    <div className="h-6 w-40 bg-slate-200/50 rounded"></div>
                    <div className="h-4 w-56 bg-slate-200/50 rounded"></div>
                  </div>
                  <div className="h-6 w-24 bg-slate-200/50 rounded-full"></div>
                </div>

                <div className="p-6">
                  <div className="flex flex-col sm:flex-row items-end justify-between gap-6">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-6 flex-1 w-full sm:w-auto">
                      <div>
                        <div className="h-3 w-24 bg-slate-200/50 rounded mb-2"></div>
                        <div className="h-4 w-32 bg-slate-200/50 rounded"></div>
                      </div>
                      <div>
                        <div className="h-3 w-20 bg-slate-200/50 rounded mb-2"></div>
                        <div className="h-4 w-24 bg-slate-200/50 rounded"></div>
                      </div>
                    </div>
                    <div className="w-full sm:w-auto shrink-0 mt-4 sm:mt-0">
                      <div className="h-9 w-full sm:w-32 bg-slate-200/50 rounded-md"></div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Skeleton Card 3 (Lomba KTI) */}
              <section className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border p-6">
                  <div className="space-y-2">
                    <div className="h-6 w-32 bg-slate-200/50 rounded"></div>
                    <div className="h-4 w-48 bg-slate-200/50 rounded"></div>
                  </div>
                  <div className="h-6 w-24 bg-slate-200/50 rounded-full"></div>
                </div>

                <div className="p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="h-4 w-64 bg-slate-200/50 rounded"></div>
                    <div className="h-9 w-full sm:w-32 bg-slate-200/50 rounded-md"></div>
                  </div>
                </div>
              </section>

            </section>
          </div>
        </section>
      </div>
    </div>
  )
}
