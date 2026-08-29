import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { KANBAN_STAGES } from "@/lib/constants";
import { orderItemInclude, serializeOrderItem } from "@/lib/order-items";

const patchSchema = z.object({ stage: z.enum(KANBAN_STAGES) });

/** Drag-and-drop move between production board columns. */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.stage === "COMPLETED") {
    return NextResponse.json(
      { error: "Use the complete-production action so an actual quantity can be recorded." },
      { status: 400 }
    );
  }

  const item = await prisma.orderItem.update({
    where: { id: params.id },
    data: { kanbanStage: parsed.data.stage },
    include: orderItemInclude,
  });

  return NextResponse.json(serializeOrderItem(item));
}
