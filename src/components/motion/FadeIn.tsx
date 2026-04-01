"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right" | "none";

type FadeInProps = {
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
  children: React.ReactNode;
};

const translateMap: Record<Direction, string> = {
  up: "translateY(20px)",
  down: "translateY(-20px)",
  left: "translateX(-20px)",
  right: "translateX(20px)",
  none: "none",
};

export function FadeIn({
  direction = "up",
  delay = 0,
  duration = 0.6,
  className,
  children,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
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
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : translateMap[direction],
        transition: `opacity ${duration}s ease-out ${delay}s, transform ${duration}s ease-out ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
