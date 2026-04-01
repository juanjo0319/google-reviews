import type { Metadata } from "next";
import { SectionWrapper } from "@/components/ui/SectionWrapper";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "RevUp.ai Privacy Policy. Learn how we collect, use, and protect your data when you use our AI-powered Google review management platform.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <SectionWrapper>
      <div className="pt-12 max-w-3xl mx-auto">
        <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-neutral-950 mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm text-neutral-500 mb-12">
          Last updated: March 2026
        </p>

        <div className="prose prose-neutral prose-lg max-w-none">
          <p>
            At RevUp.ai (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;),
            your privacy is fundamental to how we build and operate our
            platform. This Privacy Policy explains how we collect, use, store,
            and protect your information when you use our website and services.
          </p>

          <h2>Information We Collect</h2>
          <p>We collect information in the following ways:</p>
          <ul>
            <li>
              <strong>Account Information:</strong> When you sign up, we collect
              your name, email address, and password. If you sign up via Google
              OAuth, we receive your name, email, and profile picture from
              Google.
            </li>
            <li>
              <strong>Google Business Profile Data:</strong> When you connect
              your Google Business Profile, we access your business reviews,
              review responses, and basic business information (name, address,
              category). We only request the minimum permissions necessary.
            </li>
            <li>
              <strong>Usage Data:</strong> We collect information about how you
              interact with our platform, including pages visited, features
              used, responses generated, and session duration.
            </li>
            <li>
              <strong>Payment Information:</strong> Payment processing is
              handled by Stripe. We do not store your credit card numbers on
              our servers. Stripe&apos;s privacy policy governs how they handle
              your payment data.
            </li>
            <li>
              <strong>Communications:</strong> If you contact us via email or
              our contact form, we retain the content of those communications.
            </li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>
              Provide, maintain, and improve our AI-powered review management
              services
            </li>
            <li>
              Generate AI-drafted responses to your Google reviews using Claude
              AI by Anthropic
            </li>
            <li>
              Send you notifications about new reviews and system updates
            </li>
            <li>
              Process payments and manage your subscription
            </li>
            <li>
              Analyze usage patterns to improve our product and user experience
            </li>
            <li>
              Respond to your support inquiries and communications
            </li>
            <li>
              Comply with legal obligations and enforce our terms of service
            </li>
          </ul>

          <h2>Data Storage &amp; Security</h2>
          <p>
            Your data is stored on secure servers hosted in the United States.
            We implement industry-standard security measures including:
          </p>
          <ul>
            <li>
              Encryption in transit (TLS 1.3) and at rest (AES-256) for all
              sensitive data
            </li>
            <li>
              Secure authentication via Google OAuth 2.0 and bcrypt-hashed
              passwords
            </li>
            <li>
              Regular security audits and vulnerability assessments
            </li>
            <li>
              Access controls and role-based permissions for our internal team
            </li>
            <li>
              Database backups with encrypted storage
            </li>
          </ul>

          <h2>Third-Party Services</h2>
          <p>
            We use the following third-party services to operate our platform:
          </p>
          <ul>
            <li>
              <strong>Anthropic (Claude AI):</strong> Processes review text to
              generate response drafts. Review content is sent to Anthropic&apos;s
              API for processing. Anthropic does not use your data to train
              their models.
            </li>
            <li>
              <strong>Google:</strong> Provides OAuth authentication and Google
              Business Profile API access for review management.
            </li>
            <li>
              <strong>Stripe:</strong> Handles payment processing and
              subscription management.
            </li>
            <li>
              <strong>Supabase:</strong> Provides database hosting and
              authentication infrastructure.
            </li>
            <li>
              <strong>Sentry:</strong> Monitors application errors and
              performance (anonymized data only).
            </li>
          </ul>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>
              <strong>Access:</strong> Request a copy of the personal data we
              hold about you
            </li>
            <li>
              <strong>Correction:</strong> Request correction of inaccurate
              personal data
            </li>
            <li>
              <strong>Deletion:</strong> Request deletion of your personal data
              and account
            </li>
            <li>
              <strong>Portability:</strong> Request your data in a
              machine-readable format
            </li>
            <li>
              <strong>Opt-out:</strong> Unsubscribe from marketing
              communications at any time
            </li>
            <li>
              <strong>Revoke Access:</strong> Disconnect your Google Business
              Profile and revoke our OAuth permissions at any time
            </li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{" "}
            <a href="mailto:privacy@revup.ai">privacy@revup.ai</a>.
          </p>

          <h2>Cookie Policy</h2>
          <p>We use cookies and similar technologies for:</p>
          <ul>
            <li>
              <strong>Essential Cookies:</strong> Required for authentication,
              session management, and security. These cannot be disabled.
            </li>
            <li>
              <strong>Analytics Cookies:</strong> Help us understand how you
              use our platform so we can improve it. You can opt out of
              analytics cookies in your account settings.
            </li>
          </ul>
          <p>
            We do not use advertising cookies or share cookie data with
            third-party advertisers.
          </p>

          <h2>Data Retention</h2>
          <p>
            We retain your data for as long as your account is active or as
            needed to provide our services. Specifically:
          </p>
          <ul>
            <li>
              <strong>Account data:</strong> Retained until you delete your
              account
            </li>
            <li>
              <strong>Review data:</strong> Retained while your Google Business
              Profile is connected. Deleted within 30 days of disconnection.
            </li>
            <li>
              <strong>Usage logs:</strong> Retained for 12 months, then
              anonymized
            </li>
            <li>
              <strong>Payment records:</strong> Retained for 7 years as
              required by tax and financial regulations
            </li>
          </ul>
          <p>
            When you delete your account, we remove your personal data within
            30 days, except where retention is required by law.
          </p>

          <h2>Contact</h2>
          <p>
            If you have questions about this Privacy Policy or our data
            practices, please contact us:
          </p>
          <ul>
            <li>
              Email:{" "}
              <a href="mailto:privacy@revup.ai">privacy@revup.ai</a>
            </li>
            <li>
              General support:{" "}
              <a href="mailto:support@revup.ai">support@revup.ai</a>
            </li>
          </ul>
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of significant changes by email or through our platform. Your
            continued use of RevUp.ai after changes are posted constitutes
            acceptance of the updated policy.
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}
