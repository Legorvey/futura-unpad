"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";
import { ServerCrash } from "lucide-react";
import { EB_Garamond, Geist_Mono, Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";
import HoverFooter from "@/components/layout/footer";
import "./globals.css";

const space_grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical global runtime error caught in global-error.tsx:", error);
  }, [error]);

  return (
    <html
      lang="id"
      className={cn(
        "h-full",
        "antialiased",
        space_grotesk.variable,
        ebGaramond.variable,
        geistMono.variable,
        "font-sans"
      )}
    >
      <body className="dark bg-[#00205B] text-foreground min-h-screen">
        <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-4 py-16 sm:px-6">
          <ErrorState
            statusCode="500"
            icon={ServerCrash}
            title="Terjadi Kesalahan Kritis"
            description="Terjadi kendala kritis yang mencegah aplikasi dimuat. Silakan muat ulang halaman atau coba lagi."
            onAction={() => {
              if (typeof window !== "undefined") {
                window.location.reload();
              }
            }}
            actionLabel="Muat Ulang Halaman"
            onSecondaryAction={reset}
            secondaryActionLabel="Coba Lagi"
            tone="destructive"
          />
          {error.digest && (
            <p className="mt-4 text-xs text-white/30 font-mono select-all text-center">
              Digest: {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
