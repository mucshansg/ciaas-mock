import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Pick a default business so the operator dashboard link is clickable
  const business = await prisma.business.findFirst({ where: { id: "biz_northwind" } });

  return (
    <main className="min-h-screen bg-ink-950 text-bone-50">
      <div className="mx-auto max-w-6xl px-8 py-20">
        <div className="space-y-4">
          <p className="eyebrow text-lime-300">CIaaS · MOCK · v0.1</p>
          <h1 className="font-display text-6xl font-bold leading-[0.95] tracking-tightest md:text-8xl">
            Card issuance
            <br />
            <span className="text-lime-300">in motion.</span>
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-bone-300">
            A click-through prototype of the CIaaS platform — three surfaces, one fake
            issuer, no real money. Use it to feel the workflows before we commit to the
            real build.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Surface
            label="01 · Business"
            title="Operator dashboard"
            body="Issue cards, watch authorizations land, fund the program, see alerts."
            href={`/business/${business?.id ?? "biz_northwind"}`}
            cta="Enter dashboard"
            accent
          />
          <Surface
            label="02 · End customer"
            title="Customer portal"
            body="Sign in with OTP, view card details, simulate a purchase, report the card lost."
            href="/customer"
            cta="Enter portal"
          />
          <Surface
            label="03 · Internal"
            title="Ops console"
            body="Cross-business search, audit trail, suspend/reactivate, force-decline scenarios."
            href="/ops"
            cta="Enter ops"
          />
        </div>

        <div className="mt-20 grid grid-cols-1 gap-4 md:grid-cols-2">
          <NoteCard title="What's mocked">
            KYC/KYB is skipped entirely. The issuer is a local module that returns fake
            PANs and decides auths in process. There is no real auth or session — pick a
            user from a list. SQLite holds all state.
          </NoteCard>
          <NoteCard title="What's real">
            Tenant-scoped data model. State machines for cards (active → suspended →
            terminated). Append-only audit log. Idempotent decision logic mirroring how a
            real issuer would behave.
          </NoteCard>
        </div>
      </div>
    </main>
  );
}

function Surface(props: {
  label: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={props.href}
      className={`group flex flex-col justify-between rounded-3xl border p-8 transition hover:-translate-y-1 ${
        props.accent
          ? "border-lime-700 bg-lime-300 text-ink-950 hover:bg-lime-50"
          : "border-ink-700 bg-ink-900 text-bone-50 hover:border-ink-600"
      }`}
    >
      <div className="space-y-3">
        <p
          className={`font-mono text-[11px] font-bold tracking-eyebrow ${
            props.accent ? "text-ink-700" : "text-lime-300"
          }`}
        >
          {props.label}
        </p>
        <h2 className="font-display text-3xl font-bold tracking-tightest">
          {props.title}
        </h2>
        <p
          className={`text-sm leading-relaxed ${
            props.accent ? "text-ink-700" : "text-bone-300"
          }`}
        >
          {props.body}
        </p>
      </div>
      <div className="mt-8 font-mono text-xs font-bold tracking-eyebrow">
        {props.cta} →
      </div>
    </Link>
  );
}

function NoteCard(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900 p-6">
      <p className="font-mono text-[11px] font-bold tracking-eyebrow text-lime-300">
        {props.title.toUpperCase()}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-bone-200">{props.children}</p>
    </div>
  );
}
