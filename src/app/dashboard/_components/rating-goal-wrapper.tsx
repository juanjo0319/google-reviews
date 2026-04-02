import { createAdminClient } from "@/lib/supabase/admin";
import { RatingGoal } from "./rating-goal";

export async function RatingGoalWrapper({ orgId }: { orgId: string }) {
  const supabase = createAdminClient();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("star_rating")
    .eq("organization_id", orgId);

  if (!reviews?.length) return null;

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const r of reviews) {
    distribution[r.star_rating] = (distribution[r.star_rating] ?? 0) + 1;
    sum += r.star_rating;
  }

  const avg = sum / reviews.length;

  return (
    <RatingGoal
      currentAvg={avg}
      totalReviews={reviews.length}
      ratingDistribution={distribution}
    />
  );
}
