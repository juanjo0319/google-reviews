import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from "@react-email/components";

interface WeeklyDigestProps {
  businessName: string;
  totalNewReviews: number;
  averageRating: string;
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
  topPositiveQuote: string | null;
  urgentNegativeSnippet: string | null;
  responseRate: string;
  dashboardUrl: string;
}

export function WeeklyDigest({
  businessName = "Your Business",
  totalNewReviews = 12,
  averageRating = "4.3",
  sentimentBreakdown = { positive: 8, neutral: 2, negative: 2 },
  topPositiveQuote = "Absolutely amazing service!",
  urgentNegativeSnippet = null,
  responseRate = "92%",
  dashboardUrl = "https://app.reviewai.com/dashboard",
}: WeeklyDigestProps) {
  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Text style={heading}>Weekly Review Digest</Text>
          <Text style={subtext}>{businessName} — Last 7 days</Text>

          {/* Stats grid */}
          <Section style={statsRow}>
            <table width="100%" cellPadding={0} cellSpacing={0}>
              <tbody>
                <tr>
                  <td style={statBox}>
                    <Text style={statNumber}>{totalNewReviews}</Text>
                    <Text style={statLabel}>New Reviews</Text>
                  </td>
                  <td style={statBox}>
                    <Text style={statNumber}>{averageRating}</Text>
                    <Text style={statLabel}>Avg Rating</Text>
                  </td>
                  <td style={statBox}>
                    <Text style={statNumber}>{responseRate}</Text>
                    <Text style={statLabel}>Response Rate</Text>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* Sentiment breakdown */}
          <Section style={sectionBox}>
            <Text style={sectionHeading}>Sentiment Breakdown</Text>
            <table width="100%" cellPadding={0} cellSpacing={0}>
              <tbody>
                <tr>
                  <td>
                    <Text style={sentimentItem}>
                      <span style={{ color: "#16a34a" }}>
                        {"\u25CF"} Positive
                      </span>
                    </Text>
                  </td>
                  <td style={{ textAlign: "right" as const }}>
                    <Text style={sentimentCount}>
                      {sentimentBreakdown.positive}
                    </Text>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Text style={sentimentItem}>
                      <span style={{ color: "#d97706" }}>
                        {"\u25CF"} Neutral
                      </span>
                    </Text>
                  </td>
                  <td style={{ textAlign: "right" as const }}>
                    <Text style={sentimentCount}>
                      {sentimentBreakdown.neutral}
                    </Text>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Text style={sentimentItem}>
                      <span style={{ color: "#dc2626" }}>
                        {"\u25CF"} Negative
                      </span>
                    </Text>
                  </td>
                  <td style={{ textAlign: "right" as const }}>
                    <Text style={sentimentCount}>
                      {sentimentBreakdown.negative}
                    </Text>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* Top positive */}
          {topPositiveQuote && (
            <Section style={quoteBox}>
              <Text style={quoteLabel}>Top Positive Review</Text>
              <Text style={quoteText}>
                &ldquo;{topPositiveQuote}&rdquo;
              </Text>
            </Section>
          )}

          {/* Urgent negative */}
          {urgentNegativeSnippet && (
            <Section style={urgentBox}>
              <Text style={urgentLabel}>Needs Your Attention</Text>
              <Text style={urgentReviewText}>
                &ldquo;{urgentNegativeSnippet}&rdquo;
              </Text>
            </Section>
          )}

          <Section style={{ textAlign: "center" as const, marginTop: "24px" }}>
            <Button style={button} href={dashboardUrl}>
              View Dashboard
            </Button>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            You received this weekly digest because you have it enabled in your
            ReviewAI notification settings.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#f8fafc",
  fontFamily: "system-ui, -apple-system, sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "40px 24px",
  maxWidth: "520px",
};

const heading = {
  fontSize: "22px",
  fontWeight: "700" as const,
  color: "#0f172a",
  marginBottom: "4px",
};

const subtext = { fontSize: "14px", color: "#64748b", marginBottom: "24px" };

const statsRow = { marginBottom: "20px" };

const statBox = {
  textAlign: "center" as const,
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "16px 8px",
};

const statNumber = {
  fontSize: "24px",
  fontWeight: "700" as const,
  color: "#0f172a",
  margin: "0",
};

const statLabel = {
  fontSize: "11px",
  color: "#94a3b8",
  margin: "4px 0 0 0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};

const sectionBox = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "16px 20px",
  marginBottom: "16px",
};

const sectionHeading = {
  fontSize: "13px",
  fontWeight: "600" as const,
  color: "#334155",
  marginBottom: "12px",
};

const sentimentItem = { fontSize: "14px", color: "#475569", margin: "4px 0" };
const sentimentCount = {
  fontSize: "14px",
  fontWeight: "600" as const,
  color: "#0f172a",
  margin: "4px 0",
};

const quoteBox = {
  backgroundColor: "#f0fdf4",
  border: "1px solid #bbf7d0",
  borderRadius: "12px",
  padding: "16px 20px",
  marginBottom: "16px",
};

const quoteLabel = {
  fontSize: "11px",
  fontWeight: "600" as const,
  color: "#16a34a",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  marginBottom: "8px",
};

const quoteText = {
  fontSize: "14px",
  color: "#334155",
  fontStyle: "italic" as const,
  lineHeight: "1.6",
  margin: "0",
};

const urgentBox = {
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "12px",
  padding: "16px 20px",
  marginBottom: "16px",
};

const urgentLabel = {
  fontSize: "11px",
  fontWeight: "600" as const,
  color: "#dc2626",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  marginBottom: "8px",
};

const urgentReviewText = {
  fontSize: "14px",
  color: "#334155",
  fontStyle: "italic" as const,
  lineHeight: "1.6",
  margin: "0",
};

const button = {
  backgroundColor: "#1a73e8",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "600" as const,
  textDecoration: "none",
};

const hr = { borderColor: "#e2e8f0", margin: "32px 0 16px 0" };

const footer = { fontSize: "12px", color: "#94a3b8", lineHeight: "1.5" };

export default WeeklyDigest;
