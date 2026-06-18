import { Tv, Radio, Newspaper, Mic, Video, Camera, Clapperboard, Rss } from "lucide-react"

const partners = [
  { name: "Futura TV", icon: Tv },
  { name: "Tech Radio", icon: Radio },
  { name: "Daily News", icon: Newspaper },
  { name: "Voice Pod", icon: Mic },
  { name: "StreamHQ", icon: Video },
  { name: "Pixel Lens", icon: Camera },
  { name: "Cinema Now", icon: Clapperboard },
  { name: "Feed Press", icon: Rss },
]

export default function MediaPartnersSection() {
  return (
    <section className="py-4 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-8 text-center">
        <p className="text-xl font-semibold">
          Our media partners
        </p>
      </div>

      <div className="relative flex overflow-x-hidden w-full group">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#fbfbf8] to-transparent z-10 pointer-events-none" />

        <div className="flex gap-4 w-max animate-sponsor-scroll-reverse hover:[animation-play-state:paused]">
          {[...partners, ...partners].map((partner, idx) => {
            const Icon = partner.icon
            return (
              <div
                key={idx}
                className="flex items-center gap-3 px-8 py-4 bg-white rounded-2xl border border-border/50 shadow-sm min-w-[200px] justify-center transition-all hover:border-primary/40 hover:shadow-md cursor-pointer"
              >
                <Icon className="w-6 h-6 text-primary" />
                <span className="font-bold text-lg text-foreground">{partner.name}</span>
              </div>
            )
          })}
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#fbfbf8] to-transparent z-10 pointer-events-none" />
      </div>
    </section>
  )
}
