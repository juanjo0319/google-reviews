import type { Metadata } from "next";
import { SectionWrapper } from "@/components/ui/SectionWrapper";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "RevUp.ai Terms of Service. Read the terms and conditions that govern your use of our AI-powered Google review management platform.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <SectionWrapper>
      <div className="pt-12 max-w-3xl mx-auto">
        <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-neutral-950 mb-4">
          Terms of Service
        </h1>
        <p className="text-sm text-neutral-500 mb-12">
          Last updated: March 2026
        </p>

        <div className="prose prose-neutral prose-lg max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using RevUp.ai (&quot;the Service&quot;), you agree
            to be bound by these Terms of Service (&quot;Terms&quot;). If you
            are using the Service on behalf of an organization, you represent
            and warrant that you have the authority to bind that organization
            to these Terms. If you do not agree to these Terms, do not use the
            Service.
          </p>

          <h2>2. Account Registration</h2>
          <p>
            To use RevUp.ai, you must create an account by providing accurate
            and complete information. You are responsible for:
          </p>
          <ul>
            <li>
              Maintaining the confidentiality of your account credentials
            </li>
            <li>All activities that occur under your account</li>
            <li>
              Notifying us immediately of any unauthorized use of your account
            </li>
            <li>
              Ensuring your account information remains accurate and up to date
            </li>
          </ul>
          <p>
            You must be at least 18 years old to create an account. We reserve
            the right to refuse service, terminate accounts, or remove content
            at our sole discretion.
          </p>

          <h2>3. Acceptable Use</h2>
          <p>You agree not to use RevUp.ai to:</p>
          <ul>
            <li>
              Violate any applicable local, state, national, or international
              law or regulation
            </li>
            <li>
              Post or publish review responses that are defamatory, obscene,
              abusive, or otherwise objectionable
            </li>
            <li>
              Impersonate any person or entity, or falsely state or
              misrepresent your affiliation with a person or entity
            </li>
            <li>
              Attempt to gain unauthorized access to our systems, other users&apos;
              accounts, or third-party services connected through our platform
            </li>
            <li>
              Use automated scripts, bots, or other means to access the
              Service in a manner that exceeds reasonable use
            </li>
            <li>
              Interfere with or disrupt the Service or servers or networks
              connected to the Service
            </li>
            <li>
              Reverse engineer, decompile, or disassemble any aspect of the
              Service
            </li>
          </ul>

          <h2>4. Subscription &amp; Billing</h2>
          <p>
            RevUp.ai offers subscription-based plans billed monthly or
            annually. By subscribing, you agree to the following:
          </p>
          <ul>
            <li>
              <strong>Free Trial:</strong> New accounts receive a 14-day free
              trial with full access to features. No credit card is required to
              start a trial.
            </li>
            <li>
              <strong>Billing:</strong> Subscriptions are billed in advance on
              a recurring basis (monthly or annually). Prices are in USD unless
              otherwise stated.
            </li>
            <li>
              <strong>Plan Changes:</strong> You may upgrade or downgrade your
              plan at any time. Upgrades take effect immediately with prorated
              billing. Downgrades take effect at the start of the next billing
              cycle.
            </li>
            <li>
              <strong>Cancellation:</strong> You may cancel your subscription
              at any time from your dashboard. Cancellation takes effect at the
              end of the current billing period. No partial refunds are issued
              for unused time within a billing period.
            </li>
            <li>
              <strong>Refunds:</strong> We offer a 30-day money-back guarantee
              for new subscribers. After 30 days, all payments are
              non-refundable except as required by law.
            </li>
            <li>
              <strong>Price Changes:</strong> We may adjust pricing with at
              least 30 days&apos; notice. Existing subscribers will be notified by
              email before any price increase takes effect.
            </li>
          </ul>

          <h2>5. Intellectual Property</h2>
          <p>
            <strong>Our IP:</strong> RevUp.ai, including its software, design,
            branding, documentation, and all related intellectual property, is
            owned by RevUp.ai and protected by copyright, trademark, and other
            intellectual property laws. You may not copy, modify, distribute,
            or create derivative works based on our Service without prior
            written consent.
          </p>
          <p>
            <strong>Your Content:</strong> You retain ownership of all content
            you submit to the Service, including your review responses, brand
            voice configurations, and business data. By using the Service, you
            grant us a limited, non-exclusive license to process your content
            solely for the purpose of providing the Service.
          </p>
          <p>
            <strong>AI-Generated Content:</strong> Responses generated by our
            AI are provided for your use. Once you publish or download an
            AI-generated response, you may use it freely. We do not claim
            ownership of AI-generated responses.
          </p>

          <h2>6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law:
          </p>
          <ul>
            <li>
              RevUp.ai is provided &quot;as is&quot; and &quot;as available&quot;
              without warranties of any kind, express or implied, including but
              not limited to implied warranties of merchantability, fitness for
              a particular purpose, and non-infringement.
            </li>
            <li>
              We do not guarantee that AI-generated responses will be accurate,
              appropriate, or error-free. You are solely responsible for
              reviewing and approving all responses before publication.
            </li>
            <li>
              In no event shall RevUp.ai, its officers, directors, employees,
              or agents be liable for any indirect, incidental, special,
              consequential, or punitive damages, including loss of profits,
              data, or business opportunities, arising from your use of the
              Service.
            </li>
            <li>
              Our total cumulative liability to you shall not exceed the
              amounts you have paid to us in the twelve (12) months preceding
              the claim.
            </li>
          </ul>

          <h2>7. Termination</h2>
          <p>
            We may suspend or terminate your access to the Service immediately,
            without prior notice, if:
          </p>
          <ul>
            <li>You breach any provision of these Terms</li>
            <li>
              Your use of the Service poses a security risk or may cause harm
              to other users
            </li>
            <li>
              We are required to do so by law or a valid legal process
            </li>
            <li>
              Your account has been inactive for more than 12 consecutive
              months
            </li>
          </ul>
          <p>
            Upon termination, your right to use the Service ceases immediately.
            We will retain your data for 30 days after termination, during
            which you may request an export. After 30 days, your data will be
            permanently deleted.
          </p>

          <h2>8. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with
            the laws of the State of California, United States, without regard
            to its conflict of law provisions. Any disputes arising under these
            Terms shall be resolved exclusively in the state or federal courts
            located in San Francisco County, California.
          </p>
          <p>
            Any claim or cause of action arising out of or related to use of
            the Service must be filed within one (1) year after such claim or
            cause of action arose, or it shall be forever barred.
          </p>

          <h2>Contact</h2>
          <p>
            If you have questions about these Terms of Service, please contact
            us:
          </p>
          <ul>
            <li>
              Email: <a href="mailto:legal@revup.ai">legal@revup.ai</a>
            </li>
            <li>
              General support:{" "}
              <a href="mailto:support@revup.ai">support@revup.ai</a>
            </li>
          </ul>
          <p>
            We may update these Terms from time to time. We will notify you of
            material changes by email or through our platform at least 30 days
            before they take effect. Your continued use of the Service after
            changes become effective constitutes acceptance of the revised
            Terms.
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}
