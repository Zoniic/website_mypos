import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Admin, and the private cart/order pages (also noindex'd individually).
      disallow: ["/admin", "/*/checkout", "/*/order/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
