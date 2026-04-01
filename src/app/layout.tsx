import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://revup.ai"),
  title: {
    default: "RevUp.ai — AI-Powered Google Review Management",
    template: "%s | RevUp.ai",
  },
  description:
    "Connect your Google Business Profile and let AI read, analyze, and respond to every customer review. Save 10+ hours weekly. Starting at $29/mo.",
  keywords: [
    "AI review response",
    "Google review management",
    "automated review replies",
    "review response generator",
    "AI reputation management",
    "review management software",
  ],
  authors: [{ name: "RevUp.ai" }],
  creator: "RevUp.ai",
  openGraph: {
    title: "RevUp.ai — AI-Powered Google Review Management",
    description:
      "Connect your Google Business Profile and let AI read, analyze, and respond to every customer review. Save 10+ hours weekly. Starting at $29/mo.",
    url: "/",
    siteName: "RevUp.ai",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RevUp.ai — AI-Powered Google Review Management",
    description:
      "Connect your Google Business Profile and let AI read, analyze, and respond to every customer review. Save 10+ hours weekly. Starting at $29/mo.",
    images: ["/og-default.png"],
    creator: "@revupai",
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
  verification: { google: "your-search-console-verification-code" },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${jakarta.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {/* Header will be injected by marketing layout */}
            {children}
            {/* Footer will be injected by marketing layout */}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
