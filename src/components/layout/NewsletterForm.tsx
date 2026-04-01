"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: integrate with Resend or email marketing service
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="text-sm text-success">
        Thanks for subscribing! Check your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        aria-label="Email address for newsletter"
        className="flex-1 rounded-l-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <button
        type="submit"
        className="rounded-r-lg gradient-button px-5 py-2.5 text-sm font-semibold text-white whitespace-nowrap"
      >
        Subscribe
      </button>
    </form>
  );
}
