"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { Button, Flex, Heading, Text } from "@once-ui-system/core";
import styles from "./WriterClient.module.scss";
import { slugify, type WriterKind, type WriterPostRecord } from "@/utils/writer";

type WriterState = {
  kind: WriterKind;
  title: string;
  slug: string;
  summary: string;
  publishedAt: string;
  tag: string;
  tagsInput: string;
  link: string;
  image: string;
  images: string[];
  body: string;
  originalPath?: string;
};

type WriterClientProps = {
  posts: WriterPostRecord[];
};

function createBlank(kind: WriterKind = "blog"): WriterState {
  return {
    kind,
    title: "",
    slug: "",
    summary: "",
    publishedAt: new Date().toISOString().split("T")[0],
    tag: "",
    tagsInput: "",
    link: "",
    image: "",
    images: [],
    body: "",
  };
}

function hydratePost(post: WriterPostRecord): WriterState {
  return {
    kind: post.kind,
    title: post.title,
    slug: post.slug,
    summary: post.summary,
    publishedAt: post.publishedAt?.split("T")[0] || "",
    tag: post.tag || "",
    tagsInput: post.tags?.join(", ") || "",
    link: post.link || "",
    image: post.image || "",
    images: post.images || [],
    body: post.body || "",
    originalPath: post.sourcePath,
  };
}

async function uploadAsset(file: File, kind: WriterKind, slug: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("kind", kind);
  formData.append("slug", slug || "post");

  const response = await fetch("/api/writer/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image");
  }

  return (await response.json()) as { path: string };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatInline(text: string) {
  let html = escapeHtml(text);
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
    return `<img alt="${escapeHtml(alt)}" src="${escapeHtml(src)}" />`;
  });
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    return `<a href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${label}</a>`;
  });
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/_([^_]+)_/g, "<em>$1</em>");
  return html;
}

