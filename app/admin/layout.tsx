import Link from "next/link"
import { LayoutDashboard, Users, Trophy, Cpu } from "lucide-react"
import { requireAdminOrRedirect } from "@/lib/auth"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    await requireAdminOrRedirect()
    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-10 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-6 sm:px-8">
                    <Link href="/admin" className="flex items-center gap-2 font-semibold">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Admin</span>
                    </Link>
                    <nav className="flex items-center gap-6 text-sm font-medium">
                        <Link href="/admin/seminar" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Seminar
                        </Link>
                        <Link href="/admin/lomba-kti" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                            <Trophy className="h-4 w-4" />
                            LKTI
                        </Link>
                        <Link href="/admin/mechatura" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                            <Cpu className="h-4 w-4" />
                            Mechatura
                        </Link>
                    </nav>
                </div>
            </header>
            {children}
        </div>
    )
}
