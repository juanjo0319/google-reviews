import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Star, BarChart3, Clock, Tag, MapPin, TrendingUp } from "lucide-react-native";
import { useAuthStore } from "@/lib/auth-store";
import { useColors } from "@/hooks/useColors";
import { useCachedFetch } from "@/hooks/useCachedFetch";
import { cacheKeys } from "@/lib/cache";
import { ListSkeleton } from "@/components/ui/Skeleton";

interface AnalyticsData {
  totalReviews: number;
  ratingDistribution: { star: number; count: number }[];
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
  dailyVolume: { date: string; count: number }[];
  responseStats: {
    avgResponseTimeHours: number;
    responseRate: number;
    totalResponses: number;
    published: number;
  };
  topThemes: { theme: string; count: number }[];
  locationStats: { name: string; count: number; avgRating: string }[];
}

export default function AnalyticsScreen() {
  const colors = useColors();
  const activeOrg = useAuthStore((s) => s.activeOrg);

  const { data, loading, refreshing, onRefresh } = useCachedFetch<AnalyticsData>(
    `/api/mobile/analytics?orgId=${activeOrg?.id}`,
    {
      cacheKey: cacheKeys.analytics(activeOrg?.id ?? ""),
      skip: !activeOrg,
    }
  );

  if (loading || !data) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ListSkeleton count={4} />
      </View>
    );
  }

  const maxRating = Math.max(...data.ratingDistribution.map((d) => d.count), 1);
  const sentimentTotal =
    data.sentimentBreakdown.positive +
    data.sentimentBreakdown.neutral +
    data.sentimentBreakdown.negative || 1;
  const maxVolume = Math.max(...data.dailyVolume.map((d) => d.count), 1);

  const avgTime = data.responseStats.avgResponseTimeHours;
  const avgTimeDisplay =
    avgTime > 0
      ? avgTime < 1
        ? `${Math.round(avgTime * 60)}m`
        : avgTime < 24
          ? `${avgTime.toFixed(1)}h`
          : `${(avgTime / 24).toFixed(1)}d`
      : "--";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Rating Distribution */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Star size={18} color={colors.star} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Rating Distribution</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            {data.totalReviews} total
          </Text>
        </View>
        {data.ratingDistribution.map(({ star, count }) => {
          const pct = data.totalReviews > 0 ? Math.round((count / data.totalReviews) * 100) : 0;
          return (
            <View key={star} style={styles.barRow}>
              <Text style={[styles.barLabel, { color: colors.textSecondary }]}>
                {star} {star === 1 ? "star" : "stars"}
              </Text>
              <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      backgroundColor: colors.star,
                      width: `${(count / maxRating) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barValue, { color: colors.textSecondary }]}>
                {count} ({pct}%)
              </Text>
            </View>
          );
        })}
      </View>

      {/* Sentiment Breakdown */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <BarChart3 size={18} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Sentiment Breakdown</Text>
        </View>
        {([
          { key: "positive" as const, label: "Positive", color: colors.sentimentPositive },
          { key: "neutral" as const, label: "Neutral", color: colors.sentimentNeutral },
          { key: "negative" as const, label: "Negative", color: colors.sentimentNegative },
        ]).map(({ key, label, color }) => {
          const count = data.sentimentBreakdown[key];
          const pct = Math.round((count / sentimentTotal) * 100);
          return (
            <View key={key} style={{ marginBottom: 12 }}>
              <View style={styles.sentimentLabelRow}>
                <Text style={[styles.sentimentLabel, { color }]}>{label}</Text>
                <Text style={[styles.sentimentCount, { color: colors.textSecondary }]}>
                  {count} ({pct}%)
                </Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: colors.border, height: 8 }]}>
                <View
                  style={[styles.barFill, { backgroundColor: color, width: `${pct}%`, height: 8 }]}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* Response Stats */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Clock size={18} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Response Stats</Text>
        </View>
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { backgroundColor: colors.background }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{avgTimeDisplay}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avg. Time</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.background }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {data.responseStats.responseRate}%
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Response Rate</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.background }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {data.responseStats.totalResponses}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.background }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {data.responseStats.published}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Published</Text>
          </View>
        </View>
      </View>

      {/* Review Volume */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <TrendingUp size={18} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Review Volume</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Last 30 days</Text>
        </View>
        <View style={styles.chartContainer}>
          {data.dailyVolume.map(({ count }, i) => (
            <View key={i} style={styles.chartBar}>
              <View
                style={[
                  styles.chartBarFill,
                  {
                    backgroundColor: colors.primary + "40",
                    height: Math.max(2, (count / maxVolume) * 100),
                  },
                ]}
              />
            </View>
          ))}
        </View>
        <View style={styles.chartLabels}>
          <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>
            {data.dailyVolume[0]?.date}
          </Text>
          <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>
            {data.dailyVolume[data.dailyVolume.length - 1]?.date}
          </Text>
        </View>
      </View>

      {/* Top Themes */}
      {data.topThemes.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Tag size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Top Themes</Text>
          </View>
          {data.topThemes.map(({ theme, count }) => {
            const maxTheme = data.topThemes[0].count;
            return (
              <View key={theme} style={styles.barRow}>
                <Text
                  style={[styles.themeLabel, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {theme}
                </Text>
                <View style={[styles.barTrack, { backgroundColor: colors.border, flex: 1 }]}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        backgroundColor: colors.primary + "40",
                        width: `${(count / maxTheme) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barValue, { color: colors.textSecondary, width: 28 }]}>
                  {count}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Location Comparison */}
      {data.locationStats.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <MapPin size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Locations</Text>
          </View>
          {data.locationStats.map((loc) => (
            <View
              key={loc.name}
              style={[styles.locationRow, { backgroundColor: colors.background }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.locationName, { color: colors.text }]}>{loc.name}</Text>
                <Text style={[styles.locationCount, { color: colors.textSecondary }]}>
                  {loc.count} reviews
                </Text>
              </View>
              <View style={styles.locationRating}>
                <Text style={{ color: colors.star, fontSize: 14 }}>★</Text>
                <Text style={[styles.locationAvg, { color: colors.text }]}>{loc.avgRating}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", flex: 1 },
  cardSubtitle: { fontSize: 12 },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  barLabel: { fontSize: 12, width: 50 },
  barTrack: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
  },
  barFill: {
    height: 12,
    borderRadius: 6,
  },
  barValue: { fontSize: 11, width: 60, textAlign: "right" },
  sentimentLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  sentimentLabel: { fontSize: 13, fontWeight: "500" },
  sentimentCount: { fontSize: 12 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statBox: {
    width: "47%",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  statValue: { fontSize: 22, fontWeight: "700" },
  statLabel: { fontSize: 11, marginTop: 2 },
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 100,
    gap: 1,
  },
  chartBar: {
    flex: 1,
    justifyContent: "flex-end",
  },
  chartBarFill: {
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    minHeight: 2,
  },
  chartLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  chartLabel: { fontSize: 10 },
  themeLabel: { fontSize: 12, width: 90 },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  locationName: { fontSize: 14, fontWeight: "500" },
  locationCount: { fontSize: 12, marginTop: 2 },
  locationRating: { flexDirection: "row", alignItems: "center", gap: 4 },
  locationAvg: { fontSize: 18, fontWeight: "700" },
});
