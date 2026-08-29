import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

/**
 * QA photo upload. Stored on local disk under /public/uploads — fine for a
 * single-server deployment; swap for blob storage (S3, etc.) if this ever
 * runs on ephemeral/serverless infra.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const item = await prisma.orderItem.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const form = await request.formData();
  const file = form.get("file");
  const caption = form.get("caption");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const ext = path.extname(file.name) || ".jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const dir = path.join(UPLOAD_ROOT, item.id);
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  const photo = await prisma.qaPhoto.create({
    data: {
      orderItemId: item.id,
      url: `/uploads/${item.id}/${filename}`,
      caption: typeof caption === "string" && caption.length > 0 ? caption : null,
    },
  });

  return NextResponse.json(photo);
}
