"use client";

import Link from "next/link";
import { Star, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { resetPassword, type RegisterResult } from "@/app/actions/auth";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, formAction, pending] = useActionState<RegisterResult | null, FormData>(
    resetPassword,
    null
  );

  if (!token) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100 text-center">
        <p className="text-sm text-slate-500 mb-4">Invalid reset link. Please request a new one.</p>
        <Link href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-dark">
          Request new reset link
        </Link>
      </div>
    );
  }

  if (state?.success) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Password updated</h2>
        <p className="text-sm text-slate-500 mb-6">
          Your password has been reset. You can now sign in with your new password.
        </p>
        <Link
          href="/login"
          className="inline-flex rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
      <p className="text-sm text-slate-500 mb-6">Enter your new password below.</p>

      {state?.error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="token" value={token} />

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
            New Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="Min. 8 characters"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50"
        >
          {pending ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
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
          <p className="text-slate-500">Set a new password</p>
        </div>

        <Suspense>
          <ResetForm />
        </Suspense>

        <p className="mt-6 text-center">
          <Link href="/login" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
