import { Sidebar } from "./sidebar"
import { MobileHeader } from "./mobile-header"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40 md:flex-row">
            <Sidebar />
            
            <div className="flex flex-col flex-1 transition-all md:ml-64 min-w-0">
                <MobileHeader />
                
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
