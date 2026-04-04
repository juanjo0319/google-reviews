import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useAuthStore } from "@/lib/auth-store";
import { useColors } from "@/hooks/useColors";
import { api } from "@/lib/api";

interface UsageSummary {
  currentMonthCost: number;
  currentMonthInputTokens: number;
  currentMonthOutputTokens: number;
  budgetLimit: number;
  budgetUsedPercent: number;
  byOperation: Record<string, { count: number; cost: number }>;
  dailyAverage: number;
}

export default function UsageScreen() {
  const colors = useColors();
  const activeOrg = useAuthStore((s) => s.activeOrg);
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    if (!activeOrg) return;
    try {
      const result = await api<UsageSummary>(
        `/api/mobile/settings/usage?orgId=${activeOrg.id}`
      );
      setUsage(result);
    } catch (err) {
      console.error("Usage fetch error:", err);
    }
  }, [activeOrg?.id]);

  useEffect(() => {
    fetchUsage().finally(() => setLoading(false));
  }, [fetchUsage]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!usage) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>No usage data</Text>
      </View>
    );
  }

  const budgetText =
    usage.budgetLimit === -1
      ? "Unlimited"
      : `$${usage.budgetLimit.toFixed(2)}/mo`;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Budget progress */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Monthly Budget
        </Text>
        <View style={styles.budgetRow}>
          <Text style={[styles.budgetValue, { color: colors.text }]}>
            ${usage.currentMonthCost.toFixed(2)}
          </Text>
          <Text style={[styles.budgetLimit, { color: colors.textSecondary }]}>
            / {budgetText}
          </Text>
        </View>
        {usage.budgetLimit > 0 && (
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor:
                    usage.budgetUsedPercent > 80
                      ? colors.danger
                      : colors.primary,
                  width: `${Math.min(usage.budgetUsedPercent, 100)}%`,
                },
              ]}
            />
          </View>
        )}
        <Text style={[styles.dailyAvg, { color: colors.textSecondary }]}>
          Daily average: ${usage.dailyAverage.toFixed(3)}
        </Text>
      </View>

      {/* Token counts */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Token Usage
        </Text>
        <View style={styles.tokenRow}>
          <View style={styles.tokenStat}>
            <Text style={[styles.tokenValue, { color: colors.text }]}>
              {(usage.currentMonthInputTokens / 1000).toFixed(1)}K
            </Text>
            <Text style={[styles.tokenLabel, { color: colors.textSecondary }]}>
              Input
            </Text>
          </View>
          <View style={styles.tokenStat}>
            <Text style={[styles.tokenValue, { color: colors.text }]}>
              {(usage.currentMonthOutputTokens / 1000).toFixed(1)}K
            </Text>
            <Text style={[styles.tokenLabel, { color: colors.textSecondary }]}>
              Output
            </Text>
          </View>
        </View>
      </View>

      {/* By operation */}
      {Object.keys(usage.byOperation).length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            By Operation
          </Text>
          {Object.entries(usage.byOperation).map(([op, data]) => (
            <View key={op} style={styles.opRow}>
              <View style={styles.opInfo}>
                <Text style={[styles.opName, { color: colors.text }]}>
                  {op.replace(/_/g, " ")}
                </Text>
                <Text style={[styles.opCount, { color: colors.textSecondary }]}>
                  {data.count} calls
                </Text>
              </View>
              <Text style={[styles.opCost, { color: colors.text }]}>
                ${data.cost.toFixed(3)}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  budgetRow: { flexDirection: "row", alignItems: "baseline" },
  budgetValue: { fontSize: 32, fontWeight: "700" },
  budgetLimit: { fontSize: 16, marginLeft: 4 },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginTop: 12,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 4 },
  dailyAvg: { fontSize: 13, marginTop: 8 },
  tokenRow: { flexDirection: "row", gap: 32 },
  tokenStat: { alignItems: "center" },
  tokenValue: { fontSize: 24, fontWeight: "700" },
  tokenLabel: { fontSize: 13, marginTop: 2 },
  opRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e5e5",
  },
  opInfo: {},
  opName: { fontSize: 14, fontWeight: "500", textTransform: "capitalize" },
  opCount: { fontSize: 12, marginTop: 2 },
  opCost: { fontSize: 15, fontWeight: "600" },
});
