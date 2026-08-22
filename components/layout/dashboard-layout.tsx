import { Sidebar } from "./sidebar"
import { MobileHeader } from "./mobile-header"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background md:flex-row overflow-hidden">
            {/* Atmospheric Background Blobs */}
            <div className="absolute top-0 -left-1/4 w-[150%] h-[150vh] pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background blur-3xl opacity-60" />
            
            <Sidebar />
            
            <div className="relative flex flex-col flex-1 transition-all md:ml-64 min-w-0 z-10">
                <MobileHeader />
                
                <main className="flex-1 p-6 pt-10 sm:p-8 sm:pt-12 lg:p-12 lg:pt-16 animate-fade-up">
                    {children}
                </main>
            </div>
        </div>
    )
}
