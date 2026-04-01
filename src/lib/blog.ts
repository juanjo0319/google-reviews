import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  category: string;
  tags: string[];
  readTime: string;
  content: string;
};

function parseFrontmatter(slug: string): BlogPost {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title ?? "",
    description: data.description ?? "",
    publishedAt: data.publishedAt ?? "",
    updatedAt: data.updatedAt ?? data.publishedAt ?? "",
    author: data.author ?? "RevUp.ai Team",
    category: data.category ?? "General",
    tags: data.tags ?? [],
    readTime: data.readTime ?? "5 min read",
    content,
  };
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"));

  return files
    .map((f) => parseFrontmatter(f.replace(/\.mdx$/, "")))
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

export function getPost(slug: string): BlogPost | null {
  try {
    return parseFrontmatter(slug);
  } catch {
    return null;
  }
}

export function getPostsByCategory(category: string): BlogPost[] {
  return getAllPosts().filter((p) => p.category === category);
}
