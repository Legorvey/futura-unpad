import Link from "next/link"

export function HeroSection() {
  return (
    <section id="home" className="bg-[#fbfbf8] text-slate-950">
      <div className="mx-auto grid min-h-[calc(100svh-65px)] max-w-6xl content-center gap-16 px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-sans font-heading text-6xl tracking-tight leading-snug text-balance sm:text-4xl lg:text-5xl">
            A small space to <span className="font-serif italic">speak</span> and <span className="font-serif italic">learn</span> what moves next.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600">
            Join a university technology event shaped around talks, prototypes,
            research, and the useful questions that happen between them.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm font-medium">
            <Link
              href="/registration"
              className="rounded-full bg-slate-950 px-5 py-3 text-white transition hover:bg-slate-700"
            >
              Register now
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
