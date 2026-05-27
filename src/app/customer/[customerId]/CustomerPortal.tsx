"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VirtualCard } from "@/components/VirtualCard";
import { Pill, statusToPillKind } from "@/components/Pill";
import { formatMoney, formatPan } from "@/lib/format";

interface CardData {
  id: string;
  last4: string;
  fullPan: string;
  cvv: string;
  expMonth: number;
  expYear: number;
  status: string;
  spendLimit: number;
}

interface TxnData {
  id: string;
  merchant: string;
  amount: number;
  status: string;
  createdAt: string;
  declineReason: string | null;
}

export function CustomerPortal({
  customer,
  card,
  transactions,
}: {
  customer: { id: string; fullName: string; email: string; businessName: string };
  card: CardData | null;
  transactions: TxnData[];
}) {
  const router = useRouter();
  const [revealed, setRevealed] = useState(false);
  const [showSpend, setShowSpend] = useState(false);
  const [showReport, setShowReport] = useState(false);

  return (
    <main className="min-h-screen bg-ink-950 pb-20">
      <div className="mx-auto max-w-md px-6 pt-12">
        {/* Greeting */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-bone-400">Hello</p>
            <h1 className="font-display text-3xl font-bold tracking-tightest">
              {customer.fullName.split(" ")[0]}
            </h1>
            <p className="mt-0.5 text-xs text-bone-400">{customer.businessName}</p>
          </div>
          <a
            href="/customer"
            className="font-mono text-[10px] tracking-eyebrow text-bone-400 hover:text-bone-200"
          >
            SIGN OUT
          </a>
        </div>

        {/* Card */}
        {card ? (
          <div className="mt-6">
            <VirtualCard
              brand={customer.businessName.split(" ")[0]}
              last4={card.last4}
              cardholder={customer.fullName}
              expMonth={card.expMonth}
              expYear={card.expYear}
              status={card.status}
            />
            {/* Reveal toggle */}
            <button
              onClick={() => setRevealed((r) => !r)}
              className="mt-3 flex w-full items-center justify-between rounded-xl border border-ink-700 bg-ink-900 px-4 py-3 text-left text-xs"
            >
              <div>
                <p className="font-mono tracking-eyebrow text-bone-400">CARD DETAILS</p>
                <p className="mt-1 font-mono text-bone-50">
                  {revealed ? formatPan(card.fullPan) : "•••• •••• •••• " + card.last4}
                </p>
                <p className="mt-0.5 font-mono text-bone-400">
                  CVV {revealed ? card.cvv : "•••"} · EXP{" "}
                  {String(card.expMonth).padStart(2, "0")}/{String(card.expYear).slice(-2)}
                </p>
              </div>
              <span className="font-mono text-[10px] font-bold tracking-eyebrow text-lime-300">
                {revealed ? "HIDE" : "REVEAL"}
              </span>
            </button>
          </div>
        ) : (
          <div className="mt-6 card text-center text-sm text-bone-400">
            No card has been issued to you yet. Have your operator issue one from the
            business dashboard.
          </div>
        )}

        {/* Balance */}
        <div className="mt-8 flex items-end justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-eyebrow text-bone-400">
              SPEND LIMIT REMAINING
            </p>
            <p className="mt-1 stat-num text-4xl">
              ${card ? (card.spendLimit / 100).toFixed(2) : "0.00"}
            </p>
          </div>
        </div>

        {/* Actions */}
        {card && card.status === "active" && (
          <div className="mt-6 space-y-3">
            <button onClick={() => setShowSpend(true)} className="btn-primary w-full">
              Simulate a purchase
            </button>
            <button
              onClick={() => setShowReport(true)}
              className="flex w-full items-center justify-between rounded-xl border border-ink-700 bg-ink-900 p-4 text-left transition hover:border-coral-500"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-coral-700 font-bold text-coral-300">
                  !
                </span>
                <div>
                  <p className="text-sm font-semibold">Lost or compromised?</p>
                  <p className="text-xs text-bone-400">Suspend the card instantly</p>
                </div>
              </div>
              <span className="text-bone-300">›</span>
            </button>
          </div>
        )}
        {card && card.status === "suspended" && (
          <div className="mt-6 rounded-xl border border-amber-700 bg-amber-700/20 p-4">
            <p className="font-semibold text-amber-300">Card suspended</p>
            <p className="mt-1 text-xs text-amber-300">
              Contact {customer.businessName} to reactivate if recovered.
            </p>
          </div>
        )}
        {card && card.status === "terminated" && (
          <div className="mt-6 rounded-xl border border-coral-700 bg-coral-700/20 p-4">
            <p className="font-semibold text-coral-300">Card terminated</p>
            <p className="mt-1 text-xs text-coral-300">
              A new card must be issued by your operator.
            </p>
          </div>
        )}

        {/* Recent transactions */}
        <div className="mt-10">
          <h2 className="font-display text-xl font-medium">Recent activity</h2>
          {transactions.length === 0 ? (
            <p className="mt-3 text-xs text-bone-400">
              Nothing yet. Try "Simulate a purchase" above.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-ink-800">
              {transactions.map((t) => (
                <li key={t.id} className="flex items-center gap-3 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-800 font-display text-sm font-bold">
                    {t.merchant.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{t.merchant}</p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <Pill kind={statusToPillKind(t.status)}>
                        {t.status.toUpperCase()}
                      </Pill>
                    </div>
                  </div>
                  <p
                    className={`font-mono text-sm ${
                      t.status === "declined" ? "text-coral-300" : "text-bone-50"
                    }`}
                  >
                    {t.amount < 0 ? "+ " : "− "}
                    {formatMoney(Math.abs(t.amount))}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {showSpend && card && (
        <SimulatePurchaseModal
          card={card}
          onClose={() => {
            setShowSpend(false);
            router.refresh();
          }}
        />
      )}
      {showReport && card && (
        <ReportLostModal
          cardId={card.id}
          onClose={() => {
            setShowReport(false);
            router.refresh();
          }}
        />
      )}
    </main>
  );
}

function SimulatePurchaseModal({
  card,
  onClose,
}: {
  card: CardData;
  onClose: () => void;
}) {
  const [merchant, setMerchant] = useState("Whole Foods");
  const [amount, setAmount] = useState("28.50");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    title: string;
    body: string;
  } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setResult(null);
    try {
      const r = await fetch(`/api/cards/${card.id}/authorize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant,
          amount: Math.round(Number(amount) * 100),
        }),
      });
      const data = await r.json();
      if (r.ok && data.status === "captured") {
        setResult({
          ok: true,
          title: "Approved",
          body: `${merchant} charged $${amount}. Receipt is on its way.`,
        });
      } else {
        setResult({
          ok: false,
          title: "Declined",
          body: data.declineReason ?? data.error ?? "Unknown reason.",
        });
      }
    } catch {
      setResult({ ok: false, title: "Error", body: "Network error." });
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <p className="eyebrow text-lime-300">SIMULATE</p>
      <h2 className="mt-2 font-display text-3xl font-bold tracking-tightest">
        Tap to pay.
      </h2>
      <p className="mt-2 text-sm text-bone-300">
        We'll send the authorization through the platform just like a real merchant
        terminal would.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="eyebrow">Merchant</label>
          <input
            className="input mt-1.5"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
          />
        </div>
        <div>
          <label className="eyebrow">Amount (USD)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            className="input mt-1.5"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {result && (
          <div
            className={`rounded-xl p-4 ${
              result.ok
                ? "border border-mint-700 bg-mint-700/20"
                : "border border-coral-700 bg-coral-700/20"
            }`}
          >
            <p
              className={`font-display text-lg font-medium ${
                result.ok ? "text-mint-300" : "text-coral-300"
              }`}
            >
              {result.title}
            </p>
            <p className="mt-1 text-xs text-bone-200">{result.body}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost flex-1"
            disabled={pending}
          >
            {result ? "Done" : "Cancel"}
          </button>
          {!result && (
            <button className="btn-primary flex-1" disabled={pending}>
              {pending ? "Authorizing…" : "Authorize"}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}

function ReportLostModal({
  cardId,
  onClose,
}: {
  cardId: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("lost_or_stolen");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    setPending(true);
    try {
      const r = await fetch(`/api/cards/${cardId}/report-lost`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (r.ok) setDone(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="rounded-2xl bg-coral-700 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral-500 font-display text-2xl font-bold">
          !
        </div>
        <h2 className="mt-3 font-display text-2xl font-bold tracking-tightest">
          Lost or compromised?
        </h2>
        <p className="mt-1 text-xs text-bone-100">
          We'll suspend the card immediately and notify your operator.
        </p>
      </div>

      {!done ? (
        <>
          <div className="mt-6 space-y-2">
            <p className="text-sm font-semibold">What happened?</p>
            <ReasonOption
              value="lost_or_stolen"
              current={reason}
              onChange={setReason}
              label="Card was lost or stolen"
            />
            <ReasonOption
              value="unrecognized_txn"
              current={reason}
              onChange={setReason}
              label="I see a transaction I don't recognize"
            />
            <ReasonOption
              value="other"
              current={reason}
              onChange={setReason}
              label="Something else"
            />
          </div>

          <div className="mt-6 flex gap-2">
            <button onClick={onClose} className="btn-ghost flex-1" disabled={pending}>
              Cancel
            </button>
            <button onClick={submit} className="btn-danger flex-1" disabled={pending}>
              {pending ? "Suspending…" : "Suspend card now"}
            </button>
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-xl border border-mint-700 bg-mint-700/20 p-4">
          <p className="font-display text-lg font-medium text-mint-300">
            Card suspended
          </p>
          <p className="mt-1 text-xs text-mint-300">
            Your operator has been notified. They'll be in touch about next steps.
          </p>
          <button onClick={onClose} className="btn-primary mt-4 w-full">
            Done
          </button>
        </div>
      )}
    </Modal>
  );
}

function ReasonOption({
  value,
  current,
  onChange,
  label,
}: {
  value: string;
  current: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const selected = current === value;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`flex w-full items-center gap-3 rounded-xl p-3.5 text-left transition ${
        selected
          ? "border-2 border-lime-300 bg-ink-800"
          : "border border-ink-700 bg-transparent"
      }`}
    >
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
          selected ? "border-lime-300" : "border-bone-400"
        }`}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-lime-300" />}
      </span>
      <span className="text-sm">{label}</span>
    </button>
  );
}

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/80 backdrop-blur sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl border border-ink-700 bg-ink-900 p-6 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
