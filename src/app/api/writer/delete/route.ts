import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { rm } from "fs/promises";
import { getPostDir, slugify, type WriterKind } from "@/utils/writer";

export const dynamic = "force-dynamic";

function isWriterEnabled() {
  return process.env.NODE_ENV !== "production";
}

export async function POST(request: NextRequest) {
  if (!isWriterEnabled()) {
    return NextResponse.json({ message: "Not available" }, { status: 404 });
  }

  const payload = (await request.json()) as {
    kind: WriterKind;
    slug: string;
  };

  const kind = payload.kind;
  if (kind !== "blog" && kind !== "work") {
    return NextResponse.json({ message: "Invalid content kind" }, { status: 400 });
  }

  const slug = slugify(payload.slug);
  if (!slug) {
    return NextResponse.json({ message: "Slug is required" }, { status: 400 });
  }

  const targetPath = path.join(getPostDir(kind), `${slug}.mdx`);

  try {
    await rm(targetPath, { force: false });
  } catch {
    return NextResponse.json({ message: "Post not found" }, { status: 404 });
  }

  // Optionally clean up the image directory for this post
  const imageRoot = kind === "blog"
    ? path.join(process.cwd(), "public", "images", "blog", slug)
    : path.join(process.cwd(), "public", "images", "projects", slug);

  try {
    await rm(imageRoot, { recursive: true, force: true });
  } catch {
    // Ignore image cleanup errors
  }

  return NextResponse.json({ ok: true, slug, kind });
}
