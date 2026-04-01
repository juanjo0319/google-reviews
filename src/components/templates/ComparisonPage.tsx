import { CheckCircle2, XCircle, ArrowRight, Star } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/motion";
import Link from "next/link";

type ComparisonFeature = {
  feature: string;
  revup: string | boolean;
  competitor: string | boolean;
  category: string;
};

type ProsCons = {
  pros: string[];
  cons: string[];
};

export type ComparisonData = {
  competitorName: string;
  heroTitle: string;
  tldr: string;
  comparisonTable: ComparisonFeature[];
  prosConsRevup: ProsCons;
  prosConsCompetitor: ProsCons;
  pricingComparison: { revup: string; competitor: string; verdict: string };
  verdict: string;
  relatedComparisons: { label: string; href: string }[];
};

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <CheckCircle2 className="h-5 w-5 text-success mx-auto" />
    ) : (
      <XCircle className="h-5 w-5 text-neutral-300 mx-auto" />
    );
  }
  return <span className="text-sm text-neutral-700">{value}</span>;
}

export function ComparisonPage({ data }: { data: ComparisonData }) {
  const categories = [
    ...new Set(data.comparisonTable.map((f) => f.category)),
  ];

  return (
    <>
      {/* Hero */}
      <SectionWrapper>
        <div className="pt-12 text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <Star className="h-6 w-6 text-primary" />
              <span className="font-heading text-xl font-bold text-neutral-950">
                RevUp.ai
              </span>
            </div>
            <span className="text-2xl font-bold text-neutral-300">vs</span>
            <span className="font-heading text-xl font-bold text-neutral-500">
              {data.competitorName}
            </span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-neutral-950 mb-4">
            {data.heroTitle}
          </h1>
          <p className="text-sm text-neutral-400">
            Updated April 2026
          </p>
        </div>
      </SectionWrapper>

      {/* TL;DR */}
      <SectionWrapper background="muted">
        <FadeIn>
          <div className="max-w-3xl mx-auto bg-primary/5 border border-primary/10 rounded-2xl p-8">
            <h2 className="font-heading text-lg font-bold text-primary mb-2">
              TL;DR
            </h2>
            <p className="text-neutral-700 leading-relaxed">{data.tldr}</p>
          </div>
        </FadeIn>
      </SectionWrapper>

      {/* Feature comparison table */}
      <SectionWrapper>
        <h2 className="font-heading text-2xl font-bold text-neutral-950 mb-8 text-center">
          Feature Comparison
        </h2>
        <div className="max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="py-3 pr-4 text-sm font-semibold text-neutral-500">
                  Feature
                </th>
                <th className="py-3 px-4 text-sm font-semibold text-primary text-center">
                  RevUp.ai
                </th>
                <th className="py-3 pl-4 text-sm font-semibold text-neutral-500 text-center">
                  {data.competitorName}
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <Fragment key={cat}>
                  <tr>
                    <td
                      colSpan={3}
                      className="pt-6 pb-2 text-xs font-bold uppercase tracking-wider text-neutral-400"
                    >
                      {cat}
                    </td>
                  </tr>
                  {data.comparisonTable
                    .filter((f) => f.category === cat)
                    .map((f) => (
                      <tr
                        key={f.feature}
                        className="border-b border-neutral-100"
                      >
                        <td className="py-3 pr-4 text-sm text-neutral-700">
                          {f.feature}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Cell value={f.revup} />
                        </td>
                        <td className="py-3 pl-4 text-center">
                          <Cell value={f.competitor} />
                        </td>
                      </tr>
                    ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/* Pricing comparison */}
      <SectionWrapper background="muted">
        <FadeIn>
          <h2 className="font-heading text-2xl font-bold text-neutral-950 mb-8 text-center">
            Pricing
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl p-6 border-2 border-primary shadow-sm">
              <p className="font-heading font-bold text-primary mb-2">
                RevUp.ai
              </p>
              <p className="text-2xl font-bold text-neutral-950">
                {data.pricingComparison.revup}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-neutral-200">
              <p className="font-heading font-bold text-neutral-500 mb-2">
                {data.competitorName}
              </p>
              <p className="text-2xl font-bold text-neutral-950">
                {data.pricingComparison.competitor}
              </p>
            </div>
          </div>
          <p className="text-center text-neutral-600 mt-6 max-w-2xl mx-auto">
            {data.pricingComparison.verdict}
          </p>
        </FadeIn>
      </SectionWrapper>

      {/* Pros & Cons */}
      <SectionWrapper>
        <h2 className="font-heading text-2xl font-bold text-neutral-950 mb-8 text-center">
          Pros & Cons
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            { name: "RevUp.ai", data: data.prosConsRevup, highlight: true },
            {
              name: data.competitorName,
              data: data.prosConsCompetitor,
              highlight: false,
            },
          ].map((side) => (
            <div key={side.name}>
              <h3
                className={`font-heading font-bold text-lg mb-4 ${
                  side.highlight ? "text-primary" : "text-neutral-600"
                }`}
              >
                {side.name}
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-success mb-2">
                    Pros
                  </p>
                  <ul className="space-y-2">
                    {side.data.pros.map((p) => (
                      <li
                        key={p}
                        className="flex items-start gap-2 text-sm text-neutral-700"
                      >
                        <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-danger mb-2">Cons</p>
                  <ul className="space-y-2">
                    {side.data.cons.map((c) => (
                      <li
                        key={c}
                        className="flex items-start gap-2 text-sm text-neutral-700"
                      >
                        <XCircle className="h-4 w-4 text-danger mt-0.5 shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Verdict */}
      <SectionWrapper background="muted">
        <FadeIn>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-2xl font-bold text-neutral-950 mb-4">
              The Verdict
            </h2>
            <p className="text-neutral-600 leading-relaxed mb-8">
              {data.verdict}
            </p>
            <Button href="/signup" size="lg">
              Try RevUp.ai Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </FadeIn>
      </SectionWrapper>

      {/* Related comparisons */}
      {data.relatedComparisons.length > 0 && (
        <SectionWrapper>
          <h3 className="font-heading text-lg font-bold text-neutral-950 mb-6 text-center">
            Other Comparisons
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {data.relatedComparisons.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="text-sm font-medium text-primary bg-primary/5 px-4 py-2 rounded-lg hover:bg-primary/10 transition-colors"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </SectionWrapper>
      )}
    </>
  );
}

// Need Fragment for the table
import { Fragment } from "react";
