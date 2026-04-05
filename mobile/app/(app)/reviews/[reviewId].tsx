import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { api, apiStream } from "@/lib/api";
import { notifySuccess, notifyWarning } from "@/lib/haptics";
import { Sparkles, Send, Check, X, Edit3, Trash2 } from "lucide-react-native";

interface ReviewDetail {
  id: string;
  reviewer_name: string | null;
  star_rating: number;
  comment: string | null;
  sentiment: string | null;
  sentiment_themes: string[] | null;
  requires_urgent_response: boolean;
  review_created_at: string | null;
  locations: { name: string } | null;
}

interface Response {
  id: string;
  content: string;
  status: string;
  is_ai_generated: boolean;
  created_at: string;
}

export default function ReviewDetailScreen() {
  const { reviewId } = useLocalSearchParams<{ reviewId: string }>();
  const colors = useColors();

  const [review, setReview] = useState<ReviewDetail | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // AI generation state
  const [generating, setGenerating] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [manualDraft, setManualDraft] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  const fetchReview = useCallback(async () => {
    if (!reviewId) return;
    try {
      const result = await api<{
        review: ReviewDetail;
        responses: Response[];
      }>(`/api/mobile/reviews/${reviewId}`);
      setReview(result.review);
      setResponses(result.responses);
    } catch (err) {
      console.error("Review fetch error:", err);
    }
  }, [reviewId]);

  useEffect(() => {
    fetchReview().finally(() => setLoading(false));
  }, [fetchReview]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReview();
    setRefreshing(false);
  }, [fetchReview]);

  async function handleGenerateAI() {
    if (!reviewId) return;
    setGenerating(true);
    setStreamedText("");

    try {
      let text = "";
      for await (const chunk of apiStream(
        "/api/mobile/ai/generate-response",
        { reviewId }
      )) {
        text += chunk;
        setStreamedText(text);
      }

      // Refresh to get the saved response
      await fetchReview();
    } catch (err) {
      Alert.alert("Error", "Failed to generate response");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveManual() {
    if (!reviewId || !manualDraft.trim()) return;
    try {
      await api(`/api/mobile/reviews/${reviewId}/respond`, {
        method: "POST",
        body: { content: manualDraft.trim() },
      });
      setManualDraft("");
      setShowManualInput(false);
      await fetchReview();
    } catch {
      Alert.alert("Error", "Failed to save response");
    }
  }

  async function handleResponseAction(
    responseId: string,
    action: string,
    content?: string
  ) {
    try {
      await api(
        `/api/mobile/reviews/${reviewId}/responses/${responseId}`,
        {
          method: "PUT",
          body: { action, content },
        }
      );
      if (action === "approve" || action === "publish") {
        notifySuccess();
      } else if (action === "reject") {
        notifyWarning();
      }
      await fetchReview();
    } catch (err) {
      Alert.alert("Error", `Failed to ${action} response`);
    }
  }

  async function handleDeleteResponse(responseId: string) {
    Alert.alert("Discard Response", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Discard",
        style: "destructive",
        onPress: async () => {
          try {
            await api(
              `/api/mobile/reviews/${reviewId}/responses/${responseId}`,
              { method: "DELETE" }
            );
            await fetchReview();
          } catch {
            Alert.alert("Error", "Failed to discard response");
          }
        },
      },
    ]);
  }

  function renderStars(rating: number) {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  }

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!review) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Review not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Review card */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.reviewHeader}>
          <Text style={[styles.reviewerName, { color: colors.text }]}>
            {review.reviewer_name ?? "Anonymous"}
          </Text>
          <Text style={{ color: colors.star, fontSize: 16 }}>
            {renderStars(review.star_rating)}
          </Text>
        </View>
        {review.locations && (
          <Text style={[styles.locationText, { color: colors.textSecondary }]}>
            {review.locations.name}
          </Text>
        )}
        {review.comment && (
          <Text style={[styles.comment, { color: colors.text }]}>
            {review.comment}
          </Text>
        )}
        {/* Sentiment & themes */}
        <View style={styles.metaRow}>
          {review.sentiment && (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    (review.sentiment === "positive"
                      ? colors.sentimentPositive
                      : review.sentiment === "negative"
                        ? colors.sentimentNegative
                        : colors.sentimentNeutral) + "20",
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color:
                    review.sentiment === "positive"
                      ? colors.sentimentPositive
                      : review.sentiment === "negative"
                        ? colors.sentimentNegative
                        : colors.sentimentNeutral,
                  textTransform: "capitalize",
                }}
              >
                {review.sentiment}
              </Text>
            </View>
          )}
          {review.requires_urgent_response && (
            <View
              style={[styles.badge, { backgroundColor: colors.danger + "20" }]}
            >
              <Text style={{ fontSize: 12, fontWeight: "500", color: colors.danger }}>
                Urgent
              </Text>
            </View>
          )}
        </View>
        {review.sentiment_themes &&
          Array.isArray(review.sentiment_themes) &&
          review.sentiment_themes.length > 0 && (
            <View style={styles.themesRow}>
              {review.sentiment_themes.map((theme, i) => (
                <View
                  key={i}
                  style={[styles.themeChip, { backgroundColor: colors.primaryLight }]}
                >
                  <Text style={{ fontSize: 11, color: colors.primary }}>
                    {theme}
                  </Text>
                </View>
              ))}
            </View>
          )}
      </View>

      {/* AI streaming result */}
      {streamedText && (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
          <View style={styles.responseHeader}>
            <Sparkles size={16} color={colors.primary} />
            <Text style={[styles.responseLabel, { color: colors.primary }]}>
              AI Generated
            </Text>
          </View>
          <Text style={[styles.responseContent, { color: colors.text }]}>
            {streamedText}
            {generating && "▊"}
          </Text>
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={handleGenerateAI}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Sparkles size={18} color="#fff" />
          )}
          <Text style={styles.actionButtonText}>
            {generating ? "Generating..." : "Generate AI Response"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
          ]}
          onPress={() => setShowManualInput(!showManualInput)}
        >
          <Edit3 size={18} color={colors.text} />
          <Text style={[styles.actionButtonText, { color: colors.text }]}>
            Write Manually
          </Text>
        </TouchableOpacity>
      </View>

      {/* Manual input */}
      {showManualInput && (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TextInput
            style={[styles.manualInput, { color: colors.text, borderColor: colors.border }]}
            placeholder="Write your response..."
            placeholderTextColor={colors.textSecondary}
            value={manualDraft}
            onChangeText={setManualDraft}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSaveManual}
            disabled={!manualDraft.trim()}
          >
            <Text style={styles.saveButtonText}>Save Draft</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Existing responses */}
      {responses.length > 0 && (
        <View style={styles.responsesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Responses ({responses.length})
          </Text>
          {responses.map((resp) => (
            <View
              key={resp.id}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.responseHeader}>
                {resp.is_ai_generated && (
                  <Sparkles size={14} color={colors.primary} />
                )}
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        resp.status === "published"
                          ? colors.success + "20"
                          : resp.status === "approved"
                            ? colors.primary + "20"
                            : colors.textSecondary + "20",
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "600",
                      color:
                        resp.status === "published"
                          ? colors.success
                          : resp.status === "approved"
                            ? colors.primary
                            : colors.textSecondary,
                      textTransform: "capitalize",
                    }}
                  >
                    {resp.status}
                  </Text>
                </View>
              </View>
              <Text style={[styles.responseContent, { color: colors.text }]}>
                {resp.content}
              </Text>
              {/* Actions based on status */}
              <View style={styles.responseActions}>
                {resp.status === "draft" && (
                  <>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleResponseAction(resp.id, "submit")}
                    >
                      <Send size={16} color={colors.primary} />
                      <Text style={{ fontSize: 12, color: colors.primary }}>Submit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleDeleteResponse(resp.id)}
                    >
                      <Trash2 size={16} color={colors.danger} />
                      <Text style={{ fontSize: 12, color: colors.danger }}>Discard</Text>
                    </TouchableOpacity>
                  </>
                )}
                {(resp.status === "pending_approval" || resp.status === "approved") && (
                  <>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleResponseAction(resp.id, "approve")}
                    >
                      <Check size={16} color={colors.success} />
                      <Text style={{ fontSize: 12, color: colors.success }}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleResponseAction(resp.id, "publish")}
                    >
                      <Send size={16} color={colors.primary} />
                      <Text style={{ fontSize: 12, color: colors.primary }}>Publish</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleResponseAction(resp.id, "reject")}
                    >
                      <X size={16} color={colors.danger} />
                      <Text style={{ fontSize: 12, color: colors.danger }}>Reject</Text>
                    </TouchableOpacity>
                  </>
                )}
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
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewerName: { fontSize: 18, fontWeight: "700" },
  locationText: { fontSize: 13, marginTop: 4 },
  comment: { fontSize: 15, lineHeight: 22, marginTop: 12 },
  metaRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  themesRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  themeChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  actions: { paddingHorizontal: 16, marginTop: 16, gap: 10 },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  manualInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  responsesSection: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontSize: 17, fontWeight: "600", marginBottom: 4 },
  responseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  responseLabel: { fontSize: 13, fontWeight: "600" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  responseContent: { fontSize: 14, lineHeight: 21 },
  responseActions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e5e5",
    paddingTop: 10,
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
