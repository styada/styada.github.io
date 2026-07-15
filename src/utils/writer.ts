import path from "path";

export type WriterKind = "blog" | "work";

export type WriterDraft = {
  kind: WriterKind;
  title: string;
  slug: string;
  summary: string;
  publishedAt: string;
  tag?: string;
  tags?: string[];
  link?: string;
  image?: string;
  images?: string[];
  body: string;
  originalPath?: string;
};

export type WriterPostRecord = {
  kind: WriterKind;
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  tag?: string;
  tags?: string[];
  link?: string;
  image?: string;
  images?: string[];
  body: string;
  sourcePath: string;
};

export const writerPaths = {
  blogPostsDir: path.join(process.cwd(), "src", "app", "blog", "posts"),
  workPostsDir: path.join(process.cwd(), "src", "app", "work", "projects"),
  blogImageRoot: path.join(process.cwd(), "public", "images", "blog"),
  workImageRoot: path.join(process.cwd(), "public", "images", "projects"),
} as const;

export function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['".]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function makeFileSlug(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  const base = slugify(path.basename(filename, ext)) || "image";
  return `${base}${ext || ".png"}`;
}

export function getPostDir(kind: WriterKind) {
  return kind === "blog" ? writerPaths.blogPostsDir : writerPaths.workPostsDir;
}

export function getImageRoot(kind: WriterKind) {
  return kind === "blog" ? writerPaths.blogImageRoot : writerPaths.workImageRoot;
}

export function getImagePublicPath(kind: WriterKind, slug: string, filename: string) {
  const root = kind === "blog" ? "/images/blog" : "/images/projects";
  return `${root}/${slug}/${filename}`;
}

export function normalizeDate(date: string) {
  if (!date) return "";
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return date;
  return value.toISOString().split("T")[0];
}
