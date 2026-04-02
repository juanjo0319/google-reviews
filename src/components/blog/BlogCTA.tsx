import { cn } from "@/lib/utils";
import Link from "next/link";

interface BlogCTAProps {
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
}

export function BlogCTA({
  title,
  description,
  buttonText,
  buttonHref,
}: BlogCTAProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-gradient-to-r from-primary to-accent text-white p-8 my-12"
      )}
    >
      <h3 className="text-xl font-bold font-heading">{title}</h3>
      <p className="text-white/80 text-sm mt-2 mb-6 max-w-lg">{description}</p>
      <Link
        href={buttonHref}
        className={cn(
          "inline-flex bg-white text-primary font-semibold px-6 py-3 rounded-xl",
          "hover:bg-white/90 transition-colors"
        )}
      >
        {buttonText}
      </Link>
    </div>
  );
}
