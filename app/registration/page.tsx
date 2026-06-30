import Link from "next/link"
import { AuthGuardLink } from "@/components/auth-guard-link"

type RegistrationProgram = {
    title: string
    mode: string
    description: string
    date: string
    price: string
    details: string[]
    href?: string
    guidebook?: boolean
}

const programs: RegistrationProgram[] = [
    {
        title: "Futura Seminar",
        mode: "Listen",
        description:
            "Understand applied technology through talks, examples, and field perspectives.",
        date: "14 August 2026",
        price: "Free",
        details: ["Industry context", "Practical examples", "Seminar certificate"],
        href: "/registration/seminar",
    },
    {
        title: "Mechatura",
        mode: "Build",
        description:
            "Test decisions, iterate quickly, and see how a robot performs under pressure.",
        date: "15 August 2026",
        price: "Rp 250.000",
        details: ["Team decisions", "Technical testing", "Competition prizes"],
        href: "/registration/mechatura",
        guidebook: true,
    },
    {
        title: "Lomba Essay",
        mode: "Present",
        description:
            "Turn research into a clearer story and get useful feedback from peers.",
        date: "16 August 2026",
        price: "Rp 150.000",
        details: ["Research presentation", "Peer feedback", "Academic networking"],
        href: "/registration/lomba-kti",
    },
]

export default function RegistrationPage() {
    return (
        <main className="min-h-[calc(100svh-65px)] bg-[#fbfbf8] px-5 py-20 text-slate-950 sm:px-8 lg:py-28">
            <section className="mx-auto max-w-6xl">
                <div className="mx-auto max-w-3xl text-center">
                    <h1 className="tracking-tighter text-5xl font-medium leading-[0.96] text-balance sm:text-6xl">
                        Choose the track that fits your way in.
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600">
                        Listen closely, build with a team, or present something you
                        have already started.
                    </p>
                </div>

                <div className="mt-16 grid gap-6 lg:grid-cols-3">
                    {programs.map((program) => (
                        <article
                            key={program.title}
                            className="flex min-h-[430px] flex-col justify-between rounded-[8px] bg-white p-7"
                        >
                            <div>
                                <h2 className="tracking-tight text-4xl font-medium leading-tight text-slate-950">
                                    {program.title}
                                </h2>
                                <p className="mt-5 text-sm leading-7 text-slate-600">
                                    {program.description}
                                </p>
                            </div>

                            <div className="mt-10">
                                <dl className="mt-6 grid gap-3 border-t border-slate-100 pt-5 text-sm">
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-slate-400">Date</dt>
                                        <dd className="font-medium text-slate-800">{program.date}</dd>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-slate-400">Fee</dt>
                                        <dd className="font-medium text-slate-800">{program.price}</dd>
                                    </div>
                                </dl>

                                <div className="mt-7 flex flex-wrap items-center gap-4">
                                    {program.href ? (
                                        <AuthGuardLink
                                            href={program.href}
                                            requireAuth={program.href === "/registration/lomba-kti"}
                                            className="text-sm font-medium rounded-lg bg-black px-4 py-2 text-white"
                                        >
                                            Continue to form
                                        </AuthGuardLink>
                                    ) : (
                                        <span className="text-sm font-medium text-slate-400">
                                            Opening soon
                                        </span>
                                    )}

                                    {program.guidebook ? (
                                        <span className="text-sm text-slate-400">
                                            Guidebook soon
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    )
}
