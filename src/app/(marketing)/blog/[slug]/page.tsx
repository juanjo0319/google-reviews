import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPost } from "@/lib/blog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <article className="py-16 px-[var(--section-padding-x)]">
      <div className="mx-auto max-w-3xl">
        {/* Category + Read Time */}
        <div className="flex items-center gap-3 mb-6">
          <Badge variant="primary">{post.category}</Badge>
          <span className="text-sm text-neutral-500">{post.readTime}</span>
        </div>

        {/* Title */}
        <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-neutral-950 mb-6">
          {post.title}
        </h1>

        {/* Author Bar */}
        <div className="flex items-center gap-4 text-sm text-neutral-600 border-b border-neutral-200 pb-6 mb-10">
          <span className="font-medium">{post.author}</span>
          <span className="text-neutral-300">|</span>
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </time>
          {post.updatedAt !== post.publishedAt && (
            <>
              <span className="text-neutral-300">|</span>
              <span className="text-neutral-400">
                Updated{" "}
                <time dateTime={post.updatedAt}>
                  {new Date(post.updatedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </span>
            </>
          )}
          <span className="text-neutral-300">|</span>
          <span>{post.readTime}</span>
        </div>

        {/* MDX Content */}
        <div className="prose prose-neutral prose-lg max-w-none prose-headings:font-heading prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
          <MDXRemote source={post.content} />
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 rounded-2xl bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border border-primary/10 p-8 text-center">
          <h2 className="font-heading text-2xl font-bold text-neutral-950 mb-3">
            Ready to automate your review responses?
          </h2>
          <p className="text-neutral-600 mb-6 max-w-lg mx-auto">
            RevUp.ai uses Claude AI to craft personalized, on-brand responses to
            every Google review -- so you can focus on running your business.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button href="/signup" size="lg">
              Start Free Trial
            </Button>
            <Button href="/features" variant="secondary" size="lg">
              See Features
            </Button>
          </div>
        </div>

        {/* Back to Blog */}
        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="text-sm text-neutral-500 hover:text-primary transition-colors"
          >
            &larr; Back to all articles
          </Link>
        </div>
      </div>
    </article>
  );
}
