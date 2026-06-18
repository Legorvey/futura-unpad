import Link from "next/link"

export function HeroSection() {
  return (
    <section id="home" className="relative overflow-hidden bg-[#fbfbf8] text-slate-950">
      <div className="relative mx-auto grid min-h-[calc(100svh-65px)] max-w-6xl content-center gap-16 px-5 py-20 sm:px-8 lg:py-28 z-10">
        <div className="mx-auto max-w-4xl text-center">

          <h1 className="font-sans font-heading text-3xl tracking-tight leading-tight text-balance sm:text-4xl lg:text-5xl">
            A small space to <span className="font-serif italic">speak</span> and <span className="font-serif italic">learn</span> what moves next.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Join a university technology event shaped around talks, prototypes,
            research, and the useful questions that happen between them.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm font-medium">
            <Link
              href="/registration"
              className="group relative overflow-hidden rounded-full bg-slate-950 px-8 py-4 text-white shadow-lg transition-all hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/20 to-sky-500/20 opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="relative z-10">Register now</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
