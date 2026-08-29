import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const createSchema = z.object({
  productId: z.string(),
  customerId: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative().optional(),
  shippedAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month"); // YYYY-MM

  const where = month
    ? {
        shippedAt: {
          gte: new Date(`${month}-01T00:00:00.000Z`),
          lt: new Date(
            new Date(`${month}-01T00:00:00.000Z`).setUTCMonth(
              new Date(`${month}-01T00:00:00.000Z`).getUTCMonth() + 1
            )
          ),
        },
      }
    : {};

  const shipments = await prisma.shipment.findMany({
    where,
    include: { product: true, customer: true },
    orderBy: { shippedAt: "desc" },
  });
  return NextResponse.json(shipments);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product) return NextResponse.json({ error: "Unknown product" }, { status: 400 });

  const shipment = await prisma.shipment.create({
    data: {
      productId: data.productId,
      customerId: data.customerId,
      quantity: data.quantity,
      unitPrice: data.unitPrice ?? product.unitPrice ?? 0,
      shippedAt: data.shippedAt ? new Date(data.shippedAt) : new Date(),
      notes: data.notes,
    },
    include: { product: true, customer: true },
  });

  return NextResponse.json(shipment, { status: 201 });
}
