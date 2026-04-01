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

interface NegativeReviewAlertProps {
  businessName: string;
  reviewerName: string;
  starRating: number;
  reviewText: string;
  reviewUrl: string;
}

export function NegativeReviewAlert({
  businessName = "Your Business",
  reviewerName = "A customer",
  starRating = 1,
  reviewText = "Terrible experience.",
  reviewUrl = "https://app.reviewai.com/dashboard/reviews",
}: NegativeReviewAlertProps) {
  const stars = Array.from({ length: 5 })
    .map((_, i) => (i < starRating ? "\u2605" : "\u2606"))
    .join("");

  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          {/* Urgent banner */}
          <Section style={urgentBanner}>
            <Text style={urgentText}>Urgent: Negative Review</Text>
          </Section>

          <Text style={heading}>
            A negative review was posted for {businessName}
          </Text>
          <Text style={subtext}>
            This review may require immediate attention.
          </Text>

          <Section style={reviewBox}>
            <Text style={reviewerStyle}>{reviewerName}</Text>
            <Text style={starsStyle}>{stars}</Text>
            <Text style={reviewTextStyle}>&ldquo;{reviewText}&rdquo;</Text>
          </Section>

          <Section style={{ textAlign: "center" as const, marginTop: "24px" }}>
            <Button style={ctaButton} href={reviewUrl}>
              Respond Now
            </Button>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            You received this because you have negative review alerts enabled.
            Manage preferences in your dashboard settings.
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
  maxWidth: "480px",
};

const urgentBanner = {
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "8px",
  padding: "8px 16px",
  marginBottom: "20px",
};

const urgentText = {
  fontSize: "13px",
  fontWeight: "700" as const,
  color: "#dc2626",
  margin: "0",
  textAlign: "center" as const,
};

const heading = {
  fontSize: "20px",
  fontWeight: "700" as const,
  color: "#0f172a",
  marginBottom: "4px",
};

const subtext = {
  fontSize: "14px",
  color: "#64748b",
  marginBottom: "20px",
};

const reviewBox = {
  backgroundColor: "#ffffff",
  border: "1px solid #fecaca",
  borderRadius: "12px",
  padding: "20px",
};

const reviewerStyle = {
  fontSize: "14px",
  fontWeight: "600" as const,
  color: "#334155",
  margin: "0 0 4px 0",
};

const starsStyle = {
  fontSize: "20px",
  color: "#ef4444",
  margin: "0 0 12px 0",
};

const reviewTextStyle = {
  fontSize: "14px",
  color: "#475569",
  lineHeight: "1.6",
  margin: "0",
};

const ctaButton = {
  backgroundColor: "#dc2626",
  color: "#ffffff",
  padding: "14px 28px",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "700" as const,
  textDecoration: "none",
};

const hr = { borderColor: "#e2e8f0", margin: "32px 0 16px 0" };

const footer = {
  fontSize: "12px",
  color: "#94a3b8",
  lineHeight: "1.5",
};

export default NegativeReviewAlert;
