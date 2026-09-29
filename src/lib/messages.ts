import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { SITE_CONTENT_TAG, SITE_CONTENT_TTL_SECONDS } from "@/lib/siteCache";
import { encodeEditMarker, markValue } from "@/lib/editMode";

// Namespaces where the DB's "items" list is merged back in as a structured
// array/object matching the original messages/*.json shape, so every
// existing `t.raw("items")` call in the app keeps working unchanged.
type Messages = Record<string, unknown>;

function setDeep(obj: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split(".");
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (typeof cur[part] !== "object" || cur[part] === null) {
      cur[part] = {};
    }
    cur = cur[part] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

function parseValue(raw: string): unknown {
  const trimmed = raw.trim();
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return raw;
    }
  }
  return raw;
}

function ensureNamespace(messages: Messages, namespace: string): Record<string, unknown> {
  if (typeof messages[namespace] !== "object" || messages[namespace] === null) {
    messages[namespace] = {};
  }
  return messages[namespace] as Record<string, unknown>;
}

/** `editable`: tag visible copy with its row id for "edit on site" mode (lib/editMode). */
async function loadMessages(locale: string, editable = false): Promise<Messages> {
  const rows = await prisma.pageContent.findMany({ where: { locale } });

  const messages: Messages = {};
  for (const row of rows) {
    const value = parseValue(row.value);
    const tagged = editable && !/meta(Title|Description)$/.test(row.key) ? markValue(value, encodeEditMarker(row.id)) : value;
    setDeep(ensureNamespace(messages, row.namespace), row.key, tagged);
  }

  const [products, accessories, referenceCases] = await Promise.all([
    prisma.product.findMany({
      include: { translations: { where: { locale } } },
    }),
    prisma.accessory.findMany({
      orderBy: { sortOrder: "asc" },
      include: { translations: { where: { locale } } },
    }),
    prisma.referenceCase.findMany({
      orderBy: { sortOrder: "asc" },
      include: { translations: { where: { locale } } },
    }),
  ]);

  const productsNs = ensureNamespace(messages, "products");
  productsNs.items = Object.fromEntries(
    products.map((p) => [p.slug, { highlight: p.translations[0]?.highlight ?? "" }])
  );

  const accessoriesNs = ensureNamespace(messages, "accessories");
  accessoriesNs.items = accessories.map((a) => ({
    slug: a.slug,
    name: a.translations[0]?.name ?? "",
    description: a.translations[0]?.description ?? "",
    imageUrl: a.imageUrl ?? undefined,
  }));

  const referencesNs = ensureNamespace(messages, "references");
  referencesNs.items = referenceCases.map((c) => ({
    business: c.translations[0]?.business ?? "",
    businessType: c.businessType,
    problem: c.translations[0]?.problem ?? "",
    install: c.translations[0]?.install ?? "",
    result: c.translations[0]?.result ?? "",
  }));

  return messages;
}

/**
 * All copy for one locale. Several queries per call, needed by every page,
 * so it's cached across requests and purged by admin saves (lib/siteCache).
 */
export const getMessages = unstable_cache((locale: string) => loadMessages(locale), ["messages"], {
  tags: [SITE_CONTENT_TAG],
  revalidate: SITE_CONTENT_TTL_SECONDS,
});

/** Uncached, marked copy for an admin in edit mode. */
export function getEditableMessages(locale: string): Promise<Messages> {
  return loadMessages(locale, true);
}
