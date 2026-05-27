import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

const Body = z.object({
  reason: z.string().min(1).max(80),
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
    include: { customer: true, business: true },
  });
  if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 });
  if (card.status === "terminated") {
    return NextResponse.json({ error: "Card already terminated" }, { status: 409 });
  }

  const updated = await prisma.card.update({
    where: { id: cardId },
    data: { status: "suspended" },
  });

  await prisma.alert.create({
    data: {
      businessId: card.businessId,
      kind: "bad",
      title: `${card.customer.fullName} reported card ••${card.last4}`,
      body: `Reason: ${parsed.data.reason.replaceAll("_", " ")}. Card suspended automatically. Review and confirm next action.`,
    },
  });

  await audit({
    businessId: card.businessId,
    actor: card.customer.fullName,
    action: "card.reported_lost",
    details: {
      cardId: card.id,
      reason: parsed.data.reason,
    },
  });

  return NextResponse.json(updated);
}
