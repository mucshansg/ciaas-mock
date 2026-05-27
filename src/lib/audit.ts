import { prisma } from "./prisma";

export async function audit(params: {
  businessId: string;
  actor: string;
  action: string;
  details?: Record<string, unknown>;
}) {
  await prisma.auditEvent.create({
    data: {
      businessId: params.businessId,
      actor: params.actor,
      action: params.action,
      details: JSON.stringify(params.details ?? {}),
    },
  });
}
