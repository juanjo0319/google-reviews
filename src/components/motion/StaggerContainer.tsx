"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type StaggerContainerProps = {
  delay?: number;
  staggerDelay?: number;
  className?: string;
  children: React.ReactNode;
};

export function StaggerContainer({
  delay = 0.1,
  className,
  children,
}: StaggerContainerProps) {
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
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(className)}
      data-visible={visible}
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity 0.4s ease-out ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
