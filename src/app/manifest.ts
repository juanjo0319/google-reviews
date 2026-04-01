import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RevUp.ai",
    short_name: "RevUp",
    description: "AI-Powered Google Review Management",
    start_url: "/",
    display: "standalone",
    theme_color: "#2563EB",
    background_color: "#F8FAFC",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
