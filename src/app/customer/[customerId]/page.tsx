import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CustomerPortal } from "./CustomerPortal";

export const dynamic = "force-dynamic";

export default async function CustomerPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      business: true,
      cards: { orderBy: { createdAt: "desc" } },
      transactions: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!customer) notFound();

  const card = customer.cards[0] ?? null;

  return (
    <CustomerPortal
      customer={{
        id: customer.id,
        fullName: customer.fullName,
        email: customer.email,
        businessName: customer.business.name,
      }}
      card={
        card
          ? {
              id: card.id,
              last4: card.last4,
              fullPan: card.fullPan,
              cvv: card.cvv,
              expMonth: card.expMonth,
              expYear: card.expYear,
              status: card.status,
              spendLimit: card.spendLimit,
            }
          : null
      }
      transactions={customer.transactions.map((t) => ({
        id: t.id,
        merchant: t.merchant,
        amount: t.amount,
        status: t.status,
        createdAt: t.createdAt.toISOString(),
        declineReason: t.declineReason,
      }))}
    />
  );
}
