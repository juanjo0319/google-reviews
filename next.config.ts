import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.google.com" },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  // Upload source maps for better stack traces in Sentry
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Bypass ad blockers by tunneling Sentry events through our server
  tunnelRoute: "/monitoring",

  // Only upload source maps in CI
  silent: !process.env.CI,
  disableLogger: true,

  // Disable source map upload if no auth token (local dev)
  ...(process.env.SENTRY_AUTH_TOKEN
    ? {}
    : { sourcemaps: { disable: true } }),
});
