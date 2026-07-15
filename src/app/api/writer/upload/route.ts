import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { getImageRoot, getImagePublicPath, makeFileSlug, slugify, type WriterKind } from "@/utils/writer";

export const dynamic = "force-dynamic";

function isWriterEnabled() {
  return process.env.NODE_ENV !== "production";
}

export async function POST(request: NextRequest) {
  if (!isWriterEnabled()) {
    return NextResponse.json({ message: "Not available" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const kind = String(formData.get("kind") || "blog") as WriterKind;
  const slug = slugify(String(formData.get("slug") || "post"));

  if (kind !== "blog" && kind !== "work") {
    return NextResponse.json({ message: "Invalid content kind" }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Missing file" }, { status: 400 });
  }

  const safeSlug = slug || "post";
  const root = getImageRoot(kind);
  const filename = `${Date.now()}-${makeFileSlug(file.name)}`;
  const targetDir = path.join(root, safeSlug);
  await mkdir(targetDir, { recursive: true });

  const targetPath = path.join(targetDir, filename);
  const bytes = await file.arrayBuffer();
  await writeFile(targetPath, Buffer.from(bytes));

  return NextResponse.json({
    path: getImagePublicPath(kind, safeSlug, filename),
    filename,
  });
}
