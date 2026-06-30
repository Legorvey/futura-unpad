import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { AuthGuardLink } from "@/components/auth-guard-link"

type Program = {
  image: string
  title: string
  label: string
  description: string
  outcomes: string[]
  href: string
  price: string
  format: string
  timeline: string
  action: string
  featured?: boolean
}

const programs: Program[] = [
  {
    image: "/teacher.gif",
    title: "Seminar",
    label: "Listen",
    description:
      "Understand applied technology through talks, examples, and field perspectives.",
    outcomes: ["Industry context", "Practical examples", "Certificate"],
    href: "/registration/seminar",
    price: "Free",
    format: "Open registration",
    timeline: "14 August 2026",
    action: "Register",
  },
  {
    image: "/bmo.gif",
    title: "Mechatura",
    label: "Build",
    description:
      "Test decisions, iterate quickly, and see how a robot performs under pressure.",
    outcomes: ["Team decisions", "Technical testing", "Prizes"],
    href: "/registration/mechatura",
    price: "Rp 250.000",
    format: "Team entry",
    timeline: "15 August 2026",
    action: "Register",
  },
  {
    image: "/paper.gif",
    title: "Lomba Essay",
    label: "Present",
    description:
      "Turn your academic research into a clear story, present it, and get useful feedback from peers.",
    outcomes: ["Research presentation", "Peer feedback", "Academic networking"],
    href: "/registration/lomba-kti",
    price: "Rp 150.000",
    format: "Presenter slot",
    timeline: "16 August 2026",
    action: "Register",
  },
]

export function RegistrationCards() {
  return (
    <section
      id="programs"
      aria-labelledby="programs-heading"
      className="relative bg-[#fbfbf8] px-5 py-24 text-slate-950 sm:px-8"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[30%] bg-primary/5 blur-[120px] pointer-events-none rounded-[100%]" />

      <div className="relative mx-auto max-w-6xl z-10">
        <div className="max-w-2xl text-left">
          <h2
            id="programs-heading"
            className="font-sans tracking-tighter mt-6 text-3xl leading-[1.1] text-balance sm:text-4xl lg:text-5xl"
          >
            Choose the way you want to participate.
          </h2>
        </div>

        <div className="mt-12 sm:mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {programs.map((program) => (
            <article
              key={program.title}
              className={cn(
                "group relative flex flex-col justify-between rounded-3xl border bg-white/80 p-4 sm:p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1",
                program.featured
                  ? "border-primary/40 shadow-primary/5"
                  : "border-border/50 hover:border-primary/30"
              )}
            >
              {program.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
                  Most Popular
                </div>
              )}
              <div>
                <Image src={program.image} width={200} height={200} alt={program.title} className="rounded-2xl mb-4 w-[200px] sm:w-[240px] h-auto object-cover" />
                <h3 className="text-2xl sm:text-3xl tracking-tight font-medium leading-tight text-slate-950 group-hover:text-primary transition-colors">
                  {program.title}
                </h3>
              </div>

              <div>
                <AuthGuardLink
                  href={program.href}
                  requireAuth={program.href === "/registration/lomba-kti"}
                  className={cn(
                    "mt-8 flex w-full items-center justify-center gap-2 rounded-lg px-6 py-4 text-sm font-semibold transition-all",
                    program.featured
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20"
                      : "bg-black text-white hover:bg-gray-800 hover:cursor-pointer"
                  )}
                >
                  {program.action}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </AuthGuardLink>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
