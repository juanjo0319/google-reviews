import { cn } from "@/lib/utils";

export function Steps({ children }: { children: React.ReactNode }) {
  return <div className={cn("space-y-0 my-8")}>{children}</div>;
}

export function Step({
  number,
  title,
  description,
  last = false,
}: {
  number: number;
  title: string;
  description: string;
  last?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="relative flex flex-col items-center">
        <div className="h-8 w-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">
          {number}
        </div>
        {!last && (
          <div className="absolute top-8 bottom-0 border-l-2 border-dashed border-primary/20" />
        )}
      </div>
      <div className={cn("pb-8", last && "pb-0")}>
        <p className="font-heading font-semibold text-neutral-900">{title}</p>
        <p className="text-sm text-neutral-600 mt-1">{description}</p>
      </div>
    </div>
  );
}
