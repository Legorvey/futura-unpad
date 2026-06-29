import MechaturaRegistrationForm from "./form"

export default function MechaturaPage() {
    return (
        <main className="mx-auto w-full max-w-3xl items-start space-y-12 px-6 py-16 sm:px-8">
            <section>
                <div className="space-y-2">
                    <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                        Formulir Lomba Mechatura
                    </h1>
                    <p className="max-w-lg text-sm leading-6 text-muted-foreground">
                        Reserve your seminar seat, verify the certificate
                        identity details, then download your participant ticket.
                    </p>
                </div>
            </section>

            <section>
                <MechaturaRegistrationForm />
            </section>
        </main>
    )
}
