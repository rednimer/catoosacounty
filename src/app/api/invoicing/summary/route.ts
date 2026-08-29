import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** Monthly amount-due rollup per customer, priced off the shipment's snapshot unit price. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month"); // YYYY-MM, defaults to current month
  const key = month ?? new Date().toISOString().slice(0, 7);

  const start = new Date(`${key}-01T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);

  const shipments = await prisma.shipment.findMany({
    where: { shippedAt: { gte: start, lt: end } },
    include: { product: true, customer: true },
  });

  const byCustomer = new Map<
    string,
    {
      customerId: string;
      customerName: string;
      lines: {
        productId: string;
        productName: string;
        fnsku: string | null;
        quantity: number;
        unitPrice: number;
        subtotal: number;
        cogsPerUnit: number | null;
        marginSubtotal: number | null;
      }[];
      totalAmount: number;
      totalCogs: number | null;
    }
  >();

  for (const s of shipments) {
    const entry = byCustomer.get(s.customerId) ?? {
      customerId: s.customerId,
      customerName: s.customer.name,
      lines: [],
      totalAmount: 0,
      totalCogs: 0,
    };

    const subtotal = s.quantity * s.unitPrice;
    const cogsPerUnit = s.product.cogsPerUnit ?? null;
    const marginSubtotal = cogsPerUnit != null ? subtotal - cogsPerUnit * s.quantity : null;

    entry.lines.push({
      productId: s.productId,
      productName: s.product.name,
      fnsku: s.product.fnsku,
      quantity: s.quantity,
      unitPrice: s.unitPrice,
      subtotal,
      cogsPerUnit,
      marginSubtotal,
    });
    entry.totalAmount += subtotal;
    entry.totalCogs =
      entry.totalCogs == null || cogsPerUnit == null ? null : entry.totalCogs + cogsPerUnit * s.quantity;

    byCustomer.set(s.customerId, entry);
  }

  return NextResponse.json({ month: key, customers: Array.from(byCustomer.values()) });
}
