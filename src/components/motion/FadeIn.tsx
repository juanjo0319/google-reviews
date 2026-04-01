"use client";

import * as m from "motion/react-client";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right" | "none";

type FadeInProps = {
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
  children: React.ReactNode;
};

const offsets: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 30 },
  down: { y: -30 },
  left: { x: -30 },
  right: { x: 30 },
  none: {},
};

export function FadeIn({
  direction = "up",
  delay = 0,
  duration = 0.6,
  className,
  children,
}: FadeInProps) {
  const offset = offsets[direction];

  return (
    <m.div
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={cn(className)}
    >
      {children}
    </m.div>
  );
}
