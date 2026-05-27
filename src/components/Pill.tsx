import { classNames } from "@/lib/format";

type Kind = "ok" | "warn" | "bad" | "info" | "neutral";

const styles: Record<Kind, string> = {
  ok: "bg-mint-700 text-mint-300",
  warn: "bg-amber-700 text-amber-300",
  bad: "bg-coral-700 text-coral-300",
  info: "bg-indigo-700 text-indigo-300",
  neutral: "bg-ink-700 text-bone-300",
};
const dotStyles: Record<Kind, string> = {
  ok: "bg-mint-300",
  warn: "bg-amber-300",
  bad: "bg-coral-300",
  info: "bg-indigo-300",
  neutral: "bg-bone-300",
};

export function Pill({
  children,
  kind = "neutral",
  className,
}: {
  children: React.ReactNode;
  kind?: Kind;
  className?: string;
}) {
  return (
    <span className={classNames("pill", styles[kind], className)}>
      <span className={classNames("pill-dot", dotStyles[kind])} />
      {children}
    </span>
  );
}

export function statusToPillKind(status: string): Kind {
  switch (status) {
    case "active":
    case "approved":
    case "captured":
    case "refund":
    case "settled":
      return "ok";
    case "authorized":
    case "processing":
    case "pending":
      return "info";
    case "suspended":
    case "info req.":
      return "warn";
    case "held":
      return "warn";
    case "terminated":
    case "declined":
      return "bad";
    default:
      return "neutral";
  }
}
