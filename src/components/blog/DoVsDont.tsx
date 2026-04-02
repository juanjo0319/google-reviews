import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

export function DoVsDont({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn("rounded-xl overflow-hidden border border-neutral-200 my-8")}>
      <div className="grid md:grid-cols-2">
        <div className="flex items-center gap-2 bg-danger/5 px-4 py-3 font-semibold text-danger text-sm">
          <XCircle className="h-5 w-5" />
          Don&apos;t
        </div>
        <div className="flex items-center gap-2 bg-success/5 px-4 py-3 font-semibold text-success text-sm">
          <CheckCircle2 className="h-5 w-5" />
          Do
        </div>
      </div>
      {children}
    </div>
  );
}

export function DoVsDontRow({
  bad,
  good,
}: {
  bad: string;
  good: string;
}) {
  return (
    <div className="grid md:grid-cols-2 border-t border-neutral-100">
      <div className="px-4 py-3 bg-danger/5 text-sm text-neutral-700">
        {bad}
      </div>
      <div className="px-4 py-3 bg-success/5 text-sm text-neutral-700">
        {good}
      </div>
    </div>
  );
}
