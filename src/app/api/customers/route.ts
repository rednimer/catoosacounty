import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  const customers = await prisma.customer.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(customers);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const customer = await prisma.customer.create({ data: parsed.data });
  return NextResponse.json(customer, { status: 201 });
}
