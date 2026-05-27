import { prisma } from "@/lib/prisma";
import { VirtualCard } from "@/components/VirtualCard";
import { CardActions } from "./CardActions";
import { formatMoneyBare } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CardsPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const business = await prisma.business.findUniqueOrThrow({ where: { id: businessId } });
  const cards = await prisma.card.findMany({
    where: { businessId },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="px-12 py-8">
      <div className="space-y-2">
        <p className="eyebrow text-lime-300">CARDS</p>
        <h1 className="font-display text-5xl font-bold tracking-tightest">
          {cards.length} virtual cards.
        </h1>
        <p className="text-bone-300">All cards issued under {business.name}.</p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <div key={c.id} className="card space-y-5">
            <VirtualCard
              brand={business.name.split(" ")[0]}
              last4={c.last4}
              cardholder={c.customer.fullName}
              expMonth={c.expMonth}
              expYear={c.expYear}
              status={c.status}
            />
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono tracking-eyebrow text-bone-400">
                SPEND LIMIT
              </span>
              <span className="font-mono text-bone-50">
                ${formatMoneyBare(c.spendLimit)}
              </span>
            </div>
            <CardActions businessId={businessId} cardId={c.id} status={c.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
