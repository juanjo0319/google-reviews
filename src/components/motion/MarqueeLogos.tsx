"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type Logo = {
  name: string;
  src: string;
};

type MarqueeLogosProps = {
  logos: Logo[];
  speed?: number;
  className?: string;
};

export function MarqueeLogos({
  logos,
  speed = 30,
  className,
}: MarqueeLogosProps) {
  // Duplicate for seamless loop
  const doubled = [...logos, ...logos];

  return (
    <div
      className={cn(
        "group relative overflow-hidden",
        className
      )}
    >
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />

      <div
        className="flex items-center gap-12 w-max motion-safe:animate-marquee group-hover:[animation-play-state:paused]"
        style={{
          animationDuration: `${speed}s`,
        }}
      >
        {doubled.map((logo, i) => (
          <div
            key={`${logo.name}-${i}`}
            className="flex items-center justify-center shrink-0 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
          >
            <Image
              src={logo.src}
              alt={logo.name}
              width={120}
              height={40}
              className="h-8 w-auto object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
