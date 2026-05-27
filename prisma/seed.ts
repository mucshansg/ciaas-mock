import { PrismaClient } from "@prisma/client";
import { mockIssueCard } from "../src/lib/mockIssuer";

const prisma = new PrismaClient();

async function main() {
  
 // const existing = await prisma.business.count();
 // if (existing > 0) {
 //   console.log("DB already seeded, skipping.");
 //   return;
 // }

  // Clean slate
  await prisma.alert.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.funding.deleteMany();
  await prisma.card.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.business.deleteMany();

  // ---------- Northwind Logistics ----------
  const northwind = await prisma.business.create({
    data: {
      id: "biz_northwind",
      name: "Northwind Logistics",
      industry: "Logistics",
      programBalance: 24_850_000, // $248,500.00
    },
  });

  await prisma.funding.createMany({
    data: [
      {
        businessId: northwind.id,
        amount: 20_000_000,
        source: "Pinnacle Trust Bank",
        status: "settled",
      },
      {
        businessId: northwind.id,
        amount: 2_500_000,
        source: "Pinnacle Trust Bank",
        status: "settled",
      },
      {
        businessId: northwind.id,
        amount: 2_350_000,
        source: "Pinnacle Trust Bank",
        status: "settled",
      },
      {
        businessId: northwind.id,
        amount: 500_000,
        source: "Acme Corp Holdings",
        status: "held",
        holdReason: "Name mismatch — sender does not match registered business name.",
      },
    ],
  });

  const customers = await Promise.all(
    [
      { fullName: "Cici Mao", email: "cici@ciaas.example" },
      { fullName: "Xiaoxi Zhang", email: "xiaoxi@ciaas.example" },
      { fullName: "Guan Li", email: "guan@ciaas.example" },
      { fullName: "Elon Mask", email: "elon@ciaas.example" },
      { fullName: "Jack Dorsey", email: "jack@ciaas.example" },
      { fullName: "Mark Zuckerberg", email: "mark@ciaas.example" },
    ].map((c) =>
      prisma.customer.create({
        data: { ...c, businessId: northwind.id },
      })
    )
  );

  // Issue cards via the mock issuer so PAN/CVV are generated consistently
  const cardSpecs: Array<{ customerIdx: number; status: string; forcedLast4?: string }> = [
    { customerIdx: 0, status: "active", forcedLast4: "4271" }, // Maya
    { customerIdx: 1, status: "active", forcedLast4: "8902" }, // David
    { customerIdx: 2, status: "suspended", forcedLast4: "1054" }, // Aisha
    { customerIdx: 3, status: "terminated", forcedLast4: "6630" }, // Marcus
    { customerIdx: 4, status: "active", forcedLast4: "9118" }, // Yusuf
    { customerIdx: 5, status: "active", forcedLast4: "7245" }, // Lena
  ];

  const cards = [];
  for (const spec of cardSpecs) {
    const issued = mockIssueCard(spec.forcedLast4);
    const card = await prisma.card.create({
      data: {
        businessId: northwind.id,
        customerId: customers[spec.customerIdx].id,
        issuerCardId: issued.id,
        last4: issued.last4,
        expMonth: issued.expMonth,
        expYear: issued.expYear,
        fullPan: issued.fullPan,
        cvv: issued.cvv,
        status: spec.status,
        spendLimit: 100_000,
      },
    });
    cards.push(card);
  }

  // Seed some transactions
  const mins = (n: number) => new Date(Date.now() - n * 60_000);
  await prisma.transaction.createMany({
    data: [
      {
        businessId: northwind.id,
        cardId: cards[0].id,
        customerId: customers[0].id,
        merchant: "Uber",
        amount: 1840,
        status: "captured",
        createdAt: mins(2),
      },
      {
        businessId: northwind.id,
        cardId: cards[1].id,
        customerId: customers[1].id,
        merchant: "Walgreens",
        amount: 4216,
        status: "authorized",
        createdAt: mins(8),
      },
      {
        businessId: northwind.id,
        cardId: cards[2].id,
        customerId: customers[2].id,
        merchant: "Whole Foods",
        amount: 12755,
        status: "captured",
        createdAt: mins(14),
      },
      {
        businessId: northwind.id,
        cardId: cards[3].id,
        customerId: customers[3].id,
        merchant: "Shell",
        amount: 6520,
        status: "declined",
        declineReason: "Card terminated",
        createdAt: mins(22),
      },
      {
        businessId: northwind.id,
        cardId: cards[4].id,
        customerId: customers[4].id,
        merchant: "Apple",
        amount: 999,
        status: "captured",
        createdAt: mins(41),
      },
      {
        businessId: northwind.id,
        cardId: cards[5].id,
        customerId: customers[5].id,
        merchant: "Spotify",
        amount: -1199,
        status: "refund",
        createdAt: mins(60),
      },
    ],
  });

  await prisma.alert.createMany({
    data: [
      {
        businessId: northwind.id,
        kind: "warn",
        title: "Funding held — name mismatch",
        body: "Inbound wire $5,000 from Acme Corp Holdings doesn't match registered name. Compliance review.",
      },
      {
        businessId: northwind.id,
        kind: "info",
        title: "3 verification queue",
        body: "3 customers awaiting identity verification (avg wait 4 min).",
      },
      {
        businessId: northwind.id,
        kind: "bad",
        title: "Decline spike",
        body: "Authorization decline rate 2.1% above baseline (last 1h).",
      },
    ],
  });

  await prisma.auditEvent.create({
    data: {
      businessId: northwind.id,
      actor: "system",
      action: "program.seeded",
      details: JSON.stringify({ note: "Initial seed data created" }),
    },
  });

  // ---------- Second business: Acme Helix ----------
  const acme = await prisma.business.create({
    data: {
      id: "biz_acme",
      name: "Acme Helix Therapeutics",
      industry: "Biotech",
      programBalance: 5_000_000,
    },
  });
  await prisma.funding.create({
    data: {
      businessId: acme.id,
      amount: 5_000_000,
      source: "First Republic",
      status: "settled",
    },
  });

  console.log("✅ Seed complete.");
  console.log(`   Northwind Logistics — id: ${northwind.id}`);
  console.log(`   Acme Helix Therapeutics — id: ${acme.id}`);
  console.log(`   Sample customers: Maya (4271), David (8902), Aisha (1054 — suspended).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

