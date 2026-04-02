import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

interface ComparisonItem {
  bad: string;
  good: string;
  label?: string;
}

interface ComparisonTableProps {
  items: ComparisonItem[];
}

export function ComparisonTable({ items }: ComparisonTableProps) {
  return (
    <div className={cn("rounded-xl overflow-hidden border border-neutral-200")}>
      {/* Header */}
      <div className="grid md:grid-cols-2">
        <div className="flex items-center gap-2 bg-danger/5 px-4 py-3 font-semibold text-danger">
          <XCircle className="h-5 w-5" />
          <span>Don&apos;t</span>
        </div>
        <div className="flex items-center gap-2 bg-success/5 px-4 py-3 font-semibold text-success">
          <CheckCircle2 className="h-5 w-5" />
          <span>Do</span>
        </div>
      </div>

      {/* Rows */}
      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            "grid md:grid-cols-2",
            index % 2 === 0 && "bg-neutral-50/50"
          )}
        >
          <div className="bg-danger/5 px-4 py-3 text-sm text-neutral-700">
            {item.label && (
              <span className="block text-xs font-semibold text-neutral-500 mb-1">
                {item.label}
              </span>
            )}
            {item.bad}
          </div>
          <div className="bg-success/5 px-4 py-3 text-sm text-neutral-700">
            {item.good}
          </div>
        </div>
      ))}
    </div>
  );
}
