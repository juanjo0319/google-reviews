"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-client";
import { cn } from "@/lib/utils";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { JsonLd } from "@/components/ui/JsonLd";

const FAQ_ITEMS = [
  {
    question: "How does RevUp.ai generate review responses?",
    answer:
      "RevUp.ai uses Claude AI by Anthropic — one of the world's most capable AI models — to analyze each review's content, sentiment, and context. It then generates a response that matches your configured brand voice, tone, and style preferences. Every response is drafted, never auto-published — you always have final approval.",
  },
  {
    question: "Is it safe to connect my Google Business Profile?",
    answer:
      "Absolutely. We use Google's official OAuth 2.0 authentication — the same secure method used by Google's own apps. RevUp.ai only accesses your review data and the ability to post replies. We never access your email, contacts, or any other Google data. You can revoke access at any time from your Google Account settings.",
  },
  {
    question: "Can I edit AI-generated responses before publishing?",
    answer:
      'Yes, always. Every AI response starts as a draft. You can edit it, regenerate it with different instructions, or write your own response from scratch. Nothing is ever published to Google without your explicit approval.',
  },
  {
    question: "What happens if I go over my monthly response limit?",
    answer:
      "You'll receive a notification when you're approaching your limit. Once reached, you can still view and manage reviews, but new AI responses will be paused until your next billing cycle — or you can upgrade your plan instantly for immediate access to more responses.",
  },
  {
    question: "Do you support multiple Google Business locations?",
    answer:
      "Yes! The Pro plan supports up to 10 locations, and Enterprise offers unlimited locations. Each location can have its own brand voice settings, notification preferences, and team permissions. You manage everything from one unified dashboard.",
  },
  {
    question: "How quickly does RevUp.ai detect new reviews?",
    answer:
      "New reviews are detected within minutes using Google's real-time notification system. You'll receive an alert immediately, and an AI-drafted response will be ready for your approval by the time you open the dashboard.",
  },
  {
    question: "Can I customize the AI's writing style?",
    answer:
      "Extensively. You control the tone (professional, casual, warm, etc.), formality level, whether to use emoji, preferred phrases, phrases to avoid, response length, and even provide example responses for the AI to learn from. The more you customize, the more the AI sounds like you.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes — every plan includes a 14-day free trial with full access to all features. No credit card required to start. Cancel anytime during the trial at no cost.",
  },
];

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
            isOpen ? "text-primary" : "text-neutral-900 group-hover:text-primary"
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

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Split into two columns
  const mid = Math.ceil(FAQ_ITEMS.length / 2);
  const leftColumn = FAQ_ITEMS.slice(0, mid);
  const rightColumn = FAQ_ITEMS.slice(mid);

  return (
    <SectionWrapper id="faq" background="muted">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ_ITEMS.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }}
      />

      <SectionHeading
        eyebrow="FAQ"
        heading="Frequently Asked Questions"
        description="Everything you need to know about RevUp.ai."
      />

      <div className="grid md:grid-cols-2 gap-x-12 max-w-5xl mx-auto">
        <div>
          {leftColumn.map((item, i) => (
            <AccordionItem
              key={i}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
        <div>
          {rightColumn.map((item, i) => {
            const idx = i + mid;
            return (
              <AccordionItem
                key={idx}
                question={item.question}
                answer={item.answer}
                isOpen={openIndex === idx}
                onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-12 text-center text-sm text-neutral-500">
        Still have questions?{" "}
        <a href="/contact" className="text-primary font-medium hover:underline">
          Contact Us
        </a>
      </div>
    </SectionWrapper>
  );
}
