import { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, type ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Shimmer skeleton placeholder for loading states.
 */
export function Skeleton({ width = "100%", height = 16, borderRadius = 8, style }: SkeletonProps) {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
}

/**
 * Skeleton card mimicking a stat card.
 */
export function StatCardSkeleton() {
  const colors = useColors();
  return (
    <View style={[skeletonStyles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Skeleton width={80} height={12} />
      <Skeleton width={60} height={28} borderRadius={6} style={{ marginTop: 8 }} />
    </View>
  );
}

/**
 * Skeleton card mimicking a review card.
 */
export function ReviewCardSkeleton() {
  const colors = useColors();
  return (
    <View style={[skeletonStyles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={skeletonStyles.row}>
        <Skeleton width={120} height={14} />
        <Skeleton width={70} height={14} />
      </View>
      <Skeleton width="100%" height={12} style={{ marginTop: 10 }} />
      <Skeleton width="75%" height={12} style={{ marginTop: 6 }} />
      <View style={[skeletonStyles.row, { marginTop: 10 }]}>
        <Skeleton width={60} height={20} borderRadius={10} />
        <Skeleton width={50} height={12} />
      </View>
    </View>
  );
}

/**
 * Skeleton card for a notification item.
 */
export function NotificationCardSkeleton() {
  const colors = useColors();
  return (
    <View style={[skeletonStyles.notifCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Skeleton width={36} height={36} borderRadius={18} />
      <View style={{ flex: 1, gap: 6 }}>
        <Skeleton width="70%" height={14} />
        <Skeleton width="90%" height={12} />
        <Skeleton width={60} height={10} />
      </View>
    </View>
  );
}

/**
 * Skeleton for a location card.
 */
export function LocationCardSkeleton() {
  const colors = useColors();
  return (
    <View style={[skeletonStyles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Skeleton width={150} height={16} />
      <Skeleton width="100%" height={12} style={{ marginTop: 8 }} />
      <View style={[skeletonStyles.row, { marginTop: 10 }]}>
        <Skeleton width={60} height={20} borderRadius={10} />
        <Skeleton width={80} height={12} />
      </View>
    </View>
  );
}

/**
 * Full-screen skeleton for dashboard stats.
 */
export function DashboardSkeleton() {
  return (
    <View style={skeletonStyles.dashboardContainer}>
      <View style={skeletonStyles.greetingArea}>
        <Skeleton width={180} height={24} borderRadius={6} />
        <Skeleton width={120} height={14} style={{ marginTop: 6 }} />
      </View>
      <View style={skeletonStyles.statsGrid}>
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </View>
      <View style={skeletonStyles.sectionArea}>
        <Skeleton width={140} height={18} borderRadius={6} />
        <ReviewCardSkeleton />
        <ReviewCardSkeleton />
        <ReviewCardSkeleton />
      </View>
    </View>
  );
}

/**
 * Skeleton list for reviews/responses screens.
 */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 10 }}>
      {Array.from({ length: count }).map((_, i) => (
        <ReviewCardSkeleton key={i} />
      ))}
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  statCard: {
    width: "47%",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: "1.5%",
  },
  reviewCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  notifCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dashboardContainer: { paddingBottom: 32 },
  greetingArea: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 8,
    marginTop: 16,
  },
  sectionArea: { paddingHorizontal: 20, marginTop: 24, gap: 12 },
});
