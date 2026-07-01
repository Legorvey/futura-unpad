import type { Metadata } from "next";
import { Suspense } from "react";
import { EB_Garamond, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/layout/navbar";
import NavigationLoading from "@/components/navigation-loading";
import AuthRouteGuard from "@/components/auth-route-guard";
import { AuthProvider, type AuthUser } from "@/components/auth-provider";
import { getCachedAuth } from "@/lib/auth";

const inter = Inter({
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
});

export const metadata: Metadata = {
  title: "Futura Seminar",
  description: "Minimal seminar registration for Futura.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isAdmin } = await getCachedAuth();
  const initialUser: AuthUser | null = user
    ? { id: user.id, email: user.email ?? null, user_metadata: user.user_metadata }
    : null;

  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        inter.variable,
        ebGaramond.variable,
        geistMono.variable,
        "font-sans"
      )}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider initialUser={initialUser} initialIsAdmin={isAdmin}>
          <Suspense fallback={null}>
            <NavigationLoading />
          </Suspense>
          <Suspense fallback={null}>
            <AuthRouteGuard />
          </Suspense>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
