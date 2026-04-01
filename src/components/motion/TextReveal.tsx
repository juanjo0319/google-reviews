"use client";

import * as m from "motion/react-client";
import { cn } from "@/lib/utils";

type TextRevealProps = {
  text: string;
  className?: string;
};

export function TextReveal({ text, className }: TextRevealProps) {
  const words = text.split(" ");

  return (
    <m.p
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.04,
          },
        },
      }}
      className={cn(className)}
    >
      {words.map((word, i) => (
        <m.span
          key={`${word}-${i}`}
          className="inline-block mr-[0.25em]"
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.3, ease: "easeOut" },
            },
          }}
        >
          {word}
        </m.span>
      ))}
    </m.p>
  );
}
