import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/layout/navbar";
import NavigationLoading from "@/components/navigation-loading";
import { AuthProvider, type AuthUser } from "@/components/auth-provider";
import { createClient } from "@/utils/supabase/server";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const initialUser: AuthUser | null = user
    ? { id: user.id, email: user.email ?? null }
    : null;
  let initialIsAdmin = false;

  if (initialUser) {
    const { data } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", initialUser.id)
      .maybeSingle();

    initialIsAdmin = !!data;
  }

  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider initialUser={initialUser} initialIsAdmin={initialIsAdmin}>
          <Suspense fallback={null}>
            <NavigationLoading />
          </Suspense>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
