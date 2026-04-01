import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://reviewai.app"
  ),
  title: {
    default: "ReviewAI — AI-Powered Google Review Management",
    template: "%s | ReviewAI",
  },
  description:
    "Connect your Google Business Profile and let AI read, analyze, and respond to every customer review automatically. Save hours weekly. Starting at $29/mo.",
  keywords: [
    "AI review response",
    "Google review management",
    "automated review replies",
    "review response generator",
    "AI reputation management",
    "google reviews",
    "review management software",
  ],
  authors: [{ name: "ReviewAI" }],
  creator: "ReviewAI",
  openGraph: {
    title: "ReviewAI — AI-Powered Google Review Management",
    description:
      "Automatically respond to every Google review with AI that matches your brand voice.",
    url: "/",
    siteName: "ReviewAI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ReviewAI — AI-Powered Google Review Management",
    description:
      "Automatically respond to every Google review with AI.",
  },
  robots: {
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
  alternates: { canonical: "/" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
