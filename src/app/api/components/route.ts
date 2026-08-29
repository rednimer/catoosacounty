import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { COMPONENT_TYPES } from "@/lib/constants";

const createSchema = z.object({
  name: z.string().min(1),
  type: z.enum(COMPONENT_TYPES),
  unitOfMeasure: z.string().default("ea"),
  onHandQty: z.number().nonnegative().default(0),
  lowStockThreshold: z.number().nonnegative().default(0),
  criticalThreshold: z.number().nonnegative().default(0),
  notes: z.string().optional(),
});

export async function GET() {
  const components = await prisma.component.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(components);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const component = await prisma.component.create({ data: parsed.data });
  return NextResponse.json(component, { status: 201 });
}
