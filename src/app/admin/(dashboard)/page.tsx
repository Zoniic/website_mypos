import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/adminAuth";

function StatIcon({ path }: { path: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="text-primary-600">
      <path d={path} stroke="currentColor" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS = {
  box: "M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8",
  tag: "M20 12l-8 8-9-9V3h8l9 9zM7 7h.01",
  users: "M17 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 20v-1a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  doc: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 2v6h6M9 13h6M9 17h6",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z",
  award: "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.21 13.89L7 23l5-3 5 3-1.21-9.12",
  handshake: "M11 17l-1.5-1.5a2.12 2.12 0 0 1 3-3L14 14l4-4M3 10l4-4 4 4M11 6l2-2 6 6-2 2",
  key: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
} as const;

export default async function AdminDashboardPage() {
  const [
    productCount,
    accessoryCount,
    referenceCount,
    contentCount,
    kbArticleCount,
    kbCategoryCount,
    trustLogoCount,
    partnerCount,
    userCount,
    session,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.accessory.count(),
    prisma.referenceCase.count(),
    prisma.pageContent.count(),
    prisma.kbArticle.count(),
    prisma.kbCategory.count(),
    prisma.trustLogo.count(),
    prisma.officialPartner.count(),
    prisma.adminUser.count(),
    getSessionUser(),
  ]);

  const cards = [
    { label: "Products", count: productCount, href: "/admin/products", icon: ICONS.box },
    { label: "Accessories", count: accessoryCount, href: "/admin/accessories", icon: ICONS.tag },
    { label: "Case Studies", count: referenceCount, href: "/admin/references", icon: ICONS.award },
    { label: "KB Articles", count: kbArticleCount, href: "/admin/kb-articles", icon: ICONS.book },
    { label: "KB Categories", count: kbCategoryCount, href: "/admin/kb-categories", icon: ICONS.book },
    { label: "Trust Logos", count: trustLogoCount, href: "/admin/trust-logos", icon: ICONS.users },
    { label: "Official Partners", count: partnerCount, href: "/admin/official-partners", icon: ICONS.handshake },
    { label: "Page Content Entries", count: contentCount, href: "/admin/content", icon: ICONS.doc },
    { label: "Admin Users", count: userCount, href: "/admin/admin-users", icon: ICONS.key },
  ];

  const quickActions = [
    { label: "New Product", href: "/admin/products/new" },
    { label: "New Accessory", href: "/admin/accessories/new" },
    { label: "New KB Article", href: "/admin/kb-articles/new" },
    { label: "New Case Study", href: "/admin/references/new" },
  ];

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-border bg-[image:var(--gradient-hero)] p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-text-2">
          {session ? `Welcome back, ${session.name}` : "Welcome"}
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-text-2">
          Edits here go live on the website immediately — no rebuild needed.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-button bg-[image:var(--gradient-primary)] outline-offset-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow-primary)] transition-transform hover:-translate-y-0.5"
          >
            + {action.label}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-2xl border border-border bg-surface-1 p-6 shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:border-border-strong hover:shadow-[var(--shadow-card-hover)]"
          >
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{card.count}</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 transition-colors group-hover:bg-primary-900/40">
                <StatIcon path={card.icon} />
              </span>
            </div>
            <p className="mt-1 text-sm text-text-2">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
