import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

interface WarningBoxProps {
  title?: string;
  children: ReactNode;
}

export function WarningBox({ title, children }: WarningBoxProps) {
  return (
    <div
      className={cn(
        "bg-red-50 border border-red-200 rounded-xl p-4 my-6",
        "flex items-start gap-3"
      )}
    >
      <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />

      <div>
        {title && (
          <p className="font-semibold text-red-800 text-sm">{title}</p>
        )}
        <div className={cn("text-red-700 text-sm leading-relaxed", title && "mt-1")}>
          {children}
        </div>
      </div>
    </div>
  );
}
