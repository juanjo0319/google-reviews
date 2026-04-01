"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  Copy,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  TrendingUp,
  ThumbsUp,
} from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FadeIn } from "@/components/motion";
import { cn } from "@/lib/utils";

type Tone = "Professional" | "Friendly" | "Empathetic" | "Casual";

type BusinessType =
  | "Restaurant"
  | "Hotel"
  | "Healthcare"
  | "Dental"
  | "Retail"
  | "Auto"
  | "Salon"
  | "Other";

const TONES: Tone[] = ["Professional", "Friendly", "Empathetic", "Casual"];

const BUSINESS_TYPES: BusinessType[] = [
  "Restaurant",
  "Hotel",
  "Healthcare",
  "Dental",
  "Retail",
  "Auto",
  "Salon",
  "Other",
];

// TODO: Replace template-based generation with Claude API integration for truly dynamic responses
function generateResponse({
  stars,
  reviewText,
  businessType,
  tone,
}: {
  stars: number;
  reviewText: string;
  businessType: BusinessType;
  tone: Tone;
}): string {
  const businessLabel = businessType === "Other" ? "business" : businessType.toLowerCase();
  const reviewerMention = reviewText.length > 20 ? "your detailed feedback" : "your review";

  const greetings: Record<Tone, string> = {
    Professional: "Thank you for taking the time to share your experience with us.",
    Friendly: "Thanks so much for leaving us a review! We really appreciate it.",
    Empathetic: "We truly appreciate you sharing your experience with us.",
    Casual: "Hey, thanks for the review!",
  };

  const closings: Record<Tone, string> = {
    Professional: "We value your patronage and look forward to serving you again.",
    Friendly: "We can't wait to see you again soon! 😊",
    Empathetic: "Your satisfaction means the world to us, and we hope to welcome you back.",
    Casual: "Hope to see you back soon!",
  };

  if (stars >= 4) {
    const positiveMiddle: Record<Tone, string> = {
      Professional: `We are delighted to hear about your positive experience at our ${businessLabel}. ${reviewerMention.charAt(0).toUpperCase() + reviewerMention.slice(1)} helps us continue delivering the highest standards of service. Our team takes great pride in ensuring every guest receives exceptional care.`,
      Friendly: `Wow, we're thrilled you had such a great time at our ${businessLabel}! ${reviewerMention.charAt(0).toUpperCase() + reviewerMention.slice(1)} totally made our day. It's feedback like yours that keeps our team motivated to do even better!`,
      Empathetic: `It warms our hearts to know that your visit to our ${businessLabel} was a positive one. We pour our hearts into creating memorable experiences, and knowing we succeeded with you means everything to our team.`,
      Casual: `So glad you enjoyed your experience at our ${businessLabel}! ${reviewerMention.charAt(0).toUpperCase() + reviewerMention.slice(1)} means a lot to us. We work hard to make sure everyone has a great time, and it's awesome to hear it paid off.`,
    };
    return `${greetings[tone]}\n\n${positiveMiddle[tone]}\n\n${closings[tone]}`;
  }

  if (stars === 3) {
    const mixedMiddle: Record<Tone, string> = {
      Professional: `We appreciate ${reviewerMention} regarding your visit to our ${businessLabel}. While we are glad certain aspects of your experience met expectations, we recognize there is room for improvement. We take all feedback seriously and would welcome the opportunity to discuss how we can enhance your next visit.`,
      Friendly: `Thanks for being honest about your experience at our ${businessLabel}! We're glad some things went well, but we definitely want to do better on the rest. We'd love a chance to make your next visit even more amazing — feel free to reach out to us directly!`,
      Empathetic: `We genuinely appreciate ${reviewerMention} about your experience at our ${businessLabel}. We understand that while some aspects were enjoyable, others fell short of what you deserved. Every piece of feedback is a chance for us to grow, and we take yours to heart.`,
      Casual: `Thanks for the honest take on your visit to our ${businessLabel}! Sounds like we nailed some things but missed the mark on others. We're always trying to improve, so we'd love to hear more about what we can do better next time.`,
    };
    return `${greetings[tone]}\n\n${mixedMiddle[tone]}\n\nPlease don't hesitate to reach out to us directly so we can make things right. ${closings[tone]}`;
  }

  // 1-2 stars
  const negativeMiddle: Record<Tone, string> = {
    Professional: `We sincerely apologize that your experience at our ${businessLabel} did not meet the standards we set for ourselves. ${reviewerMention.charAt(0).toUpperCase() + reviewerMention.slice(1)} is invaluable, and we take this matter very seriously. We would like to investigate what went wrong and ensure it does not happen again.`,
    Friendly: `We're really sorry your experience at our ${businessLabel} wasn't what you expected. That's definitely not the experience we want anyone to have! We take ${reviewerMention} to heart and want to make it up to you.`,
    Empathetic: `We are deeply sorry to learn about your experience at our ${businessLabel}. We understand how frustrating and disappointing this must have been for you. No one should leave feeling this way, and we take full responsibility for falling short of your expectations.`,
    Casual: `We're sorry things didn't go well at our ${businessLabel}. That's not the experience we aim for, and we appreciate you letting us know about it. We want to do better, and ${reviewerMention} helps us figure out how.`,
  };

  return `${greetings[tone]}\n\n${negativeMiddle[tone]}\n\nWe would love the opportunity to make this right. Please reach out to us directly at your convenience, and we will do everything we can to resolve this. ${closings[tone]}`;
}

