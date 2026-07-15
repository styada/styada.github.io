export const dynamic = "force-dynamic";

import { Column, Heading, Text } from "@once-ui-system/core";
import { getPosts } from "@/utils/utils";
import { WriterClient } from "@/components/writer/WriterClient";
import type { WriterPostRecord } from "@/utils/writer";

function loadPosts(): WriterPostRecord[] {
  const blogPosts = getPosts(["src", "app", "blog", "posts"]).map((post) => ({
    kind: "blog" as const,
    slug: post.slug,
    title: post.metadata.title,
    summary: post.metadata.summary,
    publishedAt: post.metadata.publishedAt,
    tag: post.metadata.tag || "",
    image: post.metadata.image || "",
    body: post.content,
    sourcePath: `src/app/blog/posts/${post.slug}.mdx`,
  }));

  const workPosts = getPosts(["src", "app", "work", "projects"]).map((post) => ({
    kind: "work" as const,
    slug: post.slug,
    title: post.metadata.title,
    summary: post.metadata.summary,
    publishedAt: post.metadata.publishedAt,
    tags: post.metadata.tags || [],
    images: post.metadata.images || [],
    link: post.metadata.link || "",
    body: post.content,
    sourcePath: `src/app/work/projects/${post.slug}.mdx`,
  }));

  return [...blogPosts, ...workPosts].sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

export default function WriterPage() {
  const posts = loadPosts();

  return (
    <Column fillWidth gap="l" maxWidth="xl">
      <Column gap="8" maxWidth="s">
        <Heading variant="display-strong-s">Local Writer</Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Draft blog and work posts locally, upload images into the repo, and save straight to MDX.
        </Text>
      </Column>
      <WriterClient posts={posts} />
    </Column>
  );
}
