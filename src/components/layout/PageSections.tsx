import { Fragment, type ReactNode } from "react";

/** Renders a page's sections in the order (and subset) chosen in /admin/layout. */
export function PageSections({ order, blocks }: { order: string[]; blocks: Record<string, ReactNode> }) {
  return (
    <>
      {order.map((id) => (
        <Fragment key={id}>{blocks[id]}</Fragment>
      ))}
    </>
  );
}
