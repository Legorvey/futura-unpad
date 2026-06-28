import Link from "next/link";
import Image from "next/image";

export default function MaintenancePlaceholder() {
    return (
        <main className="min-h-[calc(100svh-65px)] bg-[#fbfbf8] flex items-center justify-center p-6 text-slate-950">
            <div className="max-w-xl w-full text-center p-10 md:p-16 flex flex-col items-center">
                <Image src="/under-construction.gif" alt="Under Construction" width={300} height={300} />

                <h1 className="mt-10 tracking-tight text-3xl md:text-4xl font-medium mb-4 text-slate-900">
                    Work in Bismillah
                </h1>

                <p className="text-slate-600 text-base md:text-lg max-w-md mb-10 leading-relaxed">
                    This page is currently under maintenance. Please check back later!
                </p>

                <Link
                    href="/registration"
                    className="inline-flex items-center justify-center px-8 py-3.5 rounded-[8px] bg-black text-white font-medium hover:bg-gray-700 transition"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Registration
                </Link>
            </div>
        </main>
    )
}
