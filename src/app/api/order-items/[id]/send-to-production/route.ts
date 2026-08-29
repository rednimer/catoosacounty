import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateCode } from "@/lib/codes";
import { createMakeOrder } from "@/lib/odoo";
import { orderItemInclude, serializeOrderItem } from "@/lib/order-items";

/** Move an order item from the sheet onto the production board: assign a work order number and open a make order. */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const item = await prisma.orderItem.findUnique({
    where: { id: params.id },
    include: { product: true },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const workOrderNumber = item.workOrderNumber ?? generateCode("WO");

  const makeOrder = await createMakeOrder({
    workOrderNumber,
    fnsku: item.product?.fnsku ?? item.oneOffFnsku ?? null,
    productName: item.product?.name ?? item.oneOffName ?? "Untitled item",
    quantity: item.quantity,
  });

  const updated = await prisma.orderItem.update({
    where: { id: item.id },
    data: {
      workOrderNumber,
      kanbanStage: item.kanbanStage === "INCOMING" ? "READY" : item.kanbanStage,
      sentToProductionAt: item.sentToProductionAt ?? new Date(),
      odooMakeOrderRef: item.odooMakeOrderRef ?? makeOrder.odooMakeOrderRef,
    },
    include: orderItemInclude,
  });

  return NextResponse.json(serializeOrderItem(updated));
}
