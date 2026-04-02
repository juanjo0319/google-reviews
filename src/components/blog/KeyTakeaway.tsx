import { cn } from "@/lib/utils";
import { Lightbulb } from "lucide-react";
import type { ReactNode } from "react";

interface KeyTakeawayProps {
  children: ReactNode;
}

export function KeyTakeaway({ children }: KeyTakeawayProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-6"
      )}
    >
      <div className="flex gap-4">
        <Lightbulb className="h-6 w-6 shrink-0 mt-0.5 text-primary" />
        <div className="font-medium text-neutral-800">{children}</div>
      </div>
    </div>
  );
}
