"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_ICONS, ADMIN_NAV, findNavItem, type AdminNavItem, type BadgeKey } from "./adminNav";

export function AdminIcon({ name, className = "" }: { name: keyof typeof ADMIN_ICONS; className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className={`shrink-0 ${className}`}>
      <path d={ADMIN_ICONS[name]} stroke="currentColor" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NavLink({ item, active, count, onNavigate }: { item: AdminNavItem; active: boolean; count?: number; onNavigate?: () => void }) {
  const className = `flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm outline-offset-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 ${
    active ? "bg-primary-50 font-semibold text-primary-700" : "text-text-2 hover:bg-surface-2 hover:text-text-1"
  }`;
  const body = (
    <>
      <AdminIcon name={item.icon} className={active ? "text-primary-600" : "text-text-3"} />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {count ? (
        <span className="rounded-full bg-primary-600 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white tabular-nums">{count}</span>
      ) : null}
    </>
  );
  // Edit-on-site is a route handler that sets a cookie: full-page link, no prefetch.
  return item.external ? (
    <a href={item.href} className={className} onClick={onNavigate}>
      {body}
    </a>
  ) : (
    <Link href={item.href} className={className} aria-current={active ? "page" : undefined} onClick={onNavigate}>
      {body}
    </Link>
  );
}

function Nav({ badges, onNavigate }: { badges: Record<BadgeKey, number>; onNavigate?: () => void }) {
  const pathname = usePathname();
  const current = findNavItem(pathname)?.item.href;
  return (
    <nav className="space-y-5" aria-label="เมนูหลังบ้าน">
      {ADMIN_NAV.map((group) => (
        <div key={group.title}>
          <p className="px-2.5 pb-1 text-xs font-semibold text-text-3">{group.title}</p>
          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item.href}>
                <NavLink item={item} active={item.href === current} count={item.badge ? badges[item.badge] : undefined} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Account({ name, email }: { name?: string; email?: string }) {
  return (
    <div className="border-t border-border pt-4">
      {name && (
        <p className="truncate px-2.5 text-xs text-text-2" title={email}>
          เข้าสู่ระบบเป็น <span className="font-medium text-text-1">{name}</span>
        </p>
      )}
      <div className="mt-2 flex gap-2 px-2.5">
        <a href="/th" target="_blank" rel="noopener noreferrer" className="flex-1 rounded-lg border border-border-strong px-3 py-1.5 text-center text-xs text-text-2 hover:bg-surface-2">
          ดูหน้าเว็บ ↗
        </a>
        <form action="/admin/logout" method="post" className="flex-1">
          <button type="submit" className="w-full rounded-lg border border-border-strong px-3 py-1.5 text-xs text-text-2 hover:bg-surface-2">
            ออกจากระบบ
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminShell({
  children,
  badges,
  userName,
  userEmail,
}: {
  children: React.ReactNode;
  badges: Record<BadgeKey, number>;
  userName?: string;
  userEmail?: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const here = findNavItem(pathname);
  const pending = Object.values(badges).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-surface-0 lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-bg lg:flex">
        <Link href="/admin" className="flex items-center gap-2 px-5 pb-4 pt-5">
          {/* eslint-disable-next-line @next/next/no-img-element -- tiny static logo */}
          <img src="/images/brand/logo.png" alt="MYPOS" className="h-5 w-auto" />
          <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[11px] font-semibold text-text-2">หลังบ้าน</span>
        </Link>
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <Nav badges={badges} />
        </div>
        <div className="px-3 pb-4">
          <Account name={userName} email={userEmail} />
        </div>
      </aside>

      {/* Mobile top bar + drawer */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-bg px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-border-strong px-3 py-1.5 text-sm"
          aria-expanded={open}
          aria-controls="admin-mobile-nav"
        >
          <AdminIcon name="menu" />
          เมนู
          {pending > 0 && <span className="rounded-full bg-primary-600 px-1.5 text-[11px] font-semibold text-white">{pending}</span>}
        </button>
        <p className="truncate text-sm font-semibold">{here?.item.label ?? "หลังบ้าน"}</p>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" id="admin-mobile-nav">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label="ปิดเมนู" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-xs flex-col bg-bg shadow-xl">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="font-semibold">หลังบ้าน MYPOS</span>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-2 py-1 text-text-2 hover:bg-surface-2" aria-label="ปิดเมนู">
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-4">
              <Nav badges={badges} onNavigate={() => setOpen(false)} />
            </div>
            <div className="px-3 pb-4">
              <Account name={userName} email={userEmail} />
            </div>
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">
          {here && here.item.href !== "/admin" && (
            <p className="mb-1 text-xs font-medium text-text-3">
              {here.group.title} › {here.item.label}
            </p>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
