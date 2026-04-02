import { cn } from "@/lib/utils";
import { Calendar, Clock } from "lucide-react";
import Link from "next/link";

interface AuthorCardProps {
  name: string;
  date: string;
  readTime: string;
  showBio?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AuthorCard({ name, date, readTime, showBio }: AuthorCardProps) {
  return (
    <div>
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "h-12 w-12 rounded-full bg-gradient-to-r from-primary to-accent",
            "flex items-center justify-center text-white font-semibold text-sm shrink-0"
          )}
        >
          {getInitials(name)}
        </div>

        <div>
          <p className="font-semibold text-neutral-900 text-base">{name}</p>

          <div className="flex items-center gap-3 text-sm text-neutral-500">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {date}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {readTime}
            </span>
          </div>
        </div>
      </div>

      {showBio && (
        <div className="mt-4 border border-neutral-200 rounded-xl p-4">
          <p className="text-sm text-neutral-600 leading-relaxed">
            The RevUp.ai team shares practical guides on review management,
            AI-powered response strategies, and reputation building for local
            businesses.
          </p>
          <Link
            href="/blog"
            className="inline-block mt-2 text-sm font-medium text-primary hover:text-accent transition-colors"
          >
            View all posts
          </Link>
        </div>
      )}
    </div>
  );
}
