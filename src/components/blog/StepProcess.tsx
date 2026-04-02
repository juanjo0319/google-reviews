import { cn } from "@/lib/utils";

interface Step {
  number: number;
  title: string;
  description: string;
}

interface StepProcessProps {
  steps: Step[];
}

export function StepProcess({ steps, children }: StepProcessProps & { children?: React.ReactNode }) {
  // If steps prop is missing (MDX can't pass array literals), render children as-is
  if (!steps || !Array.isArray(steps) || steps.length === 0) {
    return <div className={cn("space-y-0 my-8")}>{children}</div>;
  }

  return (
    <div className={cn("space-y-0 my-8")}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <div key={step.number} className="flex gap-4">
            {/* Left column: circle + connecting line */}
            <div className="relative flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">
                {step.number}
              </div>
              {!isLast && (
                <div className="absolute top-8 bottom-0 border-l-2 border-dashed border-primary/20" />
              )}
            </div>

            {/* Right column: text */}
            <div className={cn("pb-8", isLast && "pb-0")}>
              <p className="font-heading font-semibold text-neutral-900">
                {step.title}
              </p>
              <p className="text-sm text-neutral-600 mt-1">
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
