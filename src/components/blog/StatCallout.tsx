import { cn } from "@/lib/utils";

interface StatCalloutProps {
  stat: string;
  label: string;
  source?: string;
}

export function StatCallout({ stat, label, source }: StatCalloutProps) {
  return (
    <div
      className={cn(
        "w-full bg-primary/5 border-l-4 border-primary rounded-xl py-8 px-8"
      )}
    >
      <p className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-heading">
        {stat}
      </p>
      <p className="text-lg text-neutral-600">{label}</p>
      {source && <p className="text-xs text-neutral-400 mt-2">{source}</p>}
    </div>
  );
}
