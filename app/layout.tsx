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
import { SmoothScroll } from "@/components/providers/smooth-scroll"
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
  metadataBase: new URL('https://www.futuraunpad.com'),
  title: {
    template: "%s | Futura 2026",
    default: "Futura 2026",
  },
  description: "FUTURA 2026 adalah acara teknologi tahunan yang diselenggarakan oleh Himpunan Mahasiswa Teknik Elektro (HMTE) Universitas Padjadjaran. Menghadirkan seminar nasional, kompetisi robotika (Mechatura), dan pameran inovasi teknologi.",
  keywords: [
    "Futura 2026", 
    "Futura UNPAD", 
    "HMTE UNPAD", 
    "Universitas Padjadjaran", 
    "Seminar Nasional Teknologi", 
    "Kompetisi Robotika", 
    "Mechatura", 
    "Teknik Elektro UNPAD"
  ],
  authors: [{ name: "HMTE UNPAD" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://www.futuraunpad.com",
    title: "Futura 2026 | HMTE Universitas Padjadjaran",
    description: "FUTURA 2026 adalah acara teknologi tahunan oleh HMTE Universitas Padjadjaran. Ikuti rangkaian seminar nasional dan kompetisi inovasi teknologi.",
    siteName: "Futura 2026",
  },
  twitter: {
    card: "summary_large_image",
    title: "Futura 2026 | HMTE Universitas Padjadjaran",
    description: "Acara teknologi tahunan oleh HMTE Universitas Padjadjaran. Ikuti seminar nasional dan kompetisi inovasi.",
  },
  icons: {
    icon: "/favicon-fix.png"
  }
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
        <SmoothScroll>
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
        </SmoothScroll>
      </body>
    </html>
  );
}
