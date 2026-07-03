import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [productCount, accessoryCount, referenceCount, contentCount] = await Promise.all([
    prisma.product.count(),
    prisma.accessory.count(),
    prisma.referenceCase.count(),
    prisma.pageContent.count(),
  ]);

  const cards = [
    { label: "Products", count: productCount, href: "/admin/products" },
    { label: "Accessories", count: accessoryCount, href: "/admin/accessories" },
    { label: "Case Studies", count: referenceCount, href: "/admin/references" },
    { label: "Page Content Entries", count: contentCount, href: "/admin/content" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-text-2">
        Edits here go live on the website immediately — no rebuild needed.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-2xl border border-border bg-surface-1 p-6 transition-colors hover:border-border-strong"
          >
            <p className="text-3xl font-bold">{card.count}</p>
            <p className="mt-1 text-sm text-text-2">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
