import { getAllProducts } from "@/lib/products";
import { getAllAccessories } from "@/lib/accessories";
import { getAllReferenceCases } from "@/lib/references";
import { searchKbArticles } from "@/lib/kb";

export type SearchResult = {
  type: "product" | "accessory" | "kb" | "reference";
  title: string;
  snippet: string;
  href: string;
};

function matches(query: string, ...fields: (string | undefined)[]): boolean {
  const q = query.toLowerCase();
  return fields.some((f) => f?.toLowerCase().includes(q));
}

export async function searchSite(query: string, locale: string): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const [products, accessories, references, kbArticles] = await Promise.all([
    getAllProducts(locale),
    getAllAccessories(locale),
    getAllReferenceCases(locale),
    searchKbArticles(trimmed, locale),
  ]);

  const results: SearchResult[] = [];

  for (const product of products) {
    if (matches(trimmed, product.name, product.specs.cpu, product.specs.os)) {
      results.push({
        type: "product",
        title: product.name,
        snippet: `${product.specs.os} · ${product.specs.screenSize} · ฿${product.priceFrom.toLocaleString()}`,
        href: `/products/${product.slug}`,
      });
    }
  }

  for (const accessory of accessories) {
    if (matches(trimmed, accessory.name, accessory.description)) {
      results.push({
        type: "accessory",
        title: accessory.name,
        snippet: accessory.description,
        href: `/accessories`,
      });
    }
  }

  for (const ref of references) {
    if (matches(trimmed, ref.business, ref.problem, ref.result)) {
      results.push({
        type: "reference",
        title: ref.business,
        snippet: ref.result,
        href: `/references/${ref.slug}`,
      });
    }
  }

  for (const article of kbArticles) {
    results.push({
      type: "kb",
      title: article.title,
      snippet: article.summary,
      href: `/knowledge-base/article/${article.slug}`,
    });
  }

  return results;
}
