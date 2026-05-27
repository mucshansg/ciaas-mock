import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

const Body = z.object({
  fullName: z.string().min(1).max(120),
  email: z.string().email(),
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
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const customer = await prisma.customer.create({
    data: { ...parsed.data, businessId },
  });

  await audit({
    businessId,
    actor: "Priya Shah",
    action: "customer.created",
    details: { customerId: customer.id, email: customer.email },
  });

  return NextResponse.json(customer);
}
