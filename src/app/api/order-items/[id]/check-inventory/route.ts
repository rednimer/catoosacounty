import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeStatus } from "@/lib/constants";
import { fetchStockLevels } from "@/lib/odoo";
import { orderItemInclude, serializeOrderItem } from "@/lib/order-items";

/** Run (or re-run) the supply check for every component in this item's BOM. */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const item = await prisma.orderItem.findUnique({
    where: { id: params.id },
    include: {
      product: { include: { components: { include: { component: true } } } },
    },
  });

  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!item.product || item.product.components.length === 0) {
    return NextResponse.json(
      { error: "This item has no product/BOM to check — it may be a one-off item." },
      { status: 400 }
    );
  }

  const stockLevels = await fetchStockLevels(
    item.product.components.map((pc) => ({
      id: pc.componentId,
      odooProductRef: pc.component.odooProductRef,
      fallbackQty: pc.component.onHandQty,
    }))
  );
  const stockById = new Map(stockLevels.map((s) => [s.componentId, s.onHandQty]));

  await prisma.$transaction(
    item.product.components.map((pc) => {
      const onHandQty = stockById.get(pc.componentId) ?? pc.component.onHandQty;
      const requiredQty = pc.qtyPerUnit * item.quantity;
      const status = computeStatus(requiredQty, onHandQty);

      return prisma.componentCheck.upsert({
        where: {
          orderItemId_componentId_role: {
            orderItemId: item.id,
            componentId: pc.componentId,
            role: pc.role,
          },
        },
        create: {
          orderItemId: item.id,
          componentId: pc.componentId,
          role: pc.role,
          requiredQty,
          onHandAtCheck: onHandQty,
          status,
        },
        update: {
          requiredQty,
          onHandAtCheck: onHandQty,
          status,
          checkedAt: new Date(),
        },
      });
    })
  );

  const updated = await prisma.orderItem.findUniqueOrThrow({
    where: { id: item.id },
    include: orderItemInclude,
  });

  return NextResponse.json(serializeOrderItem(updated));
}
