"use client";

import { useState } from "react";
import { Target, Star, TrendingUp, Info } from "lucide-react";

interface RatingGoalProps {
  currentAvg: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>; // { 1: 2, 2: 1, 3: 2, 4: 3, 5: 4 }
}

function calculateReviewsNeeded(
  currentSum: number,
  currentTotal: number,
  targetAvg: number,
  assumedStarRating: number
): number {
  // Formula: (currentSum + n * assumedStarRating) / (currentTotal + n) = targetAvg
  // Solving for n: n = (targetAvg * currentTotal - currentSum) / (assumedStarRating - targetAvg)
  if (assumedStarRating <= targetAvg) return Infinity; // impossible if assumed rating <= target
  const n = (targetAvg * currentTotal - currentSum) / (assumedStarRating - targetAvg);
  return Math.max(0, Math.ceil(n));
}

export function RatingGoal({
  currentAvg,
  totalReviews,
  ratingDistribution,
}: RatingGoalProps) {
  const [targetRating, setTargetRating] = useState(4.5);

  const currentSum = Object.entries(ratingDistribution).reduce(
    (sum, [stars, count]) => sum + Number(stars) * count,
    0
  );

  const alreadyMet = currentAvg >= targetRating;
  const needed5Star = calculateReviewsNeeded(currentSum, totalReviews, targetRating, 5);
  const needed4Star = calculateReviewsNeeded(currentSum, totalReviews, targetRating, 4);

  // Progress percentage toward the goal
  const progressPct = Math.min(100, (currentAvg / targetRating) * 100);

  return (
    <div className="rounded-2xl bg-white border border-slate-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-slate-900">Rating Goal</h2>
      </div>

      {/* Target selector */}
      <div className="mb-5">
        <label className="text-sm text-slate-500 mb-2 block">Target rating</label>
        <div className="flex items-center gap-2">
          {[4.0, 4.2, 4.5, 4.7, 4.8, 5.0].map((val) => (
            <button
              key={val}
              onClick={() => setTargetRating(val)}
              className={
                "flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors " +
                (targetRating === val
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200")
              }
            >
              <Star className={"h-3 w-3 " + (targetRating === val ? "fill-white" : "fill-amber-400 text-amber-400")} />
              {val.toFixed(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Current vs Target */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-slate-500">Current</span>
            <span className="text-sm font-bold text-slate-900">{currentAvg.toFixed(2)}</span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={
                "h-full rounded-full transition-all duration-500 " +
                (alreadyMet ? "bg-green-500" : progressPct > 80 ? "bg-amber-400" : "bg-primary")
              }
              style={{ width: progressPct + "%" }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-slate-400">0</span>
            <span className="text-[10px] text-slate-400 font-medium">Target: {targetRating.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Result */}
      {alreadyMet ? (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">
          <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-green-700">
            Goal achieved!
          </p>
          <p className="text-xs text-green-600 mt-1">
            Your current rating of {currentAvg.toFixed(2)} already meets your {targetRating.toFixed(1)} target.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* 5-star scenario */}
          <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-sm text-slate-600">reviews needed</span>
              </div>
              <span className="text-2xl font-bold text-primary">
                {needed5Star === Infinity ? "N/A" : needed5Star}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              If every new review is 5 stars, you need <strong>{needed5Star === Infinity ? "—" : needed5Star}</strong> more
              to reach {targetRating.toFixed(1)}
            </p>
          </div>

          {/* 4-star scenario */}
          {needed4Star !== Infinity && targetRating < 4.0 === false && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <Star className="h-3.5 w-3.5 fill-slate-200 text-slate-200" />
                  </div>
                  <span className="text-sm text-slate-600">reviews needed</span>
                </div>
                <span className="text-2xl font-bold text-slate-700">
                  {needed4Star === Infinity ? "N/A" : needed4Star}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                If every new review is 4 stars, you need <strong>{needed4Star === Infinity ? "—" : needed4Star}</strong> more
              </p>
            </div>
          )}

          {/* Insight */}
          <div className="flex items-start gap-2 pt-2">
            <Info className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-500 leading-relaxed">
              Based on {totalReviews} total reviews. Focus on delighting customers
              and encouraging happy visitors to leave reviews to reach your goal faster.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
