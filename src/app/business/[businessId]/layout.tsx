import { BusinessSidebar } from "@/components/BusinessSidebar";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function BusinessLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) notFound();

  return (
    <div className="flex min-h-screen">
      <BusinessSidebar businessId={business.id} businessName={business.name} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
