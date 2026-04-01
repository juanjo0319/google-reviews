"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type CountUpProps = {
  target: number;
  suffix?: string;
  duration?: number;
  className?: string;
};

export function CountUp({
  target,
  suffix = "",
  duration = 2,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const steps = 60;
    const stepDuration = (duration * 1000) / steps;
    let current = 0;
    const timer = setInterval(() => {
      current++;
      const progress = current / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (current >= steps) {
        setValue(target);
        clearInterval(timer);
      }
    }, stepDuration);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return (
    <span ref={ref} className={cn(className)}>
      {value.toLocaleString()}{suffix}
    </span>
  );
}
