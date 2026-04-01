import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact RevUp.ai — Get in Touch",
  description:
    "Have a question about RevUp.ai? Contact our team for sales inquiries, technical support, or partnership opportunities. We respond within 24 hours.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
