import { Suspense } from "react";
import {
  Star,
  MessageSquare,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

// --- Skeleton loaders ---

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-6 border border-slate-100 animate-pulse">
      <div className="h-4 w-24 bg-slate-200 rounded mb-4" />
      <div className="h-8 w-16 bg-slate-200 rounded mb-2" />
      <div className="h-3 w-20 bg-slate-100 rounded" />
    </div>
  );
}

function ReviewListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-white p-4 border border-slate-100 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-200" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
              <div className="h-3 w-48 bg-slate-100 rounded" />
            </div>
            <div className="h-6 w-16 bg-slate-200 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Stat cards (placeholder data) ---

function StatCard({
  label,
  value,
  change,
  trend,
  icon: Icon,
  iconBg,
}: {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      <div className="flex items-center gap-1 mt-2">
        {trend === "up" ? (
          <ArrowUpRight className="h-4 w-4 text-green-600" />
        ) : (
          <ArrowDownRight className="h-4 w-4 text-red-500" />
        )}
        <span
          className={`text-sm font-medium ${
            trend === "up" ? "text-green-600" : "text-red-500"
          }`}
        >
          {change}
        </span>
        <span className="text-sm text-slate-400 ml-1">vs last month</span>
      </div>
    </div>
  );
}

async function StatCards() {
  // Placeholder data — will be wired to Supabase in Phase 4-5
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Reviews"
        value="1,284"
        change="12%"
        trend="up"
        icon={MessageSquare}
        iconBg="bg-primary/10 text-primary"
      />
      <StatCard
        label="Average Rating"
        value="4.6"
        change="0.2"
        trend="up"
        icon={Star}
        iconBg="bg-amber-100 text-amber-600"
      />
      <StatCard
        label="Response Rate"
        value="94%"
        change="3%"
        trend="up"
        icon={TrendingUp}
        iconBg="bg-green-100 text-green-600"
      />
      <StatCard
        label="Sentiment Score"
        value="8.2"
        change="0.4"
        trend="up"
        icon={BarChart3}
        iconBg="bg-purple-100 text-purple-600"
      />
    </div>
  );
}

// --- Sentiment trend bars ---

