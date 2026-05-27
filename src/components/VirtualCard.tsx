import { Pill } from "./Pill";
import { maskPan } from "@/lib/format";

export function VirtualCard({
  brand = "Northwind",
  last4,
  cardholder,
  expMonth,
  expYear,
  status,
}: {
  brand?: string;
  last4: string;
  cardholder: string;
  expMonth: number;
  expYear: number;
  status: string;
}) {
  const active = status === "active";
  return (
    <div
      className={`flex aspect-[7/4] flex-col justify-between rounded-3xl p-6 ${
        active
          ? "bg-lime-300 text-ink-950"
          : "border border-ink-700 bg-ink-800 text-bone-50"
      }`}
      style={
        status === "suspended"
          ? { borderColor: "#F59E0B", borderStyle: "dashed", borderWidth: 2 }
          : undefined
      }
    >
      <div className="flex items-start justify-between">
        <span className="font-display text-lg font-bold tracking-tight">{brand}</span>
        <Pill
          kind={
            status === "active"
              ? "ok"
              : status === "suspended"
              ? "warn"
              : status === "terminated"
              ? "bad"
              : "neutral"
          }
        >
          {status.toUpperCase()}
        </Pill>
      </div>
      <div className="font-mono text-xl tracking-widest">{maskPan(last4)}</div>
      <div className="flex items-end justify-between">
        <div>
          <p
            className={`font-mono text-[9px] tracking-eyebrow ${
              active ? "text-ink-700" : "text-bone-400"
            }`}
          >
            CARDHOLDER
          </p>
          <p className="text-sm font-semibold">{cardholder.toUpperCase()}</p>
        </div>
        <div className="text-right">
          <p
            className={`font-mono text-[9px] tracking-eyebrow ${
              active ? "text-ink-700" : "text-bone-400"
            }`}
          >
            EXP
          </p>
          <p className="font-mono text-sm font-medium">
            {String(expMonth).padStart(2, "0")}/{String(expYear).slice(-2)}
          </p>
        </div>
      </div>
    </div>
  );
}
