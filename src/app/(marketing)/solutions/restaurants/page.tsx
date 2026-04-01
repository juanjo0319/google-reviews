import type { Metadata } from "next";
import {
  SolutionPage,
  type SolutionData,
} from "@/components/templates/SolutionPage";
import { Clock, MessageSquare, TrendingDown } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Review Management for Restaurants",
  description:
    "Respond to every Google review in seconds with AI that understands the restaurant industry. Save hours each week while boosting your star rating and driving more reservations.",
  alternates: { canonical: "/solutions/restaurants" },
};

const DATA: SolutionData = {
  industry: "Restaurants",
  heroTitle: "AI Review Management Built for Restaurants",
  heroDescription:
    "Your kitchen runs on tight margins and tighter schedules. RevUp.ai crafts personalized, on-brand responses to every review so your team can focus on the food while your online reputation drives more covers through the door.",
  painPoints: [
    {
      title: "Overwhelming Review Volume",
      description:
        "Between Google, Yelp, and delivery apps, a busy restaurant can receive dozens of reviews every week. Keeping up with thoughtful responses is nearly impossible when you're running a dinner rush.",
      icon: MessageSquare,
    },
    {
      title: "Time-Starved Staff",
      description:
        "Managers and owners are already juggling inventory, scheduling, and service. Sitting down to write individual review responses falls to the bottom of the to-do list every single day.",
      icon: Clock,
    },
    {
      title: "Negative Reviews Tank Reservations",
      description:
        "A single unanswered one-star review about a bad dish or slow service can scare off hundreds of potential diners. The longer it sits without a response, the more damage it does to your bottom line.",
      icon: TrendingDown,
    },
  ],
  features: [
    {
      title: "Menu-Aware AI Responses",
      description:
        "RevUp.ai learns your menu, cuisine style, and brand voice to craft responses that reference specific dishes, ingredients, and dining experiences by name.",
      relevance:
        "Guests feel heard when you mention their exact order in your reply.",
    },
    {
      title: "Instant Response Drafts",
      description:
        "Every new review triggers an AI-generated response within seconds. Approve it as-is or tweak it before publishing — either way, no review goes unanswered.",
      relevance:
        "Restaurants that respond within 24 hours see significantly higher return visit rates.",
    },
    {
      title: "Sentiment-Driven Escalation",
      description:
        "The AI detects food safety complaints, allergy mentions, and health-code concerns and flags them for immediate manager attention instead of auto-responding.",
      relevance:
        "Critical issues get human attention fast, protecting your diners and your reputation.",
    },
    {
      title: "Multi-Platform Coverage",
      description:
        "Manage Google, Yelp, and TripAdvisor reviews from a single dashboard without switching between tabs or apps.",
      relevance:
        "One place to monitor your entire online presence across every platform diners use.",
    },
  ],
  exampleReview: {
    stars: 2,
    text: "We ordered the lobster ravioli and it was overcooked and bland. For $28 a plate, I expected a lot more. The server was nice but the food was a real letdown. Won't be coming back.",
    response:
      "Thank you for taking the time to share your experience. We're sorry the lobster ravioli didn't meet your expectations — that dish is one of our chef's favorites and we hold it to a high standard. We've shared your feedback directly with our kitchen team so they can address the preparation. We'd love the chance to make it right. Please reach out to us at hello@example.com and your next lobster ravioli is on us.",
  },
  stats: [
    { value: "94%", label: "Of diners choose restaurants based on reviews" },
    {
      value: "25%",
      label: "More revenue for restaurants with 4+ star ratings",
    },
    { value: "3 hrs", label: "Saved per week on review management" },
    { value: "4.6x", label: "More likely to get a return visit with a reply" },
  ],
  testimonial: {
    quote:
      "We went from answering maybe one in five reviews to responding to every single one — within hours, not days. Our Google rating climbed from 4.1 to 4.5 in three months and reservations are up across the board.",
    name: "Marco Pellegrini",
    role: "Owner & Executive Chef",
    company: "Trattoria Bella Sera",
  },
  ctaText: "Start Turning Reviews into Reservations",
};

export default function RestaurantsPage() {
  return <SolutionPage data={DATA} />;
}
