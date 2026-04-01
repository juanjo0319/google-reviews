"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-client";
import { cn } from "@/lib/utils";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/ui/JsonLd";
import { FadeIn } from "@/components/motion";

type FAQItem = { question: string; answer: string };
type FAQCategory = { title: string; items: FAQItem[] };

const FAQ_CATEGORIES: FAQCategory[] = [
  {
    title: "Getting Started",
    items: [
      {
        question: "How do I get started with RevUp.ai?",
        answer:
          "Sign up for a free 14-day trial — no credit card required. Connect your Google Business Profile using secure OAuth, configure your brand voice preferences, and you'll start receiving AI-drafted responses within minutes of your next review.",
      },
      {
        question: "How do I connect my Google Business Profile?",
        answer:
          "After signing up, click 'Connect Google' on your dashboard. You'll be redirected to Google's secure OAuth consent screen. Grant RevUp.ai permission to access your business reviews, and your profile will be connected instantly. You can disconnect at any time.",
      },
      {
        question: "Is there a free trial?",
        answer:
          "Yes! Every plan includes a 14-day free trial with full access to all features. No credit card is required to start. If you don't add a payment method before the trial ends, your account moves to a free read-only mode. No data is deleted.",
      },
      {
        question: "How long does setup take?",
        answer:
          "Most users are up and running in under 5 minutes. Sign up, connect your Google Business Profile, set your preferred tone and brand voice, and you're done. The AI begins drafting responses to new reviews immediately.",
      },
      {
        question: "Do I need any technical knowledge to use RevUp.ai?",
        answer:
          "Not at all. RevUp.ai is designed for business owners and managers, not developers. If you can use email, you can use RevUp.ai. The entire setup is guided, and our support team is available if you need help.",
      },
    ],
  },
  {
    title: "Features",
    items: [
      {
        question: "How does the AI generate review responses?",
        answer:
          "RevUp.ai uses Claude AI by Anthropic to analyze each review's content, sentiment, and context. It generates a response that matches your configured brand voice, tone, and style preferences. Every response is a draft — nothing is published without your explicit approval.",
      },
      {
        question: "Can I edit AI-generated responses before publishing?",
        answer:
          "Absolutely. Every AI response starts as a draft. You can edit it freely, regenerate it with different instructions, or write your own response from scratch. You have full control — nothing is ever auto-published.",
      },
      {
        question: "Can I customize the AI's writing style?",
        answer:
          "Yes, extensively. You control the tone (professional, casual, warm, etc.), formality level, whether to use emoji, preferred phrases, phrases to avoid, response length, and even provide example responses for the AI to learn from.",
      },
      {
        question: "Do you support multiple Google Business locations?",
        answer:
          "Yes! The Pro plan supports up to 10 locations, and Enterprise offers unlimited locations. Each location can have its own brand voice settings, notification preferences, and team permissions. Everything is managed from one unified dashboard.",
      },
      {
        question: "How quickly does RevUp.ai detect new reviews?",
        answer:
          "New reviews are detected within minutes using Google's real-time notification system. You'll receive an alert immediately, and an AI-drafted response will be ready for your approval by the time you open the dashboard.",
      },
    ],
  },
  {
    title: "Pricing & Billing",
    items: [
      {
        question: "What plans do you offer?",
        answer:
          "We offer three plans: Starter ($29/mo) for single-location businesses with up to 50 AI responses per month, Pro ($79/mo) for multi-location businesses with up to 200 responses and 10 locations, and Enterprise (custom pricing) for large organizations with unlimited locations and responses.",
      },
      {
        question: "Can I change my plan at any time?",
        answer:
          "Yes. Upgrade or downgrade at any time from your dashboard. Upgrades take effect immediately with prorated billing. Downgrades take effect at the start of your next billing cycle.",
      },
      {
        question: "What happens if I go over my monthly response limit?",
        answer:
          "You'll receive a notification when you're approaching your limit. Once reached, you can still view and manage reviews, but new AI responses will be paused until your next billing cycle — or you can upgrade your plan instantly for immediate access.",
      },
      {
        question: "Do you offer annual billing?",
        answer:
          "Yes! Annual billing saves you 20% compared to monthly pricing. You can switch to annual billing at any time from your account settings.",
      },
      {
        question: "What is your refund policy?",
        answer:
          "We offer a 30-day money-back guarantee for new subscribers. If RevUp.ai doesn't meet your needs in the first 30 days, contact us for a full refund — no questions asked.",
      },
    ],
  },
  {
    title: "Security & Privacy",
    items: [
      {
        question: "Is it safe to connect my Google Business Profile?",
        answer:
          "Yes. We use Google's official OAuth 2.0 authentication — the same secure method used by Google's own apps. RevUp.ai only accesses your review data and the ability to post replies. We never access your email, contacts, or any other Google data. You can revoke access at any time.",
      },
      {
        question: "How do you protect my data?",
        answer:
          "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We use secure infrastructure with role-based access controls, conduct regular security audits, and are pursuing SOC 2 Type II certification. We have a DPA with Anthropic to ensure your review data is processed securely.",
      },
      {
        question: "Do you sell or share my data?",
        answer:
          "Never. Your data is used solely to provide the RevUp.ai service. We never sell, share, or use your business data for advertising or any other purpose. Anthropic (Claude AI) does not use your data to train their models.",
      },
      {
        question: "Are you GDPR compliant?",
        answer:
          "Yes. RevUp.ai is fully GDPR compliant. You can access, export, correct, or delete your personal data at any time. We process data lawfully and transparently, and we notify users within 72 hours of any data breach.",
      },
    ],
  },
];

