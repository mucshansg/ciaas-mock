import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

const Body = z.object({
  source: z.string().min(1).max(120),
  amount: z.number().int().positive().max(50_000_000),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const { businessId } = await params;
  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business)
    return NextResponse.json({ error: "Business not found" }, { status: 404 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  // Same-name check: simple normalized comparison
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\b(inc|llc|corp|corporation|co|ltd)\b/g, "")
      .trim();
  const matches = norm(parsed.data.source) === norm(business.name);

  const funding = await prisma.funding.create({
    data: {
      businessId,
      source: parsed.data.source,
      amount: parsed.data.amount,
      status: matches ? "settled" : "held",
      holdReason: matches
        ? null
        : `Sender "${parsed.data.source}" does not match registered name "${business.name}".`,
    },
  });

  if (matches) {
    await prisma.business.update({
      where: { id: businessId },
      data: { programBalance: { increment: parsed.data.amount } },
    });
    await audit({
      businessId,
      actor: "system",
      action: "funding.settled",
      details: { fundingId: funding.id, amount: parsed.data.amount },
    });
  } else {
    await prisma.alert.create({
      data: {
        businessId,
        kind: "warn",
        title: "Funding held — name mismatch",
        body: `Wire $${(parsed.data.amount / 100).toFixed(2)} from ${
          parsed.data.source
        } held for compliance review.`,
      },
    });
    await audit({
      businessId,
      actor: "system",
      action: "funding.held",
      details: {
        fundingId: funding.id,
        amount: parsed.data.amount,
        reason: "name_mismatch",
      },
    });
  }

  return NextResponse.json(funding);
}
