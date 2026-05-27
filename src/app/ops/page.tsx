import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Pill, statusToPillKind } from "@/components/Pill";
import { formatMoney, formatRelativeTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OpsConsole() {
  const [businesses, cards, recentEvents] = await Promise.all([
    prisma.business.findMany({
      include: {
        _count: { select: { customers: true, cards: true, transactions: true } },
      },
    }),
    prisma.card.findMany({
      include: { customer: true, business: true },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.auditEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { business: true },
    }),
  ]);

  return (
    <div className="min-h-screen bg-ink-950">
      {/* Top bar — coral mark distinguishes INTERNAL from customer-facing */}
      <header className="flex items-center justify-between border-b border-ink-700 bg-ink-900 px-8 py-4">
        <div className="flex items-center gap-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-coral-500">
            <div className="h-3 w-3 rounded-sm bg-ink-950" />
          </div>
          <span className="font-mono text-sm font-bold tracking-eyebrow">
            CIaaS / OPS
          </span>
          <span className="pill bg-coral-700 text-coral-300">
            <span className="pill-dot bg-coral-300" />
            INTERNAL
          </span>
        </div>
        <div className="flex items-center gap-4 font-mono text-xs">
          <span className="tracking-eyebrow text-bone-300">REVIEWER: ARI N.</span>
          <Link href="/" className="text-bone-400 hover:text-bone-200">
            ← HOME
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-8 py-10">
        <div className="space-y-2">
          <p className="eyebrow text-coral-300">OPS CONSOLE</p>
          <h1 className="font-display text-5xl font-bold tracking-tightest">
            Cross-business view.
          </h1>
          <p className="text-bone-300">
            Every tenant. Every card. Every state transition. Read-only by design (mock).
          </p>
        </div>

        {/* Tenants */}
        <section className="mt-10">
          <h2 className="mb-4 font-mono text-[11px] tracking-eyebrow text-bone-400">
            TENANTS
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {businesses.map((b) => (
              <Link
                key={b.id}
                href={`/business/${b.id}`}
                className="card flex items-center justify-between transition hover:border-lime-300"
              >
                <div>
                  <p className="font-display text-xl font-medium">{b.name}</p>
                  <p className="mt-1 text-xs text-bone-400">
                    {b.industry} ·{" "}
                    <span className="font-mono">
                      {b._count.customers} customers
                    </span>{" "}
                    ·{" "}
                    <span className="font-mono">{b._count.cards} cards</span> ·{" "}
                    <span className="font-mono">
                      {b._count.transactions} txns
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[10px] tracking-eyebrow text-bone-400">
                    PROGRAM BALANCE
                  </p>
                  <p className="stat-num text-2xl">{formatMoney(b.programBalance)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* All cards */}
        <section className="mt-12">
          <h2 className="mb-4 font-mono text-[11px] tracking-eyebrow text-bone-400">
            CARDS — ALL TENANTS
          </h2>
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <Th>CARDHOLDER</Th>
                  <Th>BUSINESS</Th>
                  <Th>CARD</Th>
                  <Th>STATUS</Th>
                  <Th>ISSUED</Th>
                </tr>
              </thead>
              <tbody>
                {cards.map((c) => (
                  <tr key={c.id} className="border-t border-ink-800">
                    <td className="px-6 py-3.5">{c.customer.fullName}</td>
                    <td className="px-6 py-3.5 text-bone-300">{c.business.name}</td>
                    <td className="px-6 py-3.5 font-mono text-xs text-bone-400">
                      ••{c.last4}
                    </td>
                    <td className="px-6 py-3.5">
                      <Pill kind={statusToPillKind(c.status)}>
                        {c.status.toUpperCase()}
                      </Pill>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-xs text-bone-400">
                      {formatRelativeTime(c.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Audit feed */}
        <section className="mt-12">
          <h2 className="mb-4 font-mono text-[11px] tracking-eyebrow text-bone-400">
            AUDIT — CROSS-TENANT FEED
          </h2>
          <div className="card overflow-hidden p-0">
            <ul className="divide-y divide-ink-800">
              {recentEvents.map((e) => {
                let payload: Record<string, unknown> = {};
                try {
                  payload = JSON.parse(e.details);
                } catch {}
                return (
                  <li
                    key={e.id}
                    className="grid grid-cols-[160px_180px_140px_1fr_140px] gap-4 px-6 py-3 text-sm"
                  >
                    <span className="font-mono text-xs text-bone-400">
                      {e.createdAt.toLocaleString()}
                    </span>
                    <span className="text-xs text-indigo-300">{e.business.name}</span>
                    <span className="font-mono text-xs text-lime-300">{e.actor}</span>
                    <div>
                      <p className="font-mono text-xs font-semibold text-bone-100">
                        {e.action}
                      </p>
                      {Object.keys(payload).length > 0 && (
                        <p className="mt-0.5 font-mono text-[10px] text-bone-400">
                          {JSON.stringify(payload)}
                        </p>
                      )}
                    </div>
                    <span className="text-right font-mono text-xs text-bone-400">
                      {formatRelativeTime(e.createdAt)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-4 font-mono text-[10px] tracking-eyebrow text-bone-400">
      {children}
    </th>
  );
}