const ALL_FAQ_ITEMS = FAQ_CATEGORIES.flatMap((cat) => cat.items);

function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-neutral-200 last:border-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-5 text-left group"
        aria-expanded={isOpen}
      >
        <span
          className={cn(
            "font-heading font-semibold text-lg transition-colors pr-4",
            isOpen
              ? "text-primary"
              : "text-neutral-900 group-hover:text-primary"
          )}
        >
          {question}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-neutral-400 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180 text-primary"
          )}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-neutral-600 text-base leading-relaxed">
              {answer}
            </p>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Flatten all items with a global index for accordion state
  let globalIndex = 0;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: ALL_FAQ_ITEMS.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }}
      />

      {/* Hero */}
      <SectionWrapper>
        <div className="pt-12 pb-4">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto">
              <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-neutral-950 mb-4">
                Frequently Asked Questions
              </h1>
              <p className="text-lg text-neutral-600">
                Everything you need to know about RevUp.ai. Can&apos;t find the
                answer you&apos;re looking for?{" "}
                <Link
                  href="/contact"
                  className="text-primary font-medium hover:underline"
                >
                  Contact our team
                </Link>
                .
              </p>
            </div>
          </FadeIn>
        </div>
      </SectionWrapper>

      {/* FAQ Sections */}
      {FAQ_CATEGORIES.map((category) => {
        const startIndex = globalIndex;
        const categoryItems = category.items.map((item, i) => {
          const idx = startIndex + i;
          return { ...item, idx };
        });
        globalIndex += category.items.length;

        return (
          <SectionWrapper
            key={category.title}
            background={
              FAQ_CATEGORIES.indexOf(category) % 2 === 1 ? "muted" : "default"
            }
          >
            <SectionHeading heading={category.title} align="left" />
            <div className="max-w-3xl">
              {categoryItems.map(({ question, answer, idx }) => (
                <AccordionItem
                  key={idx}
                  question={question}
                  answer={answer}
                  isOpen={openIndex === idx}
                  onToggle={() =>
                    setOpenIndex(openIndex === idx ? null : idx)
                  }
                />
              ))}
            </div>
          </SectionWrapper>
        );
      })}

      {/* CTA */}
      <SectionWrapper background="muted">
        <FadeIn>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-heading text-3xl font-bold text-neutral-950 mb-4">
              Still Have Questions?
            </h2>
            <p className="text-neutral-600 mb-6">
              Our team is here to help. Reach out and we will get back to you
              within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button href="/contact" size="lg">
                Contact Us
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/signup" variant="secondary" size="lg">
                Start Free Trial
              </Button>
            </div>
          </div>
        </FadeIn>
      </SectionWrapper>
    </>
  );
}
