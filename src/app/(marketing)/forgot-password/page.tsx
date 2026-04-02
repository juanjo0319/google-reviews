"use client";

import Link from "next/link";
import { Star, ArrowLeft } from "lucide-react";
import { useActionState } from "react";
import { requestPasswordReset, type RegisterResult } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState<RegisterResult | null, FormData>(
    requestPasswordReset,
    null
  );

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
              <Star className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold text-slate-900">
              Review<span className="text-primary">AI</span>
            </span>
          </Link>
          <p className="text-slate-500">Reset your password</p>
        </div>

        {state?.success ? (
          <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Check your email</h2>
            <p className="text-sm text-slate-500 mb-6">
              If an account exists with that email, we sent a password reset link. It expires in 1 hour.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500 mb-6">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            {state?.error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {state.error}
              </div>
            )}

            <form action={formAction} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50"
              >
                {pending ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              <Link href="/login" className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary-dark">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to login
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
