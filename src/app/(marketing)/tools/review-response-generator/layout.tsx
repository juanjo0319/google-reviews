import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI Review Response Generator — Write Perfect Replies Instantly",
  description:
    "Paste any Google review and get a professional, customized response in seconds. Free to use. Powered by Claude AI.",
  alternates: { canonical: "/tools/review-response-generator" },
};

export default function ReviewResponseGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
