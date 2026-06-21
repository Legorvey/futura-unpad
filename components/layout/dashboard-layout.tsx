"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const [sidebarWidth, setSidebarWidth] = useState(260)

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40 md:flex-row">
            <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} width={sidebarWidth} setWidth={setSidebarWidth} />
            
            <div className="flex flex-col flex-1 w-full transition-all" id="dashboard-main">
                {/* 
                  Instead of static md:ml-[260px], we use an inline style for margin-left on medium screens and above.
                  Since we can't easily do a pure inline media query, we use a wrapper.
                */}
                <style>{`
                  @media (min-width: 768px) {
                    #dashboard-main {
                      margin-left: ${sidebarWidth}px;
                      width: calc(100% - ${sidebarWidth}px);
                    }
                  }
                `}</style>
                {/* Mobile Header */}
                <header className="flex h-14 items-center gap-4 border-b border-border bg-background px-4 md:hidden">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setIsMobileOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                    <span className="font-semibold">Dashboard</span>
                </header>
                
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
            
            {/* 
              Hack to keep the desktop main content synced with the resizer width:
              We'll just rely on CSS flex-1 to fill the remaining space on desktop.
              Wait, since Sidebar is 'fixed' on desktop, we need 'md:ml-[260px]' which is static in tailwind.
              If it's resizable, we should actually pass the width to the main content's margin-left.
              Let's update this to be truly responsive to the resize.
            */}
        </div>
    )
}
