import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

const Body = z.object({
  status: z.enum(["active", "suspended", "terminated"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string; cardId: string }> }
) {
  const { businessId, cardId } = await params;
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const card = await prisma.card.findFirst({ where: { id: cardId, businessId } });
  if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 });

  // Once terminated, cards cannot transition (real-world behavior)
  if (card.status === "terminated") {
    return NextResponse.json(
      { error: "Card already terminated" },
      { status: 409 }
    );
  }

  const updated = await prisma.card.update({
    where: { id: card.id },
    data: { status: parsed.data.status },
  });

  await audit({
    businessId,
    actor: "Priya Shah",
    action: `card.${parsed.data.status}`,
    details: {
      cardId: card.id,
      previousStatus: card.status,
      newStatus: parsed.data.status,
    },
  });

  return NextResponse.json(updated);
}
