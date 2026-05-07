import type { NextConfig } from "next";

const CSP = [
  "default-src 'self'",
  // unsafe-inline needed for inline JSON-LD <script> tags
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https: data: blob:",
  // OpenFreeMap tile sources + Geoapify for geocoding + Supabase + MapLibre CDN deps
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.geoapify.com https://tiles.openfreemap.org https://*.openfreemap.org https://places.googleapis.com https://challenges.cloudflare.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  // MapLibre GL JS uses blob: workers
  "worker-src blob:",
  "frame-src https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
].join('; ')

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Allow geolocation from same origin (needed for "Near me" button)
  { key: 'Permissions-Policy', value: 'camera=(), microphone=()' },
  { key: 'Content-Security-Policy', value: CSP },
]

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/sign/**',
      },
    ],
  },
};

export default nextConfig;
