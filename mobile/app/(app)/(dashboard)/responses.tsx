import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Bot, User } from "lucide-react-native";
import { useAuthStore } from "@/lib/auth-store";
import { useColors } from "@/hooks/useColors";
import { useCachedFetch } from "@/hooks/useCachedFetch";
import { cacheKeys } from "@/lib/cache";
import { ListSkeleton } from "@/components/ui/Skeleton";

interface ResponseItem {
  id: string;
  review_id: string;
  content: string;
  status: string;
  is_ai_generated: boolean;
  created_at: string;
  review: {
    reviewer_name: string | null;
    star_rating: number;
    comment: string | null;
  } | null;
}

interface ResponsesData {
  responses: ResponseItem[];
  counts: Record<string, number>;
}

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "pending_approval", label: "Pending" },
  { key: "draft", label: "Draft" },
  { key: "approved", label: "Approved" },
  { key: "published", label: "Published" },
  { key: "rejected", label: "Rejected" },
] as const;

function getStatusColor(status: string, colors: ReturnType<typeof useColors>) {
  switch (status) {
    case "draft": return colors.textSecondary;
    case "pending_approval": return colors.warning;
    case "approved": return colors.primary;
    case "published": return colors.success;
    case "rejected": return colors.danger;
    default: return colors.textSecondary;
  }
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ResponsesScreen() {
  const colors = useColors();
  const activeOrg = useAuthStore((s) => s.activeOrg);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");

  const statusParam = activeTab === "all" ? "" : `&status=${activeTab}`;
  const { data, loading, refreshing, onRefresh } = useCachedFetch<ResponsesData>(
    `/api/mobile/responses?orgId=${activeOrg?.id}${statusParam}`,
    {
      cacheKey: cacheKeys.responses(activeOrg?.id ?? "", activeTab),
      skip: !activeOrg,
    }
  );

  function renderStars(rating: number) {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  }

  const renderItem = useCallback(
    ({ item }: { item: ResponseItem }) => {
      const statusColor = getStatusColor(item.status, colors);
      return (
        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => router.push(`/(app)/reviews/${item.review_id}` as never)}
        >
          <View style={styles.cardTop}>
            <View style={styles.reviewerRow}>
              {item.is_ai_generated ? (
                <Bot size={14} color={colors.primary} />
              ) : (
                <User size={14} color={colors.textSecondary} />
              )}
              <Text style={[styles.reviewerName, { color: colors.text }]}>
                {item.review?.reviewer_name ?? "Unknown Review"}
              </Text>
              {item.review && (
                <Text style={{ color: colors.star, fontSize: 12 }}>
                  {renderStars(item.review.star_rating)}
                </Text>
              )}
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + "18" }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {formatStatus(item.status)}
              </Text>
            </View>
          </View>

          <Text
            style={[styles.content, { color: colors.textSecondary }]}
            numberOfLines={3}
          >
            {item.content}
          </Text>

          {item.review?.comment && (
            <View style={[styles.reviewSnippet, { backgroundColor: colors.background }]}>
              <Text
                style={[styles.reviewSnippetText, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                "{item.review.comment}"
              </Text>
            </View>
          )}

          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </TouchableOpacity>
      );
    },
    [colors, router]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Status Tabs */}
      <FlatList
        horizontal
        data={STATUS_TABS}
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBar}
        renderItem={({ item: tab }) => {
          const isActive = activeTab === tab.key;
          const count = tab.key === "all"
            ? data?.responses.length ?? 0
            : data?.counts[tab.key] ?? 0;
          return (
            <TouchableOpacity
              style={[
                styles.tab,
                {
                  backgroundColor: isActive ? colors.primary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={{
                  color: isActive ? "#fff" : colors.text,
                  fontSize: 13,
                  fontWeight: "500",
                }}
              >
                {tab.label} {count > 0 ? `(${count})` : ""}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {loading ? (
        <ListSkeleton count={5} />
      ) : (
        <FlatList
          data={data?.responses ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No responses yet
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                AI responses will appear here once reviews are processed.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  list: { paddingHorizontal: 16, paddingBottom: 16 },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  reviewerRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  reviewerName: { fontSize: 14, fontWeight: "600" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: "500" },
  content: { fontSize: 13, lineHeight: 19 },
  reviewSnippet: {
    marginTop: 8,
    borderRadius: 8,
    padding: 10,
  },
  reviewSnippetText: { fontSize: 12, fontStyle: "italic", lineHeight: 17 },
  dateText: { fontSize: 11, marginTop: 8 },
  emptyContainer: { alignItems: "center", paddingTop: 60 },
  emptyText: { fontSize: 16, fontWeight: "600" },
  emptySubtext: { fontSize: 13, marginTop: 4, textAlign: "center", paddingHorizontal: 40 },
});
