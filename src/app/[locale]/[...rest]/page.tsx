import { notFound } from "next/navigation";

// Unmatched URLs under a locale otherwise fall through to Next's unstyled
// root 404. Routing them here renders [locale]/not-found.tsx inside the site
// layout. notFound() runs before any await so the response keeps a real 404
// status instead of being streamed as a 200.
export default function CatchAllPage() {
  notFound();
}
