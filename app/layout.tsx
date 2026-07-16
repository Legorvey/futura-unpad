import type { Metadata } from "next";
import { Suspense } from "react";
import { EB_Garamond, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { NavbarDemo } from "@/components/layout/navbar";
import NavigationLoading from "@/components/navigation-loading";
import { AuthProvider } from "@/components/auth-provider";
import QueryProvider from "@/components/query-provider";
import type { AuthSession } from "@/lib/api/auth-session";
import HoverFooter from "@/components/layout/footer"

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

export const metadata: Metadata = {
  title: "Futura 2026",
  description: "by HMTE Universitas Padjadjaran",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        space_grotesk.variable,
        ebGaramond.variable,
        geistMono.variable,
        "font-sans"
      )}
    >
      <body className="dark">
        <QueryProvider>
          <AuthProvider>
            <Suspense fallback={null}>
              <NavigationLoading />
            </Suspense>
            <NavbarDemo />
            <div className="w-full flex-1">
              {children}
            </div>
            <HoverFooter />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
