import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const patchSchema = z.object({
  onHandQty: z.number().nonnegative().optional(),
  lowStockThreshold: z.number().nonnegative().optional(),
  criticalThreshold: z.number().nonnegative().optional(),
  notes: z.string().nullable().optional(),
});

/** Manual inventory correction — the "manual check / override" path when no Odoo sync is trusted. */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const component = await prisma.component.update({
    where: { id: params.id },
    data: parsed.data,
  });
  return NextResponse.json(component);
}
