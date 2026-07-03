"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import Link from "next/link"
import { AuthGuardLink } from "@/components/auth-guard-link"
import { useAuth } from "@/components/auth-provider"
import { UserProfileButton, UserProfileDropdown } from "@/components/user-profile-menu"
import { cn } from "@/lib/utils"
import { Menu, X, ChevronDown } from "lucide-react"
import { usePathname } from "next/navigation"

type NavDropdown = "info" | "registration"
type ActiveDropdown = NavDropdown | "user" | null

type DropdownItem = {
    label: string
    href: string
    requireAuth?: boolean
    prefetch?: false
}

const dropdownDetails: Record<NavDropdown, { title: string }> = {
    info: {
        title: "Find answers before you join.",
    },
    registration: {
        title: "Choose your Futura path.",
    },
}

const infoItems: DropdownItem[] = [
    {
        label: "Timeline",
        href: "/#faq",
    },
    {
        label: "Booklet",
        href: "/#faq-competition",
    },
     {
        label: "Juklak",
        href: "/#",
    }
]

const registrationItems: DropdownItem[] = [
    {
        label: "Seminar",
        href: "/registration/seminar",
        prefetch: false,
    },
    {
        label: "Mechatura",
        href: "/registration/mechatura",
        requireAuth: true,
    },
    {
        label: "Lomba Essay",
        href: "/registration/lomba-essay",
        requireAuth: true,
    },
]

const dropdownItems: Record<NavDropdown, DropdownItem[]> = {
    info: infoItems,
    registration: registrationItems,
}

function DropdownItemLink({ item, onClick }: { item: DropdownItem; onClick: () => void }) {
    const className = "navbar-dropdown-item group flex flex-col rounded-xl px-4 py-2 hover:bg-muted"
    const content = (
        <>
            <span className="text-lg text-foreground transition group-hover:text-primary">{item.label}</span>
        </>
    )

    if (item.requireAuth) {
        return (
            <AuthGuardLink href={item.href} requireAuth className={className} onClick={onClick}>
                {content}
            </AuthGuardLink>
        )
    }

    return (
        <Link href={item.href} prefetch={item.prefetch} className={className} onClick={onClick}>
            {content}
        </Link>
    )
}

