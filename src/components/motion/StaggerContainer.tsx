"use client";

import * as m from "motion/react-client";
import { cn } from "@/lib/utils";

type StaggerContainerProps = {
  delay?: number;
  staggerDelay?: number;
  className?: string;
  children: React.ReactNode;
};

export function StaggerContainer({
  delay = 0.1,
  staggerDelay = 0.1,
  className,
  children,
}: StaggerContainerProps) {
  return (
    <m.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: delay,
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={cn(className)}
    >
      {children}
    </m.div>
  );
}
