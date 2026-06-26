import Link from "next/link"

export function HeroSection() {
  return (
    <section id="home" className="relative overflow-hidden bg-[#fbfbf8] text-slate-950">
      <div className="relative mx-auto grid min-h-[calc(100svh-65px)] max-w-6xl content-center gap-16 px-5 py-20 sm:px-8 lg:py-28 z-10">
        <div className="mx-auto max-w-4xl text-center">

          <h1 className="font-sans font-heading tracking-tighter leading-tightest text-balance text-5xl lg:text-6xl">
            A small space to <span className="font-serif italic">speak</span> and <span className="font-serif italic">learn</span> what moves next.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Join a university technology event shaped around talks, prototypes,
            research, and the useful questions that happen between them.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm font-medium">
            <Link
              href="/registration"
              className="group relative inline-flex overflow-hidden rounded-full p-[2px] shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-zinc-500/20"
            >
              <span className="absolute inset-[-150%] animate-gradient-border bg-[conic-gradient(from_0deg,#000000_0deg,#18181b_92deg,#d4d4d8_150deg,#3f3f46_210deg,#000000_276deg,#a1a1aa_330deg,#000000_360deg)]" />
              <span className="relative overflow-hidden rounded-full bg-[#050505] px-8 py-4 text-white">
                <span className="absolute inset-0 bg-gradient-to-r from-black via-zinc-800 to-black opacity-55 transition-opacity group-hover:opacity-80" />
                <span className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
                <span className="absolute -right-8 -top-10 h-20 w-24 rounded-full bg-zinc-300/10 blur-2xl transition-opacity group-hover:opacity-80" />
                <span className="relative z-10">Register now</span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
