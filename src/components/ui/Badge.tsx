import { cn } from "@/lib/utils";

const badgeVariants = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  neutral: "bg-neutral-100 text-neutral-600",
} as const;

type BadgeProps = {
  variant?: keyof typeof badgeVariants;
  className?: string;
  children: React.ReactNode;
};

export function Badge({
  variant = "primary",
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
