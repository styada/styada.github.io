import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { mkdir, rm, writeFile } from "fs/promises";
import matter from "gray-matter";
import { getPostDir, slugify, type WriterDraft, type WriterKind } from "@/utils/writer";

export const dynamic = "force-dynamic";

function isWriterEnabled() {
  return process.env.NODE_ENV !== "production";
}

function teamBlock() {
  return [
    {
      name: "Sai Suchir Tyada",
      avatar: "/images/avatar.jpg",
      linkedIn: "https://www.linkedin.com/in/saisuchirtyada/",
    },
  ];
}

function buildFrontmatter(draft: WriterDraft) {
  const base = {
    title: draft.title,
    summary: draft.summary,
    publishedAt: draft.publishedAt,
    team: teamBlock(),
  } as Record<string, unknown>;

  if (draft.kind === "blog") {
    if (draft.image) base.image = draft.image;
    if (draft.tag?.trim()) base.tag = draft.tag.trim();
  }

  if (draft.kind === "work") {
    if (draft.images?.length) base.images = draft.images;
    if (draft.tags?.length) base.tags = draft.tags;
    if (draft.link?.trim()) base.link = draft.link.trim();
  }

  return base;
}

function resolveTargetPath(kind: WriterKind, slug: string) {
  return path.join(getPostDir(kind), `${slug}.mdx`);
}

export async function POST(request: NextRequest) {
  if (!isWriterEnabled()) {
    return NextResponse.json({ message: "Not available" }, { status: 404 });
  }

  const payload = (await request.json()) as WriterDraft;
  const kind = payload.kind;
  if (kind !== "blog" && kind !== "work") {
    return NextResponse.json({ message: "Invalid content kind" }, { status: 400 });
  }

  const slug = slugify(payload.slug || payload.title);
  if (!slug) {
    return NextResponse.json({ message: "Title or slug is required" }, { status: 400 });
  }
  const targetPath = resolveTargetPath(kind, slug);
  const previousPath = payload.originalPath ? path.join(process.cwd(), payload.originalPath) : null;

  await mkdir(path.dirname(targetPath), { recursive: true });

  const body = payload.body?.trim() ? `${payload.body.trim()}\n` : "";
  const fileContents = matter.stringify(body, buildFrontmatter({ ...payload, slug }));
  await writeFile(targetPath, fileContents, "utf8");

  if (previousPath && previousPath !== targetPath) {
    try {
      await rm(previousPath);
    } catch {
      // Ignore missing old files during rename.
    }
  }

  return NextResponse.json({
    ok: true,
    slug,
    path: path.relative(process.cwd(), targetPath),
  });
}
