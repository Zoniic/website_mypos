import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { routing } from "@/i18n/routing";
import { solutionSlugs } from "@/data/solutions";
import { industrySlugs } from "@/data/industries";
import { getAllProductSlugs } from "@/lib/products";
import { getAllKbArticleSlugs } from "@/lib/kb";
import { getAllReferenceCaseSlugs } from "@/lib/references";
import { getAllBlogPosts } from "@/lib/blog";
import { getOpenJobPostings } from "@/lib/careers";

const staticPaths = [
  "",
  "/products",
  "/industries",
  "/software",
  "/references",
  "/accessories",
  "/service",
  "/about",
  "/contact",
  "/compare",
  "/blog",
  "/careers",
  "/tools/savings-calculator",
  "/knowledge-base",
  "/knowledge-base/hardware",
  "/knowledge-base/software",
  "/privacy-policy",
  "/terms-of-service",
];

const solutionPaths = solutionSlugs.map((slug) => `/solutions/${slug}`);
const industryPaths = industrySlugs.map((slug) => `/industries/${slug}`);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productSlugs, kbArticleSlugs, referenceSlugs, blogPosts, jobs] = await Promise.all([
    getAllProductSlugs(),
    getAllKbArticleSlugs(),
    getAllReferenceCaseSlugs(),
    getAllBlogPosts(routing.defaultLocale),
    getOpenJobPostings(routing.defaultLocale),
  ]);

  const allPaths = [
    ...staticPaths,
    ...solutionPaths,
    ...industryPaths,
    ...productSlugs.map((slug) => `/products/${slug}`),
    ...kbArticleSlugs.map((slug) => `/knowledge-base/article/${slug}`),
    ...referenceSlugs.map((slug) => `/references/${slug}`),
    ...blogPosts.map((post) => `/blog/${post.slug}`),
    ...jobs.map((job) => `/careers/${job.slug}`),
  ];

  return allPaths.flatMap((path) => {
    const languages: Record<string, string> = {};
    for (const locale of routing.locales) {
      languages[locale] = `${siteConfig.url}/${locale}${path}`;
    }
    languages["x-default"] = `${siteConfig.url}/${routing.defaultLocale}${path}`;

    // One <url> entry per locale, each self-referencing every language
    // variant (including itself), per Google's hreflang sitemap guidance.
    return routing.locales.map((locale) => ({
      url: `${siteConfig.url}/${locale}${path}`,
      lastModified: new Date(),
      alternates: { languages },
    }));
  });
}
