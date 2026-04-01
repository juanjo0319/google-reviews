import Link from "next/link";
import {
  Star,
  MessageSquareText,
  BarChart3,
  Zap,
  Shield,
  ArrowRight,
  Check,
  Globe,
  BrainCircuit,
  Send,
  Clock,
  AlertTriangle,
  ChevronDown,
  Sparkles,
  Users,
  TrendingUp,
  Building2,
} from "lucide-react";
import { JsonLd } from "@/components/JsonLd";

/* ─── Helper components ─── */

function StarRating({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-star text-star" />
      ))}
      {Array.from({ length: 5 - count }).map((_, i) => (
        <Star key={`empty-${i}`} className="h-4 w-4 text-slate-200" />
      ))}
    </div>
  );
}

function ReviewCard({
  name,
  text,
  stars,
  response,
}: {
  name: string;
  text: string;
  stars: number;
  response: string;
}) {
  return (
    <div className="card-gradient-border card-hover p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
          {name[0]}
        </div>
        <div>
          <p className="font-medium text-slate-900 text-sm">{name}</p>
          <StarRating count={stars} />
        </div>
      </div>
      <p className="text-sm text-slate-600 mb-4">&ldquo;{text}&rdquo;</p>
      <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
        <div className="flex items-center gap-2 mb-2">
          <BrainCircuit className="h-4 w-4 text-accent" />
          <span className="text-xs font-semibold text-accent">
            AI-Generated Response
          </span>
        </div>
        <p className="text-sm text-slate-700">{response}</p>
      </div>
    </div>
  );
}

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <details className="group border-b border-slate-200 last:border-0">
      <summary className="flex cursor-pointer items-center justify-between py-5 text-left text-base font-semibold text-slate-900 hover:text-primary transition-colors">
        {question}
        <ChevronDown className="h-5 w-5 text-slate-400 group-open:rotate-180 transition-transform shrink-0 ml-4" />
      </summary>
      <p className="pb-5 text-slate-600 leading-relaxed">{answer}</p>
    </details>
  );
}

/* ─── Page ─── */

const FAQ_ITEMS = [
  {
    question: "How does ReviewAI generate responses?",
    answer:
      "ReviewAI uses Claude AI to read each review, understand the sentiment and context, then craft a personalized response that matches your brand voice. Every response is unique — never templated.",
  },
  {
    question: "Do I need to approve responses before they go live?",
    answer:
      "Yes, by default you review and approve every response before it's published. Pro and Enterprise plans also offer an auto-publish option for businesses that want fully hands-free management.",
  },
  {
    question: "How long does setup take?",
    answer:
      "Under 2 minutes. Connect your Google Business Profile with one click, set your brand voice preferences, and ReviewAI starts generating responses to new reviews immediately.",
  },
  {
    question: "Can I customize the tone of AI responses?",
    answer:
      "Absolutely. You define your brand voice — tone, style guidelines, specific phrases to use or avoid. The AI adapts to sound exactly like your business, whether that's warm and casual or professional and formal.",
  },
  {
    question: "What happens when I get a negative review?",
    answer:
      "ReviewAI detects negative sentiment instantly and crafts empathetic, solution-oriented responses. You'll receive a priority notification so you can review the response and take action quickly.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes — every plan includes a 14-day free trial with no credit card required. You get full access to all features during the trial so you can see the value before committing.",
  },
  {
    question: "Can I manage multiple business locations?",
    answer:
      "Yes. The Pro plan supports up to 10 locations and the Enterprise plan offers unlimited locations — all managed from a single dashboard with location-level analytics.",
  },
  {
    question: "How is ReviewAI different from Birdeye or Podium?",
    answer:
      "ReviewAI is purpose-built for AI review response at a fraction of the cost. While Birdeye ($299+/mo) and Podium ($399+/mo) are bloated enterprise platforms, ReviewAI does one thing brilliantly — powered by Claude AI — starting at just $29/mo.",
  },
];

