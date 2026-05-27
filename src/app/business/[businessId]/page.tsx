import { prisma } from "@/lib/prisma";
import { formatMoney, formatMoneyBare, formatRelativeTime } from "@/lib/format";
import { Pill, statusToPillKind } from "@/components/Pill";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BusinessHome({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;

  const [business, txns, alerts, cards, totalCards, activeCards] = await Promise.all([
    prisma.business.findUniqueOrThrow({ where: { id: businessId } }),
    prisma.transaction.findMany({
      where: { businessId },
      include: { customer: true, card: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.alert.findMany({
      where: { businessId, dismissedAt: null },
      orderBy: { createdAt: "desc" },
    }),
    prisma.card.findMany({
      where: { businessId },
      include: { customer: true },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    prisma.card.count({ where: { businessId } }),
    prisma.card.count({ where: { businessId, status: "active" } }),
  ]);

  // Available = program balance minus outstanding card spend limits roughly
  const onCards = await prisma.card.aggregate({
    where: { businessId, status: "active" },
    _sum: { spendLimit: true },
  });
  const cardsTotal = onCards._sum.spendLimit ?? 0;
  const available = Math.max(0, business.programBalance - cardsTotal);

  return (
    <div className="px-12 py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-bone-400">
          <span>Workspace</span>
          <span>/</span>
          <span className="font-medium text-bone-100">Home</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-ink-700 bg-ink-900 px-4 py-2 text-sm text-bone-400">
            <SearchIcon />
            Search customers, cards, transactions…
          </div>
          <Link href={`/business/${businessId}/customers`} className="btn-primary">
            + New customer
          </Link>
        </div>
      </div>

      {/* Heading */}
      <div className="mt-8 space-y-2">
        <div className="flex items-center gap-3">
          <p className="eyebrow text-lime-300">DASHBOARD</p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-800 px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-mint-500" />
            <span className="font-mono text-[9px] font-bold tracking-eyebrow text-mint-300">
              PROGRAM LIVE
            </span>
          </span>
        </div>
        <h1 className="font-display text-5xl font-bold tracking-tightest">
          Good morning, Priya.
        </h1>
        <p className="text-bone-300">
          Here's what's happening across your card program today.
        </p>
      </div>

      {/* KPIs */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiBig
          label="PROGRAM BALANCE"
          value={`$${formatMoneyBare(business.programBalance)}`}
          sub="+ $25,000 funded · 2h ago"
        />
        <Kpi
          label="AVAILABLE"
          value={`$${formatMoneyBare(available)}`}
          sub={`$${formatMoneyBare(cardsTotal)} on cards`}
        />
        <Kpi label="ACTIVE CARDS" value={String(activeCards)} sub={`${totalCards} total`} />
        <Kpi label="AUTH APPROVAL" value="99.6%" sub="Last 30 days" />
      </div>

      {/* Two-column */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Activity */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-medium tracking-tight">
                Recent activity
              </h2>
              <p className="mt-1 text-sm text-bone-400">
                Last 24 hours · {txns.length} events shown
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Tab active>All</Tab>
              <Tab>Authorizations</Tab>
              <Tab>Declines</Tab>
              <Tab>Funding</Tab>
            </div>
          </div>
          <hr className="my-5 border-ink-700" />
          {txns.length === 0 ? (
            <p className="py-12 text-center text-sm text-bone-400">
              No activity yet. Issue a card to your first customer and simulate a
              purchase.
            </p>
          ) : (
            <div className="divide-y divide-ink-800">
              {txns.map((t) => (
                <div key={t.id} className="flex items-center gap-4 py-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-800 font-display text-base font-bold">
                    {t.merchant.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{t.merchant}</p>
                    <p className="text-xs text-bone-400">
                      {t.customer.fullName} · ••{t.card.last4}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-mono text-[15px] font-medium ${
                        t.status === "declined" ? "text-coral-300" : "text-bone-50"
                      }`}
                    >
                      {t.amount < 0 ? "+ " : "− "}
                      {formatMoney(Math.abs(t.amount))}
                    </p>
                    <div className="mt-1 flex items-center justify-end gap-2">
                      <Pill kind={statusToPillKind(t.status)}>{t.status.toUpperCase()}</Pill>
                      <span className="font-mono text-[11px] text-bone-400">
                        {formatRelativeTime(t.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Side */}
        <div className="flex flex-col gap-6">
          <FundingCard businessName={business.name} />
          <div className="card">
            <h2 className="font-display text-lg font-medium">Alerts</h2>
            <div className="mt-3 space-y-2.5">
              {alerts.map((a) => (
                <div key={a.id} className="flex gap-3 rounded-xl bg-ink-800 p-3">
                  <div
                    className={`h-9 w-[3px] shrink-0 rounded-sm ${
                      a.kind === "warn"
                        ? "bg-amber-500"
                        : a.kind === "bad"
                        ? "bg-coral-500"
                        : "bg-indigo-500"
                    }`}
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{a.title}</p>
                    <p className="text-xs leading-relaxed text-bone-300">{a.body}</p>
                  </div>
                </div>
              ))}
              {alerts.length === 0 && (
                <p className="text-xs text-bone-400">No active alerts.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cards in circulation */}
      <div className="mt-6 card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-medium tracking-tight">
              Cards in circulation
            </h2>
            <p className="mt-1 text-sm text-bone-400">
              {activeCards} active · {totalCards - activeCards} suspended or terminated
            </p>
          </div>
          <Link
            href={`/business/${businessId}/cards`}
            className="rounded-lg border border-ink-700 px-3 py-2 text-xs font-semibold text-bone-100 hover:bg-ink-800"
          >
            View all →
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {cards.map((c) => (
            <MiniCard
              key={c.id}
              name={c.customer.fullName}
              last4={c.last4}
              status={c.status}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900 p-6">
      <p className="eyebrow">{label}</p>
      <p className="mt-3 stat-num text-4xl">{value}</p>
      <p className="mt-2 font-mono text-xs text-bone-300">{sub}</p>
    </div>
  );
}

function KpiBig({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl bg-lime-300 p-6 text-ink-950">
      <p className="font-mono text-[11px] font-bold tracking-eyebrow text-ink-700">
        {label}
      </p>
      <p className="mt-3 stat-num text-4xl">{value}</p>
      <p className="mt-2 font-mono text-xs text-ink-700">{sub}</p>
    </div>
  );
}

function Tab({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span
      className={`rounded-lg px-3 py-1.5 text-xs ${
        active ? "bg-ink-700 font-semibold text-bone-50" : "text-bone-400"
      }`}
    >
      {children}
    </span>
  );
}

function MiniCard({
  name,
  last4,
  status,
}: {
  name: string;
  last4: string;
  status: string;
}) {
  const active = status === "active";
  return (
    <div
      className={`rounded-2xl p-4 ${
        active
          ? "bg-lime-300 text-ink-950"
          : "border border-ink-700 bg-ink-800 text-bone-50"
      } ${status === "suspended" ? "border-amber-500" : ""}`}
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-semibold">{name}</span>
        <Pill kind={statusToPillKind(status)}>{status.toUpperCase()}</Pill>
      </div>
      <p
        className={`mt-3 font-mono text-sm tracking-widest ${
          active ? "text-ink-700" : "text-bone-400"
        }`}
      >
        •• {last4}
      </p>
    </div>
  );
}

function FundingCard({ businessName }: { businessName: string }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-medium">Fund program</h2>
        <Pill kind="info">WIRE · ACH</Pill>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-bone-300">
        Funds reach your program balance same-day if your wire is received before 5pm ET.
      </p>
      <div className="mt-3 space-y-2.5 rounded-xl bg-ink-800 p-4">
        <Detail label="ACCOUNT NAME" value={`${businessName}, Inc.`} />
        <Detail label="ROUTING" value="026 073 008" mono />
        <Detail label="ACCOUNT" value="8400 2255 1180" mono />
        <Detail label="BANK" value="Pinnacle Trust Bank" />
      </div>
      <div className="mt-3 flex gap-2">
        <button className="btn-secondary flex-1">Copy details</button>
        <button className="btn-ghost flex-1">Request refund</button>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="font-mono tracking-eyebrow text-bone-400">{label}</span>
      <span
        className={`text-sm font-semibold text-bone-100 ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor">
      <circle cx="6" cy="6" r="4" strokeWidth="1.5" />
      <path d="m13 13-3.5-3.5" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
