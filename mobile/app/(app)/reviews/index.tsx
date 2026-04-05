import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
// ActivityIndicator kept for load-more footer
import { useRouter } from "expo-router";
import { useAuthStore } from "@/lib/auth-store";
import { useColors } from "@/hooks/useColors";
import { api } from "@/lib/api";
import { Search, Filter, X } from "lucide-react-native";
import { ListSkeleton } from "@/components/ui/Skeleton";

interface Review {
  id: string;
  reviewer_name: string | null;
  star_rating: number;
  comment: string | null;
  sentiment: string | null;
  created_at: string;
  responseStatus: string | null;
  locations: { name: string } | null;
}

const FILTERS = ["all", "positive", "neutral", "negative"] as const;
const STAR_FILTERS = [5, 4, 3, 2, 1] as const;

export default function ReviewsListScreen() {
  const colors = useColors();
  const activeOrg = useAuthStore((s) => s.activeOrg);
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [sentiment, setSentiment] = useState<string>("all");
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchReviews = useCallback(
    async (offset = 0, append = false) => {
      if (!activeOrg) return;
      const params = new URLSearchParams({
        orgId: activeOrg.id,
        limit: "20",
        offset: String(offset),
      });
      if (search.trim()) params.set("search", search.trim());
      if (sentiment !== "all") params.set("sentiment", sentiment);
      if (starFilter) params.set("stars", String(starFilter));

      try {
        const result = await api<{
          reviews: Review[];
          total: number;
        }>(`/api/mobile/reviews?${params}`);

        if (append) {
          setReviews((prev) => [...prev, ...result.reviews]);
        } else {
          setReviews(result.reviews);
        }
        setTotal(result.total);
      } catch (err) {
        console.error("Reviews fetch error:", err);
      }
    },
    [activeOrg?.id, search, sentiment, starFilter]
  );

  useEffect(() => {
    setLoading(true);
    fetchReviews().finally(() => setLoading(false));
  }, [fetchReviews]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReviews();
    setRefreshing(false);
  }, [fetchReviews]);

  const loadMore = useCallback(async () => {
    if (loadingMore || reviews.length >= total) return;
    setLoadingMore(true);
    await fetchReviews(reviews.length, true);
    setLoadingMore(false);
  }, [loadingMore, reviews.length, total, fetchReviews]);

  function renderStars(rating: number) {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  }

  const renderReview = ({ item }: { item: Review }) => (
    <TouchableOpacity
      style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => router.push(`/(app)/reviews/${item.id}` as never)}
    >
      <View style={styles.reviewHeader}>
        <Text style={[styles.reviewerName, { color: colors.text }]}>
          {item.reviewer_name ?? "Anonymous"}
        </Text>
        <Text style={{ color: colors.star, fontSize: 13 }}>
          {renderStars(item.star_rating)}
        </Text>
      </View>
      {item.comment && (
        <Text
          style={[styles.reviewComment, { color: colors.textSecondary }]}
          numberOfLines={3}
        >
          {item.comment}
        </Text>
      )}
      <View style={styles.reviewFooter}>
        {item.sentiment && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  (item.sentiment === "positive"
                    ? colors.sentimentPositive
                    : item.sentiment === "negative"
                      ? colors.sentimentNegative
                      : colors.sentimentNeutral) + "20",
              },
            ]}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "500",
                color:
                  item.sentiment === "positive"
                    ? colors.sentimentPositive
                    : item.sentiment === "negative"
                      ? colors.sentimentNegative
                      : colors.sentimentNeutral,
                textTransform: "capitalize",
              }}
            >
              {item.sentiment}
            </Text>
          </View>
        )}
        {item.locations && (
          <Text style={[styles.locationName, { color: colors.textSecondary }]}>
            {item.locations.name}
          </Text>
        )}
        {item.responseStatus && (
          <Text style={[styles.statusText, { color: colors.primary }]}>
            {item.responseStatus}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Search size={18} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search reviews..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
          <Filter size={18} color={showFilters ? colors.primary : colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollRow>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: sentiment === f ? colors.primary : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setSentiment(f)}
              >
                <Text
                  style={{
                    color: sentiment === f ? "#fff" : colors.text,
                    fontSize: 13,
                    fontWeight: "500",
                    textTransform: "capitalize",
                  }}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollRow>
          <ScrollRow>
            {STAR_FILTERS.map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: starFilter === s ? colors.primary : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setStarFilter(starFilter === s ? null : s)}
              >
                <Text
                  style={{
                    color: starFilter === s ? "#fff" : colors.text,
                    fontSize: 13,
                  }}
                >
                  {s} ★
                </Text>
              </TouchableOpacity>
            ))}
            {starFilter && (
              <TouchableOpacity onPress={() => setStarFilter(null)}>
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </ScrollRow>
        </View>
      )}

      {/* Total */}
      <Text style={[styles.totalText, { color: colors.textSecondary }]}>
        {total} review{total !== 1 ? "s" : ""}
      </Text>

      {loading ? (
        <ListSkeleton count={6} />
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={renderReview}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                color={colors.primary}
                style={{ paddingVertical: 16 }}
              />
            ) : null
          }
          ListEmptyComponent={
            <Text
              style={[styles.emptyText, { color: colors.textSecondary }]}
            >
              No reviews found
            </Text>
          }
        />
      )}
    </View>
  );
}

function ScrollRow({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15 },
  filtersContainer: { paddingHorizontal: 16, paddingTop: 10, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  totalText: { paddingHorizontal: 16, paddingVertical: 8, fontSize: 13 },
  list: { paddingHorizontal: 16, paddingBottom: 16 },
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
  reviewerName: { fontSize: 15, fontWeight: "600", flex: 1 },
  reviewComment: { fontSize: 14, marginTop: 6, lineHeight: 20 },
  reviewFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    flexWrap: "wrap",
  },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  locationName: { fontSize: 12 },
  statusText: { fontSize: 12, fontWeight: "500" },
  emptyText: { textAlign: "center", marginTop: 40, fontSize: 15 },
});
