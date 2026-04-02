import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { BlogIndex } from "@/components/blog/BlogIndex";

export const metadata: Metadata = {
  title: "Blog — Review Management Tips, Guides & AI Insights",
  description:
    "Expert guides on Google review management, AI-powered response strategies, and reputation-building tips for local businesses.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const posts = getAllPosts().map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    publishedAt: p.publishedAt,
    author: p.author,
    category: p.category,
    readTime: p.readTime,
  }));

  return <BlogIndex posts={posts} />;
}
