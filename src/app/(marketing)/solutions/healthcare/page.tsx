import type { Metadata } from "next";
import {
  SolutionPage,
  type SolutionData,
} from "@/components/templates/SolutionPage";
import { ShieldAlert, Heart, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Review Management for Healthcare",
  description:
    "Respond to patient reviews with empathy and confidence. RevUp.ai generates HIPAA-conscious responses that never reference protected health information, so your practice stays compliant and compassionate.",
  alternates: { canonical: "/solutions/healthcare" },
};

const DATA: SolutionData = {
  industry: "Healthcare",
  heroTitle: "HIPAA-Conscious Review Responses for Healthcare",
  heroDescription:
    "Patient reviews are deeply personal, and one misstep in a public response can create a compliance nightmare. RevUp.ai generates empathetic, professional replies that never reference protected health information — so your practice builds trust without risking a violation.",
  painPoints: [
    {
      title: "Compliance Risk in Every Response",
      description:
        "HIPAA regulations mean you can't acknowledge a patient was even seen at your facility, let alone discuss diagnoses or treatments. A well-meaning staff member can inadvertently confirm protected details in a public reply.",
      icon: ShieldAlert,
    },
    {
      title: "High Emotional Stakes",
      description:
        "Patients leave reviews about some of the most vulnerable moments of their lives. A generic or dismissive response to a negative healthcare review can feel callous and drive patients to competitors.",
      icon: Heart,
    },
    {
      title: "Volume Across Multiple Providers",
      description:
        "Large practices and health systems have dozens of providers, each generating their own stream of reviews. Without a centralized system, reviews slip through the cracks and reputations suffer.",
      icon: Users,
    },
  ],
  features: [
    {
      title: "HIPAA-Safe Response Engine",
      description:
        "Every AI-generated response is built from the ground up to avoid confirming, denying, or referencing any protected health information. RevUp.ai never mentions specific conditions, treatments, dates of service, or appointment details.",
      relevance:
        "Protect your practice from costly violations while still responding to every review.",
    },
    {
      title: "Empathetic, Professional Tone",
      description:
        "The AI is fine-tuned for healthcare communication — balancing warmth with professionalism so patients feel heard without your staff composing each response from scratch.",
      relevance:
        "Patients who feel acknowledged are far more likely to give your practice a second chance.",
    },
    {
      title: "Provider-Level Review Tracking",
      description:
        "See ratings and sentiment trends broken down by individual provider, department, or facility so you know exactly where to focus improvement efforts.",
      relevance:
        "Identify systemic issues before they become patterns that damage your reputation.",
    },
    {
      title: "Offline Follow-Up Prompts",
      description:
        "For sensitive complaints, the AI invites the reviewer to continue the conversation through a private, secure channel rather than resolving details in a public forum.",
      relevance:
        "Move delicate conversations offline where you can address concerns without compliance risk.",
    },
  ],
  exampleReview: {
    stars: 1,
    text: "I waited over 45 minutes past my appointment time, and when I finally saw the doctor she spent maybe 5 minutes with me. I felt completely rushed and unheard. My concerns about my ongoing symptoms were brushed off. Very disappointing experience.",
    response:
      "Thank you for sharing your experience, and we're truly sorry you felt rushed and unheard. Every patient deserves our full time and attention, and it's clear we fell short of that standard during your visit. We take feedback like this seriously and would like the opportunity to make things right. Please contact our Patient Experience team at (555) 123-4567 so we can discuss your concerns privately and ensure you receive the care you deserve.",
  },
  stats: [
    {
      value: "84%",
      label: "Of patients use reviews to evaluate healthcare providers",
    },
    { value: "0", label: "PHI references in AI-generated responses" },
    {
      value: "59%",
      label: "Of patients avoid providers with low star ratings",
    },
    {
      value: "2.7x",
      label: "More patient inquiries with active review management",
    },
  ],
  testimonial: {
    quote:
      "Before RevUp.ai, our office manager spent hours each week agonizing over how to respond without saying the wrong thing. Now every response is compassionate, compliant, and goes out the same day. Our patient satisfaction scores have never been higher.",
    name: "Dr. Sarah Chen",
    role: "Medical Director",
    company: "Lakewood Family Medicine",
  },
  ctaText: "Protect Your Practice While Building Patient Trust",
};

export default function HealthcarePage() {
  return <SolutionPage data={DATA} />;
}
