"use client"

import RegistrationForm from "./form"
import RegistrationProgress from "@/components/registration-progress"

export default function RegistrationPage() {
    return (
        <main className="mx-auto w-full max-w-3xl items-start space-y-12 px-6 py-16 sm:px-8">
            <section>
                <div className="space-y-2">
                    <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                        Join Futura.
                    </h1>
                    <p className="max-w-lg text-sm leading-6 text-muted-foreground">
                        Fill in your details and choose how you will attend.
                    </p>
                </div>
            </section>

            <RegistrationProgress currentStep={1} />

            <section>
                <RegistrationForm />
            </section>
        </main>
    )
}
