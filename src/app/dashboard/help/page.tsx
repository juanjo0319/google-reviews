import {
  HelpCircle,
  BookOpen,
  Globe,
  Bot,
  Shield,
  Mail,
  MessageCircle,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

const faqs = [
  {
    question: "How do I get started with ReviewAI?",
    answer:
      "Start by connecting your Google Business Profile from the Settings page. Once connected, ReviewAI will automatically sync your reviews and begin generating AI-powered responses for you to review and publish.",
  },
  {
    question: "How do I connect my Google Business Profile?",
    answer:
      'Go to Settings > General and click "Connect Google Account." You\'ll be redirected to Google to authorize ReviewAI to access your Business Profile. After authorization, select the locations you want to manage.',
  },
  {
    question: "How do AI-generated responses work?",
    answer:
      "When a new review comes in, ReviewAI analyzes the content, sentiment, and context to generate a personalized response based on your Brand Voice settings. Responses go through your approval workflow before being published -- you always have the final say.",
  },
  {
    question: "Can I customize the AI's tone and style?",
    answer:
      'Yes! Go to Settings > Brand Voice to configure the tone, formality, humor level, preferred phrases, phrases to avoid, and more. The AI will follow these guidelines when generating responses.',
  },
  {
    question: "What happens when I get a negative review?",
    answer:
      "ReviewAI flags negative reviews (1-2 stars) as urgent and can send you immediate alerts via email or in-app notifications. The AI generates extra-careful responses for negative reviews, focusing on empathy and resolution.",
  },
  {
    question: "How does the approval workflow work?",
    answer:
      'AI-generated responses start as drafts. You can review, edit, approve, or reject them. Only approved responses get published to Google. You can configure automatic publishing for responses above a certain confidence threshold in your plan settings.',
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

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Help & Support</h1>
        <p className="text-sm text-slate-500 mt-1">
          Find answers and get help with ReviewAI
        </p>
      </div>

      {/* Getting Started Guide */}
      <div className="rounded-2xl bg-white border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-slate-900">Getting Started</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-100 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-3">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              1. Connect Google
            </h3>
            <p className="text-xs text-slate-500">
              Link your Google Business Profile to start syncing reviews automatically.
            </p>
            <Link
              href="/dashboard/settings"
              className="inline-block mt-2 text-xs font-medium text-primary hover:text-primary-dark"
            >
              Go to Settings
            </Link>
          </div>

          <div className="rounded-xl border border-slate-100 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-3">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              2. Set Brand Voice
            </h3>
            <p className="text-xs text-slate-500">
              Customize how the AI responds to match your brand&apos;s personality and tone.
            </p>
            <Link
              href="/dashboard/settings/brand-voice"
              className="inline-block mt-2 text-xs font-medium text-primary hover:text-primary-dark"
            >
              Configure Brand Voice
            </Link>
          </div>

          <div className="rounded-xl border border-slate-100 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-3">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              3. Review Responses
            </h3>
            <p className="text-xs text-slate-500">
              Check AI-generated responses, edit if needed, and approve them for publishing.
            </p>
            <Link
              href="/dashboard/responses"
              className="inline-block mt-2 text-xs font-medium text-primary hover:text-primary-dark"
            >
              View Responses
            </Link>
          </div>

          <div className="rounded-xl border border-slate-100 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-3">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              4. Invite Your Team
            </h3>
            <p className="text-xs text-slate-500">
              Add team members to collaborate on review management and response approval.
            </p>
            <Link
              href="/dashboard/settings/team"
              className="inline-block mt-2 text-xs font-medium text-primary hover:text-primary-dark"
            >
              Manage Team
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="rounded-2xl bg-white border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-slate-900">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="divide-y divide-slate-100 max-w-3xl">
          {faqs.map(({ question, answer }) => (
            <details key={question} className="group py-4 first:pt-0 last:pb-0">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="text-sm font-medium text-slate-900 pr-4">
                  {question}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="rounded-2xl bg-white border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-slate-900">
            Contact Support
          </h2>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Can&apos;t find what you&apos;re looking for? Our support team is here to help.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="mailto:support@reviewai.app"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
          >
            <Mail className="h-4 w-4" />
            Email Support
          </a>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Typical response time: under 24 hours during business days
        </p>
      </div>
    </div>
  );
}
