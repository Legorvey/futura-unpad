"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Map, UserPlus, FileText, CheckCircle, Ticket } from "lucide-react"

const steps = [
    {
        id: 1,
        title: "Choose Your Track",
        description: "Explore our events and select the one that fits your goals—whether it's listening to experts, building a robot, or presenting research.",
        icon: Map,
        color: "bg-blue-100 text-blue-600",
    },
    {
        id: 2,
        title: "Account Setup",
        description: "Log in or create a Futura account. Your dashboard will keep track of all your event registrations in one place.",
        icon: UserPlus,
        color: "bg-emerald-100 text-emerald-600",
    },
    {
        id: 3,
        title: "Submit Details",
        description: "Fill out the required information, such as your team members or abstract document, directly in the registration form.",
        icon: FileText,
        color: "bg-amber-100 text-amber-600",
    },
    {
        id: 4,
        title: "Verification & Payment",
        description: "Complete your payment if required. Our admin will quickly verify your submission and update your status.",
        icon: CheckCircle,
        color: "bg-purple-100 text-purple-600",
    },
    {
        id: 5,
        title: "Get Ready",
        description: "Once verified, you'll receive your e-ticket or guidebook. Prepare yourself for an amazing experience at Futura!",
        icon: Ticket,
        color: "bg-rose-100 text-rose-600",
    }
]

export default function HowToRegisterSection() {
    const [activeStep, setActiveStep] = useState(1)

    return (
        <section id="how-to-register" className="bg-[#fbfbf8] text-slate-950">
            <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
                <div className="text-center md:text-left mb-16">
                    <h1 className="font-sans text-3xl tracking-tighter leading-snug sm:text-4xl lg:text-5xl">
                        How to Register
                    </h1>
                    <p className="mt-4 text-base leading-8 text-slate-600 max-w-2xl md:mx-0 mx-auto">
                        A seamless process from choosing your event to getting your tickets. Follow these simple steps to secure your spot.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                    {/* Left: Timeline */}
                    <div className="relative">
                        {/* Connecting Line */}
                        <div className="absolute left-6 top-6 bottom-6 w-[2px] bg-slate-200" />

                        <div className="flex flex-col gap-8 relative z-10">
                            {steps.map((step) => {
                                const isActive = activeStep === step.id
                                const Icon = step.icon
                                return (
                                    <button
                                        key={step.id}
                                        onClick={() => setActiveStep(step.id)}
                                        onMouseEnter={() => setActiveStep(step.id)}
                                        className={cn(
                                            "flex gap-6 text-left transition-all duration-500 ease-out group outline-none",
                                            isActive ? "opacity-100" : "opacity-50 hover:opacity-75"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-12 h-12 rounded-full shrink-0 flex items-center justify-center transition-all duration-500 ease-out border-2",
                                            isActive ? "bg-white border-slate-950 shadow-sm" : "bg-[#fbfbf8] border-slate-300 group-hover:border-slate-400"
                                        )}>
                                            <Icon className={cn("w-5 h-5 transition-colors duration-500", isActive ? "text-slate-950" : "text-slate-400")} />
                                        </div>
                                        <div className="pt-2">
                                            <h3 className={cn("text-lg font-semibold tracking-tight transition-colors duration-500", isActive ? "text-slate-950" : "text-slate-500")}>
                                                {step.title}
                                            </h3>
                                            {/* We use a max-height transition to reveal description smoothly */}
                                            <div className={cn("overflow-hidden transition-all duration-800 ease-out", isActive ? "max-h-40 mt-2" : "max-h-0")}>
                                                <p className="text-sm leading-relaxed text-slate-600">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Right: Visual Crossfade Container */}
                    <div className="hidden lg:block sticky top-32">
                        <div className="relative w-full aspect-square rounded-[2rem] bg-white border border-slate-200 overflow-hidden flex items-center justify-center">
                            {steps.map((step) => {
                                const isActive = activeStep === step.id
                                const Icon = step.icon
                                return (
                                    <div
                                        key={step.id}
                                        className={cn(
                                            "absolute inset-0 flex flex-col items-center justify-center p-12 text-center transition-all duration-500 ease-out",
                                            isActive ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95 pointer-events-none"
                                        )}
                                    >
                                        <h3 className="tracking-tight text-4xl font-medium text-slate-950 mb-4">
                                            {step.title}
                                        </h3>
                                        <p className="text-slate-500 leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}