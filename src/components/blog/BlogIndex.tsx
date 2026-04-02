"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

type PostSummary = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  author: string;
  category: string;
  readTime: string;
};

function PostCard({
  post,
  featured = false,
}: {
  post: PostSummary;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group flex flex-col rounded-2xl border border-neutral-200 bg-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20",
        featured && "md:flex-row md:col-span-full"
      )}
    >
      {/* Cover gradient */}
      <div
        className={cn(
          "bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 flex items-center justify-center shrink-0",
          featured ? "md:w-2/5 h-48 md:h-auto" : "h-40"
        )}
      >
        <span className="text-4xl opacity-20">📝</span>
      </div>

      <div className={cn("p-6 flex flex-col flex-1", featured && "md:p-8")}>
        <div className="flex items-center gap-3 mb-3">
          <Badge variant="primary">{post.category}</Badge>
          <span className="flex items-center gap-1 text-xs text-neutral-400">
            <Clock className="h-3 w-3" />
            {post.readTime}
          </span>
        </div>

        <h2
          className={cn(
            "font-heading font-semibold text-neutral-950 group-hover:text-primary transition-colors mb-2",
            featured ? "text-2xl md:text-3xl" : "text-xl"
          )}
        >
          {post.title}
        </h2>

        <p
          className={cn(
            "text-neutral-600 text-sm leading-relaxed line-clamp-2 mb-4",
            featured && "md:line-clamp-3 md:text-base"
          )}
        >
          {post.description}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <div className="h-6 w-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white text-[10px] font-semibold">
              {post.author
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <span>{post.author}</span>
            <span className="text-neutral-300">&middot;</span>
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </time>
          </div>

          <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            Read
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

const CATEGORIES = ["All", "Guides", "Templates", "Industry Tips"];

export function BlogIndex({ posts }: { posts: PostSummary[] }) {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredPosts =
    activeCategory === "All"
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  const featuredPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);

  return (
    <section className="py-[var(--section-padding-y)] px-[var(--section-padding-x)]">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary mb-4">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
            Blog
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-neutral-950 mb-4">
            The RevUp.ai Blog
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Expert guides, actionable tips, and industry insights to help you
            master Google review management.
          </p>
        </div>

        {/* Category filter pills */}
        <div className="flex items-center justify-center gap-2 mb-12 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-all",
                activeCategory === cat
                  ? "gradient-button text-white shadow-md"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Posts grid */}
        {filteredPosts.length === 0 ? (
          <p className="text-center text-neutral-500 py-12">
            No posts in this category yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPost && <PostCard post={featuredPost} featured />}
            {remainingPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
