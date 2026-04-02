import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";
import type { ReactNode } from "react";

interface ProTipProps {
  children: ReactNode;
}

export function ProTip({ children }: ProTipProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-xl px-4 py-3 my-6"
      )}
    >
      <Zap className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
      <div className="text-sm text-amber-900">{children}</div>
    </div>
  );
}
