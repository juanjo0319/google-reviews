import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  heading?: string;
  description?: string;
  align?: "center" | "left";
  dark?: boolean;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  heading,
  description,
  align = "center",
  dark = false,
  className,
}: SectionHeadingProps) {
  const isCenter = align === "center";

  return (
    <div
      className={cn(
        "mb-16",
        isCenter && "text-center mx-auto max-w-2xl",
        className
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "flex items-center gap-2 text-sm font-semibold uppercase tracking-wider mb-4",
            isCenter && "justify-center",
            dark ? "text-primary-light" : "text-primary"
          )}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
          {eyebrow}
        </p>
      )}
      {heading && (
        <h2
          className={cn(
            "font-heading text-4xl md:text-5xl font-bold tracking-tight",
            dark ? "text-white" : "text-neutral-950"
          )}
        >
          {heading}
        </h2>
      )}
      {description && (
        <p
          className={cn(
            "mt-4 text-lg md:text-xl leading-relaxed",
            isCenter && "mx-auto max-w-2xl",
            dark ? "text-neutral-400" : "text-neutral-600"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
