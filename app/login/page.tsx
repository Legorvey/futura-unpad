import { redirect } from "next/navigation"
import LoginForm from "./form"
import { createClient } from "@/utils/supabase/server"

type LoginSearchParams = Promise<Record<string, string | string[] | undefined>>

const getSafeRedirectPath = (value: string | string[] | undefined) => {
    const next = Array.isArray(value) ? value[0] : value

    if (
        !next ||
        !next.startsWith("/") ||
        next.startsWith("//") ||
        next.startsWith("/login") ||
        next.startsWith("/register") ||
        next.startsWith("/auth/callback")
    ) {
        return "/admin"
    }

    return next
}

export default async function LoginPage({
    searchParams,
}: {
    searchParams: LoginSearchParams
}){
    const params = await searchParams
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (user) {
        redirect(getSafeRedirectPath(params.next))
    }

    return (
        <main className="w-full mx-auto max-w-xl items-start space-y-12 px-6 py-16 sm:px-8 ">
            <section className="space-y-2">
                <h1 className="max-w-md text-4xl font-semibold tracking-tight text-balance">
                    Sign in to your Futura account
                </h1>
                <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                    Get notified on every seminar
                </p>
            </section>

            <section>
                <LoginForm />
            </section>
        </main>
    )
}
