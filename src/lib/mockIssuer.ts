// Mock issuance partner.
//
// In production this module would be a thin wrapper around the Lithic/Marqeta SDK.
// Here it just returns plausible-looking card objects and simulates authorizations.
//
// The shape mirrors the broad strokes of a real issuer API so a future swap is mostly
// surface-level: replace these functions, keep the same return types.

import { randomBytes } from "crypto";

export interface IssuedCard {
  id: string; // mock provider card id
  fullPan: string; // full 16-digit PAN (mock only)
  last4: string;
  expMonth: number;
  expYear: number;
  cvv: string;
}

export interface AuthorizationDecision {
  decision: "approved" | "declined";
  reason?: string;
}

function rand(n: number) {
  return Math.floor(Math.random() * n);
}

function randDigits(n: number) {
  let s = "";
  for (let i = 0; i < n; i++) s += rand(10);
  return s;
}

/**
 * Issue a card. In real life this would POST to Lithic /cards.
 * `forcedLast4` lets the seed script keep the demo PAN stable.
 */
export function mockIssueCard(forcedLast4?: string): IssuedCard {
  const last4 = forcedLast4 ?? randDigits(4);
  // Pretend BIN 401288 (a common test BIN)
  const middle = randDigits(8);
  const fullPan = `401288${middle}${last4}`;
  const id = "mock_card_" + randomBytes(8).toString("hex");
  // Expire ~3 years out, on a fixed month for legibility
  const now = new Date();
  const expYear = now.getFullYear() + 3;
  const expMonth = 8;
  const cvv = randDigits(3);
  return { id, fullPan, last4, expMonth, expYear, cvv };
}

/**
 * Decide whether to authorize an attempted spend.
 * Pure function — bare-minimum logic per the spec:
 *  - Card must be active.
 *  - Amount must not exceed available program balance.
 *  - Amount must not exceed card spend limit.
 */
export function mockAuthorize(params: {
  cardStatus: string;
  amount: number; // cents
  programBalance: number;
  cardSpendLimit: number;
}): AuthorizationDecision {
  if (params.cardStatus === "suspended") {
    return { decision: "declined", reason: "Card suspended" };
  }
  if (params.cardStatus === "terminated") {
    return { decision: "declined", reason: "Card terminated" };
  }
  if (params.amount <= 0) {
    return { decision: "declined", reason: "Invalid amount" };
  }
  if (params.amount > params.cardSpendLimit) {
    return { decision: "declined", reason: "Exceeds card spend limit" };
  }
  if (params.amount > params.programBalance) {
    return { decision: "declined", reason: "Insufficient program balance" };
  }
  return { decision: "approved" };
}
