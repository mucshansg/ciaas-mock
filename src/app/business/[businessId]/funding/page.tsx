import { prisma } from "@/lib/prisma";
import { Pill, statusToPillKind } from "@/components/Pill";
import { formatMoney, formatRelativeTime } from "@/lib/format";
import { FundingForm } from "./FundingForm";

export const dynamic = "force-dynamic";

export default async function FundingPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const business = await prisma.business.findUniqueOrThrow({ where: { id: businessId } });
  const fundings = await prisma.funding.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="px-12 py-8">
      <div className="space-y-2">
        <p className="eyebrow text-lime-300">FUNDING</p>
        <h1 className="font-display text-5xl font-bold tracking-tightest">
          Fund the program.
        </h1>
        <p className="text-bone-300">
          Wires reach the program balance after a same-name check.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <Th>SOURCE</Th>
                <Th>AMOUNT</Th>
                <Th>STATUS</Th>
                <Th>RECEIVED</Th>
              </tr>
            </thead>
            <tbody>
              {fundings.map((f) => (
                <tr key={f.id} className="border-t border-ink-800">
                  <td className="px-6 py-3.5">{f.source}</td>
                  <td className="px-6 py-3.5 font-mono">{formatMoney(f.amount)}</td>
                  <td className="px-6 py-3.5">
                    <Pill kind={statusToPillKind(f.status)}>{f.status.toUpperCase()}</Pill>
                    {f.holdReason && (
                      <p className="mt-1 text-[10px] text-bone-400">{f.holdReason}</p>
                    )}
                  </td>
                  <td className="px-6 py-3.5 font-mono text-xs text-bone-400">
                    {formatRelativeTime(f.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <FundingForm businessId={businessId} businessName={business.name} />
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
