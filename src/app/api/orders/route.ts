import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { generateCode } from "@/lib/codes";
import { ORDER_SOURCES } from "@/lib/constants";
import { orderItemInclude, serializeOrderItem } from "@/lib/order-items";

const itemSchema = z.object({
  productId: z.string().optional(),
  oneOffName: z.string().optional(),
  oneOffFnsku: z.string().optional(),
  quantity: z.number().int().positive(),
  trackInventory: z.boolean().optional(),
  notes: z.string().optional(),
});

const createOrderSchema = z.object({
  customerId: z.string().optional(),
  source: z.enum(ORDER_SOURCES).default("MANUAL"),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1),
});

export async function GET() {
  const orders = await prisma.order.findMany({
    include: { customer: true, items: true },
    orderBy: { receivedAt: "desc" },
  });
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const order = await prisma.order.create({
    data: {
      orderNumber: generateCode("SO"),
      customerId: data.customerId,
      source: data.source,
      notes: data.notes,
      items: {
        create: data.items.map((item) => ({
          productId: item.productId,
          oneOffName: item.productId ? undefined : item.oneOffName,
          oneOffFnsku: item.productId ? undefined : item.oneOffFnsku,
          quantity: item.quantity,
          trackInventory: item.trackInventory ?? !!item.productId,
          notes: item.notes,
        })),
      },
    },
    include: { items: { include: orderItemInclude } },
  });

  return NextResponse.json({
    ...order,
    items: order.items.map(serializeOrderItem),
  });
}
