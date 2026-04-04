import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/lib/auth-store";
import { useColors } from "@/hooks/useColors";
import { api } from "@/lib/api";

interface Stats {
  totalReviews: number;
  avgRating: string;
  responseRate: number;
  sentimentScore: string;
  reviewTrend: number;
}

interface Review {
  id: string;
  reviewer_name: string | null;
  star_rating: number;
  comment: string | null;
  sentiment: string | null;
  created_at: string;
  responseStatus: string | null;
}

interface DashboardData {
  stats: Stats;
  recentReviews: Review[];
  urgentReviews: Review[];
}

export default function DashboardScreen() {
  const colors = useColors();
  const activeOrg = useAuthStore((s) => s.activeOrg);
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<DashboardData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!activeOrg) return;
    try {
      const result = await api<DashboardData>(
        `/api/mobile/reviews/stats?orgId=${activeOrg.id}`
      );
      setData(result);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  }, [activeOrg?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const router = useRouter();

  function renderStars(rating: number) {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.greeting}>
        <Text style={[styles.greetingText, { color: colors.text }]}>
          Hi, {user?.name?.split(" ")[0] ?? "there"}
        </Text>
        <Text style={[styles.orgName, { color: colors.textSecondary }]}>
          {activeOrg?.name}
        </Text>
      </View>

      {/* Stat Cards */}
      {data && (
        <View style={styles.statsGrid}>
          <StatCard
            label="Total Reviews"
            value={String(data.stats.totalReviews)}
            trend={data.stats.reviewTrend}
            colors={colors}
          />
          <StatCard
            label="Avg Rating"
            value={data.stats.avgRating}
            icon="★"
            colors={colors}
          />
          <StatCard
            label="Response Rate"
            value={`${data.stats.responseRate}%`}
            colors={colors}
          />
          <StatCard
            label="Sentiment"
            value={`${data.stats.sentimentScore}/10`}
            colors={colors}
          />
        </View>
      )}

      {/* Urgent Reviews */}
      {data && data.urgentReviews.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.danger }]}>
            Action Required ({data.urgentReviews.length})
          </Text>
          {data.urgentReviews.map((review) => (
            <TouchableOpacity
              key={review.id}
              style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.danger + "40" }]}
              onPress={() => router.push(`/(app)/reviews/${review.id}` as never)}
            >
              <View style={styles.reviewHeader}>
                <Text style={[styles.reviewerName, { color: colors.text }]}>
                  {review.reviewer_name ?? "Anonymous"}
                </Text>
                <Text style={{ color: colors.star }}>
                  {renderStars(review.star_rating)}
                </Text>
              </View>
              {review.comment && (
                <Text
                  style={[styles.reviewComment, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {review.comment}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Recent Reviews */}
      {data && data.recentReviews.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Reviews
            </Text>
            <TouchableOpacity onPress={() => router.push("/(app)/reviews" as never)}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                See all
              </Text>
            </TouchableOpacity>
          </View>
          {data.recentReviews.slice(0, 5).map((review) => (
            <TouchableOpacity
              key={review.id}
              style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push(`/(app)/reviews/${review.id}` as never)}
            >
              <View style={styles.reviewHeader}>
                <Text style={[styles.reviewerName, { color: colors.text }]}>
                  {review.reviewer_name ?? "Anonymous"}
                </Text>
                <Text style={{ color: colors.star, fontSize: 13 }}>
                  {renderStars(review.star_rating)}
                </Text>
              </View>
              {review.comment && (
                <Text
                  style={[styles.reviewComment, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {review.comment}
                </Text>
              )}
              <View style={styles.reviewFooter}>
                <SentimentBadge sentiment={review.sentiment} colors={colors} />
                {review.responseStatus && (
                  <Text style={[styles.statusBadge, { color: colors.textSecondary }]}>
                    {review.responseStatus}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function StatCard({
  label,
  value,
  trend,
  icon,
  colors,
}: {
  label: string;
  value: string;
  trend?: number;
  icon?: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[statStyles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[statStyles.label, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <View style={statStyles.valueRow}>
        {icon && (
          <Text style={{ color: colors.star, fontSize: 18, marginRight: 4 }}>
            {icon}
          </Text>
        )}
        <Text style={[statStyles.value, { color: colors.text }]}>{value}</Text>
      </View>
      {trend !== undefined && trend !== 0 && (
        <Text
          style={[
            statStyles.trend,
            { color: trend > 0 ? colors.success : colors.danger },
          ]}
        >
          {trend > 0 ? "+" : ""}
          {trend}% this month
        </Text>
      )}
    </View>
  );
}

function SentimentBadge({
  sentiment,
  colors,
}: {
  sentiment: string | null;
  colors: ReturnType<typeof useColors>;
}) {
  if (!sentiment) return null;
  const color =
    sentiment === "positive"
      ? colors.sentimentPositive
      : sentiment === "negative"
        ? colors.sentimentNegative
        : colors.sentimentNeutral;

  return (
    <View style={[badgeStyles.badge, { backgroundColor: color + "20" }]}>
      <Text style={[badgeStyles.text, { color }]}>{sentiment}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  greeting: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  greetingText: { fontSize: 24, fontWeight: "700" },
  orgName: { fontSize: 14, marginTop: 2 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 8,
    marginTop: 16,
  },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  seeAll: { fontSize: 14, fontWeight: "600" },
  reviewCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewerName: { fontSize: 15, fontWeight: "600" },
  reviewComment: { fontSize: 14, marginTop: 6, lineHeight: 20 },
  reviewFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  statusBadge: { fontSize: 12 },
});

const statStyles = StyleSheet.create({
  card: {
    width: "47%",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: "1.5%",
  },
  label: { fontSize: 12, fontWeight: "500" },
  valueRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  value: { fontSize: 24, fontWeight: "700" },
  trend: { fontSize: 12, marginTop: 4 },
});

const badgeStyles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  text: { fontSize: 12, fontWeight: "500", textTransform: "capitalize" },
});
