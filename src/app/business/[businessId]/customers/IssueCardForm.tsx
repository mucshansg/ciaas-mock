"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Customer {
  id: string;
  fullName: string;
  email: string;
}

export function IssueCardForm({
  businessId,
  customers,
}: {
  businessId: string;
  customers: Customer[];
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"new" | "existing">("existing");
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [limit, setLimit] = useState("1000");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(null);

    try {
      let cid = customerId;
      if (mode === "new") {
        if (!fullName.trim() || !email.trim()) {
          throw new Error("Name and email are required.");
        }
        const r = await fetch(`/api/businesses/${businessId}/customers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, email }),
        });
        if (!r.ok) throw new Error((await r.json()).error ?? "Failed to create customer");
        const created = await r.json();
        cid = created.id;
      }

      const r2 = await fetch(`/api/businesses/${businessId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: cid, spendLimit: Number(limit) * 100 }),
      });
      if (!r2.ok) throw new Error((await r2.json()).error ?? "Failed to issue card");
      const card = await r2.json();
      setSuccess(`Card ••${card.last4} issued.`);
      setFullName("");
      setEmail("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <div>
        <p className="font-mono text-[11px] font-bold tracking-eyebrow text-lime-300">
          ISSUE A CARD
        </p>
        <h2 className="mt-2 font-display text-2xl font-medium">New virtual card</h2>
      </div>

      <div className="flex gap-1 rounded-xl bg-ink-800 p-1">
        <button
          type="button"
          onClick={() => setMode("existing")}
          className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold ${
            mode === "existing" ? "bg-ink-700 text-bone-50" : "text-bone-400"
          }`}
        >
          Existing customer
        </button>
        <button
          type="button"
          onClick={() => setMode("new")}
          className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold ${
            mode === "new" ? "bg-ink-700 text-bone-50" : "text-bone-400"
          }`}
        >
          New customer
        </button>
      </div>

      {mode === "existing" ? (
        <div>
          <label className="eyebrow">Customer</label>
          <select
            className="input mt-1.5"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName} — {c.email}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <>
          <div>
            <label className="eyebrow">Full name</label>
            <input
              className="input mt-1.5"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Jordan Rivera"
            />
          </div>
          <div>
            <label className="eyebrow">Email</label>
            <input
              type="email"
              className="input mt-1.5"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jordan@northwind.example"
            />
          </div>
        </>
      )}

      <div>
        <label className="eyebrow">Spend limit (USD)</label>
        <input
          className="input mt-1.5"
          type="number"
          min={1}
          step={1}
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
        />
      </div>

      {error && (
        <div className="rounded-xl border border-coral-700 bg-coral-700/20 p-3 text-xs text-coral-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-mint-700 bg-mint-700/20 p-3 text-xs text-mint-300">
          {success}
        </div>
      )}

      <button className="btn-primary w-full" disabled={pending}>
        {pending ? "Issuing…" : "Issue card"}
      </button>
    </form>
  );
}
