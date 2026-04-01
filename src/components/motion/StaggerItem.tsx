"use client";

import * as m from "motion/react-client";
import { cn } from "@/lib/utils";

type StaggerItemProps = {
  className?: string;
  children: React.ReactNode;
};

export function StaggerItem({ className, children }: StaggerItemProps) {
  return (
    <m.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: "easeOut" },
        },
      }}
      className={cn(className)}
    >
      {children}
    </m.div>
  );
}
