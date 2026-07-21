import type { Metadata } from "next";
import { Suspense } from "react";
import { EB_Garamond, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { NavbarDemo } from "@/components/layout/navbar";
import NextTopLoader from 'nextjs-toploader';
import { AuthProvider } from "@/components/auth-provider";
import QueryProvider from "@/components/query-provider";
import type { AuthSession } from "@/lib/api/auth-session";
import HoverFooter from "@/components/layout/footer"
import { Toaster } from "@/components/ui/sonner";
import { getCachedAuth } from "@/lib/auth";
import { Analytics } from "@vercel/analytics/react";

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
  title: {
    template: "%s | Futura 2026",
    default: "Futura 2026",
  },
  description: "oleh HMTE Universitas Padjadjaran",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const { user, adminAccess } = await getCachedAuth();
  const initialSession: AuthSession = {
    user: user
      ? {
          id: user.id,
          email: user.email ?? null,
          user_metadata: user.user_metadata,
        }
      : null,
    adminAccess,
  };

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
      <body className="dark">
        <QueryProvider>
          <AuthProvider initialSession={initialSession}>
            <NextTopLoader color="#ffffff" showSpinner={false} />
            <NavbarDemo />
            <div className="w-full flex-1">
              {children}
            </div>
            <HoverFooter />
            <Toaster position="top-right" richColors theme="dark" />
          </AuthProvider>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
