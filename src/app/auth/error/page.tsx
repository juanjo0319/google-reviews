"use client";

import Link from "next/link";
import { Star, AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "Access denied. You do not have permission to sign in.",
  Verification: "The verification link has expired or has already been used.",
  OAuthSignin: "Error connecting to the OAuth provider.",
  OAuthCallback: "Error handling the OAuth callback.",
  OAuthCreateAccount: "Could not create an OAuth account.",
  EmailCreateAccount: "Could not create an email account.",
  Callback: "Error in the authentication callback.",
  OAuthAccountNotLinked:
    "This email is already associated with another account. Sign in with your original provider.",
  CredentialsSignin: "Invalid email or password. Please try again.",
  SessionRequired: "You must be signed in to access this page.",
  Default: "An unexpected authentication error occurred.",
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error") ?? "Default";
  const message = errorMessages[errorCode] ?? errorMessages.Default;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
              <Star className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold text-slate-900">
              Review<span className="text-primary">AI</span>
            </span>
          </Link>

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>

          <h1 className="text-xl font-bold text-slate-900 mb-2">
            Authentication Error
          </h1>
          <p className="text-sm text-slate-500 mb-8">{message}</p>

          <div className="flex gap-3">
            <Link
              href="/login"
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  );
}
