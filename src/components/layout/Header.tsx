"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslations } from "next-intl";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-button">
        <Star className="h-5 w-5 text-white" />
      </div>
      <span className="text-xl font-bold text-neutral-950 font-heading">
        RevUp<span className="text-primary">.ai</span>
      </span>
    </Link>
  );
}

function DropdownMenu({
  items,
  onClose,
  open,
}: {
  items: { label: string; href: string }[];
  onClose: () => void;
  open: boolean;
}) {
  return (
    <div
      className={cn(
        "absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 rounded-xl bg-white p-2 shadow-xl border border-neutral-100 z-50 transition-all duration-150 ease-out",
        open
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-2 pointer-events-none"
      )}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClose}
          className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-primary transition-colors"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export function Header() {
  const t = useTranslations("common.nav");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const NAV_LINKS: {
    label: string;
    href: string;
    children?: { label: string; href: string }[];
  }[] = [
    { label: t("features"), href: "#features" },
    { label: t("pricing"), href: "#pricing" },
    { label: t("blog"), href: "/blog" },
  ];

  // Scroll listener — throttled via rAF
  useEffect(() => {
    let ticking = false;
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close dropdown on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        setMobileOpen(false);
      }
    },
    []
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-neutral-100"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <div
                  key={link.label}
                  ref={dropdownRef}
                  className="relative"
                  onMouseEnter={() => setDropdownOpen(true)}
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <button
                    className={cn(
                      "flex items-center gap-1 text-sm font-medium transition-colors",
                      pathname.startsWith("/compare")
                        ? "text-primary"
                        : "text-neutral-600 hover:text-primary"
                    )}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    {link.label}
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform",
                        dropdownOpen && "rotate-180"
                      )}
                    />
                  </button>
                  <DropdownMenu
                    items={link.children}
                    onClose={() => setDropdownOpen(false)}
                    open={dropdownOpen}
                  />
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "text-primary"
                      : "text-neutral-600 hover:text-primary"
                  )}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              {t("login")}
            </Link>
            <Button href="/signup" size="sm">
              {t("startFreeTrial")}
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-neutral-600"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden fixed inset-0 top-16 z-50 bg-white overflow-y-auto transition-all duration-200 ease-out",
          mobileOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2.5 pointer-events-none"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!mobileOpen}
      >
        <nav className="px-4 py-6 space-y-1">
          {NAV_LINKS.map((link) =>
            link.children ? (
              <div key={link.label} className="space-y-1">
                <p className="px-3 py-2 text-sm font-semibold text-neutral-400 uppercase tracking-wider">
                  {link.label}
                </p>
                {link.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="block px-3 py-2 pl-6 text-base font-medium text-neutral-600 hover:text-primary hover:bg-neutral-50 rounded-lg"
                    onClick={() => setMobileOpen(false)}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="block px-3 py-2 text-base font-medium text-neutral-600 hover:text-primary hover:bg-neutral-50 rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            )
          )}

          <div className="pt-6 mt-4 border-t border-neutral-100 space-y-3">
            <div className="flex justify-center">
              <LanguageSwitcher />
            </div>
            <Link
              href="/login"
              className="block px-3 py-2 text-base font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg text-center"
              onClick={() => setMobileOpen(false)}
            >
              {t("login")}
            </Link>
            <Button
              href="/signup"
              className="w-full"
              onClick={() => setMobileOpen(false)}
            >
              {t("startFreeTrial")}
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
