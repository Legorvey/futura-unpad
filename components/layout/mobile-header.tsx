"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export function MobileHeader() {
    return (
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/40 px-4 sticky top-0 z-10 bg-background/80 backdrop-blur-md">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
            <span className="text-sm font-semibold text-foreground">Futura Admin</span>
        </header>
    )
}
