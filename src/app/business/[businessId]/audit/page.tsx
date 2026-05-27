import { prisma } from "@/lib/prisma";
import { formatRelativeTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AuditPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const events = await prisma.auditEvent.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="px-12 py-8">
      <div className="space-y-2">
        <p className="eyebrow text-lime-300">AUDIT LOG</p>
        <h1 className="font-display text-5xl font-bold tracking-tightest">
          Every state change.
        </h1>
        <p className="text-bone-300">
          Append-only. Every action that touches money or cards is recorded here.
        </p>
      </div>

      <div className="mt-10 card overflow-hidden p-0">
        {events.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-bone-400">
            Nothing logged yet.
          </p>
        ) : (
          <ul className="divide-y divide-ink-800">
            {events.map((e) => {
              let parsed: Record<string, unknown> = {};
              try {
                parsed = JSON.parse(e.details);
              } catch {}
              return (
                <li key={e.id} className="grid grid-cols-[160px_140px_1fr_140px] gap-6 px-6 py-3.5 text-sm">
                  <span className="font-mono text-xs text-bone-400">
                    {e.createdAt.toLocaleString()}
                  </span>
                  <span className="font-mono text-xs text-lime-300">{e.actor}</span>
                  <div>
                    <p className="font-mono text-xs font-semibold text-bone-100">
                      {e.action}
                    </p>
                    {Object.keys(parsed).length > 0 && (
                      <p className="mt-0.5 font-mono text-[11px] text-bone-400">
                        {JSON.stringify(parsed)}
                      </p>
                    )}
                  </div>
                  <span className="text-right font-mono text-xs text-bone-400">
                    {formatRelativeTime(e.createdAt)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
