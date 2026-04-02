import { forwardRef } from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "gradient-button text-white shadow-lg shadow-primary/25",
        secondary:
          "bg-white text-primary border border-neutral-200 hover:bg-neutral-50",
        ghost: "text-primary hover:bg-primary/5",
        outline:
          "bg-transparent text-primary border border-primary hover:bg-primary/5",
      },
      size: {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export type ButtonProps = VariantProps<typeof buttonVariants> & {
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
  href?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  "aria-label"?: string;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant,
      size,
      loading,
      className,
      children,
      href,
      disabled,
      type = "button",
      onClick,
      "aria-label": ariaLabel,
    },
    ref
  ) {
    const classes = cn(buttonVariants({ variant, size }), className);

    const content = (
      <>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </>
    );

    if (href) {
      return (
        <Link href={href} className={cn("hover:scale-[1.02] active:scale-[0.98] transition-transform", classes)} aria-label={ariaLabel}>
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        className={cn("hover:scale-[1.02] active:scale-[0.98] transition-transform", classes)}
        disabled={loading || disabled}
        onClick={onClick}
        aria-label={ariaLabel}
      >
        {content}
      </button>
    );
  }
);
