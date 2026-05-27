import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { mockAuthorize } from "@/lib/mockIssuer";
import { audit } from "@/lib/audit";

const Body = z.object({
  merchant: z.string().min(1).max(80),
  amount: z.number().int().positive().max(50_000_000),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const { cardId } = await params;
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { business: true, customer: true },
  });
  if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 });

  const decision = mockAuthorize({
    cardStatus: card.status,
    amount: parsed.data.amount,
    programBalance: card.business.programBalance,
    cardSpendLimit: card.spendLimit,
  });

  if (decision.decision === "approved") {
    // Atomic-ish: decrement program balance, decrement card limit, write txn
    const txn = await prisma.$transaction(async (tx) => {
      await tx.business.update({
        where: { id: card.businessId },
        data: { programBalance: { decrement: parsed.data.amount } },
      });
      await tx.card.update({
        where: { id: card.id },
        data: { spendLimit: { decrement: parsed.data.amount } },
      });
      return tx.transaction.create({
        data: {
          businessId: card.businessId,
          cardId: card.id,
          customerId: card.customerId,
          merchant: parsed.data.merchant,
          amount: parsed.data.amount,
          status: "captured",
        },
      });
    });

    await audit({
      businessId: card.businessId,
      actor: card.customer.fullName,
      action: "txn.captured",
      details: {
        transactionId: txn.id,
        cardId: card.id,
        merchant: parsed.data.merchant,
        amount: parsed.data.amount,
      },
    });

    return NextResponse.json(txn);
  } else {
    const txn = await prisma.transaction.create({
      data: {
        businessId: card.businessId,
        cardId: card.id,
        customerId: card.customerId,
        merchant: parsed.data.merchant,
        amount: parsed.data.amount,
        status: "declined",
        declineReason: decision.reason ?? null,
      },
    });
    await audit({
      businessId: card.businessId,
      actor: card.customer.fullName,
      action: "txn.declined",
      details: {
        transactionId: txn.id,
        cardId: card.id,
        merchant: parsed.data.merchant,
        amount: parsed.data.amount,
        reason: decision.reason,
      },
    });
    return NextResponse.json(txn, { status: 200 });
  }
}
