"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type TextRevealProps = {
  text: string;
  className?: string;
};

export function TextReveal({ text, className }: TextRevealProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const words = text.split(" ");

  return (
    <p ref={ref} className={cn(className)}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block mr-[0.25em]"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(6px)",
            transition: `opacity 0.3s ease-out ${i * 0.04}s, transform 0.3s ease-out ${i * 0.04}s`,
          }}
        >
          {word}
        </span>
      ))}
    </p>
  );
}
