import { cn } from "@/lib/utils";

const backgroundVariants = {
  default: "",
  muted: "bg-neutral-50",
  dark: "bg-neutral-950 text-white",
  gradient:
    "bg-gradient-to-br from-primary via-accent to-primary text-white",
} as const;

type SectionWrapperProps = {
  id?: string;
  className?: string;
  background?: keyof typeof backgroundVariants;
  children: React.ReactNode;
};

export function SectionWrapper({
  id,
  className,
  background = "default",
  children,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-[var(--section-padding-y)] px-[var(--section-padding-x)]",
        backgroundVariants[background],
        className
      )}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}
