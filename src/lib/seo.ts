import type { Metadata } from "next";

const SITE_NAME = "RevUp.ai";
const SITE_URL = "https://revup.ai";
const DEFAULT_DESCRIPTION =
  "Connect your Google Business Profile and let AI read, analyze, and respond to every customer review. Save 10+ hours weekly. Starting at $29/mo.";

export function constructMetadata({
  title,
  description,
  image,
  canonical,
  noIndex = false,
  keywords,
  type = "website",
}: {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
  noIndex?: boolean;
  keywords?: string[];
  type?: "website" | "article";
}): Metadata {
  const resolvedTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} — AI-Powered Google Review Management`;
  const resolvedDescription = description || DEFAULT_DESCRIPTION;
  const resolvedImage = image || "/og-default.png";
  const resolvedCanonical = canonical || "/";

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    keywords,
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url: resolvedCanonical,
      siteName: SITE_NAME,
      images: [{ url: resolvedImage, width: 1200, height: 630 }],
      locale: "en_US",
      type,
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDescription,
      images: [resolvedImage],
      creator: "@revupai",
    },
    alternates: { canonical: resolvedCanonical },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  };
}

export { SITE_NAME, SITE_URL };
