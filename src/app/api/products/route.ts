import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { COMPONENT_TYPES } from "@/lib/constants";

const bomLineSchema = z.object({
  componentId: z.string(),
  role: z.enum(COMPONENT_TYPES),
  qtyPerUnit: z.number().positive(),
});

const createProductSchema = z.object({
  fnsku: z.string().optional(),
  name: z.string().min(1),
  sizeLabel: z.string().optional(),
  customerId: z.string().optional(),
  trackInventory: z.boolean().default(true),
  customerSuppliesParts: z.boolean().default(false),
  unitPrice: z.number().nonnegative().optional(),
  cogsPerUnit: z.number().nonnegative().optional(),
  productionGuidelines: z.string().optional(),
  notes: z.string().optional(),
  components: z.array(bomLineSchema).default([]),
});

export async function GET() {
  const products = await prisma.product.findMany({
    include: { customer: true, components: { include: { component: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const product = await prisma.product.create({
    data: {
      fnsku: data.fnsku,
      name: data.name,
      sizeLabel: data.sizeLabel,
      customerId: data.customerId,
      trackInventory: data.trackInventory,
      customerSuppliesParts: data.customerSuppliesParts,
      unitPrice: data.unitPrice,
      cogsPerUnit: data.cogsPerUnit,
      productionGuidelines: data.productionGuidelines,
      notes: data.notes,
      components: {
        create: data.components.map((c) => ({
          componentId: c.componentId,
          role: c.role,
          qtyPerUnit: c.qtyPerUnit,
        })),
      },
    },
    include: { components: { include: { component: true } } },
  });

  return NextResponse.json(product, { status: 201 });
}
