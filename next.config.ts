import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const ContentSecurityPolicy = [
  "default-src 'self';",
  "base-uri 'self';",
  "font-src 'self';",
  "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in;",
  "object-src 'none';",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vitals.vercel-insights.com;",
  "style-src 'self' 'unsafe-inline';",
  "worker-src 'self' blob:;",
  "connect-src 'self' https://*.supabase.co https://*.supabase.in https://*.upstash.io https://api.openai.com https://vitals.vercel-insights.com" + (isDev ? " http://localhost:3000 ws://localhost:3000" : "") + ";",
  "frame-ancestors 'none';",
  "form-action 'self';",
  "upgrade-insecure-requests;",
].join(" ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: ContentSecurityPolicy,
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
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
    key: "Permissions-Policy",
    value:
      "accelerometer=(), ambient-light-sensor=(), autoplay=(), camera=(), encrypted-media=(), fullscreen=*, geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=*, publickey-credentials-get=(), sync-xhr=(), usb=(), xr-spatial-tracking=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
