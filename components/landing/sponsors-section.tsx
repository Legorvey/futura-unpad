/* eslint-disable */
import { Hexagon, Triangle, Circle, Square, Box, Globe, Cloud, Zap } from "lucide-react"

const sponsors = [
  { name: "Acme Corp", icon: Hexagon },
  { name: "Globex", icon: Globe },
  { name: "Initech", icon: Triangle },
  { name: "Soylent", icon: Circle },
  { name: "Umbrella", icon: Cloud },
  { name: "Stark Ind", icon: Zap },
  { name: "Wayne Ent", icon: Box },
  { name: "Hooli", icon: Square },
]

export default function SponsorsSection() {
  return (
    <section className="w-full overflow-hidden bg-background px-5 py-16 sm:px-8">
      <div className="max-w-[82rem] mx-auto mb-4 text-center">
        <p className="text-xl font-semibold">
          Our sponsors
        </p>
      </div>

      <div className="relative flex overflow-x-hidden w-full group">
        <div className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none" />

        <div className="flex gap-4 w-max animate-sponsor-scroll hover:[animation-play-state:paused]">
          {[...sponsors, ...sponsors].map((sponsor, idx) => {
            const Icon = sponsor.icon;
            const keyId = `sponsor-${sponsor.name}-${idx}`;
            return (
              <div
                key={keyId}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl border border-border/50 shadow-sm min-w-[200px] justify-center transition-all hover:border-primary/40 hover:shadow-md cursor-pointer"
              >
                <Icon className="w-6 h-6 text-primary" />
                <span className="font-bold text-lg text-foreground">{sponsor.name}</span>
              </div>
            )
          })}
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      </div>
    </section>
  )
}