export default function ReviewResponseGeneratorPage() {
  const [stars, setStars] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("Restaurant");
  const [tone, setTone] = useState<Tone>("Professional");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    if (!reviewText.trim()) return;
    setLoading(true);
    setResponse("");
    setCopied(false);

    // Simulated delay to mimic API call
    // TODO: Replace with actual Claude API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const result = generateResponse({ stars, reviewText, businessType, tone });
    setResponse(result);
    setLoading(false);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      {/* Hero */}
      <SectionWrapper>
        <div className="pt-12 pb-4 text-center max-w-3xl mx-auto">
          <Badge className="mb-4">Free Tool</Badge>
          <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-neutral-950 mb-4">
            AI Review Response Generator
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 leading-relaxed">
            Paste any Google review and get a professional, customized response
            in seconds. Free to use. Powered by Claude AI.
          </p>
        </div>
      </SectionWrapper>

      {/* Tool Interface */}
      <SectionWrapper>
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-lg p-6 md:p-8 space-y-6">
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Star Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setStars(n)}
                    aria-label={`Set ${n} star${n > 1 ? "s" : ""}`}
                    className="p-0.5 transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "h-8 w-8 transition-colors",
                        n <= stars
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-neutral-200 text-neutral-200"
                      )}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-neutral-500 self-center">
                  {stars} star{stars !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Review Text */}
            <div>
              <label
                htmlFor="review-text"
                className="block text-sm font-semibold text-neutral-700 mb-2"
              >
                Customer Review
              </label>
              <textarea
                id="review-text"
                rows={5}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Paste a customer review here..."
                className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors resize-y"
              />
            </div>

            {/* Business Type */}
            <div>
              <label
                htmlFor="business-type"
                className="block text-sm font-semibold text-neutral-700 mb-2"
              >
                Business Type
              </label>
              <select
                id="business-type"
                value={businessType}
                onChange={(e) =>
                  setBusinessType(e.target.value as BusinessType)
                }
                className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-base text-neutral-900 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
              >
                {BUSINESS_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Response Tone
              </label>
              <div className="flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                      tone === t
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-white text-neutral-600 border-neutral-200 hover:border-primary/50 hover:text-primary"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              size="lg"
              onClick={handleGenerate}
              loading={loading}
              disabled={!reviewText.trim()}
              className="w-full"
            >
              {loading ? "Generating Response..." : "Generate Response"}
            </Button>

            {/* Output */}
            {response && (
              <FadeIn direction="up" duration={0.4}>
                <div className="mt-2 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-neutral-700">
                      Generated Response
                    </h3>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-200 transition-colors"
                      >
                        {copied ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            Copy to Clipboard
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerate}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-200 transition-colors"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Regenerate
                      </button>
                    </div>
                  </div>
                  <p className="text-base text-neutral-800 leading-relaxed whitespace-pre-line">
                    {response}
                  </p>
                </div>
              </FadeIn>
            )}
          </div>

          {/* Upsell Card */}
          <FadeIn delay={0.2}>
            <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8 text-center">
              <h3 className="font-heading text-xl font-bold text-neutral-950 mb-2">
                Like this? RevUp.ai does this automatically for every review.
              </h3>
              <p className="text-neutral-600 mb-5">
                Connect your Google Business Profile and let AI handle all your
                review responses automatically. Save hours every week.
              </p>
              <Button href="/signup" size="lg">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </FadeIn>
        </div>
      </SectionWrapper>

      {/* SEO Content */}
      <SectionWrapper background="muted">
        <div className="max-w-3xl mx-auto">
          <SectionHeading
            heading="Why Responding to Google Reviews Matters"
            align="left"
          />
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-neutral-900 mb-1">
                  Build Trust
                </h3>
                <p className="text-sm text-neutral-600">
                  Responding to reviews shows potential customers you care about
                  feedback and are actively engaged with your community.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingUp className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-neutral-900 mb-1">
                  Boost SEO
                </h3>
                <p className="text-sm text-neutral-600">
                  Google confirms that responding to reviews improves your local
                  search ranking. More responses mean better visibility.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ThumbsUp className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-neutral-900 mb-1">
                  Retain Customers
                </h3>
                <p className="text-sm text-neutral-600">
                  Studies show that 45% of consumers are more likely to visit a
                  business that responds to negative reviews constructively.
                </p>
              </div>
            </div>
          </div>
          <div className="prose prose-neutral max-w-none">
            <p>
              Google reviews are one of the most powerful signals for local SEO
              and customer trust. Businesses that respond to every review see up
              to 35% higher engagement and significantly improved star ratings
              over time. Yet most business owners struggle to find the time to
              craft thoughtful, personalized responses to each review they
              receive.
            </p>
            <p>
              This free AI review response generator helps you create
              professional, customized replies in seconds. Whether you are
              handling a glowing 5-star review or a critical 1-star complaint,
              the right response can turn a one-time visitor into a loyal
              customer. For businesses that want to automate this process
              entirely,{" "}
              <Link href="/signup" className="text-primary font-medium">
                RevUp.ai
              </Link>{" "}
              monitors your Google Business Profile and generates AI-powered
              responses automatically.
            </p>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
