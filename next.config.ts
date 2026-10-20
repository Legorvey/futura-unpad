import type { NextConfig } from "next";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://va.vercel-scripts.com https://app.sandbox.midtrans.com https://app.midtrans.com;
  style-src 'self' 'unsafe-inline' https://accounts.google.com;
  img-src 'self' data: blob: https://avatars.githubusercontent.com https://images.unsplash.com https://*.supabase.co https://lh3.googleusercontent.com;
  font-src 'self' data:;
  connect-src 'self' https://*.supabase.co https://va.vercel-scripts.com https://vitals.vercel-insights.com https://accounts.google.com https://api.sandbox.midtrans.com https://api.midtrans.com;
  frame-src 'self' https://accounts.google.com https://app.sandbox.midtrans.com https://app.midtrans.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self' https://app.sandbox.midtrans.com https://app.midtrans.com;
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig: NextConfig = {
  images: {
    qualities: [60, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js', '@supabase/ssr', '@tabler/icons-react', 'lucide-react']
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
