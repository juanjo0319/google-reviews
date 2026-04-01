import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://revup.ai";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, priority: 1.0, changeFrequency: "weekly", lastModified: now },
    {
      url: `${BASE}/features`,
      priority: 0.9,
      changeFrequency: "monthly",
      lastModified: now,
    },
    {
      url: `${BASE}/pricing`,
      priority: 0.9,
      changeFrequency: "monthly",
      lastModified: now,
    },
    {
      url: `${BASE}/blog`,
      priority: 0.8,
      changeFrequency: "weekly",
      lastModified: now,
    },
    {
      url: `${BASE}/about`,
      priority: 0.6,
      changeFrequency: "monthly",
      lastModified: now,
    },
    {
      url: `${BASE}/contact`,
      priority: 0.5,
      changeFrequency: "monthly",
      lastModified: now,
    },
    {
      url: `${BASE}/faq`,
      priority: 0.7,
      changeFrequency: "monthly",
      lastModified: now,
    },
    {
      url: `${BASE}/security`,
      priority: 0.5,
      changeFrequency: "monthly",
      lastModified: now,
    },
    {
      url: `${BASE}/compare`,
      priority: 0.8,
      changeFrequency: "monthly",
      lastModified: now,
    },
    {
      url: `${BASE}/tools/review-response-generator`,
      priority: 0.8,
      changeFrequency: "monthly",
      lastModified: now,
    },
  ];

  const comparisonPages: MetadataRoute.Sitemap = [
    "/compare/revup-vs-birdeye",
    "/compare/revup-vs-podium",
    "/compare/revup-vs-reviewtrackers",
    "/compare/revup-vs-reputation-com",
    "/compare/revup-vs-yext",
  ].map((path) => ({
    url: `${BASE}${path}`,
    priority: 0.7,
    changeFrequency: "monthly" as const,
    lastModified: now,
  }));

  const solutionPages: MetadataRoute.Sitemap = [
    "/solutions/restaurants",
    "/solutions/healthcare",
    "/solutions/multi-location-franchises",
  ].map((path) => ({
    url: `${BASE}${path}`,
    priority: 0.7,
    changeFrequency: "monthly" as const,
    lastModified: now,
  }));

  const blogPosts: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    priority: 0.7,
    changeFrequency: "weekly" as const,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
  }));

  const legalPages: MetadataRoute.Sitemap = ["/privacy", "/terms"].map(
    (path) => ({
      url: `${BASE}${path}`,
      priority: 0.3,
      changeFrequency: "yearly" as const,
      lastModified: now,
    })
  );

  return [
    ...staticPages,
    ...comparisonPages,
    ...solutionPages,
    ...blogPosts,
    ...legalPages,
  ];
}
