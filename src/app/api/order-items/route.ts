import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { orderItemInclude, serializeOrderItem } from "@/lib/order-items";

export async function GET() {
  const items = await prisma.orderItem.findMany({
    include: orderItemInclude,
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(items.map(serializeOrderItem));
}
