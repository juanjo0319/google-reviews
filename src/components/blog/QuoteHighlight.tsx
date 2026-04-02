import { cn } from "@/lib/utils";

interface QuoteHighlightProps {
  quote: string;
  author?: string;
  role?: string;
}

export function QuoteHighlight({ quote, author, role }: QuoteHighlightProps) {
  return (
    <div
      className={cn(
        "relative bg-white shadow-sm rounded-xl overflow-hidden my-8",
        "border-l-4 border-primary"
      )}
    >
      <span
        aria-hidden="true"
        className="absolute top-2 left-4 text-6xl font-serif text-primary/10 leading-none select-none"
      >
        {"\u275D"}
      </span>

      <p className="text-xl font-medium italic text-neutral-700 leading-relaxed pl-8 pr-6 pt-8 pb-4">
        {quote}
      </p>

      {author && (
        <div className="pl-8 pb-6">
          <span className="text-sm font-semibold text-neutral-900">
            {author}
          </span>
          {role && (
            <span className="text-sm text-neutral-500">{" \u2014 "}{role}</span>
          )}
        </div>
      )}
    </div>
  );
}
