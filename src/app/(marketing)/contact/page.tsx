"use client";

import { useState } from "react";
import { Mail, MapPin, Clock, CheckCircle2, Send } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/motion";
import { cn } from "@/lib/utils";

const SUBJECTS = [
  "General Inquiry",
  "Sales & Pricing",
  "Technical Support",
  "Partnership",
  "Press & Media",
  "Other",
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Integrate with backend API or email service (e.g., Resend, SendGrid)
    console.log("Contact form submission:", { name, email, subject, message });
    setSubmitted(true);
  }

  return (
    <>
      <SectionWrapper>
        <div className="pt-12">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-neutral-950 mb-4">
                Get in Touch
              </h1>
              <p className="text-lg text-neutral-600">
                Have a question, need support, or want to learn how RevUp.ai can
                help your business? We&apos;d love to hear from you.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-5 gap-12 max-w-5xl mx-auto">
            {/* Form */}
            <div className="md:col-span-3">
              <FadeIn direction="left">
                {submitted ? (
                  <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h2 className="font-heading text-2xl font-bold text-neutral-950 mb-2">
                      Message Sent!
                    </h2>
                    <p className="text-neutral-600">
                      Thanks for reaching out. Our team will get back to you
                      within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 space-y-5"
                  >
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-sm font-semibold text-neutral-700 mb-1.5"
                      >
                        Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-sm font-semibold text-neutral-700 mb-1.5"
                      >
                        Email
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-subject"
                        className="block text-sm font-semibold text-neutral-700 mb-1.5"
                      >
                        Subject
                      </label>
                      <select
                        id="contact-subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-base text-neutral-900 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                      >
                        {SUBJECTS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-message"
                        className="block text-sm font-semibold text-neutral-700 mb-1.5"
                      >
                        Message
                      </label>
                      <textarea
                        id="contact-message"
                        rows={5}
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="How can we help?"
                        className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors resize-y"
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full">
                      <Send className="h-4 w-4" />
                      Send Message
                    </Button>
                  </form>
                )}
              </FadeIn>
            </div>

            {/* Contact Info */}
            <div className="md:col-span-2">
              <FadeIn direction="right" delay={0.2}>
                <div className="space-y-8">
                  <div>
                    <h2 className="font-heading text-xl font-bold text-neutral-950 mb-6">
                      Other Ways to Reach Us
                    </h2>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 shrink-0">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900">
                            Email
                          </p>
                          <a
                            href="mailto:support@revup.ai"
                            className="text-primary hover:underline"
                          >
                            support@revup.ai
                          </a>
                          <p className="text-sm text-neutral-500 mt-1">
                            For sales:{" "}
                            <a
                              href="mailto:hello@revup.ai"
                              className="text-primary hover:underline"
                            >
                              hello@revup.ai
                            </a>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 shrink-0">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900">
                            Location
                          </p>
                          <p className="text-neutral-600">
                            San Francisco, CA
                          </p>
                          <p className="text-sm text-neutral-500 mt-1">
                            Remote-first team
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 shrink-0">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900">
                            Response Time
                          </p>
                          <p className="text-neutral-600">
                            Within 24 hours
                          </p>
                          <p className="text-sm text-neutral-500 mt-1">
                            Mon-Fri, 9am-6pm PST
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-neutral-50 border border-neutral-100 p-6">
                    <h3 className="font-heading font-semibold text-neutral-900 mb-2">
                      Enterprise Inquiries
                    </h3>
                    <p className="text-sm text-neutral-600 mb-3">
                      Need a custom solution for your organization? Our
                      enterprise team can help with SSO, API access, custom
                      integrations, and volume pricing.
                    </p>
                    <a
                      href="mailto:enterprise@revup.ai"
                      className="text-sm text-primary font-medium hover:underline"
                    >
                      enterprise@revup.ai
                    </a>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
