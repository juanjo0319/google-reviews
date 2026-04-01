import Link from "next/link";
import {
  Star,
  MessageSquareText,
  BarChart3,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  Check,
  Globe,
  BrainCircuit,
  Send,
} from "lucide-react";

function StarRating({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-accent text-accent" />
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
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 card-hover">
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
          <BrainCircuit className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-primary">AI-Generated Response</span>
        </div>
        <p className="text-sm text-slate-700">{response}</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-28 lg:pt-28 lg:pb-36">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Zap className="h-4 w-4" />
              Powered by Claude AI
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
              Never Miss a{" "}
              <span className="gradient-text">Google Review</span>{" "}
              Again
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Automatically read, analyze, and craft the perfect response to
              every Google review. Save hours each week and boost your online
              reputation with AI.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up-delay">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30 transition-all animate-pulse-glow"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                Log In
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              No credit card required &middot; 14-day free trial
            </p>
          </div>

          {/* Floating demo preview */}
          <div className="mt-16 max-w-4xl mx-auto animate-fade-in-up-delay-2">
            <div className="rounded-2xl bg-white shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <span className="text-xs text-slate-400 ml-2">ReviewAI Dashboard</span>
              </div>
              <div className="p-6 sm:p-8 grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-slate-900">Incoming Review</h3>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-sm font-medium text-amber-700">M</div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Maria G.</p>
                        <StarRating count={4} />
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">
                      &ldquo;Great food and atmosphere! The pasta was amazing but we had to wait 30 minutes for our table even with a reservation.&rdquo;
                    </p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Send className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-slate-900">AI Response</h3>
                    <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      Ready to Send
                    </span>
                  </div>
                  <div className="rounded-xl bg-green-50 p-4 border border-green-100">
                    <p className="text-sm text-slate-700">
                      &ldquo;Thank you so much, Maria! We&apos;re thrilled you loved the pasta. We sincerely apologize for the wait &mdash; we&apos;re improving our reservation system to ensure this doesn&apos;t happen again. We&apos;d love to welcome you back!&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
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
                color: "bg-green-100 text-green-700",
              },
              {
                icon: Zap,
                title: "Instant Notifications",
                desc: "Get alerted the moment a new review comes in. Never let a negative review sit unanswered.",
                color: "bg-amber-100 text-amber-700",
              },
              {
                icon: Shield,
                title: "Brand Voice Control",
                desc: "Set your tone, style, and guidelines. Every AI response matches your brand perfectly.",
                color: "bg-purple-100 text-purple-700",
              },
              {
                icon: Clock,
                title: "Save 10+ Hours/Week",
                desc: "Stop writing repetitive responses manually. Let AI handle the heavy lifting while you focus on your business.",
                color: "bg-rose-100 text-rose-700",
              },
              {
                icon: Globe,
                title: "Multi-Location Support",
                desc: "Manage reviews across all your Google Business locations from a single dashboard.",
                color: "bg-teal-100 text-teal-700",
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="rounded-2xl bg-white p-8 border border-slate-100 card-hover"
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${color} mb-5`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Up and Running in 3 Steps
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Connect your Google Business account and let AI do the rest.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: "1",
                title: "Connect Google Business",
                desc: "Link your Google Business Profile in one click. We securely sync all your reviews in real time.",
              },
              {
                step: "2",
                title: "AI Reads & Analyzes",
                desc: "Claude AI reads every review, understands sentiment, and generates a tailored response draft.",
              },
              {
                step: "3",
                title: "Review & Publish",
                desc: "Approve, edit, or auto-publish responses. You stay in control while AI does the heavy lifting.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white text-2xl font-bold shadow-lg shadow-primary/20">
                  {step}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{title}</h3>
                <p className="text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social Proof / Demo Reviews ── */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
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
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Start free, upgrade when you&apos;re ready. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="rounded-2xl bg-white p-8 border border-slate-200 card-hover flex flex-col">
              <h3 className="text-lg font-semibold text-slate-900">Starter</h3>
              <p className="text-sm text-slate-500 mt-1">For small businesses</p>
              <div className="mt-6 mb-8">
                <span className="text-4xl font-bold text-slate-900">$29</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-600 flex-1">
                {[
                  "1 Google Business location",
                  "Up to 50 AI responses/mo",
                  "Sentiment dashboard",
                  "Email notifications",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="mt-8 block rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Pro — highlighted */}
            <div className="rounded-2xl bg-primary p-8 text-white shadow-xl shadow-primary/20 card-hover flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-slate-900 text-xs font-bold px-3 py-1 rounded-full">
                Most Popular
              </div>
              <h3 className="text-lg font-semibold">Pro</h3>
              <p className="text-sm text-blue-200 mt-1">For growing businesses</p>
              <div className="mt-6 mb-8">
                <span className="text-4xl font-bold">$79</span>
                <span className="text-blue-200">/mo</span>
              </div>
              <ul className="space-y-3 text-sm text-blue-100 flex-1">
                {[
                  "Up to 5 locations",
                  "Unlimited AI responses",
                  "Custom brand voice",
                  "Auto-publish option",
                  "Priority support",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
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
            <div className="rounded-2xl bg-white p-8 border border-slate-200 card-hover flex flex-col">
              <h3 className="text-lg font-semibold text-slate-900">Enterprise</h3>
              <p className="text-sm text-slate-500 mt-1">For large organizations</p>
              <div className="mt-6 mb-8">
                <span className="text-4xl font-bold text-slate-900">Custom</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-600 flex-1">
                {[
                  "Unlimited locations",
                  "Unlimited AI responses",
                  "API access",
                  "Dedicated account manager",
                  "Custom integrations",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
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
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 bg-surface-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to Transform Your Review Management?
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-xl mx-auto">
            Join hundreds of businesses already using AI to respond to every
            Google review — faster and better.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all"
            >
              Start Your Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 px-8 py-3.5 text-base font-semibold text-slate-300 hover:bg-slate-800 transition-all"
            >
              Log In to Dashboard
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
