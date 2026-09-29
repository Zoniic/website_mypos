import Link from "next/link";
import { SECTION_GUIDES, type SectionGuideKey } from "./guides";

function List({ items }: { items: string[] }) {
  return (
    <ul className="mt-1.5 list-disc space-y-1 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/** Collapsible content guide shown at the top of an admin section. */
export function AdminGuide({ section }: { section: SectionGuideKey }) {
  const guide = SECTION_GUIDES[section];

  return (
    <details className="group mt-4 rounded-xl border border-primary-200 bg-primary-50 text-sm leading-relaxed">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 font-semibold text-text-1 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400">
        <span>📋 คู่มือเนื้อหา: ควรใส่อะไรในหัวข้อนี้</span>
        <span aria-hidden className="text-primary-600 transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <div className="space-y-4 border-t border-primary-200 px-4 pb-4 pt-3 text-text-2">
        <p className="text-text-1">{guide.why}</p>
        <div>
          <p className="font-semibold text-text-1">✍️ ใส่อะไร (เรียงตามความสำคัญ)</p>
          <List items={guide.write} />
        </div>
        <div>
          <p className="font-semibold text-text-1">🎯 ทิศทาง</p>
          <p className="mt-1">{guide.direction}</p>
        </div>
        {guide.seo.length > 0 && (
          <div>
            <p className="font-semibold text-text-1">🔎 SEO</p>
            <List items={guide.seo} />
          </div>
        )}
        <div>
          <p className="font-semibold text-text-1">🏁 คู่แข่งทำอะไร</p>
          <p className="mt-1">{guide.benchmark}</p>
        </div>
        <div>
          <p className="font-semibold text-text-1">✅ เช็คลิสต์</p>
          <List items={guide.checklist} />
        </div>
        <Link
          href="/admin/playbook"
          className="inline-block rounded-sm font-semibold text-primary-600 outline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
        >
          ดูแผนรวมทั้งหมดในแผนเนื้อหา →
        </Link>
      </div>
    </details>
  );
}
