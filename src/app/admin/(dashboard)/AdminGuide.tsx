import Link from "next/link";
import { ArrowRight, ChevronDown, ClipboardList, CircleCheck, Flag, PenLine, Search, Target, type LucideIcon } from "lucide-react";
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

function GuideHeading({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 font-semibold text-text-1">
      <Icon size={16} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-primary-600" />
      {children}
    </p>
  );
}

/** Collapsible content guide shown at the top of an admin section. */
export function AdminGuide({ section }: { section: SectionGuideKey }) {
  const guide = SECTION_GUIDES[section];

  return (
    <details className="group mt-4 rounded-xl border border-primary-200 bg-primary-50 text-sm leading-relaxed">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 font-semibold text-text-1 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400">
        <span className="flex items-center gap-2">
          <ClipboardList size={18} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-primary-600" />
          คู่มือเนื้อหา: ควรใส่อะไรในหัวข้อนี้
        </span>
        <ChevronDown size={18} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-primary-600 transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-4 border-t border-primary-200 px-4 pb-4 pt-3 text-text-2">
        <p className="text-text-1">{guide.why}</p>
        <div>
          <GuideHeading icon={PenLine}>ใส่อะไร (เรียงตามความสำคัญ)</GuideHeading>
          <List items={guide.write} />
        </div>
        <div>
          <GuideHeading icon={Target}>ทิศทาง</GuideHeading>
          <p className="mt-1">{guide.direction}</p>
        </div>
        {guide.seo.length > 0 && (
          <div>
            <GuideHeading icon={Search}>SEO</GuideHeading>
            <List items={guide.seo} />
          </div>
        )}
        <div>
          <GuideHeading icon={Flag}>คู่แข่งทำอะไร</GuideHeading>
          <p className="mt-1">{guide.benchmark}</p>
        </div>
        <div>
          <GuideHeading icon={CircleCheck}>เช็คลิสต์</GuideHeading>
          <List items={guide.checklist} />
        </div>
        <Link
          href="/admin/playbook"
          className="inline-flex items-center gap-1 rounded-sm font-semibold text-primary-600 outline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
        >
          ดูแผนรวมทั้งหมดในแผนเนื้อหา
          <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
        </Link>
      </div>
    </details>
  );
}
