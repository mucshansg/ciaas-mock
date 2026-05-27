"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FundingForm({
  businessId,
  businessName,
}: {
  businessId: string;
  businessName: string;
}) {
  const router = useRouter();
  const [source, setSource] = useState(businessName);
  const [amount, setAmount] = useState("5000");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setResult(null);
    try {
      const r = await fetch(`/api/businesses/${businessId}/funding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, amount: Math.round(Number(amount) * 100) }),
      });
      const data = await r.json();
      if (data.status === "settled") {
        setResult({
          ok: true,
          message: `$${amount} settled to program balance.`,
        });
      } else {
        setResult({
          ok: false,
          message: data.holdReason ?? "Funding held for review.",
        });
      }
      router.refresh();
    } catch {
      setResult({ ok: false, message: "Something went wrong." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <div>
        <p className="font-mono text-[11px] font-bold tracking-eyebrow text-lime-300">
          SIMULATE INBOUND WIRE
        </p>
        <h2 className="mt-2 font-display text-2xl font-medium">Receive funds</h2>
        <p className="mt-2 text-xs text-bone-400">
          Same-name check: if the sender doesn't exactly match the registered business
          name, funds are held for compliance review.
        </p>
      </div>

      <div>
        <label className="eyebrow">Sender</label>
        <input
          className="input mt-1.5"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
        <p className="mt-1.5 text-[11px] text-bone-400">
          Registered name: <span className="font-mono">{businessName}</span>
        </p>
      </div>

      <div>
        <label className="eyebrow">Amount (USD)</label>
        <input
          type="number"
          step={1}
          min={1}
          className="input mt-1.5"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      {result && (
        <div
          className={`rounded-xl p-3 text-xs ${
            result.ok
              ? "border border-mint-700 bg-mint-700/20 text-mint-300"
              : "border border-amber-700 bg-amber-700/20 text-amber-300"
          }`}
        >
          {result.message}
        </div>
      )}

      <button className="btn-primary w-full" disabled={pending}>
        {pending ? "Processing…" : "Simulate wire"}
      </button>
    </form>
  );
}
