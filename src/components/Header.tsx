"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Star } from "lucide-react";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
              <Star className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-slate-900">
              Review<span className="text-primary">AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
            >
              Pricing
            </a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors shadow-sm"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-slate-600"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 py-4 space-y-3">
            <a
              href="#features"
              className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </a>
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 text-center"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark text-center"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
