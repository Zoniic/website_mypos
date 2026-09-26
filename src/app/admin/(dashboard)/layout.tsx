import Link from "next/link";
import { getSessionUser } from "@/lib/adminAuth";

// Every page here reads live data straight from MySQL; never prerender it.
export const dynamic = "force-dynamic";

const navLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/launch", label: "🚀 Launch Checklist" },
  { href: "/admin/playbook", label: "📋 Content Playbook" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/accessories", label: "Accessories" },
  { href: "/admin/references", label: "Case Studies" },
  { href: "/admin/blog", label: "Blog Posts" },
  { href: "/admin/careers", label: "Careers" },
  { href: "/admin/kb-categories", label: "KB Categories" },
  { href: "/admin/kb-articles", label: "KB Articles" },
  { href: "/admin/content", label: "Page Content" },
  { href: "/admin/layout-editor", label: "Page Layout" },
  { href: "/admin/navigation", label: "Navigation" },
  { href: "/admin/photos", label: "Site Photos" },
  { href: "/admin/trust-logos", label: "Trust Logos" },
  { href: "/admin/official-partners", label: "Official Partners" },
  { href: "/admin/contact-messages", label: "Contact Messages" },
  { href: "/admin/quote-requests", label: "Quote Requests" },
  { href: "/admin/warranty-claims", label: "Warranty Claims" },
  { href: "/admin/newsletter", label: "Newsletter Subscribers" },
  { href: "/admin/settings", label: "Site Settings" },
  { href: "/admin/admin-users", label: "Admin Users" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionUser();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 border-r border-border bg-surface-0 p-4 sm:block">
        <div className="text-lg font-bold">MYPOS Admin</div>
        <nav className="mt-6 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-text-2 outline-offset-2 transition-colors hover:bg-surface-2 hover:text-text-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 border-t border-border pt-4">
          {session && (
            <p className="truncate px-3 text-xs text-text-2" title={session.email}>
              Signed in as <span className="font-medium text-text-1">{session.name}</span>
            </p>
          )}
          <form action="/admin/logout" method="post" className="mt-3">
            <button
              type="submit"
              className="w-full rounded-lg border border-border-strong px-3 py-2 text-sm text-text-2 outline-offset-2 transition-colors hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
            >
              Log out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-6 sm:p-8">{children}</main>
    </div>
  );
}
