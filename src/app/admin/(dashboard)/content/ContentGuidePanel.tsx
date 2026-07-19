import { CONTENT_GUIDE, type ContentGuideEntry } from "./contentGuide";

export function getContentGuide(
  namespace: string,
  key: string
): ContentGuideEntry | undefined {
  return CONTENT_GUIDE[namespace]?.[key];
}

/** Inline editorial guidance for a single content field, shown in the admin editor. */
export function ContentGuidePanel({ entry }: { entry: ContentGuideEntry }) {
  return (
    <div className="mt-2 rounded-lg border border-primary-200 bg-primary-50 p-3 text-xs leading-relaxed">
      <p className="flex gap-1.5 text-text-1">
        <span aria-hidden="true">✍️</span>
        <span>{entry.what}</span>
      </p>
      <p className="mt-1.5 pl-5 text-text-2">
        <span className="font-semibold text-text-1">ตัวอย่าง: </span>
        <span className="italic">{entry.example}</span>
      </p>
      {entry.image ? (
        <p className="mt-1.5 flex gap-1.5 border-t border-primary-200 pt-1.5 text-text-2">
          <span aria-hidden="true">🖼️</span>
          <span>
            <span className="font-semibold text-text-1">ภาพประกอบ: </span>
            {entry.image}
          </span>
        </p>
      ) : null}
    </div>
  );
}
