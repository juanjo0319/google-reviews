export const SITE_NAME = "RevUp.ai";
export const SITE_URL = "https://revup.ai";
export const SITE_DESCRIPTION =
  "Connect your Google Business Profile and let AI read, analyze, and respond to every customer review automatically. Save hours weekly. Starting at $29/mo.";

export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Blog", href: "/blog" },
  {
    label: "Compare",
    href: "/compare",
    children: [
      { label: "vs Birdeye", href: "/compare/revup-vs-birdeye" },
      { label: "vs Podium", href: "/compare/revup-vs-podium" },
      { label: "vs ReviewTrackers", href: "/compare/revup-vs-reviewtrackers" },
      { label: "vs Reputation.com", href: "/compare/revup-vs-reputation-com" },
      { label: "vs Yext", href: "/compare/revup-vs-yext" },
    ],
  },
  { label: "Login", href: "/login" },
] as const;

export const FOOTER_LINKS = {
  product: {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Integrations", href: "/integrations" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  solutions: {
    title: "Solutions",
    links: [
      { label: "Restaurants", href: "/solutions/restaurants" },
      { label: "Hotels & Hospitality", href: "/solutions/hotels-hospitality" },
      { label: "Healthcare", href: "/solutions/healthcare" },
      { label: "Automotive", href: "/solutions/automotive" },
      { label: "Multi-Location", href: "/solutions/multi-location-franchises" },
    ],
  },
  resources: {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Templates", href: "/templates" },
      { label: "Case Studies", href: "/resources/case-studies" },
      { label: "Guides", href: "/resources/guides" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Security", href: "/security" },
    ],
  },
} as const;

export const SOCIAL_LINKS = [
  { label: "Twitter", href: "https://twitter.com/revupai", icon: "twitter" },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/revupai",
    icon: "linkedin",
  },
  { label: "GitHub", href: "https://github.com/revupai", icon: "github" },
] as const;
