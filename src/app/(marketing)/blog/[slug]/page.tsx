import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArrowLeft } from "lucide-react";
import { getAllPosts, getPost } from "@/lib/blog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AuthorCard } from "@/components/blog/AuthorCard";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { StatCallout } from "@/components/blog/StatCallout";
import { KeyTakeaway } from "@/components/blog/KeyTakeaway";
import { ComparisonTable } from "@/components/blog/ComparisonTable";
import { TemplateCard } from "@/components/blog/TemplateCard";
import { ProTip } from "@/components/blog/ProTip";
import { StepProcess } from "@/components/blog/StepProcess";
import { Steps, Step } from "@/components/blog/Steps";
import { DoVsDont, DoVsDontRow } from "@/components/blog/DoVsDont";
import { QuoteHighlight } from "@/components/blog/QuoteHighlight";
import { WarningBox } from "@/components/blog/WarningBox";
import { BlogCTA } from "@/components/blog/BlogCTA";

const mdxComponents = {
  StatCallout,
  KeyTakeaway,
  ComparisonTable,
  TemplateCard,
  ProTip,
  StepProcess,
  Steps,
  Step,
  DoVsDont,
  DoVsDontRow,
  QuoteHighlight,
  WarningBox,
  BlogCTA,
};

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

function extractHeadings(content: string): { id: string; text: string }[] {
  const headingRegex = /^## (.+)$/gm;
  const headings: { id: string; text: string }[] = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const text = match[1].replace(/[*_`]/g, "").trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    headings.push({ id, text });
  }
  return headings;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const headings = extractHeadings(post.content);

  return (
    <>
      <ReadingProgress />

      <article className="py-16 px-[var(--section-padding-x)]">
        <div className="mx-auto max-w-7xl">
          <div className="lg:grid lg:grid-cols-[1fr_240px] lg:gap-12">
            {/* Main content */}
            <div className="max-w-3xl">
              {/* Back link */}
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary transition-colors mb-8"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                All articles
              </Link>

              {/* Category + Read Time */}
              <div className="flex items-center gap-3 mb-6">
                <Badge variant="primary">{post.category}</Badge>
                <span className="text-sm text-neutral-500">
                  {post.readTime}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-950 leading-tight mb-8">
                {post.title}
              </h1>

              {/* Author Card */}
              <div className="mb-10 pb-8 border-b border-neutral-200">
                <AuthorCard
                  name={post.author}
                  date={post.publishedAt}
                  readTime={post.readTime}
                />
              </div>

              {/* MDX Content */}
              <div className="prose prose-neutral max-w-none text-lg leading-[1.8] prose-headings:font-heading prose-headings:tracking-tight prose-headings:mt-14 prose-headings:mb-4 prose-h2:text-2xl prose-h2:md:text-3xl prose-h3:text-xl prose-h3:md:text-2xl prose-p:mb-6 prose-p:text-neutral-700 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-neutral-900 prose-blockquote:border-l-primary prose-blockquote:bg-neutral-50 prose-blockquote:rounded-r-xl prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:text-neutral-700 prose-hr:border-neutral-100 prose-hr:my-12 prose-img:rounded-xl prose-img:shadow-lg prose-li:text-neutral-700 prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
                <MDXRemote
                  source={post.content}
                  components={mdxComponents}
                  options={{
                    mdxOptions: {
                      development: process.env.NODE_ENV === "development",
                    },
                  }}
                />
              </div>

              {/* Author Card (bottom with bio) */}
              <div className="mt-16 pt-8 border-t border-neutral-200">
                <AuthorCard
                  name={post.author}
                  date={post.publishedAt}
                  readTime={post.readTime}
                  showBio
                />
              </div>

              {/* Bottom CTA */}
              <div className="mt-12 rounded-2xl bg-gradient-to-r from-primary to-accent text-white p-8 text-center">
                <h2 className="font-heading text-2xl font-bold mb-3">
                  Ready to automate your review responses?
                </h2>
                <p className="text-white/80 mb-6 max-w-lg mx-auto text-sm">
                  RevUp.ai uses Claude AI to craft personalized, on-brand
                  responses to every Google review.
                </p>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <Button
                    href="/signup"
                    variant="secondary"
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 border-0"
                  >
                    Start Free Trial
                  </Button>
                  <Button
                    href="/features"
                    variant="outline"
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    See Features
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar — Table of Contents (desktop only) */}
            {headings.length > 0 && (
              <aside className="hidden lg:block">
                <TableOfContents headings={headings} />
              </aside>
            )}
          </div>
        </div>
      </article>
    </>
  );
}
