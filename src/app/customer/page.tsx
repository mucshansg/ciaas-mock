import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CustomerPortalIndex() {
  const customers = await prisma.customer.findMany({
    include: {
      business: { select: { name: true } },
      cards: { select: { id: true, last4: true, status: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="min-h-screen bg-ink-950">
      <div className="mx-auto max-w-3xl px-8 py-20">
        <p className="eyebrow text-lime-300">CUSTOMER PORTAL · MOCK SIGN-IN</p>
        <h1 className="mt-3 font-display text-5xl font-bold leading-[1] tracking-tightest">
          Who are you?
        </h1>
        <p className="mt-4 max-w-xl text-bone-300">
          In real life you'd enter your email, get an OTP, and sign in. For the mock,
          pick a customer.
        </p>

        <ul className="mt-10 space-y-2">
          {customers.map((c) => (
            <li key={c.id}>
              <Link
                href={`/customer/${c.id}`}
                className="flex items-center justify-between rounded-xl border border-ink-700 bg-ink-900 px-5 py-4 transition hover:border-lime-300"
              >
                <div>
                  <p className="font-semibold">{c.fullName}</p>
                  <p className="text-xs text-bone-400">
                    {c.business.name} · {c.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {c.cards.map((card) => (
                    <span
                      key={card.id}
                      className={`font-mono text-[11px] ${
                        card.status === "active"
                          ? "text-lime-300"
                          : card.status === "suspended"
                          ? "text-amber-300"
                          : "text-coral-300"
                      }`}
                    >
                      ••{card.last4}
                    </span>
                  ))}
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/"
          className="mt-12 inline-block font-mono text-[11px] tracking-eyebrow text-bone-400 hover:text-bone-200"
        >
          ← BACK
        </Link>
      </div>
    </main>
  );
}
