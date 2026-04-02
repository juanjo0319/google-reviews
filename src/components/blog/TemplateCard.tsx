"use client";

import { cn } from "@/lib/utils";
import { Check, Copy, Sparkles } from "lucide-react";
import { useState } from "react";

interface TemplateCardProps {
  title?: string;
  scenario: string;
  template: string;
  explanation: string;
}

export function TemplateCard({
  title,
  scenario,
  template,
  explanation,
}: TemplateCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-200 overflow-hidden mb-8"
      )}
    >
      {title && (
        <p className="font-heading font-semibold text-lg px-6 pt-6">
          {title}
        </p>
      )}

      <div className="px-6 pt-4">
        <p className="text-sm text-neutral-500 italic">{scenario}</p>
      </div>

      <div className="px-6 py-4">
        <div className="relative bg-neutral-50 rounded-xl p-5 border border-neutral-200">
          <button
            onClick={handleCopy}
            className={cn(
              "absolute top-3 right-3 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              copied
                ? "bg-success/10 text-success"
                : "bg-white text-neutral-500 hover:text-neutral-700 border border-neutral-200 hover:border-neutral-300"
            )}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>
          <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap pr-20">
            {template}
          </pre>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="flex items-start gap-2 bg-accent/5 rounded-lg p-4">
          <Sparkles className="h-4 w-4 text-accent shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-accent mb-1">
              Why this works
            </p>
            <p className="text-sm text-neutral-700">{explanation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
