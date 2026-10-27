import { cookies } from "next/headers"
import { Sidebar } from "./sidebar"
import { MobileHeader } from "./mobile-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies()
    const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"
    const parsedWidth = Number(cookieStore.get("sidebar_width")?.value)
    const defaultWidth = Number.isFinite(parsedWidth) && parsedWidth >= 220 && parsedWidth <= 480
        ? parsedWidth
        : 288

    return (
        <SidebarProvider defaultOpen={defaultOpen} defaultWidth={defaultWidth}>
            {/* Atmospheric Background Blobs */}
            <div className="fixed top-0 -left-1/4 w-[150%] h-[150vh] pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background blur-3xl opacity-60" />

            <Sidebar />

            <SidebarInset className="bg-transparent min-w-0 flex flex-col flex-1">
                <MobileHeader />

                <div className="flex-1 p-6 pt-8 sm:p-8 sm:pt-10 lg:p-10 lg:pt-12 animate-fade-up">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
