# CIaaS Mock

A click-through prototype of a Card Issuance as a Service platform. Three surfaces — a
business operator dashboard, an end-customer portal, and an internal ops console — all
backed by a mock issuance partner and a local SQLite database.

This is **not** a production app. It exists to make the product feel real before any of
the heavy lifting (KYC/KYB, partner-bank integration, PCI scope) is committed to.

## Quick start

```bash
# 1. Install deps
npm install

# 2. Set up DB + seed data in one command
npm run setup

# 3. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What's mocked

- **Issuance partner** — a local module (`src/lib/mockIssuer.ts`) returns plausible
  card objects and decides auth/decline. Replace with a real Lithic/Marqeta client to
  go live.
- **Authentication** — none. The customer portal asks you to "pick a customer." Real
  app would use email OTP via Twilio/Postmark.
- **KYC/KYB** — skipped entirely. Businesses arrive in the DB pre-approved.
- **Webhooks** — no real partner means no real webhooks. Authorizations happen
  synchronously in-process when the customer hits "simulate a purchase."

## What's real

- **Multi-tenant data model** — businesses, customers, cards, transactions, fundings,
  alerts, and an append-only audit log, all scoped by `businessId`.
- **Card state machine** — `active` → `suspended` (reversible) → `terminated`
  (irreversible).
- **Authorization logic** — checks card status, card spend limit, and program balance
  before approving. Decrements both balances atomically.
- **Same-name funding check** — wires from senders whose name doesn't match the
  registered business are held for review (try it in the Funding page).
- **Audit log** — every state change writes an immutable entry. Visible per-tenant
  under Audit Log, and cross-tenant in the Ops console.

## Walkthrough

The fastest way to feel the product:

1. **Home** → Operator dashboard. Notice the lime program-balance hero, recent
   activity (already populated by seed), funding details panel, alerts feed.
2. **Customers** → Pick "Maya Rodriguez" from the existing list (or create a new
   customer) and issue a card with a $1,000 spend limit. The new card appears in
   the list.
3. **Cards** → Suspend a card. Note that the action is also recorded in the audit
   log.
4. **Home → click "Customer portal"** in the top-right (or visit `/customer`).
   Pick yourself as a customer. You'll see your card. Reveal the PAN.
5. **Simulate a purchase** at Whole Foods for $28.50. Go back to the operator
   dashboard — the transaction is there.
6. **Simulate a purchase** for $99,999. It should be declined (insufficient
   limit). Decline reason appears in the operator's Transactions view.
7. **Report lost** from the customer portal. The card moves to `suspended`, the
   operator gets a `bad`-kind alert on the dashboard, and the audit log records
   it.
8. **Ops console** at `/ops` → cross-business audit feed of everything that just
   happened.

## Project structure

```
src/
  app/
    page.tsx                          Landing page (surface picker)
    business/[businessId]/            Operator dashboard
      page.tsx                          Home
      customers/                        Customer list + issue card
      cards/                            Cards + suspend/terminate/reactivate
      transactions/                     All authorizations
      funding/                          Wire log + simulate inbound wire
      audit/                            Per-tenant audit log
    customer/                         End-customer portal
      page.tsx                          Pick-a-customer "sign in"
      [customerId]/                     Card view, simulate spend, report lost
    ops/                              Internal cross-business console
    api/                              REST routes (Next.js Route Handlers)
  components/
    Pill.tsx                          Status pill (active/suspended/declined/etc.)
    VirtualCard.tsx                   Card visual
    BusinessSidebar.tsx               Dashboard nav
  lib/
    prisma.ts                         Singleton Prisma client
    mockIssuer.ts                     The fake card issuer ← swap this for real
    audit.ts                          Audit log helper
    format.ts                         Money / time / PAN formatting
prisma/
  schema.prisma                       Data model
  seed.ts                             Seed data (Northwind + Acme Helix)
```

## Design system

The visual language matches the Figma mockups:

- **Surfaces** — deep ink (`#0A0B0D`), card surfaces `#101216`, dividers `#272B33`
- **Primary action** — electric lime `#D6FF4A`
- **Text** — warm bone whites (`#FAF8F3` → `#8E8878`)
- **Status** — mint for approved/captured, amber for warn/pending, coral for
  declined/terminated, indigo for info/processing
- **Typography** — Space Grotesk display, Inter body, JetBrains Mono for numbers
  and labels. Loaded via Google Fonts CDN; no build setup needed.
- **Ops console** uses a coral mark instead of lime to signal "internal."

## Going from here to real

The shortest path to a working V0:

1. Replace `src/lib/mockIssuer.ts` with a Lithic client. The two functions
   (`mockIssueCard`, `mockAuthorize`) define a deliberate interface — keep their
   shape, change their guts. Real Lithic auth happens via webhook; you'd add a
   `POST /api/webhooks/lithic` route that records the transaction instead of the
   current synchronous flow.
2. Add real authentication — Clerk or WorkOS for operators, Postmark/Twilio for
   customer OTP.
3. Add KYB onboarding — Persona, Alloy, or Middesk. The KYB review screen exists
   in the Figma file already (Ops & Compliance page).
4. Wire funding to a partner bank — Increase, Column, or Modern Treasury. The
   same-name check stays; just move it from the funding form to an inbound
   webhook handler.
5. Move from SQLite to Postgres with row-level security policies keyed on
   `businessId`. The schema doesn't need to change.
