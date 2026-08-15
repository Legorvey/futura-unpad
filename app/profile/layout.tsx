import { ProfileTabs } from "@/components/layout/profile-tabs"
import { VerificationToast } from "./verification-toast"
import { Suspense } from "react"

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative min-h-screen bg-[#00205B] overflow-x-clip text-white selection:bg-white/30 selection:text-white">
            {/* Realistic Aurora Ribbons Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[10%] left-[-10vw] w-[80vw] h-[20vh] bg-[#307FE2] blur-[80px] rounded-[100%] opacity-40 animate-aurora-ribbon-1" />
                <div className="absolute top-[60%] right-[-10vw] w-[70vw] h-[25vh] bg-[#307FE2] blur-[100px] rounded-[100%] opacity-30 animate-aurora-ribbon-2" />
                <div className="absolute bottom-[-10%] left-[20vw] w-[60vw] h-[30vh] bg-[#307FE2] blur-[120px] rounded-[100%] opacity-40 animate-aurora-ribbon-3" />
            </div>

            <div className="relative z-10 pt-32 pb-24 w-full">
                <ProfileTabs />
                <div className="mt-12 w-full max-w-5xl mx-auto px-[18px] sm:px-8 [&:has([data-full-width])]:max-w-none [&:has([data-full-width])]:px-0 [&:has([data-full-width])]:mt-6">
                    {children}
                </div>
                <Suspense fallback={null}>
                    <VerificationToast />
                </Suspense>
            </div>
        </div>
    )
}
