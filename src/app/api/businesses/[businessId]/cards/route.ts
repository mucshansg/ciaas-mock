import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { mockIssueCard } from "@/lib/mockIssuer";
import { audit } from "@/lib/audit";

const Body = z.object({
  customerId: z.string(),
  spendLimit: z.number().int().positive().max(50_000_000),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const { businessId } = await params;
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const customer = await prisma.customer.findFirst({
    where: { id: parsed.data.customerId, businessId },
  });
  if (!customer)
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  // Call the mock issuer
  const issued = mockIssueCard();

  const card = await prisma.card.create({
    data: {
      businessId,
      customerId: customer.id,
      issuerCardId: issued.id,
      last4: issued.last4,
      expMonth: issued.expMonth,
      expYear: issued.expYear,
      fullPan: issued.fullPan,
      cvv: issued.cvv,
      spendLimit: parsed.data.spendLimit,
      status: "active",
    },
  });

  await audit({
    businessId,
    actor: "Priya Shah",
    action: "card.issued",
    details: {
      cardId: card.id,
      customerId: customer.id,
      last4: card.last4,
      spendLimit: card.spendLimit,
    },
  });

  return NextResponse.json(card);
}
