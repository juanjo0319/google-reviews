"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useTransform, animate } from "motion/react";
import * as m from "motion/react-client";
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
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) =>
    Math.round(v).toLocaleString()
  );

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(motionValue, target, {
      duration,
      ease: "easeOut",
    });
    return controls.stop;
  }, [isInView, motionValue, target, duration]);

  return (
    <span ref={ref} className={cn(className)}>
      <m.span>{rounded}</m.span>
      {suffix}
    </span>
  );
}
