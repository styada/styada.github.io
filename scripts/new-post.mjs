#!/usr/bin/env node
/**
 * new-post.mjs — Scaffold a new blog or work post.
 *
 * Usage:
 *   node scripts/new-post.mjs blog "My Blog Post Title"
 *   node scripts/new-post.mjs work "My Project Name" --tags "Python,FastAPI,AI Agents"
 *   node scripts/new-post.mjs blog "Quick Thought" --date 2026-07-20
 *
 * Flags:
 *   --tags "comma,separated,tags"   (work only, default: ["Project Showcase"])
 *   --date YYYY-MM-DD               (default: today)
 *   --slug custom-slug               (default: auto-slugified from title)
 *   --summary "A short summary"      (default: empty placeholder)
 *   --link "https://github.com/..."  (work only)
 *   --image "/path/to/cover"         (blog only)
 *   --open                          (open the file in $EDITOR after creation)
 */

import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

// --- helpers ---

function slugify(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['".]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function parseArgs(argv) {
  const args = { kind: null, title: null, tags: null, date: null, slug: null, summary: null, link: null, image: null, open: false };
  const positional = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--tags") { args.tags = argv[++i]; continue; }
    if (arg === "--date") { args.date = argv[++i]; continue; }
    if (arg === "--slug") { args.slug = argv[++i]; continue; }
    if (arg === "--summary") { args.summary = argv[++i]; continue; }
    if (arg === "--link") { args.link = argv[++i]; continue; }
    if (arg === "--image") { args.image = argv[++i]; continue; }
    if (arg === "--open") { args.open = true; continue; }
    if (arg === "--help" || arg === "-h") { args.help = true; continue; }
    positional.push(arg);
  }

  if (positional.length >= 1) args.kind = positional[0];
  if (positional.length >= 2) args.title = positional.slice(1).join(" ");

  return args;
}

function printHelp() {
  console.log(`
new-post.mjs — Scaffold a new blog or work post

Usage:
  node scripts/new-post.mjs blog "My Blog Post Title"
  node scripts/new-post.mjs work "My Project Name" --tags "Python,FastAPI,AI Agents"
  node scripts/new-post.mjs blog "Quick Thought" --date 2026-07-20

Flags:
  --tags "comma,separated,tags"   (work only, default: ["Project Showcase"])
  --date YYYY-MM-DD               (default: today)
  --slug custom-slug               (default: auto-slugified from title)
  --summary "A short summary"      (default: empty placeholder)
  --link "https://github.com/..."  (work only)
  --image "/path/to/cover"         (blog only)
  --open                           (open the file in $EDITOR after creation)
`);
}

// --- frontmatter builders ---

function buildBlogFrontmatter(title, summary, date, image, slug) {
  const fm = {
    title: `"${title}"`,
    summary: `"${summary || "TODO: Write a 1-2 sentence summary."}"`,
    publishedAt: `"${date}"`,
  };
  if (image) fm.image = `"${image}"`;
  fm.tag = '"Blog"';
  fm.team = [
    {
      name: "Sai Suchir Tyada",
      avatar: "/images/avatar.jpg",
      linkedIn: "https://www.linkedin.com/in/saisuchirtyada/",
    },
  ];
  return fm;
}

function buildWorkFrontmatter(title, summary, date, tags, link) {
  const tagList = tags
    ? tags.split(",").map((t) => t.trim()).filter(Boolean)
    : ["Project Showcase"];

  const fm = {
    title: `"${title}"`,
    summary: `"${summary || "TODO: Write a 1-2 sentence summary."}"`,
    publishedAt: `"${date}"`,
  };
  fm.images = [`"/images/projects/project-01/blogs/ai_zero_to_hero.png"`];
  fm.tags = JSON.stringify(tagList);
  if (link) fm.link = `"${link}"`;
  fm.team = [
    {
      name: "Sai Suchir Tyada",
      avatar: "/images/avatar.jpg",
      linkedIn: "https://www.linkedin.com/in/saisuchirtyada/",
    },
  ];
  return fm;
}

function frontmatterToYaml(fm) {
  // Custom serializer that handles arrays and nested objects
  const lines = ["---"];

  for (const [key, value] of Object.entries(fm)) {
    if (key === "team" && Array.isArray(value)) {
      lines.push("team:");
      for (const member of value) {
        lines.push(`  - name: "${member.name}"`);
        lines.push(`    avatar: "${member.avatar}"`);
        lines.push(`    linkedIn: "${member.linkedIn}"`);
      }
    } else if (key === "images" && Array.isArray(value)) {
      lines.push("images:");
      for (const img of value) {
        lines.push(`    - ${img}`);
      }
    } else if (key === "tags" && typeof value === "string") {
      // tags is already a JSON string like ["A", "B"]
      lines.push(`tags: ${value}`);
    } else if (Array.isArray(value)) {
      lines.push(`${key}: ${JSON.stringify(value)}`);
    } else {
      lines.push(`${key}: ${value}`);
    }
  }

  lines.push("---");
  return lines.join("\n");
}

// --- main ---

const cwd = process.cwd();
const args = parseArgs(process.argv.slice(2));

if (args.help || !args.kind || !args.title) {
  printHelp();
  process.exit(args.help ? 0 : 1);
}

const kind = args.kind;
if (kind !== "blog" && kind !== "work") {
  console.error(`Error: kind must be "blog" or "work", got "${kind}"`);
  process.exit(1);
}

const title = args.title;
const slug = args.slug ? slugify(args.slug) : slugify(title);
const date = args.date || today();

if (!slug) {
  console.error("Error: Could not generate a slug from the title. Use --slug to set one.");
  process.exit(1);
}

const postsDir = kind === "blog"
  ? path.join(cwd, "src", "app", "blog", "posts")
  : path.join(cwd, "src", "app", "work", "projects");

const filePath = path.join(postsDir, `${slug}.mdx`);

// Check if file already exists
if (fs.existsSync(filePath)) {
  console.error(`Error: File already exists: ${path.relative(cwd, filePath)}`);
  console.error(`Use a different title or --slug to create a new post.`);
  process.exit(1);
}

// Build frontmatter
const fm =
  kind === "blog"
    ? buildBlogFrontmatter(title, args.summary, date, args.image, slug)
    : buildWorkFrontmatter(title, args.summary, date, args.tags, args.link);

const frontmatter = frontmatterToYaml(fm);

// Body template
const body = kind === "blog"
  ? `\n## Introduction\n\nStart writing here.\n`
  : `\n## Project Motivation\n\nDescribe what problem this project solves.\n\n## How It Works\n\nExplain the architecture and key decisions.\n\n## Challenges and Learnings\n\nWhat was hard? What surprised you?\n\n## What's Next\n\nFuture plans and improvements.\n`;

const content = `${frontmatter}\n${body}\n`;

// Ensure directory exists
fs.mkdirSync(postsDir, { recursive: true });

// Write the file
fs.writeFileSync(filePath, content, "utf-8");
console.log(`Created: ${path.relative(cwd, filePath)}`);
console.log(`  Kind: ${kind}`);
console.log(`  Slug: ${slug}`);
console.log(`  Date: ${date}`);
console.log(`  Title: ${title}`);

// Open in editor if requested
if (args.open) {
  const editor = process.env.EDITOR || "vim";
  try {
    execFileSync(editor, [filePath], { stdio: "inherit" });
  } catch {
    console.log(`Could not open editor. File is at: ${filePath}`);
  }
}