export default function Home() {
  return (
    <>
      {/* Structured Data */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "ReviewAI",
          url: "https://reviewai.app",
          description:
            "AI-powered Google review management. Read, analyze, and respond to every review automatically.",
          contactPoint: {
            "@type": "ContactPoint",
            email: "support@reviewai.app",
            contactType: "customer service",
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "ReviewAI",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          offers: {
            "@type": "AggregateOffer",
            lowPrice: "29",
            highPrice: "79",
            priceCurrency: "USD",
          },
        }}
      />
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

      {/* ── 1. Hero ── */}
      <section className="hero-gradient relative overflow-hidden bg-grid-pattern">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-28 lg:pb-24">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered Google Review Management
            </div>

            {/* Headline — short, outcome-focused */}
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Every Review Answered.{" "}
              <span className="gradient-text-hero">Automatically.</span>
            </h1>

            {/* Sub-headline — benefit + mechanism + speed */}
            <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Connect your Google Business Profile. Claude AI reads every review,
              matches your brand voice, and drafts the perfect response — in
              seconds, not hours.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up-delay">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl gradient-cta px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all animate-pulse-glow"
              >
                Start My Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                See How It Works
              </a>
            </div>

            {/* Micro-copy */}
            <p className="mt-4 text-sm text-slate-500">
              No credit card required &middot; Setup in 2 minutes
            </p>
          </div>

          {/* Hero demo preview */}
          <div className="mt-16 max-w-4xl mx-auto animate-fade-in-up-delay-2">
            <div className="rounded-2xl bg-white shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <span className="text-xs text-slate-400 ml-2">
                  ReviewAI Dashboard
                </span>
              </div>
              <div className="p-6 sm:p-8 grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="h-5 w-5 text-primary" />
                    <h3 className="font-heading font-semibold text-slate-900">
                      Incoming Review
                    </h3>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-sm font-medium text-amber-700">
                        M
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          Maria G.
                        </p>
                        <StarRating count={4} />
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">
                      &ldquo;Great food and atmosphere! The pasta was amazing but
                      we had to wait 30 minutes for our table even with a
                      reservation.&rdquo;
                    </p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Send className="h-5 w-5 text-success" />
                    <h3 className="font-heading font-semibold text-slate-900">
                      AI Response
                    </h3>
                    <span className="ml-auto text-xs bg-success/10 text-success px-2 py-0.5 rounded-full font-medium">
                      Ready to Send
                    </span>
                  </div>
                  <div className="rounded-xl bg-success/5 p-4 border border-success/10">
                    <p className="text-sm text-slate-700">
                      &ldquo;Thank you so much, Maria! We&apos;re thrilled you
                      loved the pasta. We sincerely apologize for the wait —
                      we&apos;re improving our reservation system to ensure this
                      doesn&apos;t happen again. We&apos;d love to welcome you
                      back!&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Social proof strip ── */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-slate-400 mb-8 uppercase tracking-wider">
            Trusted by growing businesses everywhere
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            {[
              {
                icon: Building2,
                value: "500+",
                label: "Businesses",
              },
              {
                icon: MessageSquareText,
                value: "1M+",
                label: "Reviews managed",
              },
              {
                icon: Clock,
                value: "10hrs",
                label: "Saved per week",
              },
              {
                icon: TrendingUp,
                value: "4.8/5",
                label: "Average rating",
              },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary mb-3">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
                  {value}
                </p>
                <p className="text-sm text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Problem section ── */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900">
              Managing Reviews Manually Is Costing You
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Every unanswered review is a missed opportunity. Every slow
              response hurts your reputation.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: "Hours wasted weekly",
                desc: "Business owners spend 5–10 hours per week writing repetitive review responses that could be automated.",
                color: "text-danger",
                bg: "bg-red-50",
              },
              {
                icon: AlertTriangle,
                title: "Negative reviews sit unanswered",
                desc: "53% of customers expect a response within 7 days. Unanswered negative reviews drive away new customers.",
                color: "text-alert",
                bg: "bg-amber-50",
              },
              {
                icon: Users,
                title: "Inconsistent brand voice",
                desc: "Multiple team members responding differently creates a fragmented brand experience for your customers.",
                color: "text-accent",
                bg: "bg-indigo-50",
              },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="rounded-2xl bg-white p-8 border border-slate-100 card-hover"
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${bg} ${color} mb-5`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-slate-900 mb-2">
                  {title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. How It Works ── */}
      <section id="how-it-works" className="py-24 bg-surface bg-dot-pattern">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900">
              Up and Running in 3 Steps
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Connect your Google Business account and let AI do the rest.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-8 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-primary via-accent to-success" />

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
              {[
                {
                  step: "1",
                  title: "Connect Google Business",
                  desc: "Link your Google Business Profile in one click. We securely sync all your reviews in real time.",
                  gradient: "from-primary to-primary-light",
                },
                {
                  step: "2",
                  title: "AI Reads & Analyzes",
                  desc: "Claude AI reads every review, understands sentiment, and generates a tailored response draft.",
                  gradient: "from-accent to-accent-light",
                },
                {
                  step: "3",
                  title: "Review & Publish",
                  desc: "Approve, edit, or auto-publish responses. You stay in control while AI does the heavy lifting.",
                  gradient: "from-success to-emerald-400",
                },
              ].map(({ step, title, desc, gradient }) => (
                <div key={step} className="text-center relative">
                  <div
                    className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white text-2xl font-bold shadow-lg`}
                  >
                    {step}
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-slate-900 mb-3">
                    {title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Features ── */}
      <section id="features" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900">
              Everything You Need to Manage Reviews
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              From reading to responding, our AI handles the entire review
              management workflow.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: MessageSquareText,
                title: "Smart AI Responses",
                desc: "Claude AI crafts personalized, brand-consistent responses that sound human — not robotic.",
                color: "bg-primary/10 text-primary",
              },
              {
                icon: BarChart3,
                title: "Sentiment Analysis",
                desc: "Instantly understand customer sentiment trends across all your locations and time periods.",
                color: "bg-success/10 text-success",
              },
              {
                icon: Zap,
                title: "Instant Notifications",
                desc: "Get alerted the moment a new review comes in. Never let a negative review sit unanswered.",
                color: "bg-alert/10 text-alert",
              },
              {
                icon: Shield,
                title: "Brand Voice Control",
                desc: "Set your tone, style, and guidelines. Every AI response matches your brand perfectly.",
                color: "bg-accent/10 text-accent",
              },
              {
                icon: Clock,
                title: "Save 10+ Hours/Week",
                desc: "Stop writing repetitive responses manually. Let AI handle the heavy lifting while you focus on your business.",
                color: "bg-rose-100 text-rose-600",
              },
              {
                icon: Globe,
                title: "Multi-Location Support",
                desc: "Manage reviews across all your Google Business locations from a single dashboard.",
                color: "bg-teal-100 text-teal-600",
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card-gradient-border card-hover p-8">
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${color} mb-5`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-slate-900 mb-2">
                  {title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Mid-page CTA */}
          <div className="mt-16 text-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl gradient-cta px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-xl transition-all"
            >
              Start My Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-3 text-sm text-slate-500">
              No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* ── 6. Social Proof — AI Responses in Action ── */}
      <section className="py-24 bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900">
              See AI Responses in Action
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Real examples of how ReviewAI transforms customer feedback into
              meaningful conversations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <ReviewCard
              name="Sarah Johnson"
              text="Absolutely loved the service! Staff was friendly and the quality exceeded my expectations."
              stars={5}
              response="Thank you so much, Sarah! Your kind words truly made our day. We take pride in delivering exceptional service and quality. We look forward to welcoming you again soon!"
            />
            <ReviewCard
              name="James T."
              text="Product is decent but the delivery took way too long. Expected better for the price."
              stars={3}
              response="Hi James, thank you for your honest feedback. We're sorry about the delivery delay — we're working with our logistics partners to improve turnaround times. We'd love the chance to make it right. Please reach out to us directly!"
            />
            <ReviewCard
              name="Emily R."
              text="Terrible experience. Wrong order twice and no one seemed to care."
              stars={1}
              response="Emily, we sincerely apologize for this experience. This is not the standard we hold ourselves to. We've escalated this to our management team and would like to offer you a complimentary visit. Please contact us so we can make this right."
            />
          </div>

          {/* Micro case study metrics */}
          <div className="mt-16 grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              {
                metric: "48hrs → 2hrs",
                label: "Average response time",
              },
              {
                metric: "94%",
                label: "Response rate achieved",
              },
              {
                metric: "4.2 → 4.7",
                label: "Average star rating increase",
              },
            ].map(({ metric, label }) => (
              <div
                key={label}
                className="text-center rounded-xl bg-white p-6 border border-slate-100"
              >
                <p className="font-heading text-2xl font-bold gradient-text">
                  {metric}
                </p>
                <p className="text-sm text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Pricing ── */}
      <section id="pricing" className="py-24 bg-white bg-grid-pattern">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Start free, upgrade when you&apos;re ready. No hidden fees, no
              surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="rounded-2xl bg-white p-8 border border-slate-200 card-hover flex flex-col shadow-sm">
              <h3 className="font-heading text-lg font-semibold text-slate-900">
                Starter
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                For small businesses
              </p>
              <div className="mt-6 mb-8">
                <span className="font-heading text-4xl font-bold text-slate-900">
                  $29
                </span>
                <span className="text-slate-500">/mo</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-600 flex-1">
                {[
                  "1 Google Business location",
                  "100 AI responses/mo",
                  "Basic sentiment dashboard",
                  "Email notifications",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="mt-8 block rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Pro — highlighted */}
            <div className="rounded-2xl p-8 text-white shadow-xl card-hover flex flex-col relative gradient-cta">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-alert text-slate-900 text-xs font-bold px-3 py-1 rounded-full">
                Most Popular
              </div>
              <h3 className="font-heading text-lg font-semibold">Pro</h3>
              <p className="text-sm text-blue-200 mt-1">
                For growing businesses
              </p>
              <div className="mt-6 mb-8">
                <span className="font-heading text-4xl font-bold">$79</span>
                <span className="text-blue-200">/mo</span>
              </div>
              <ul className="space-y-3 text-sm text-blue-100 flex-1">
                {[
                  "Up to 10 locations",
                  "500 AI responses/mo",
                  "Advanced sentiment + trends",
                  "Brand voice control",
                  "Auto-publish option",
                  "Multi-user access",
                  "Priority support",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-alert mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="mt-8 block rounded-xl bg-white py-3 text-center text-sm font-semibold text-primary hover:bg-blue-50 transition-colors"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="rounded-2xl bg-white p-8 border border-slate-200 card-hover flex flex-col shadow-sm">
              <h3 className="font-heading text-lg font-semibold text-slate-900">
                Enterprise
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                For large organizations
              </p>
              <div className="mt-6 mb-8">
                <span className="font-heading text-4xl font-bold text-slate-900">
                  Custom
                </span>
              </div>
              <ul className="space-y-3 text-sm text-slate-600 flex-1">
                {[
                  "Unlimited locations",
                  "Unlimited AI responses",
                  "Custom AI training",
                  "SSO + API access",
                  "Dedicated account manager",
                  "Custom integrations",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="mt-8 block rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>

          {/* Price anchoring against competitors */}
          <div className="mt-12 text-center">
            <p className="text-sm text-slate-500">
              Compare:{" "}
              <span className="line-through text-slate-400">
                Birdeye $299+/mo
              </span>{" "}
              &middot;{" "}
              <span className="line-through text-slate-400">
                Podium $399+/mo
              </span>{" "}
              &middot;{" "}
              <span className="font-semibold text-primary">
                ReviewAI from $29/mo
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* ── 8. FAQ ── */}
      <section id="faq" className="py-24 bg-surface">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Everything you need to know about ReviewAI.
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 divide-y divide-slate-200 px-8 shadow-sm">
            {FAQ_ITEMS.map((item) => (
              <FAQItem key={item.question} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. Final CTA ── */}
      <section className="py-24 section-gradient-dark relative overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
            Ready to Transform Your Review Management?
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-xl mx-auto">
            Join hundreds of businesses already using AI to respond to every
            Google review — faster and better.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl gradient-cta px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-xl transition-all"
            >
              Start My Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 px-8 py-3.5 text-base font-semibold text-slate-300 hover:bg-slate-800 transition-all"
            >
              Log In to Dashboard
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            No credit card required &middot; 14-day free trial
          </p>
        </div>
      </section>
    </>
  );
}
