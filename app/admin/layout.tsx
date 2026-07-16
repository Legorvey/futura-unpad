import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { requireAdminOrRedirect } from "@/lib/auth"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    await requireAdminOrRedirect()

    return (
        <DashboardLayout>
            {children}
        </DashboardLayout>
    )
}
