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

interface NewReviewAlertProps {
  businessName: string;
  reviewerName: string;
  starRating: number;
  reviewSnippet: string;
  reviewUrl: string;
}

export function NewReviewAlert({
  businessName = "Your Business",
  reviewerName = "A customer",
  starRating = 5,
  reviewSnippet = "Great experience!",
  reviewUrl = "https://app.reviewai.com/dashboard/reviews",
}: NewReviewAlertProps) {
  const stars = Array.from({ length: 5 })
    .map((_, i) => (i < starRating ? "\u2605" : "\u2606"))
    .join("");

  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Text style={heading}>New Review for {businessName}</Text>
          <Section style={reviewBox}>
            <Text style={reviewerStyle}>{reviewerName}</Text>
            <Text style={starsStyle}>{stars}</Text>
            <Text style={snippetStyle}>&ldquo;{reviewSnippet}&rdquo;</Text>
          </Section>
          <Section style={{ textAlign: "center" as const, marginTop: "24px" }}>
            <Button style={button} href={reviewUrl}>
              View Review
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            You received this because you have new review alerts enabled in
            ReviewAI. Manage preferences in your dashboard settings.
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

const heading = {
  fontSize: "20px",
  fontWeight: "700" as const,
  color: "#0f172a",
  marginBottom: "16px",
};

const reviewBox = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
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
  color: "#f59e0b",
  margin: "0 0 12px 0",
};

const snippetStyle = {
  fontSize: "14px",
  color: "#475569",
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

const footer = {
  fontSize: "12px",
  color: "#94a3b8",
  lineHeight: "1.5",
};

export default NewReviewAlert;
