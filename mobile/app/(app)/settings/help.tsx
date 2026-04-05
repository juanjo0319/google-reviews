import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Globe,
  Bot,
  MessageCircle,
  Shield,
  ChevronDown,
  ChevronUp,
  Mail,
  HelpCircle,
} from "lucide-react-native";
import { useColors } from "@/hooks/useColors";

const STEPS = [
  {
    icon: Globe,
    title: "1. Connect Google",
    description: "Link your Google Business Profile to start syncing reviews automatically.",
    route: "/(app)/settings" as const,
  },
  {
    icon: Bot,
    title: "2. Set Brand Voice",
    description: "Customize how the AI responds to match your brand's personality and tone.",
    route: "/(app)/settings/brand-voice" as const,
  },
  {
    icon: MessageCircle,
    title: "3. Review Responses",
    description: "Check AI-generated responses, edit if needed, and approve for publishing.",
    route: "/(app)/(dashboard)/responses" as const,
  },
  {
    icon: Shield,
    title: "4. Invite Your Team",
    description: "Add team members to collaborate on review management and response approval.",
    route: "/(app)/settings/team" as const,
  },
];

const FAQS = [
  {
    question: "How do I get started with ReviewAI?",
    answer:
      "Start by connecting your Google Business Profile from the Settings page. Once connected, ReviewAI will automatically sync your reviews and begin generating AI-powered responses for you to review and publish.",
  },
  {
    question: "How do I connect my Google Business Profile?",
    answer:
      'Go to Settings and tap "Connect Google Account." You\'ll be redirected to Google to authorize ReviewAI to access your Business Profile. After authorization, select the locations you want to manage.',
  },
  {
    question: "How do AI-generated responses work?",
    answer:
      "When a new review comes in, ReviewAI analyzes the content, sentiment, and context to generate a personalized response based on your Brand Voice settings. Responses go through your approval workflow before being published — you always have the final say.",
  },
  {
    question: "Can I customize the AI's tone and style?",
    answer:
      "Yes! Go to Settings > Brand Voice to configure the tone, formality, humor level, preferred phrases, phrases to avoid, and more. The AI will follow these guidelines when generating responses.",
  },
  {
    question: "What happens when I get a negative review?",
    answer:
      "ReviewAI flags negative reviews (1-2 stars) as urgent and can send you immediate alerts via push notification or email. The AI generates extra-careful responses for negative reviews, focusing on empathy and resolution.",
  },
  {
    question: "How does the approval workflow work?",
    answer:
      "AI-generated responses start as drafts. You can review, edit, approve, or reject them. Only approved responses get published to Google. You can configure automatic publishing for responses above a certain confidence threshold.",
  },
  {
    question: "Can multiple team members manage reviews?",
    answer:
      "Yes! Go to Settings > Team to invite team members. You can assign roles (Owner, Admin, Member) with different permission levels. Admins can approve and publish responses, while Members can view and draft responses.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. ReviewAI uses industry-standard encryption, and your Google credentials are stored securely. We never share your data with third parties. See our Privacy Policy for full details.",
  },
];

export default function HelpScreen() {
  const colors = useColors();
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Getting Started */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Getting Started</Text>
        {STEPS.map(({ icon: Icon, title, description, route }) => (
          <TouchableOpacity
            key={title}
            style={[styles.stepCard, { backgroundColor: colors.background }]}
            onPress={() => router.push(route as never)}
          >
            <View style={[styles.stepIcon, { backgroundColor: colors.primary + "15" }]}>
              <Icon size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>{title}</Text>
              <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                {description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* FAQ */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <HelpCircle size={18} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
            Frequently Asked Questions
          </Text>
        </View>
        {FAQS.map(({ question, answer }, index) => {
          const isExpanded = expandedIndex === index;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.faqItem, { borderBottomColor: colors.border }]}
              onPress={() => setExpandedIndex(isExpanded ? null : index)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <Text style={[styles.faqQuestion, { color: colors.text }]}>{question}</Text>
                {isExpanded ? (
                  <ChevronUp size={16} color={colors.textSecondary} />
                ) : (
                  <ChevronDown size={16} color={colors.textSecondary} />
                )}
              </View>
              {isExpanded && (
                <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                  {answer}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Contact Support */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <Mail size={18} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
            Contact Support
          </Text>
        </View>
        <Text style={[styles.supportDesc, { color: colors.textSecondary }]}>
          Can't find what you're looking for? Our support team is here to help.
        </Text>
        <TouchableOpacity
          style={[styles.emailButton, { backgroundColor: colors.primary }]}
          onPress={() => Linking.openURL("mailto:support@reviewai.app")}
        >
          <Mail size={16} color="#fff" />
          <Text style={styles.emailButtonText}>Email Support</Text>
        </TouchableOpacity>
        <Text style={[styles.responseTime, { color: colors.textSecondary }]}>
          Typical response time: under 24 hours during business days
        </Text>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  stepCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  stepTitle: { fontSize: 14, fontWeight: "600" },
  stepDesc: { fontSize: 12, marginTop: 2, lineHeight: 17 },
  faqItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqQuestion: { fontSize: 14, fontWeight: "500", flex: 1, paddingRight: 12 },
  faqAnswer: { fontSize: 13, lineHeight: 20, marginTop: 10 },
  supportDesc: { fontSize: 13, lineHeight: 19, marginBottom: 12 },
  emailButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 12,
  },
  emailButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  responseTime: { fontSize: 11, marginTop: 8, textAlign: "center" },
});