function markdownToHtml(markdown: string) {
  const lines = markdown.split(/\r?\n/);
  const blocks: string[] = [];
  let paragraph: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let listItems: string[] = [];
  let inCode = false;
  let codeLang = "";
  let codeLines: string[] = [];
  let quoteLines: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(`<p>${formatInline(paragraph.join("<br />"))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!listType || !listItems.length) return;
    blocks.push(`<${listType}>${listItems.join("")}</${listType}>`);
    listType = null;
    listItems = [];
  };

  const flushQuote = () => {
    if (!quoteLines.length) return;
    blocks.push(`<blockquote>${formatInline(quoteLines.join("<br />"))}</blockquote>`);
    quoteLines = [];
  };

  const flushCode = () => {
    if (!codeLines.length) return;
    blocks.push(
      `<pre><code data-lang="${escapeHtml(codeLang || "text")}">${escapeHtml(codeLines.join("\n"))}</code></pre>`,
    );
    codeLines = [];
    codeLang = "";
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCode) {
        inCode = false;
        flushCode();
      } else {
        flushParagraph();
        flushList();
        flushQuote();
        inCode = true;
        codeLang = trimmed.slice(3).trim();
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      flushQuote();
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      flushQuote();
      const level = headingMatch[1].length;
      blocks.push(`<h${level}>${formatInline(headingMatch[2])}</h${level}>`);
      continue;
    }

    const quoteMatch = trimmed.match(/^>\s?(.*)$/);
    if (quoteMatch) {
      flushParagraph();
      flushList();
      quoteLines.push(quoteMatch[1]);
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*+]\s+(.*)$/);
    if (unorderedMatch) {
      flushParagraph();
      flushQuote();
      if (listType !== "ul") {
        flushList();
        listType = "ul";
      }
      listItems.push(`<li>${formatInline(unorderedMatch[1])}</li>`);
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph();
      flushQuote();
      if (listType !== "ol") {
        flushList();
        listType = "ol";
      }
      listItems.push(`<li>${formatInline(orderedMatch[1])}</li>`);
      continue;
    }

    flushList();
    flushQuote();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  flushQuote();
  flushCode();

  return blocks.join("");
}

export function WriterClient({ posts }: WriterClientProps) {
  const [draft, setDraft] = useState<WriterState>(() => {
    return posts[0] ? hydratePost(posts[0]) : createBlank("blog");
  });
  const [listKind, setListKind] = useState<WriterKind>(() => {
    return posts[0]?.kind || "blog";
  });
  const [status, setStatus] = useState<string>("Ready");
  const [saving, setSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const slugTouched = useRef(false);
  const previewHtml = useMemo(() => markdownToHtml(draft.body), [draft.body]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => post.kind === listKind);
  }, [posts, listKind]);

  function updateDraft<K extends keyof WriterState>(key: K, value: WriterState[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function insertAtCursor(insert: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      updateDraft("body", `${draft.body}${draft.body ? "\n" : ""}${insert}`);
      return;
    }

    const start = textarea.selectionStart ?? draft.body.length;
    const end = textarea.selectionEnd ?? draft.body.length;
    const nextBody = `${draft.body.slice(0, start)}${insert}${draft.body.slice(end)}`;
    updateDraft("body", nextBody);

    requestAnimationFrame(() => {
      textarea.focus();
      const position = start + insert.length;
      textarea.setSelectionRange(position, position);
    });
  }

  function surroundSelection(prefix: string, suffix = prefix) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const selected = draft.body.slice(start, end);
    const replacement = `${prefix}${selected || "text"}${suffix}`;
    const nextBody = `${draft.body.slice(0, start)}${replacement}${draft.body.slice(end)}`;
    updateDraft("body", nextBody);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursorStart = start + prefix.length;
      const cursorEnd = selected ? cursorStart + selected.length : cursorStart + 4;
      textarea.setSelectionRange(cursorStart, cursorEnd);
    });
  }

  function prefixSelectedLines(prefix: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const selected = draft.body.slice(start, end) || "item";
    const next = selected
      .split("\n")
      .map((line) => `${prefix}${line}`)
      .join("\n");
    const nextBody = `${draft.body.slice(0, start)}${next}${draft.body.slice(end)}`;
    updateDraft("body", nextBody);
  }

  async function handleImageDrop(files: FileList | File[]) {
    const slug = draft.slug || slugify(draft.title) || "post";
    const uploads = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (!uploads.length) return;

    setStatus(`Uploading ${uploads.length} image${uploads.length === 1 ? "" : "s"}...`);
    const inserted: string[] = [];

    for (const file of uploads) {
      const result = await uploadAsset(file, draft.kind, slug);
      inserted.push(`![${file.name}](${result.path})`);
    }

    insertAtCursor(inserted.join("\n\n"));
    slugTouched.current = true;
    setStatus("Image inserted");
  }

  async function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const slug = draft.slug || slugify(draft.title) || "post";
    setStatus("Uploading cover image...");
    const result = await uploadAsset(file, draft.kind, slug);
    updateDraft("image", result.path);
    slugTouched.current = true;
    setStatus("Cover image updated");
    event.target.value = "";
  }

  async function handleGalleryChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const slug = draft.slug || slugify(draft.title) || "post";
    setStatus(`Uploading ${files.length} gallery image${files.length === 1 ? "" : "s"}...`);
    const uploaded: string[] = [];
    for (const file of files) {
      const result = await uploadAsset(file, draft.kind, slug);
      uploaded.push(result.path);
    }
    updateDraft("images", [...draft.images, ...uploaded]);
    slugTouched.current = true;
    setStatus("Gallery images added");
    event.target.value = "";
  }

  async function handleDelete() {
    if (!draft.slug) {
      setStatus("Nothing to delete");
      return;
    }
    const confirmed = window.confirm(
      `Delete "${draft.title || draft.slug}"? This removes the .mdx file and its image folder. This cannot be undone.`,
    );
    if (!confirmed) return;

    setSaving(true);
    try {
      const response = await fetch("/api/writer/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: draft.kind, slug: draft.slug }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Delete failed");
      }

      setStatus(`Deleted ${draft.slug}.mdx`);
      setDraft(createBlank(draft.kind));
      slugTouched.current = false;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const response = await fetch("/api/writer/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...draft,
          slug: draft.slug || slugify(draft.title) || "post",
          tags: draft.tagsInput
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) {
        throw new Error("Save failed");
      }

      const result = (await response.json()) as { path: string; slug: string };
      setDraft((current) => ({
        ...current,
        slug: result.slug,
        originalPath: result.path,
      }));
      setStatus(`Saved to ${result.path}`);
      slugTouched.current = true;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function startNew(kind: WriterKind) {
    setListKind(kind);
    setDraft(createBlank(kind));
    setStatus(`New ${kind} draft`);
    slugTouched.current = false;
  }

  function selectPost(post: WriterPostRecord) {
    setListKind(post.kind);
    setDraft(hydratePost(post));
    setStatus(`Loaded ${post.title}`);
    slugTouched.current = true;
  }

  function handleTitleChange(value: string) {
    updateDraft("title", value);
    if (!slugTouched.current) {
      updateDraft("slug", slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    slugTouched.current = true;
    updateDraft("slug", slugify(value));
  }

  const fileCountLabel = draft.kind === "work" ? `${draft.images.length} gallery image${draft.images.length === 1 ? "" : "s"}` : draft.image ? "Cover image set" : "No cover image";

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.titleRow}>
          <Heading as="h1" variant="display-strong-xs">
            Writer
          </Heading>
          <Text variant="body-default-s" onBackground="neutral-weak">
            Local only
          </Text>
        </div>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Thin MDX editor with markdown shortcuts and direct image uploads.
        </Text>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${listKind === "blog" ? styles.tabActive : ""}`}
            onClick={() => setListKind("blog")}
            type="button"
          >
            Blog
          </button>
          <button
            className={`${styles.tab} ${listKind === "work" ? styles.tabActive : ""}`}
            onClick={() => setListKind("work")}
            type="button"
          >
            Work
          </button>
        </div>

        <Flex gap="8" wrap marginBottom="16">
          <button className={styles.miniButton} type="button" onClick={() => startNew(listKind)}>
            New {listKind}
          </button>
          <button className={styles.miniButton} type="button" onClick={() => setDraft(createBlank(listKind))}>
            Clear
          </button>
        </Flex>

        <div className={styles.postList}>
          {filteredPosts.map((post) => (
              <button
              key={post.sourcePath}
              type="button"
              className={`${styles.listItem} ${draft.originalPath === post.sourcePath ? styles.listItemActive : ""}`}
              onClick={() => selectPost(post)}
            >
              <span className={styles.listItemTitle}>{post.title}</span>
              <span className={styles.listItemMeta}>{post.slug}</span>
              <span className={styles.listItemMeta}>{post.publishedAt}</span>
            </button>
          ))}
          {!filteredPosts.length && (
            <Text variant="body-default-s" onBackground="neutral-weak">
              No {listKind} posts found.
            </Text>
          )}
        </div>
      </aside>

      <main className={styles.panel}>
        <div className={styles.contentGrid}>
          <section className={styles.editorColumn}>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label htmlFor="kind">Kind</label>
                <select
                  id="kind"
                  value={draft.kind}
                  onChange={(event) => {
                    const nextKind = event.target.value as WriterKind;
                    setDraft((current) => ({ ...current, kind: nextKind }));
                    setListKind(nextKind);
                  }}
                >
                  <option value="blog">Blog</option>
                  <option value="work">Work</option>
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="publishedAt">Published</label>
                <input
                  id="publishedAt"
                  type="date"
                  value={draft.publishedAt}
                  onChange={(event) => updateDraft("publishedAt", event.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  value={draft.title}
                  onChange={(event) => handleTitleChange(event.target.value)}
                  placeholder="Post title"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="slug">Slug</label>
                <input
                  id="slug"
                  value={draft.slug}
                  onChange={(event) => handleSlugChange(event.target.value)}
                  placeholder="post-slug"
                />
              </div>

              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label htmlFor="summary">Summary</label>
                <textarea
                  id="summary"
                  rows={3}
                  value={draft.summary}
                  onChange={(event) => updateDraft("summary", event.target.value)}
                  placeholder="One or two sentence summary"
                />
              </div>

              {draft.kind === "blog" && (
                <>
                  <div className={styles.field}>
                    <label htmlFor="tag">Tag</label>
                    <input
                      id="tag"
                      value={draft.tag}
                      onChange={(event) => updateDraft("tag", event.target.value)}
                      placeholder="Generative AI"
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="cover">Cover Image</label>
                    <input id="cover" type="file" accept="image/*" onChange={handleCoverChange} />
                  </div>
                </>
              )}

              {draft.kind === "work" && (
                <>
                  <div className={styles.field}>
                    <label htmlFor="tags">Tags</label>
                    <input
                      id="tags"
                      value={draft.tagsInput}
                      onChange={(event) => updateDraft("tagsInput", event.target.value)}
                      placeholder="Python, FastAPI, AI Agents"
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="link">Project Link</label>
                    <input
                      id="link"
                      value={draft.link}
                      onChange={(event) => updateDraft("link", event.target.value)}
                      placeholder="https://..."
                    />
                  </div>

                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label htmlFor="gallery">Gallery Images</label>
                    <input id="gallery" type="file" accept="image/*" multiple onChange={handleGalleryChange} />
                  </div>
                </>
              )}
            </div>

            <div className={styles.toolbar}>
              <button className={styles.toolbarButton} type="button" onClick={() => surroundSelection("**")}>
                Bold
              </button>
              <button className={styles.toolbarButton} type="button" onClick={() => surroundSelection("_")}>
                Italic
              </button>
              <button className={styles.toolbarButton} type="button" onClick={() => prefixSelectedLines("- ")}>
                Bullet
              </button>
              <button className={styles.toolbarButton} type="button" onClick={() => prefixSelectedLines("1. ")}>
                Numbered
              </button>
              <button className={styles.toolbarButton} type="button" onClick={() => prefixSelectedLines("> ")}>
                Quote
              </button>
              <button className={styles.toolbarButton} type="button" onClick={() => insertAtCursor("\n```ts\ncode\n```\n")}>
                Code Block
              </button>
              <button className={styles.toolbarButton} type="button" onClick={() => insertAtCursor("[link](https://)")}>
                Link
              </button>
              <button className={styles.toolbarButton} type="button" onClick={() => insertAtCursor("![alt text](/images/)")}>
                Image
              </button>
            </div>

            <div
              className={`${styles.dropzone} ${dragActive ? styles.dropzoneActive : ""}`}
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={async (event) => {
                event.preventDefault();
                setDragActive(false);
                const files = event.dataTransfer.files;
                if (files.length) {
                  await handleImageDrop(files);
                }
              }}
            >
              Drop images here to upload and insert markdown image links.
            </div>

            <div className={styles.section} style={{ marginTop: 12 }}>
              <label htmlFor="body">Body</label>
              <textarea
                ref={textareaRef}
                id="body"
                className={styles.editor}
                value={draft.body}
                onChange={(event) => updateDraft("body", event.target.value)}
                placeholder="Write your post in markdown or MDX..."
                onDrop={async (event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setDragActive(false);
                  if (event.dataTransfer.files.length) {
                    await handleImageDrop(event.dataTransfer.files);
                  }
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
              />
            </div>

            <div className={styles.footer}>
              <div className={styles.chips}>
                <span className={styles.chip}>{draft.kind}</span>
                <span className={styles.chip}>{fileCountLabel}</span>
                {draft.originalPath && <span className={styles.chip}>{draft.originalPath}</span>}
              </div>
              <div className={styles.status}>{status}</div>
              <Flex gap="8" wrap="wrap">
                <button
                  className={styles.miniButton}
                  type="button"
                  onClick={handleDelete}
                  disabled={saving || !draft.originalPath}
                  style={draft.originalPath ? { color: "var(--accent-on-background-strong)" } : {}}
                >
                  Delete
                </button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save MDX"}
                </Button>
              </Flex>
            </div>
          </section>

          <aside className={styles.previewColumn}>
            <div className={styles.previewHeader}>
              <div>
                <Text variant="label-default-s" onBackground="neutral-weak">
                  Preview
                </Text>
                <Heading variant="display-strong-xs">{draft.title || "Untitled draft"}</Heading>
              </div>
              <div className={styles.previewBadge}>{draft.kind}</div>
            </div>

            <article className={styles.previewCard}>
              <div className={styles.previewMeta}>
                <span>{draft.publishedAt || "No date"}</span>
                {draft.tag && <span>{draft.tag}</span>}
                {!draft.tag && draft.tagsInput && <span>{draft.tagsInput}</span>}
              </div>
              {draft.summary && <p className={styles.previewSummary}>{draft.summary}</p>}
              {draft.image && <img className={styles.previewHero} src={draft.image} alt={draft.title || "Cover"} />}
              {draft.kind === "work" && draft.images.length > 0 && (
                <div className={styles.previewGallery}>
                  {draft.images.slice(0, 6).map((src) => (
                    <img key={src} className={styles.previewThumb} src={src} alt="" />
                  ))}
                </div>
              )}
              <div
                className={styles.previewBody}
                dangerouslySetInnerHTML={{ __html: previewHtml || "<p>Write something to see a preview.</p>" }}
              />
            </article>
          </aside>
        </div>
      </main>
    </div>
  );
}
