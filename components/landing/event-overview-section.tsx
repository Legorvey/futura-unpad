import { CheckCircle2 } from "lucide-react"

const points = [
  "Talks give context before the hype arrives.",
  "Competition turns theory into tradeoffs.",
  "Research sessions make early ideas easier to discuss.",
  "Participants leave with a certificate, a story, or a sharper next step.",
]

export function EventOverviewSection() {
  return (
    <section id="programs" aria-labelledby="overview-heading" className="relative bg-[#fbfbf8] px-5 py-24 text-slate-950 sm:px-8">
      <div className="absolute right-0 top-0 w-[30%] h-[30%] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <div className="relative mx-auto grid max-w-6xl gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start z-10">
        <div className="max-w-xl">
          <h2
            id="overview-heading"
            className="tracking-tighter mt-6 text-5xl leading-[1.1] text-balance sm:text-6xl lg:text-7xl"
          >
            Better technical instincts, without the noise.
          </h2>
        </div>

        <div className="grid gap-5">
          {points.map((point) => (
            <div
              key={point}
              className="flex items-start gap-4 rounded-2xl border border-border/50 bg-white/80 backdrop-blur-sm p-6 transition-all hover:border-primary/30 hover:-translate-y-0.5"
            >
              <CheckCircle2 className="h-6 w-6 shrink-0 text-primary mt-0.5" />
              <p className="text-base leading-7 text-slate-700 font-medium">
                {point}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
