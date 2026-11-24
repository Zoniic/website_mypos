import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { legacyRedirects } from "./src/data/legacyRedirects";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Content-Security-Policy, report-only. It blocks nothing; violations show in
// the browser console. Every origin below is one the code really loads:
// - TrackingScripts.tsx: Google tag/GTM/Ads, Meta pixel, TikTok pixel, LINE tag.
// - kb.ts toEmbedUrl: YouTube and Google Drive embeds. siteDisplay.ts: Google Maps embed.
// - uploads and datasheet iframe: Supabase Storage (*.supabase.co).
// Inline scripts are needed (tracking bootstrap, JSON-LD). A nonce would force
// dynamic rendering and break cached pages (HANDOFF section 3.8), so none is used.
// Switching to enforcing (Content-Security-Policy) needs a clean report first.
const isDev = process.env.NODE_ENV !== "production";
const contentSecurityPolicyReportOnly = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://www.googleadservices.com https://connect.facebook.net https://analytics.tiktok.com https://d.line-scdn.net`,
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://*.doubleclick.net https://www.googleadservices.com https://www.facebook.com https://connect.facebook.net https://analytics.tiktok.com https://*.tiktok.com https://tr.line.me https://*.supabase.co",
  "img-src 'self' data: blob: https://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://*.doubleclick.net https://www.google.com https://www.facebook.com https://*.tiktok.com https://tr.line.me https://i.ytimg.com",
  "media-src 'self' blob: https://*.supabase.co",
  "frame-src 'self' https://*.supabase.co https://www.youtube.com https://www.youtube-nocookie.com https://drive.google.com https://www.google.com https://td.doubleclick.net",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicyReportOnly },
  // No HSTS here: the app cannot know it is served over HTTPS. Set it on the reverse proxy.
];

const nextConfig: NextConfig = {
  // Self-contained server for the Docker image (.next/standalone).
  output: "standalone",
  // Next.js 16 dev server blocks cross-origin requests to /_next/static
  // and RSC data fetches by default (only localhost is allowed). Without
  // this, opening the dev server from a LAN IP (e.g. testing on another
  // device on the same network) 403s every JS chunk, so the page shell
  // loads but React never hydrates and no content renders.
  allowedDevOrigins: ["192.168.0.109", "192.168.99.111"],
  // Server Actions default to a 1MB request body, which is well under what
  // admin forms need: products/accessories submit up to 4 images (5MB each,
  // see MAX_IMAGE_BYTES in src/lib/uploads.ts) or a datasheet PDF (20MB,
  // MAX_PDF_BYTES) in the same multipart submission. The largest single
  // case is the hero background upload (50MB video, MAX_VIDEO_BYTES) — set
  // the limit above that with headroom for multipart overhead.
  experimental: {
    serverActions: {
      bodySizeLimit: "55mb",
    },
  },
  images: {
    // Local, self-authored placeholder tiles only (public/images/placeholders/*.svg).
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Admin-uploaded photos/PDF covers now live in Supabase Storage
    // (see src/lib/uploads.ts) — next/image needs the remote host allowlisted.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return legacyRedirects.map((redirect) => ({
      ...redirect,
      permanent: true,
    }));
  },
};

export default withNextIntl(nextConfig);
