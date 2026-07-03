import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { updateContent } from "../actions";

export default async function EditContentNamespacePage({
  params,
  searchParams,
}: {
  params: Promise<{ namespace: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { namespace } = await params;
  const { saved } = await searchParams;

  const rows = await prisma.pageContent.findMany({
    where: { namespace },
    orderBy: { key: "asc" },
  });

  const keys = Array.from(new Set(rows.map((r) => r.key))).sort();
  const byKeyLocale = new Map(rows.map((r) => [`${r.key}__${r.locale}`, r.value]));

  const boundAction = updateContent.bind(null, namespace);

  return (
    <div>
      <Link href="/admin/content" className="text-sm text-text-2 hover:text-text-1">
        &larr; Back to Page Content
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{namespace}</h1>
      {saved && <p className="mt-2 text-sm text-success">Saved.</p>}

      <form action={boundAction} className="mt-6 max-w-4xl space-y-6">
        {keys.map((key) => (
          <fieldset key={key} className="rounded-xl border border-border p-4">
            <legend className="px-1 font-mono text-sm text-text-2">{key}</legend>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              {(["th", "en", "zh"] as const).map((locale) => {
                const value = byKeyLocale.get(`${key}__${locale}`) ?? "";
                const isLong = value.length > 80 || value.trim().startsWith("[");
                return (
                  <label key={locale} className="block">
                    <span className="text-xs font-semibold uppercase text-text-2">{locale}</span>
                    <textarea
                      name={`${key}__${locale}`}
                      defaultValue={value}
                      rows={isLong ? 6 : 2}
                      className="mt-1 w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 font-mono text-xs text-text-1"
                    />
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}

        <button
          type="submit"
          className="rounded-button bg-[image:var(--gradient-primary)] px-6 py-2.5 font-semibold text-text-1 shadow-[var(--shadow-glow-primary)]"
        >
          Save All Changes
        </button>
      </form>
    </div>
  );
}
