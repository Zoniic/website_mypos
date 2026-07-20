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
  images: {
    // Local, self-authored placeholder tiles only (public/images/placeholders/*.svg).
    // Swap for real photography in next/image before launch.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async redirects() {
    return legacyRedirects.map((redirect) => ({
      ...redirect,
      permanent: true,
    }));
  },
};

export default withNextIntl(nextConfig);
