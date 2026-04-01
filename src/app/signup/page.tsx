"use client";

import Link from "next/link";
import { Star, Check } from "lucide-react";
import { useState } from "react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-surface">
      {/* Left — Value prop */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 bg-surface-dark text-white px-16 py-12">
        <h2 className="text-3xl font-bold mb-6">
          Start managing your reviews with AI today
        </h2>
        <p className="text-slate-400 text-lg mb-10 leading-relaxed">
          Join hundreds of businesses that save 10+ hours every week with
          automated, AI-powered review responses.
        </p>
        <ul className="space-y-5">
          {[
            "14-day free trial, no credit card required",
            "Set up in under 5 minutes",
            "AI responses powered by Claude",
            "Full control — approve before publishing",
            "Cancel anytime, no questions asked",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20">
                <Check className="h-3 w-3 text-primary" />
              </div>
              <span className="text-slate-300">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Right — Form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="flex items-center gap-2 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                <Star className="h-5 w-5" />
              </div>
              <span className="text-2xl font-bold text-slate-900">
                Review<span className="text-primary">AI</span>
              </span>
            </Link>
            <p className="text-slate-500">Create your free account</p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
            <button
              type="button"
              className="w-full rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 mb-6"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign up with Google
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-400">
                  or sign up with email
                </span>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                // TODO: Implement auth
              }}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Work Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-colors shadow-sm"
              >
                Create Free Account
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-slate-400">
              By signing up, you agree to our{" "}
              <a href="#" className="text-primary hover:underline">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:text-primary-dark"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
