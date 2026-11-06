#!/usr/bin/env node
/**
 * new-post.mjs — scaffolder for the magic-portfolio (Once UI) blog.
 *
 * Usage:
 *   npm run new:blog -- "My Post Title"        # creates src/app/blog/posts/<slug>.mdx
 *   npm run new:work -- "My Project Title"     # creates src/app/work/projects/<slug>.mdx
 *   npm run new:blog -- "Title" --tags "AI,Agents"   # for work: --tags and --images
 *   npm run new:blog -- --dry-run "Title"      # print what would be created, don't write
 *
 * Interactive when no title is given.
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const REPO_ROOT = process.cwd();
const TODAY = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

const DEFAULTS = {
  blog: {
    dir: "src/app/blog/posts",
    frontmatter: {
      title: "",
      summary: "",
      publishedAt: TODAY,
      image: "/images/projects/project-01/blogs/ai_zero_to_hero.png",
      tag: "Blog",
      team: [
        {
          name: "Sai Suchir Tyada",
          avatar: "/images/avatar.jpg",
          linkedIn: "https://www.linkedin.com/in/saisuchirtyada/",
        },
      ],
    },
  },
  work: {
    dir: "src/app/work/projects",
    frontmatter: {
      title: "",
      summary: "",
      publishedAt: TODAY,
      images: ["/images/projects/project-01/blogs/ai_zero_to_hero.png"],
      tags: ["Project Showcase"],
      team: [
        {
          name: "Sai Suchir Tyada",
          avatar: "/images/avatar.jpg",
          linkedIn: "https://www.linkedin.com/in/saisuchirtyada/",
        },
      ],
    },
  },
};

function slugify(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/['"`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parseArgs(argv) {
  const args = { title: "", kind: null, dryRun: false, tags: null, images: null, summary: null };
  // First positional "blog" or "work" selects the kind. After that, only the
  // title may follow (consuming the rest of argv verbatim, with --dry-run
  // stripped). Other flags (--summary, --tags, --images) are only honored
  // when the script is invoked directly (not via npm-run), where the user
  // passes `node new-post.mjs blog "Title" --tags "..."`.
  let i = 0;
  if (argv[0] === "blog" || argv[0] === "work") {
    args.kind = argv[0];
    i = 1;
  }
  for (; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") args.dryRun = true;
    else if (a === "--tags") args.tags = (argv[++i] || "").split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "--images") args.images = (argv[++i] || "").split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "--summary") args.summary = argv[++i] || "";
    else if (a.startsWith("--")) { /* unknown flag, ignore */ }
    else args.title = args.title ? `${args.title} ${a}` : a;
  }
  args.title = args.title.trim();
  return args;
}

function yamlScalar(v) {
  if (/[:#\n"']/.test(v) || v === "" || /^\s|\s$/.test(v) || /^(true|false|null|~)$/i.test(v) || /^\d/.test(v)) {
    return JSON.stringify(v);
  }
  return v;
}

function renderFrontmatter(fm) {
  const lines = ["---"];
  for (const [k, v] of Object.entries(fm)) {
    if (k === "team") {
      lines.push("team:");
      for (const m of v) {
        lines.push(`  - name: ${yamlScalar(m.name)}`);
        lines.push(`    avatar: ${yamlScalar(m.avatar)}`);
        lines.push(`    linkedIn: ${yamlScalar(m.linkedIn)}`);
      }
    } else if (k === "images" || k === "tags") {
      lines.push(`${k}:`);
      for (const item of v) lines.push(`    - ${yamlScalar(item)}`);
    } else if (Array.isArray(v)) {
      lines.push(`${k}: [${v.map(yamlScalar).join(", ")}]`);
    } else {
      lines.push(`${k}: ${yamlScalar(v)}`);
    }
  }
  lines.push("---", "");
  return lines.join("\n");
}

function buildPost(kind, { title, summary, tags, images }) {
  const cfg = DEFAULTS[kind];
  const fm = { ...cfg.frontmatter, title };
  if (summary) fm.summary = summary;
  if (kind === "work") {
    if (tags && tags.length) fm.tags = tags;
    if (images && images.length) fm.images = images;
  }
  const slug = slugify(title);
  const file = path.join(REPO_ROOT, cfg.dir, `${slug}.mdx`);
  const body = `${renderFrontmatter(fm)}## ${title}\n\nStart writing here. Frontmatter is already wired up — edit summary, images, tags, or dates before publishing.\n`;
  return { file, body, slug, frontmatter: fm };
}

async function prompt(question, fallback = "") {
  const rl = readline.createInterface({ input, output });
  try {
    const ans = (await rl.question(question)).trim();
    return ans || fallback;
  } finally {
    rl.close();
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  args.kind = args.kind || "blog";

  let title = args.title;
  if (!title) title = await prompt("Post title: ");
  if (!title) {
    console.error("✗ Title is required.");
    process.exit(1);
  }

  let summary = args.summary;
  if (!summary) summary = await prompt("One-line summary (optional): ", "");

  let tags = args.tags;
  if (args.kind === "work" && !tags) {
    const t = await prompt("Tags (comma-separated, optional): ", "");
    tags = t ? t.split(",").map((s) => s.trim()).filter(Boolean) : DEFAULTS.work.frontmatter.tags;
  }

  let images = args.images;
  if (args.kind === "work" && !images) {
    const i = await prompt("Cover image path (optional): ", "");
    images = i ? [i] : DEFAULTS.work.frontmatter.images;
  }

  const { file, body, slug } = buildPost(args.kind, { title, summary, tags, images });

  console.log(`\n→ ${args.kind === "blog" ? "Blog post" : "Work project"}: ${title}`);
  console.log(`  slug:  ${slug}`);
  console.log(`  file:  ${path.relative(REPO_ROOT, file)}`);

  if (args.dryRun) {
    console.log("\n--- dry-run: would write ---");
    console.log(body);
    console.log("--- end ---");
    return;
  }

  if (fs.existsSync(file)) {
    const overwrite = await prompt(`File already exists. Overwrite? [y/N] `, "N");
    if (!/^y(es)?$/i.test(overwrite)) {
      console.log("Aborted.");
      return;
    }
  }

  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body, "utf8");
  console.log(`✓ wrote ${path.relative(REPO_ROOT, file)}`);

  const tip = args.kind === "blog"
    ? "It will appear on /blog automatically once the route picks up the file."
    : "It will appear on /work and on the home featured grid once you wire a featured entry.";
  console.log(`  ${tip}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
