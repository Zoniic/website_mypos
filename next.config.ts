import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { legacyRedirects } from "./src/data/legacyRedirects";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
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
  async redirects() {
    return legacyRedirects.map((redirect) => ({
      ...redirect,
      permanent: true,
    }));
  },
};

export default withNextIntl(nextConfig);
