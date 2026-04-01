import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions",
  description:
    "Find answers to common questions about RevUp.ai, including setup, features, pricing, billing, security, and privacy for our AI review management platform.",
  alternates: { canonical: "/faq" },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
