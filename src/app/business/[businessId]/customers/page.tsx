import { prisma } from "@/lib/prisma";
import { Pill } from "@/components/Pill";
import { IssueCardForm } from "./IssueCardForm";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const customers = await prisma.customer.findMany({
    where: { businessId },
    include: {
      cards: { select: { id: true, last4: true, status: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="px-12 py-8">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <p className="eyebrow text-lime-300">CUSTOMERS</p>
          <h1 className="font-display text-5xl font-bold tracking-tightest">
            {customers.length} cardholders.
          </h1>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-6 py-4 font-mono text-[10px] tracking-eyebrow text-bone-400">
                  CUSTOMER
                </th>
                <th className="px-6 py-4 font-mono text-[10px] tracking-eyebrow text-bone-400">
                  EMAIL
                </th>
                <th className="px-6 py-4 font-mono text-[10px] tracking-eyebrow text-bone-400">
                  CARDS
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-t border-ink-800">
                  <td className="px-6 py-4">
                    <p className="font-semibold">{c.fullName}</p>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-bone-300">
                    {c.email}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {c.cards.length === 0 ? (
                        <span className="text-xs text-bone-400">No cards yet</span>
                      ) : (
                        c.cards.map((card) => (
                          <Pill
                            key={card.id}
                            kind={
                              card.status === "active"
                                ? "ok"
                                : card.status === "suspended"
                                ? "warn"
                                : "bad"
                            }
                          >
                            ••{card.last4}
                          </Pill>
                        ))
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <IssueCardForm businessId={businessId} customers={customers} />
      </div>
    </div>
  );
}
