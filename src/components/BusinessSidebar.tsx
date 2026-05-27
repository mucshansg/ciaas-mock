"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { classNames } from "@/lib/format";

interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

export function BusinessSidebar({
  businessId,
  businessName,
}: {
  businessId: string;
  businessName: string;
}) {
  const pathname = usePathname();
  const base = `/business/${businessId}`;
  const items: NavItem[] = [
    { label: "Home", href: base },
    { label: "Customers", href: `${base}/customers` },
    { label: "Cards", href: `${base}/cards` },
    { label: "Transactions", href: `${base}/transactions` },
    { label: "Funding", href: `${base}/funding` },
    { label: "Audit log", href: `${base}/audit` },
  ];

  return (
    <aside className="flex w-60 flex-col gap-7 border-r border-ink-700 bg-ink-900 px-6 py-7">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-300">
          <div className="h-3 w-3 rounded-sm bg-ink-950" />
        </div>
        <span className="font-display text-xl font-bold tracking-tight">CIaaS</span>
      </div>

      <div className="rounded-xl bg-ink-800 p-3">
        <p className="font-mono text-[9px] tracking-eyebrow text-bone-400">WORKSPACE</p>
        <p className="mt-0.5 text-sm font-semibold">{businessName}</p>
      </div>

      <nav className="flex flex-col gap-0.5">
        <p className="px-3 pb-2 font-mono text-[10px] tracking-eyebrow text-bone-400">
          NAVIGATE
        </p>
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={classNames(
                "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition",
                active
                  ? "bg-ink-700 text-bone-50"
                  : "text-bone-300 hover:bg-ink-800 hover:text-bone-100"
              )}
            >
              <span className="flex items-center gap-3">
                <span
                  className={classNames(
                    "h-2 w-2 rounded-sm",
                    active ? "bg-lime-300" : "bg-ink-600"
                  )}
                />
                <span className={active ? "font-semibold" : "font-medium"}>
                  {item.label}
                </span>
              </span>
              {item.badge && (
                <span className="rounded-full bg-coral-500 px-1.5 py-0.5 font-mono text-[9px] font-bold text-bone-50">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center gap-2.5 rounded-xl bg-ink-800 p-3">
        <div className="h-7 w-7 rounded-full bg-lime-700" />
        <div>
          <p className="text-sm font-semibold">Priya Shah</p>
          <p className="font-mono text-[10px] text-bone-400">Operator</p>
        </div>
      </div>
    </aside>
  );
}
