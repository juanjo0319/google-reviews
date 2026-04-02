"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface Heading {
  id: string;
  text: string;
}

interface TableOfContentsProps {
  headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    for (const el of elements) {
      observerRef.current.observe(el);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [headings]);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
    const target = document.getElementById(id);
    target?.scrollIntoView({ behavior: "smooth" });
    setActiveId(id);
  }

  return (
    <nav className="hidden lg:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <p className="text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-3">
        On this page
      </p>

      <ul className="space-y-0.5">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;

          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleClick(e, heading.id)}
                className={cn(
                  "block text-sm py-1.5 transition-colors",
                  isActive
                    ? "text-primary font-medium pl-3 border-l-2 border-primary"
                    : "text-neutral-400 hover:text-primary pl-3 border-l-2 border-transparent"
                )}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
