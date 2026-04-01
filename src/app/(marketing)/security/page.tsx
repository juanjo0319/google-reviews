import type { Metadata } from "next";
import {
  Shield,
  Lock,
  KeyRound,
  Globe,
  ScanSearch,
  ShieldOff,
} from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";

export const metadata: Metadata = {
  title: "Security at RevUp.ai",
  description:
    "Learn how RevUp.ai protects your data with encryption, OAuth 2.0, GDPR compliance, and ongoing security audits. Your data security is our priority.",
  alternates: { canonical: "/security" },
};

const SECURITY_FEATURES = [
  {
    icon: Shield,
    title: "SOC 2 (In Progress)",
    description:
      "We are actively pursuing SOC 2 Type II certification. Our security controls are designed to meet the Trust Services Criteria for security, availability, and confidentiality.",
  },
  {
    icon: Lock,
    title: "Encryption Everywhere",
    description:
      "All data is encrypted in transit with TLS 1.3 and at rest with AES-256 encryption. Your review data, account information, and API keys are never stored in plaintext.",
  },
  {
    icon: KeyRound,
    title: "Google OAuth 2.0",
    description:
      "We use Google's official OAuth 2.0 protocol for authentication and API access. We never see or store your Google password. You can revoke access at any time.",
  },
  {
    icon: Globe,
    title: "GDPR Compliant",
    description:
      "RevUp.ai is fully GDPR compliant. You can access, export, correct, or delete your personal data at any time. We process data lawfully, transparently, and with purpose limitation.",
  },
  {
    icon: ScanSearch,
    title: "Regular Security Audits",
    description:
      "We conduct regular vulnerability assessments, penetration testing, and code reviews. Dependencies are automatically scanned for known vulnerabilities.",
  },
  {
    icon: ShieldOff,
    title: "We Never Sell Your Data",
    description:
      "Your data is yours. We never sell, share, or use your business data for advertising. Your review data is used solely to provide the service you signed up for.",
  },
];

export default function SecurityPage() {
  return (
    <>
      {/* Hero */}
      <SectionWrapper>
        <div className="pt-16 pb-4">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto">
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mx-auto mb-6">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-950 mb-6">
                Your Data Security Is Our Priority
              </h1>
              <p className="text-lg md:text-xl text-neutral-600 leading-relaxed">
                We understand that connecting your Google Business Profile
                requires trust. Here is how we earn and maintain that trust
                every day.
              </p>
            </div>
          </FadeIn>
        </div>
      </SectionWrapper>

      {/* Security Features Grid */}
      <SectionWrapper background="muted">
        <SectionHeading
          eyebrow="Security"
          heading="How We Protect Your Data"
          description="Enterprise-grade security practices built into every layer of our platform."
        />
        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {SECURITY_FEATURES.map((feature) => (
            <StaggerItem key={feature.title}>
              <div className="bg-white rounded-2xl border border-neutral-100 p-8 h-full">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-5">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-bold text-neutral-950 mb-3">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </SectionWrapper>

      {/* Data Protection Prose */}
      <SectionWrapper>
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <SectionHeading
              eyebrow="Data Protection"
              heading="Our Commitment to Your Privacy"
              align="left"
            />
            <div className="prose prose-lg prose-neutral max-w-none">
              <p>
                When you connect your Google Business Profile to RevUp.ai, we
                request only the minimum permissions necessary to read your
                reviews and post responses on your behalf. We do not access your
                email, contacts, Google Drive, or any other Google service.
              </p>
              <p>
                Review data is processed by Claude AI (Anthropic) to generate
                response drafts. Anthropic does not use your data to train their
                models, and data is not retained by Anthropic after processing.
                We have a Data Processing Agreement (DPA) in place with Anthropic
                to ensure your data is handled in compliance with GDPR and other
                privacy regulations.
              </p>
              <p>
                Our infrastructure is hosted on secure, SOC 2-certified cloud
                providers. All database access is protected by role-based access
                controls, and our internal team follows the principle of least
                privilege. Production systems are isolated from development and
                staging environments.
              </p>
              <p>
                We maintain an incident response plan and will notify affected
                users within 72 hours of discovering any data breach, in
                compliance with GDPR requirements. If you discover a
                vulnerability, we encourage responsible disclosure — please
                contact{" "}
                <a href="mailto:security@revup.ai">security@revup.ai</a>.
              </p>
            </div>
          </FadeIn>
        </div>
      </SectionWrapper>
    </>
  );
}
