/**
 * RevUp.ai Analytics Event Schema
 *
 * Conversion Events (configure as conversions in GA4):
 * - sign_up: User creates account
 * - trial_start: User starts free trial
 * - demo_request: User requests demo
 *
 * Engagement Events:
 * - view_pricing, pricing_toggle, feature_click, comparison_view
 * - tool_usage, blog_read, faq_expand, cta_click
 *
 * Lead Capture:
 * - email_capture, newsletter_signup
 */

import { sendGAEvent } from "@next/third-parties/google";

export const analytics = {
  trackSignup: (method: string) =>
    sendGAEvent({ event: "sign_up", value: { method } }),
  trackTrialStart: (plan: string) =>
    sendGAEvent({ event: "trial_start", value: { plan } }),
  trackDemoRequest: (source: string) =>
    sendGAEvent({ event: "demo_request", value: { source } }),
  trackPricingView: (billing: string) =>
    sendGAEvent({ event: "view_pricing", value: { billing } }),
  trackPricingToggle: (from: string, to: string) =>
    sendGAEvent({ event: "pricing_toggle", value: { from, to } }),
  trackFeatureClick: (name: string) =>
    sendGAEvent({ event: "feature_click", value: { feature: name } }),
  trackComparisonView: (competitor: string) =>
    sendGAEvent({ event: "comparison_view", value: { competitor } }),
  trackToolUsage: (action: string) =>
    sendGAEvent({
      event: "tool_usage",
      value: { tool: "review-generator", action },
    }),
  trackCTAClick: (location: string, text: string) =>
    sendGAEvent({
      event: "cta_click",
      value: { location, button_text: text },
    }),
  trackFAQExpand: (question: string) =>
    sendGAEvent({ event: "faq_expand", value: { question } }),
  trackEmailCapture: (source: string) =>
    sendGAEvent({ event: "email_capture", value: { source } }),
  trackNewsletterSignup: () =>
    sendGAEvent({ event: "newsletter_signup", value: {} }),
};
