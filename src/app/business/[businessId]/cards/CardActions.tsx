"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CardActions({
  businessId,
  cardId,
  status,
}: {
  businessId: string;
  cardId: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  async function action(target: "suspended" | "active" | "terminated") {
    setPending(target);
    try {
      const r = await fetch(`/api/businesses/${businessId}/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: target }),
      });
      if (!r.ok) {
        console.error(await r.text());
      } else {
        router.refresh();
      }
    } finally {
      setPending(null);
    }
  }

  if (status === "terminated") {
    return (
      <p className="text-xs text-bone-400">
        This card is terminated. No further actions are possible.
      </p>
    );
  }

  return (
    <div className="flex gap-2">
      {status === "active" ? (
        <button
          className="btn-secondary flex-1 !py-2"
          onClick={() => action("suspended")}
          disabled={!!pending}
        >
          {pending === "suspended" ? "Suspending…" : "Suspend"}
        </button>
      ) : (
        <button
          className="btn-primary flex-1 !py-2"
          onClick={() => action("active")}
          disabled={!!pending}
        >
          {pending === "active" ? "Reactivating…" : "Reactivate"}
        </button>
      )}
      <button
        className="btn-danger flex-1 !py-2"
        onClick={() => action("terminated")}
        disabled={!!pending}
      >
        {pending === "terminated" ? "Terminating…" : "Terminate"}
      </button>
    </div>
  );
}
