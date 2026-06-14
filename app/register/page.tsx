import { redirect } from "next/navigation"
import RegisterForm from "./form"
import { createClient } from "@/utils/supabase/server"

export default async function LoginPage(){
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (user) {
        redirect("/admin")
    }

    return (
        <main className="mx-auto w-full max-w-xl items-start space-y-12 px-6 py-16 sm:px-8">
            <section className="space-y-2">
                <h1 className="max-w-md text-4xl font-semibold tracking-tight text-balance">
                    Create a Futura account
                </h1>
                <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                    Set up your futura account 
                </p>
            </section>

            <section> 
                <RegisterForm />
            </section>
        </main>
    )
}
