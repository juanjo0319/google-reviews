import Link from "next/link";
import { Star } from "lucide-react";
import { NewsletterForm } from "./NewsletterForm";
import { getTranslations } from "next-intl/server";

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  {
    label: "Twitter",
    href: "https://twitter.com/revupai",
    icon: TwitterIcon,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/revupai",
    icon: LinkedInIcon,
  },
  {
    label: "GitHub",
    href: "https://github.com/revupai",
    icon: GitHubIcon,
  },
];

export async function Footer() {
  const t = await getTranslations("common.footer");
  const navT = await getTranslations("common.nav");

  const COLUMNS = [
    {
      title: t("product"),
      links: [
        { label: navT("features"), href: "/features" },
        { label: navT("pricing"), href: "/pricing" },
        { label: t("integrations"), href: "/integrations" },
        { label: t("changelog"), href: "/changelog" },
        { label: t("api"), href: "#", badge: t("comingSoon") },
      ],
    },
    {
      title: t("resources"),
      links: [
        { label: navT("blog"), href: "/blog" },
        { label: t("caseStudies"), href: "/resources/case-studies" },
        { label: t("templates"), href: "/templates" },
        { label: t("responseGenerator"), href: "/tools/review-response-generator" },
        { label: navT("faq"), href: "/faq" },
      ],
    },
    {
      title: t("company"),
      links: [
        { label: t("about"), href: "/about" },
        { label: t("contact"), href: "/contact" },
        { label: t("careers"), href: "#" },
        { label: t("security"), href: "/security" },
        { label: t("privacyPolicy"), href: "/privacy" },
        { label: t("termsOfService"), href: "/terms" },
      ],
    },
  ];

  return (
    <footer className="bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Top grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-button">
                <Star className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white font-heading">
                RevUp<span className="text-primary-light">.ai</span>
              </span>
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed mb-6">
              {t("description")}
            </p>
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-800 text-neutral-400 hover:text-primary-light hover:bg-neutral-700 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm uppercase tracking-wider font-semibold text-neutral-400 mb-4">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-2"
                    >
                      {link.label}
                      {"badge" in link && link.badge && (
                        <span className="text-[10px] font-semibold bg-accent/20 text-accent-light px-1.5 py-0.5 rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-neutral-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">
                {t("stayInTheLoop")}
              </h4>
              <p className="text-xs text-neutral-500">
                {t("noSpam")}
              </p>
            </div>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} RevUp.ai. {t("allRightsReserved")}
          </p>
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <a href="#" className="hover:text-white transition-colors">
              {t("status")}
            </a>
            <Link href="/privacy" className="hover:text-white transition-colors">
              {t("privacy")}
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              {t("terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
