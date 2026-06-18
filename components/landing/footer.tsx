import Link from "next/link"

const links = [
  { label: "Home", href: "#home" },
  { label: "Tracks", href: "#programs" },
  { label: "Seminar", href: "/registration/seminar" },
  { label: "FAQ", href: "#faq" },
  { label: "Email", href: "mailto:committee@futura.id" },
]

export function Footer() {
  return (
    <footer className="bg-[#fbfbf8] px-5 py-12 text-slate-950 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 border-t border-slate-200 pt-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="#home" className="font-heading text-5xl font-medium leading-none">
            footer otw
          </Link>
          <p className="mt-4 max-w-md text-sm leading-7 text-slate-500">
            saran teks bang
          </p>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
          {links.map((link) => (
            <Link key={link.label} href={link.href} className="transition hover:text-slate-950">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
