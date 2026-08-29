import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { PRIORITIES } from "@/lib/constants";
import { orderItemInclude, serializeOrderItem } from "@/lib/order-items";

const patchSchema = z.object({
  notes: z.string().nullable().optional(),
  priority: z.enum(PRIORITIES).optional(),
  manualOverride: z.boolean().optional(),
  trackInventory: z.boolean().optional(),
  quantity: z.number().int().positive().optional(),
  workOrderNumber: z.string().nullable().optional(),
});

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const item = await prisma.orderItem.findUnique({
    where: { id: params.id },
    include: orderItemInclude,
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(serializeOrderItem(item));
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const item = await prisma.orderItem.update({
    where: { id: params.id },
    data: parsed.data,
    include: orderItemInclude,
  });

  return NextResponse.json(serializeOrderItem(item));
}
