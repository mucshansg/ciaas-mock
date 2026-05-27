import { prisma } from "@/lib/prisma";
import { Pill, statusToPillKind } from "@/components/Pill";
import { formatMoney, formatRelativeTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function TransactionsPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const txns = await prisma.transaction.findMany({
    where: { businessId },
    include: { customer: true, card: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="px-12 py-8">
      <div className="space-y-2">
        <p className="eyebrow text-lime-300">TRANSACTIONS</p>
        <h1 className="font-display text-5xl font-bold tracking-tightest">
          {txns.length} authorizations.
        </h1>
        <p className="text-bone-300">All-time activity across every card.</p>
      </div>

      <div className="mt-10 card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-700">
            <tr className="text-left">
              <Th>MERCHANT</Th>
              <Th>CUSTOMER</Th>
              <Th>CARD</Th>
              <Th>AMOUNT</Th>
              <Th>STATUS</Th>
              <Th>WHEN</Th>
            </tr>
          </thead>
          <tbody>
            {txns.map((t) => (
              <tr key={t.id} className="border-t border-ink-800">
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-800 font-display text-sm font-bold">
                      {t.merchant.charAt(0)}
                    </div>
                    <span className="font-semibold">{t.merchant}</span>
                  </div>
                </td>
                <td className="px-6 py-3.5 text-bone-300">{t.customer.fullName}</td>
                <td className="px-6 py-3.5 font-mono text-xs text-bone-400">
                  ••{t.card.last4}
                </td>
                <td className="px-6 py-3.5 font-mono">
                  <span
                    className={
                      t.status === "declined"
                        ? "text-coral-300"
                        : t.amount < 0
                        ? "text-mint-300"
                        : "text-bone-50"
                    }
                  >
                    {t.amount < 0 ? "+ " : "− "}
                    {formatMoney(Math.abs(t.amount))}
                  </span>
                </td>
                <td className="px-6 py-3.5">
                  <Pill kind={statusToPillKind(t.status)}>
                    {t.status.toUpperCase()}
                  </Pill>
                  {t.declineReason && (
                    <p className="mt-1 text-[10px] text-bone-400">{t.declineReason}</p>
                  )}
                </td>
                <td className="px-6 py-3.5 font-mono text-xs text-bone-400">
                  {formatRelativeTime(t.createdAt)}
                </td>
              </tr>
            ))}
            {txns.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-bone-400">
                  No transactions yet. Have a customer simulate a purchase from the
                  customer portal.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
