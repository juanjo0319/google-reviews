import { Resend } from "resend";
import { NewReviewAlert } from "@/emails/NewReviewAlert";
import { NegativeReviewAlert } from "@/emails/NegativeReviewAlert";
import { WeeklyDigest } from "@/emails/WeeklyDigest";
import { createElement } from "react";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM =
  process.env.RESEND_FROM_EMAIL ?? "ReviewAI <noreply@reviewai.app>";

export async function sendNewReviewAlert(
  to: string,
  props: {
    businessName: string;
    reviewerName: string;
    starRating: number;
    reviewSnippet: string;
    reviewUrl: string;
  }
) {
  const resend = getResend();
  return resend.emails.send({
    from: FROM,
    to,
    subject: "New " + props.starRating + "-star review for " + props.businessName,
    react: createElement(NewReviewAlert, props),
  });
}

export async function sendNegativeReviewAlert(
  to: string,
  props: {
    businessName: string;
    reviewerName: string;
    starRating: number;
    reviewText: string;
    reviewUrl: string;
  }
) {
  const resend = getResend();
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Urgent: " + props.starRating + "-star review needs attention — " + props.businessName,
    react: createElement(NegativeReviewAlert, props),
  });
}

export async function sendWeeklyDigest(
  to: string,
  props: {
    businessName: string;
    totalNewReviews: number;
    averageRating: string;
    sentimentBreakdown: { positive: number; neutral: number; negative: number };
    topPositiveQuote: string | null;
    urgentNegativeSnippet: string | null;
    responseRate: string;
    dashboardUrl: string;
  }
) {
  const resend = getResend();
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Weekly Review Digest — " + props.businessName,
    react: createElement(WeeklyDigest, props),
  });
}
