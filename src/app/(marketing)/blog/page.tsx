import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Blog — Review Management Tips, Guides & AI Insights",
  description:
    "Expert guides on Google review management, AI-powered response strategies, and reputation-building tips for local businesses.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <SectionWrapper>
      <SectionHeading
        eyebrow="Blog"
        heading="The RevUp.ai Blog"
        description="Expert guides, actionable tips, and industry insights to help you master Google review management and grow your business."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="mb-4">
              <Badge variant="primary">{post.category}</Badge>
            </div>

            <h2 className="font-heading font-semibold text-xl text-neutral-950 group-hover:text-primary transition-colors mb-3">
              {post.title}
            </h2>

            <p className="text-neutral-600 text-sm leading-relaxed line-clamp-2 mb-6">
              {post.description}
            </p>

            <div className="mt-auto flex items-center justify-between text-xs text-neutral-500">
              <span>{post.author}</span>
              <div className="flex items-center gap-3">
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
                <span className="text-neutral-300">|</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </SectionWrapper>
  );
}
