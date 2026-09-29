import { Fragment, type ReactNode } from "react";
import { isEditMode } from "@/lib/editMode";
import { PAGE_LAYOUTS, getLayoutVariants, getStoredLayout, type PageKey } from "@/lib/pageLayout";

/**
 * Renders a page's sections in the order (and subset) chosen in /admin/layout.
 * In edit-on-site mode each section is wrapped so the on-page toolbar can move
 * or hide it, and the full layout (incl. hidden sections) is handed to it.
 */
export async function PageSections({
  order,
  blocks,
  page,
  variant,
}: {
  order: string[];
  blocks: Record<string, ReactNode>;
  page: PageKey;
  /** Solution/industry slug when the page can have its own layout. */
  variant?: string;
}) {
  if (!(await isEditMode())) {
    return (
      <>
        {order.map((id) => (
          <Fragment key={id}>{blocks[id]}</Fragment>
        ))}
      </>
    );
  }

  const own = variant ? (await getLayoutVariants(page))[variant] : undefined;
  const layout = {
    page,
    variant: variant ?? null,
    hasOwn: Boolean(own),
    items: own ?? (await getStoredLayout(page)),
    labels: Object.fromEntries(PAGE_LAYOUTS[page].sections.map((s) => [s.id, { label: s.label, locked: Boolean(s.locked) }])),
  };

  return (
    <>
      <div hidden id="edit-layout" data-layout={JSON.stringify(layout)} />
      {order.map((id) =>
        blocks[id] ? (
          <div key={id} data-edit-section={id}>
            {blocks[id]}
          </div>
        ) : null,
      )}
    </>
  );
}
