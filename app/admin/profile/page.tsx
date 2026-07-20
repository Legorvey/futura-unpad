import type { Metadata } from "next"
import { requireAdminOrRedirect } from "@/lib/auth"
import { EditProfileDialog } from "@/components/edit-profile-dialog"
const dateFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
})

const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    return dateFormatter.format(new Date(dateString))
}

export const metadata: Metadata = {
  title: "Profil Admin"
}

export default async function AdminProfilePage() {
    const { user } = await requireAdminOrRedirect()

    return (
        <div className="mx-auto w-full max-w-3xl space-y-8">
            <section className="flex flex-col gap-3 border-b border-border pb-6">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                    Admin Profile
                </h1>
                <p className="text-sm font-medium text-muted-foreground">
                    Manage your administrator account settings and view your account information.
                </p>
            </section>

            <div className="grid gap-8">
                {/* Profile Information */}
                <div className="rounded-xl border border-border bg-card">
                    <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center justify-between">
                        <h2 className="font-medium text-foreground">Profile Information</h2>
                        <EditProfileDialog
                            initialDisplayName={user.user_metadata?.display_name || ""}
                            initialUsername={user.user_metadata?.username || ""}
                            initialEmail={user.email || ""}
                            className="h-8 text-xs sm:h-9 sm:text-sm"
                        />
                    </div>
                    <div className="p-6">
                        <dl className="space-y-6">
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground mb-1">Email address</dt>
                                <dd className="text-base font-medium text-foreground">{user.email}</dd>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground mb-1">Display name</dt>
                                    <dd className="text-base font-medium text-foreground">{user.user_metadata?.display_name || "-"}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground mb-1">Username</dt>
                                    <dd className="text-base font-medium text-foreground">{user.user_metadata?.username ? `@${user.user_metadata.username}` : "-"}</dd>
                                </div>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground mb-1">Role</dt>
                                <dd className="text-base font-medium text-foreground">Administrator</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground mb-1">Account ID</dt>
                                <dd className="text-sm font-mono text-foreground">{user.id}</dd>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground mb-1">Account created</dt>
                                    <dd className="text-sm text-foreground">{formatDate(user.created_at)}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground mb-1">Last sign in</dt>
                                    <dd className="text-sm text-foreground">{formatDate(user.last_sign_in_at)}</dd>
                                </div>
                            </div>
                        </dl>
                    </div>
                </div>


            </div>
        </div>
    )
}