function DesktopDropdownPanel({
    activeDropdown,
    onClose,
}: {
    activeDropdown: ActiveDropdown
    onClose: () => void
}) {
    const visibleDropdown = activeDropdown === "info" || activeDropdown === "registration" ? activeDropdown : null

    return (
        <div
            className={cn(
                "absolute inset-x-0 top-0 z-50 grid grid-cols-[17rem_20rem] gap-33 px-4 py-6",
                visibleDropdown ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}
        >
            <div className="relative pt-1">
                {(Object.keys(dropdownDetails) as NavDropdown[]).map((dropdown) => (
                    <h3
                        key={dropdown}
                        data-active={visibleDropdown === dropdown}
                        className="navbar-dropdown-layer absolute left-0 top-1 text-2xl font-semibold leading-tight tracking-tight text-foreground"
                    >
                        {dropdownDetails[dropdown].title}
                    </h3>
                ))}
                <h3 className="invisible text-2xl font-semibold leading-tight tracking-tight" aria-hidden="true">
                    {dropdownDetails.registration.title}
                </h3>
            </div>
            <div className="relative min-h-[152px]">
                {(Object.keys(dropdownItems) as NavDropdown[]).map((dropdown) => (
                    <div
                        key={dropdown}
                        data-active={visibleDropdown === dropdown}
                        className="navbar-dropdown-layer absolute inset-0 flex flex-col"
                    >
                        {dropdownItems[dropdown].map((item) => (
                            <DropdownItemLink key={item.href} item={item} onClick={onClose} />
                        ))}
                    </div>
                ))}
                <div className="invisible flex flex-col gap-2" aria-hidden="true">
                    {registrationItems.map((item) => (
                        <div key={item.href} className="flex flex-col gap-1 rounded-2xl">
                            <span className="text-sm font-semibold">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default function Navbar() {
    const { user, isAdmin } = useAuth()
    const pathname = usePathname()
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isMobileRegistrationOpen, setIsMobileRegistrationOpen] = useState(false)
    const [isMobileFaqOpen, setIsMobileFaqOpen] = useState(false)
    const [isMobileUserOpen, setIsMobileUserOpen] = useState(false)
    const [activeDropdown, setActiveDropdown] = useState<ActiveDropdown>(null)

    const handleHover = (dropdown: ActiveDropdown) => {
        if (!dropdown) return
        setActiveDropdown(dropdown)
    }

    const visibleActiveDropdown = !user && activeDropdown === "user" ? null : activeDropdown

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 60)
        }

        // Initial check
        handleScroll()

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    if (pathname.startsWith("/admin") || pathname.startsWith("/profile")) {
        return null
    }

    return (
        <>
            {/* Invisible spacer to prevent the fixed navbar from overlapping the top of the page */}
            <div className="h-[73px] w-full shrink-0" />
            <header
                className={cn(
                    "fixed top-0 z-50 w-full transition-all duration-700 ease-in-out dark text-foreground",
                    isScrolled ? "px-3 pt-3 pb-4 sm:px-6 lg:px-8" : "px-0"
                )}
            >
                <div
                    className={cn(
                        "mx-auto flex flex-col transition-all duration-700 ease-in-out overflow-hidden",
                        isScrolled
                            ? cn(
                                "w-full max-w-7xl border border-border/70 bg-background/80 backdrop-blur-xl px-4 pt-2.5 pb-0 sm:px-6 shadow-sm",
                                isMobileMenuOpen ? "rounded-3xl" : "rounded-3xl md:rounded-[2rem]"
                            )
                            : "w-full max-w-full rounded-none border border-transparent border-b-border/70 bg-background/95 backdrop-blur-xl px-4 pt-3 pb-0 sm:px-8",
                        (isMobileMenuOpen || visibleActiveDropdown) && !isScrolled ? "bg-background/95 border-b-border/70" : ""
                    )}
                    onMouseLeave={() => setActiveDropdown(null)}
                >
                    <div className="flex items-center justify-between w-full pb-3">
                        <div className="flex min-w-0 items-center gap-5 sm:gap-12">
                            {isAdmin ? (
                                <Link href="/" className="flex items-center gap-2 text-base font-semibold tracking-tight" onClick={() => setIsMobileMenuOpen(false)}>
                                    Admin Futura
                                </Link>
                            ) : (
                                <Link href="/" className="flex items-center gap-2 text-base font-semibold tracking-tight" onClick={() => setIsMobileMenuOpen(false)}>
                                    Futura
                                </Link>
                            )}

                            <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
                                <Link href="/#home" className="transition hover:text-foreground">
                                    Home
                                </Link>
                                <Link href="/#about" className="transition hover:text-foreground">
                                    About
                                </Link>
                                <Link href="/#programs" className="transition hover:text-foreground">
                                    Programs
                                </Link>

                                <button
                                    className="flex items-center gap-1 py-2 transition hover:text-foreground outline-none"
                                    onMouseEnter={() => handleHover("info")}
                                    onClick={() => setActiveDropdown(activeDropdown === "info" ? null : "info")}
                                >
                                    Info <ChevronDown className={cn("h-4 w-4 transition-transform duration-500", visibleActiveDropdown === "info" && "rotate-180")} />
                                </button>

                                <button
                                    className="flex items-center gap-1 py-2 transition hover:text-foreground outline-none"
                                    onMouseEnter={() => handleHover("registration")}
                                    onClick={() => setActiveDropdown(activeDropdown === "registration" ? null : "registration")}
                                >
                                    Registration <ChevronDown className={cn("h-4 w-4 transition-transform duration-500", visibleActiveDropdown === "registration" && "rotate-180")} />
                                </button>
                            </nav>
                        </div>

                        {/* Top Right Actions */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="flex items-center gap-2 sm:gap-3 relative">
                                {user ? (
                                    <>
                                        {isAdmin && (
                                            <div className="hidden sm:block">
                                                <Button asChild className={cn("transition-all duration-700 ease-in-out", isScrolled && "rounded-[1.5rem]")}>
                                                    <Link href="/admin" prefetch={false}>Admin Dashboard</Link>
                                                </Button>
                                            </div>
                                        )}
                                        <div
                                            className="relative hidden md:block"
                                            onMouseEnter={() => handleHover("user")}
                                        >
                                            <UserProfileButton onClick={() => setActiveDropdown(activeDropdown === "user" ? null : "user")} />

                                            {/* User Dropdown List anchored strictly to user button */}
                                            <div
                                                className={cn(
                                                    "absolute right-0 top-full mt-8 w-[280px] transition-all duration-300 ease-out z-50",
                                                    visibleActiveDropdown === "user" ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none"
                                                )}
                                            >
                                                <UserProfileDropdown onClose={() => setActiveDropdown(null)} />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            prefetch={false}
                                            className="hidden sm:block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                                        >
                                            Log in
                                        </Link>
                                        <Button
                                            asChild
                                            size="sm"
                                            className={cn("hidden sm:flex transition-all duration-700 ease-in-out", isScrolled && "rounded-[1.5rem]")}
                                        >
                                            <Link href="/register" prefetch={false}>Register</Link>
                                        </Button>
                                    </>
                                )}

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden"
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    aria-label="Toggle menu"
                                >
                                    {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Background Expansion Block */}
                    <div
                        className={cn(
                            "hidden md:block w-full pointer-events-none relative transition-[height,opacity,border-color] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]",
                            visibleActiveDropdown === "registration" ? "h-[190px] opacity-100 border-t border-border/50" :
                                visibleActiveDropdown === "info" ? "h-[190px] opacity-100 border-t border-border/50" :
                                    visibleActiveDropdown === "user" ? (isAdmin ? "h-[460px]" : "h-[420px]") + " opacity-100 border-t border-border/50" :
                                        "h-0 opacity-0 border-t border-transparent"
                        )}
                    >
                        <DesktopDropdownPanel
                            activeDropdown={visibleActiveDropdown}
                            onClose={() => setActiveDropdown(null)}
                        />
                        <div
                            className={cn(
                                "absolute left-8 top-10 max-w-md transition-all duration-500 delay-100 ease-out",
                                visibleActiveDropdown === "user" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                            )}
                        >
                            <h3 className="text-3xl font-semibold tracking-tight text-foreground mb-3">
                                Welcome back, <br /><span className="text-primary">{user?.user_metadata?.display_name || user?.user_metadata?.username || user?.email?.split('@')[0] || 'User'}</span>
                            </h3>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                                Manage your registrations, view your transaction history, and stay updated with all your upcoming seminars and competitions.
                            </p>
                            <div className="flex gap-4">
                                <div className="flex-1 rounded-2xl bg-muted/50 p-4 border border-border/50">
                                    <h4 className="text-sm font-semibold mb-1">Total Seminars</h4>
                                    <p className="text-2xl font-bold text-primary">0</p>
                                </div>
                                <div className="flex-1 rounded-2xl bg-muted/50 p-4 border border-border/50">
                                    <h4 className="text-sm font-semibold mb-1">Active Events</h4>
                                    <p className="text-2xl font-bold text-primary">0</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Nav Dropdown */}
                    <div
                        className={cn(
                            "md:hidden w-full overflow-y-auto overscroll-contain transition-all duration-500 ease-in-out",
                            isMobileMenuOpen ? "max-h-[85vh] opacity-100 mt-4" : "max-h-0 opacity-0"
                        )}
                    >
                        <nav className="flex flex-col gap-2 pb-4 px-2">
                            <Link href="/#home" className="text-base font-medium text-muted-foreground hover:text-foreground transition py-2" onClick={() => setIsMobileMenuOpen(false)}>
                                Home
                            </Link>
                            <Link href="/#about" className="text-base font-medium text-muted-foreground hover:text-foreground transition py-2" onClick={() => setIsMobileMenuOpen(false)}>
                                About
                            </Link>
                            <Link href="/#programs" className="text-base font-medium text-muted-foreground hover:text-foreground transition py-2" onClick={() => setIsMobileMenuOpen(false)}>
                                Programs
                            </Link>

                            {/* Mobile FAQ Accordion */}
                            <div className="flex flex-col">
                                <button
                                    className="flex items-center justify-between text-base font-medium text-muted-foreground hover:text-foreground transition py-2 text-left"
                                    onClick={() => setIsMobileFaqOpen(!isMobileFaqOpen)}
                                >
                                    FAQ <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", isMobileFaqOpen && "rotate-180")} />
                                </button>
                                <div className={cn("flex flex-col gap-2 overflow-hidden transition-all duration-500 ease-in-out", isMobileFaqOpen ? "max-h-32 opacity-100 mt-2" : "max-h-0 opacity-0")}>
                                    <Link href="/#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition py-2 pl-4 border-l-2 border-border/50 ml-2" onClick={() => setIsMobileMenuOpen(false)}>
                                        General Questions
                                    </Link>
                                    <Link href="/#faq-competition" className="text-sm font-medium text-muted-foreground hover:text-foreground transition py-2 pl-4 border-l-2 border-border/50 ml-2" onClick={() => setIsMobileMenuOpen(false)}>
                                        Competition Details
                                    </Link>
                                </div>
                            </div>

                            {/* Mobile Registration Accordion */}
                            <div className="flex flex-col">
                                <button
                                    className="flex items-center justify-between text-base font-medium text-muted-foreground hover:text-foreground transition py-2 text-left"
                                    onClick={() => setIsMobileRegistrationOpen(!isMobileRegistrationOpen)}
                                >
                                    Registration <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", isMobileRegistrationOpen && "rotate-180")} />
                                </button>
                                <div className={cn("flex flex-col gap-2 overflow-hidden transition-all duration-500 ease-in-out", isMobileRegistrationOpen ? "max-h-48 opacity-100 mt-2" : "max-h-0 opacity-0")}>
                                    <Link href="/registration/seminar" prefetch={false} className="text-sm font-medium text-muted-foreground hover:text-foreground transition py-2 pl-4 border-l-2 border-border/50 ml-2" onClick={() => setIsMobileMenuOpen(false)}>
                                        Seminar
                                    </Link>
                                    <AuthGuardLink href="/registration/mechatura" requireAuth className="text-sm font-medium text-muted-foreground hover:text-foreground transition py-2 pl-4 border-l-2 border-border/50 ml-2" onClick={() => setIsMobileMenuOpen(false)}>
                                        Mechatura
                                    </AuthGuardLink>
                                    <AuthGuardLink href="/registration/lomba-essay" requireAuth className="text-sm font-medium text-muted-foreground hover:text-foreground transition py-2 pl-4 border-l-2 border-border/50 ml-2" onClick={() => setIsMobileMenuOpen(false)}>
                                        Lomba Essay
                                    </AuthGuardLink>
                                </div>
                            </div>

                            {/* Mobile Auth Actions */}
                            {!user && (
                                <div className="flex flex-col gap-3 pt-6 mt-2 border-t border-border/50">
                                    <Link
                                        href="/login"
                                        prefetch={false}
                                        className="text-base font-medium text-muted-foreground hover:text-foreground transition py-2"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href="/register"
                                        prefetch={false}
                                        className="text-base font-medium text-primary hover:text-primary/80 transition py-2"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                            {user && (
                                <div className="flex flex-col pt-4 mt-2 border-t border-border/50">
                                    <button
                                        className="flex items-center justify-between text-base font-medium text-muted-foreground hover:text-foreground transition py-2 text-left"
                                        onClick={() => setIsMobileUserOpen(!isMobileUserOpen)}
                                    >
                                        Your Account <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", isMobileUserOpen && "rotate-180")} />
                                    </button>
                                    <div className={cn("overflow-hidden transition-all duration-500 ease-in-out", isMobileUserOpen ? "max-h-[600px] opacity-100 mt-2" : "max-h-0 opacity-0")}>
                                        <UserProfileDropdown onClose={() => setIsMobileMenuOpen(false)} />
                                    </div>
                                </div>
                            )}
                        </nav>
                    </div>
                </div>
            </header>
        </>
    )
}
