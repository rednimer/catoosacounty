import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { CHECK_STATUSES } from "@/lib/constants";

const patchSchema = z.object({
  manualOverride: z.boolean().optional(),
  status: z.enum(CHECK_STATUSES).optional(),
  note: z.string().nullable().optional(),
});

/** Manual check / override for a single component on a single order item (e.g. "eyeballed it, we're fine"). */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = { ...parsed.data };
  if (data.manualOverride && !data.status) {
    data.status = "MANUAL";
  }

  const check = await prisma.componentCheck.update({
    where: { id: params.id },
    data: { ...data, checkedAt: new Date() },
  });

  return NextResponse.json(check);
}
