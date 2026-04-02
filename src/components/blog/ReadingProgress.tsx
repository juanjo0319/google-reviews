"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId: number;

    function updateProgress() {
      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      if (scrollHeight > 0) {
        setProgress((scrollTop / scrollHeight) * 100);
      }
    }

    function handleScroll() {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateProgress);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="fixed top-16 md:top-20 left-0 right-0 z-40 h-0.5">
      <div
        className="h-full bg-gradient-to-r from-primary to-accent"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
