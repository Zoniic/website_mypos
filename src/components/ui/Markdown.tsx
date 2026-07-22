/**
 * Minimal, dependency-free Markdown renderer for admin-authored article bodies.
 * Supports a deliberately small, safe subset: ## / ### headings, **bold**,
 * [text](url) links, "- " bullet lists, and blank-line-separated paragraphs.
 *
 * Safety: the raw text is HTML-escaped first, so no author markup can inject
 * elements. Only our own tags are added afterwards, and link hrefs are limited
 * to http(s), mailto, and site-relative paths.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeHref(url: string, locale?: string): string | null {
  const u = url.trim();
  if (/^(https?:\/\/|mailto:)/i.test(u)) return u;
  if (u.startsWith("/")) {
    // Keep site-relative links in the reader's locale.
    if (locale && !u.startsWith(`/${locale}/`) && u !== `/${locale}`) {
      return `/${locale}${u}`;
    }
    return u;
  }
  return null;
}

/** Inline formatting on already-escaped text: links then bold. */
function inline(escaped: string, locale?: string): string {
  let out = escaped.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (match, text: string, url: string) => {
      const href = safeHref(url, locale);
      if (!href) return text;
      return `<a href="${href}" class="rounded-sm text-primary-600 underline underline-offset-2 outline-offset-2 transition-colors hover:text-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400">${text}</a>`;
    }
  );
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>');
  return out;
}

function renderToHtml(body: string, locale?: string): string {
  const blocks = body.replace(/\r\n/g, "\n").split(/\n{2,}/);
  const html: string[] = [];

  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;
    const lines = block.split("\n");

    if (lines.every((l) => l.trim().startsWith("- "))) {
      const items = lines
        .map((l) => `<li>${inline(escapeHtml(l.trim().slice(2)), locale)}</li>`)
        .join("");
      html.push(
        `<ul class="mt-4 list-disc space-y-2 pl-5 text-text-1">${items}</ul>`
      );
      continue;
    }

    if (block.startsWith("### ")) {
      html.push(
        `<h3 class="mt-8 mb-2 text-xl font-semibold">${inline(escapeHtml(block.slice(4)), locale)}</h3>`
      );
      continue;
    }
    if (block.startsWith("## ")) {
      html.push(
        `<h2 class="mt-10 mb-3 text-2xl font-bold tracking-tight">${inline(escapeHtml(block.slice(3)), locale)}</h2>`
      );
      continue;
    }

    const paragraph = inline(escapeHtml(lines.join(" ")), locale);
    html.push(`<p class="mt-4 leading-relaxed text-text-1">${paragraph}</p>`);
  }

  return html.join("");
}

export function Markdown({ body, locale }: { body: string; locale?: string }) {
  return (
    <div
      className="text-text-1 [&>*:first-child]:mt-0"
      dangerouslySetInnerHTML={{ __html: renderToHtml(body, locale) }}
    />
  );
}
