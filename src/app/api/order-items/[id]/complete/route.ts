import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { closeMakeOrder } from "@/lib/odoo";
import { orderItemInclude, serializeOrderItem } from "@/lib/order-items";

const bodySchema = z.object({ actualQtyProduced: z.number().int().nonnegative() });

/** Finish production: record actual quantity produced and close the make order in Odoo (stubbed). */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const item = await prisma.orderItem.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let odooMakeOrderClosed = item.odooMakeOrderClosed;
  if (item.odooMakeOrderRef) {
    const result = await closeMakeOrder({
      odooMakeOrderRef: item.odooMakeOrderRef,
      actualQtyProduced: parsed.data.actualQtyProduced,
    });
    odooMakeOrderClosed = result.success;
  }

  const updated = await prisma.orderItem.update({
    where: { id: item.id },
    data: {
      kanbanStage: "COMPLETED",
      completedAt: new Date(),
      actualQtyProduced: parsed.data.actualQtyProduced,
      odooMakeOrderClosed,
    },
    include: orderItemInclude,
  });

  return NextResponse.json(serializeOrderItem(updated));
}