function SentimentTrend() {
  const data = [
    { label: "Mon", positive: 75, neutral: 15, negative: 10 },
    { label: "Tue", positive: 80, neutral: 12, negative: 8 },
    { label: "Wed", positive: 65, neutral: 20, negative: 15 },
    { label: "Thu", positive: 70, neutral: 18, negative: 12 },
    { label: "Fri", positive: 85, neutral: 10, negative: 5 },
    { label: "Sat", positive: 78, neutral: 14, negative: 8 },
    { label: "Sun", positive: 82, neutral: 11, negative: 7 },
  ];

  return (
    <div className="rounded-2xl bg-white p-6 border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Sentiment Trend
        </h2>
        <span className="text-sm text-slate-500">Last 7 days</span>
      </div>
      <div className="flex items-end gap-3 h-40">
        {data.map(({ label, positive, neutral, negative }) => (
          <div key={label} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col gap-0.5" style={{ height: "120px" }}>
              <div
                className="w-full bg-green-400 rounded-t"
                style={{ height: `${(positive / 100) * 120}px` }}
              />
              <div
                className="w-full bg-amber-400"
                style={{ height: `${(neutral / 100) * 120}px` }}
              />
              <div
                className="w-full bg-red-400 rounded-b"
                style={{ height: `${(negative / 100) * 120}px` }}
              />
            </div>
            <span className="text-xs text-slate-500 mt-1">{label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
          <span className="text-xs text-slate-500">Positive</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="text-xs text-slate-500">Neutral</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="text-xs text-slate-500">Negative</span>
        </div>
      </div>
    </div>
  );
}

// --- Recent reviews ---

function StarDisplay({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < count
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

const sentimentColors = {
  positive: "bg-green-100 text-green-700",
  neutral: "bg-amber-100 text-amber-700",
  negative: "bg-red-100 text-red-700",
};

const statusColors = {
  responded: "bg-primary/10 text-primary",
  pending: "bg-amber-100 text-amber-700",
  unresponded: "bg-slate-100 text-slate-600",
};

const recentReviews = [
  {
    id: "1",
    reviewer: "Sarah M.",
    stars: 5,
    text: "Absolutely fantastic experience! The staff went above and beyond to make our visit special.",
    sentiment: "positive" as const,
    status: "responded" as const,
    time: "2 hours ago",
  },
  {
    id: "2",
    reviewer: "James T.",
    stars: 3,
    text: "Decent food but the wait times are getting longer. Used to be much better about this.",
    sentiment: "neutral" as const,
    status: "pending" as const,
    time: "5 hours ago",
  },
  {
    id: "3",
    reviewer: "Emily R.",
    stars: 1,
    text: "Terrible service. Wrong order and no one seemed to care about fixing it.",
    sentiment: "negative" as const,
    status: "unresponded" as const,
    time: "8 hours ago",
  },
  {
    id: "4",
    reviewer: "Michael B.",
    stars: 4,
    text: "Great quality products. Delivery was a bit slow but everything arrived in perfect condition.",
    sentiment: "positive" as const,
    status: "responded" as const,
    time: "1 day ago",
  },
  {
    id: "5",
    reviewer: "Lisa K.",
    stars: 5,
    text: "Best experience I've had in years! Will definitely be coming back and recommending to friends.",
    sentiment: "positive" as const,
    status: "responded" as const,
    time: "1 day ago",
  },
];

async function RecentReviews() {
  return (
    <div className="rounded-2xl bg-white border border-slate-100">
      <div className="flex items-center justify-between p-6 pb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Recent Reviews
        </h2>
        <Link
          href="/dashboard/reviews"
          className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          View all
        </Link>
      </div>
      <div className="divide-y divide-slate-100">
        {recentReviews.map((review) => (
          <div key={review.id} className="flex items-start gap-3 px-6 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
              {review.reviewer[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-slate-900">
                  {review.reviewer}
                </span>
                <StarDisplay count={review.stars} />
                <span className="text-xs text-slate-400 ml-auto shrink-0">
                  {review.time}
                </span>
              </div>
              <p className="text-sm text-slate-600 truncate">{review.text}</p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    sentimentColors[review.sentiment]
                  }`}
                >
                  {review.sentiment}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    statusColors[review.status]
                  }`}
                >
                  {review.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Action required ---

const actionItems = [
  {
    id: "1",
    reviewer: "Emily R.",
    stars: 1,
    text: "Terrible service. Wrong order and no one seemed to care about fixing it.",
    time: "8 hours ago",
  },
  {
    id: "2",
    reviewer: "David P.",
    stars: 2,
    text: "Very disappointing. Quality has really gone downhill lately.",
    time: "1 day ago",
  },
];

async function ActionRequired() {
  return (
    <div className="rounded-2xl bg-white border border-slate-100">
      <div className="flex items-center gap-2 p-6 pb-4">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <h2 className="text-lg font-semibold text-slate-900">
          Action Required
        </h2>
        <span className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
          {actionItems.length}
        </span>
      </div>
      <div className="divide-y divide-slate-100">
        {actionItems.map((item) => (
          <div key={item.id} className="flex items-start gap-3 px-6 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-semibold text-red-600">
              {item.reviewer[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-slate-900">
                  {item.reviewer}
                </span>
                <StarDisplay count={item.stars} />
                <span className="text-xs text-slate-400 ml-auto shrink-0 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {item.time}
                </span>
              </div>
              <p className="text-sm text-slate-600 truncate">{item.text}</p>
              <Link
                href="/dashboard/reviews"
                className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary hover:text-primary-dark"
              >
                Respond now
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Page ---

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Overview of your review performance
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <StatCards />
      </Suspense>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <Suspense fallback={<ReviewListSkeleton />}>
            <RecentReviews />
          </Suspense>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <SentimentTrend />
          <Suspense fallback={<ReviewListSkeleton />}>
            <ActionRequired />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
