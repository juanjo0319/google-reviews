import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuthStore } from "@/lib/auth-store";
import { useColors } from "@/hooks/useColors";
import { useCachedFetch } from "@/hooks/useCachedFetch";
import { cacheKeys } from "@/lib/cache";
import { api } from "@/lib/api";
import { enqueueAction } from "@/lib/offline-queue";
import { tapLight } from "@/lib/haptics";
import { useBadgeStore } from "@/lib/notification-badge";
import { NotificationCardSkeleton } from "@/components/ui/Skeleton";
import { SwipeableRow } from "@/components/ui/SwipeableRow";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { Bell, Star, AlertTriangle, Mail, CheckCheck } from "lucide-react-native";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  data: Record<string, unknown> | null;
  read: boolean;
  created_at: string;
}

interface NotificationsData {
  notifications: Notification[];
  unreadCount: number;
}

export default function NotificationsScreen() {
  const colors = useColors();
  const activeOrg = useAuthStore((s) => s.activeOrg);
  const router = useRouter();
  const setUnreadCount = useBadgeStore((s) => s.setUnreadCount);
  const decrementBadge = useBadgeStore((s) => s.decrement);

  const {
    data: rawData,
    loading,
    refreshing,
    onRefresh,
  } = useCachedFetch<NotificationsData>(
    `/api/mobile/notifications?orgId=${activeOrg?.id}`,
    {
      cacheKey: cacheKeys.notifications(activeOrg?.id ?? ""),
      ttl: 2 * 60 * 1000,
      skip: !activeOrg,
    }
  );

  const [localReadIds, setLocalReadIds] = useState<Set<string>>(new Set());

  // Sync badge count when data changes
  useEffect(() => {
    if (rawData) {
      const adjustedCount = Math.max(0, rawData.unreadCount - localReadIds.size);
      setUnreadCount(adjustedCount);
    }
  }, [rawData, localReadIds.size, setUnreadCount]);

  const notifications = (rawData?.notifications ?? []).map((n) =>
    localReadIds.has(n.id) ? { ...n, read: true } : n
  );
  const unreadCount = Math.max(
    0,
    (rawData?.unreadCount ?? 0) - localReadIds.size
  );

  async function handleMarkRead(id: string) {
    setLocalReadIds((prev) => new Set(prev).add(id));
    tapLight();
    decrementBadge();

    api(`/api/mobile/notifications/${id}/read`, {
      method: "PUT",
      body: { read: true },
    }).catch(() => {
      enqueueAction({
        path: `/api/mobile/notifications/${id}/read`,
        method: "PUT",
        body: { read: true },
      });
    });
  }

  function handleNotificationPress(notification: Notification) {
    if (!notification.read) {
      handleMarkRead(notification.id);
    }
    const reviewId =
      notification.data?.reviewId ?? notification.data?.review_id;
    if (reviewId && typeof reviewId === "string") {
      router.push(`/(app)/reviews/${reviewId}` as never);
    }
  }

  function getIcon(type: string) {
    switch (type) {
      case "new_review":
        return Star;
      case "negative_review":
        return AlertTriangle;
      case "weekly_digest":
        return Mail;
      default:
        return Bell;
    }
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  const renderNotification = useCallback(
    ({ item, index }: { item: Notification; index: number }) => {
      const Icon = getIcon(item.type);
      const swipeActions = !item.read
        ? [
            {
              label: "Read",
              icon: CheckCheck,
              color: colors.success,
              onPress: () => handleMarkRead(item.id),
            },
          ]
        : [];

      return (
        <AnimatedCard index={index}>
          <SwipeableRow rightActions={swipeActions}>
            <TouchableOpacity
              style={[
                styles.card,
                {
                  backgroundColor: item.read ? colors.surface : colors.primaryLight,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleNotificationPress(item)}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}. ${item.message ?? ""}. ${item.read ? "Read" : "Unread"}. ${timeAgo(item.created_at)}`}
              accessibilityHint={item.read ? undefined : "Double tap to open and mark as read"}
            >
              <View style={styles.iconContainer} accessibilityElementsHidden>
                <Icon
                  size={20}
                  color={item.type === "negative_review" ? colors.danger : colors.primary}
                />
              </View>
              <View style={styles.content}>
                <Text style={[styles.title, { color: colors.text }]}>
                  {item.title}
                </Text>
                {item.message && (
                  <Text
                    style={[styles.message, { color: colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {item.message}
                  </Text>
                )}
                <Text style={[styles.time, { color: colors.textSecondary }]}>
                  {timeAgo(item.created_at)}
                </Text>
              </View>
              {!item.read && (
                <View
                  style={[styles.unreadDot, { backgroundColor: colors.primary }]}
                  accessibilityElementsHidden
                />
              )}
            </TouchableOpacity>
          </SwipeableRow>
        </AnimatedCard>
      );
    },
    [colors, localReadIds]
  );

  if (loading) {
    return (
      <View style={[{ flex: 1, backgroundColor: colors.background, paddingTop: 8 }]}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={{ paddingHorizontal: 16 }}>
            <NotificationCardSkeleton />
          </View>
        ))}
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.list}
        style={{ backgroundColor: colors.background }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          unreadCount > 0 ? (
            <Text
              style={[styles.headerText, { color: colors.textSecondary }]}
              accessibilityRole="header"
            >
              {unreadCount} unread
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState} accessibilityRole="text">
            <Bell size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              All caught up
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              You'll see new review alerts and updates here.
            </Text>
          </View>
        }
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 32 },
  headerText: { fontSize: 13, marginBottom: 8, fontWeight: "500" },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  iconContainer: { paddingTop: 2 },
  content: { flex: 1 },
  title: { fontSize: 15, fontWeight: "600" },
  message: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  time: { fontSize: 12, marginTop: 6 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: "600" },
  emptyDesc: { fontSize: 14, textAlign: "center", maxWidth: 240 },
});
