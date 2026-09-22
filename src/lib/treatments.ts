import type { ConcernKey } from "./concerns";

/**
 * starter treatment library for v1.
 * real catalogue lives in supabase long term; this seeds the recommendations ui.
 * booking is external only (concierge model): booking_url points at a clinic page.
 */

export type BudgetTier = "under_200" | "200_500" | "500_plus";
export type Downtime = "none" | "minimal" | "days";

export interface Treatment {
  slug: string;
  name: string;
  category: string;
  targets: ConcernKey[];
  price_from: number;
  price_to: number;
  budget: BudgetTier;
  downtime: Downtime;
  downtime_label: string;
  needles: boolean;
  sessions: string;
  description: string;
  booking_url: string;
}

export const TREATMENTS: Treatment[] = [
  {
    slug: "hydrafacial",
    name: "hydrafacial",
    category: "facial",
    targets: ["pores", "texture", "oiliness", "hydration", "radiance"],
    price_from: 175,
    price_to: 250,
    budget: "under_200",
    downtime: "none",
    downtime_label: "no downtime",
    needles: false,
    sessions: "monthly for maintenance",
    description: "a deep cleanse, exfoliation and hydration infusion in one visit. great first treatment.",
    booking_url: "https://treatmeapp.com/book",
  },
  {
    slug: "chemical-peel-light",
    name: "light chemical peel",
    category: "facial",
    targets: ["pigmentation", "texture", "uniformness", "radiance", "breakouts"],
    price_from: 150,
    price_to: 300,
    budget: "200_500",
    downtime: "minimal",
    downtime_label: "1 to 2 days of light flaking",
    needles: false,
    sessions: "series of 3 to 4, spaced 2 to 4 weeks",
    description: "a gentle acid exfoliation that lifts dullness and evens tone over a series.",
    booking_url: "https://treatmeapp.com/book",
  },
  {
    slug: "microneedling",
    name: "microneedling",
    category: "collagen",
    targets: ["texture", "pores", "lines", "firmness", "pigmentation"],
    price_from: 300,
    price_to: 500,
    budget: "200_500",
    downtime: "days",
    downtime_label: "2 to 3 days of redness",
    needles: true,
    sessions: "3 sessions, 4 to 6 weeks apart",
    description: "tiny micro-injuries trigger your own collagen. the workhorse for texture and fine lines.",
    booking_url: "https://treatmeapp.com/book",
  },
  {
    slug: "skin-booster",
    name: "skin booster",
    category: "injectable",
    targets: ["hydration", "radiance", "texture", "firmness"],
    price_from: 400,
    price_to: 650,
    budget: "500_plus",
    downtime: "minimal",
    downtime_label: "small bumps for a day or two",
    needles: true,
    sessions: "2 to 3 sessions, then yearly",
    description: "micro-droplets of hydrating filler placed just under the skin for deep glow.",
    booking_url: "https://treatmeapp.com/book",
  },
  {
    slug: "botox",
    name: "botox",
    category: "injectable",
    targets: ["lines", "eyelid_heaviness"],
    price_from: 250,
    price_to: 600,
    budget: "200_500",
    downtime: "none",
    downtime_label: "no downtime",
    needles: true,
    sessions: "every 3 to 4 months",
    description: "relaxes the muscles that etch expression lines. results in about two weeks.",
    booking_url: "https://treatmeapp.com/book",
  },
  {
    slug: "ipl",
    name: "ipl photofacial",
    category: "laser",
    targets: ["redness", "pigmentation", "uniformness"],
    price_from: 300,
    price_to: 500,
    budget: "200_500",
    downtime: "minimal",
    downtime_label: "spots darken then flake, about a week",
    needles: false,
    sessions: "3 to 5 sessions",
    description: "light energy that clears redness and brown spots at the same time.",
    booking_url: "https://treatmeapp.com/book",
  },
  {
    slug: "fractional-laser",
    name: "fractional laser",
    category: "laser",
    targets: ["texture", "lines", "pigmentation", "firmness", "pores"],
    price_from: 600,
    price_to: 1200,
    budget: "500_plus",
    downtime: "days",
    downtime_label: "3 to 5 days of redness and peeling",
    needles: false,
    sessions: "1 to 3 sessions per year",
    description: "the heavy hitter for resurfacing. real downtime, real results.",
    booking_url: "https://treatmeapp.com/book",
  },
  {
    slug: "led-therapy",
    name: "led light therapy",
    category: "facial",
    targets: ["redness", "breakouts", "radiance", "hydration"],
    price_from: 75,
    price_to: 150,
    budget: "under_200",
    downtime: "none",
    downtime_label: "no downtime",
    needles: false,
    sessions: "weekly for a month, then monthly",
    description: "calming light that soothes redness and supports healing. zero commitment.",
    booking_url: "https://treatmeapp.com/book",
  },
  {
    slug: "dermaplaning",
    name: "dermaplaning",
    category: "facial",
    targets: ["texture", "radiance", "uniformness"],
    price_from: 100,
    price_to: 175,
    budget: "under_200",
    downtime: "none",
    downtime_label: "no downtime",
    needles: false,
    sessions: "monthly",
    description: "removes peach fuzz and dead skin for instant smoothness and glow.",
    booking_url: "https://treatmeapp.com/book",
  },
  {
    slug: "under-eye-filler",
    name: "under-eye filler",
    category: "injectable",
    targets: ["tear_trough", "dark_circles", "under_eye_puffiness"],
    price_from: 600,
    price_to: 900,
    budget: "500_plus",
    downtime: "minimal",
    downtime_label: "possible bruising for a few days",
    needles: true,
    sessions: "once, lasts 9 to 12 months",
    description: "softens the hollow groove under the eyes. needs an experienced injector.",
    booking_url: "https://treatmeapp.com/book",
  },
  {
    slug: "radiofrequency",
    name: "radiofrequency tightening",
    category: "collagen",
    targets: ["firmness", "volume_loss", "lines", "eyelid_heaviness"],
    price_from: 400,
    price_to: 800,
    budget: "500_plus",
    downtime: "none",
    downtime_label: "no downtime",
    needles: false,
    sessions: "4 to 6 sessions",
    description: "heat energy that tightens skin gradually. no needles, no downtime.",
    booking_url: "https://treatmeapp.com/book",
  },
  {
    slug: "acne-facial",
    name: "clinical acne facial",
    category: "facial",
    targets: ["breakouts", "oiliness", "pores", "redness"],
    price_from: 150,
    price_to: 225,
    budget: "under_200",
    downtime: "minimal",
    downtime_label: "mild redness for a day",
    needles: false,
    sessions: "every 2 to 4 weeks until clear",
    description: "extractions plus calming care, built for congested and breakout-prone skin.",
    booking_url: "https://treatmeapp.com/book",
  },
];

export interface MatchFilters {
  budget: BudgetTier | "any";
  downtime: Downtime | "any";
  noNeedles: boolean;
  priorities: ConcernKey[];
}

export interface MatchedTreatment extends Treatment {
  matchScore: number;
  why: string;
}

export function matchTreatments(filters: MatchFilters): MatchedTreatment[] {
  return TREATMENTS.map((t) => {
    if (filters.noNeedles && t.needles) return null;
    if (filters.budget !== "any" && t.budget !== filters.budget) return null;
    if (filters.downtime !== "any" && t.downtime !== filters.downtime) return null;

    const overlap = t.targets.filter((c) => filters.priorities.includes(c));
    const matchScore = overlap.length;
    if (matchScore === 0) return null;

    const names = overlap
      .map((c) => c.replace(/_/g, " "))
      .join(", ");
    const why =
      overlap.length === 1
        ? `targets your priority: ${names}.`
        : `targets ${overlap.length} of your priorities: ${names}.`;

    return { ...t, matchScore, why };
  })
    .filter((t): t is MatchedTreatment => t !== null)
    .sort((a, b) => b.matchScore - a.matchScore || a.price_from - b.price_from);
}

export const BUDGET_LABELS: Record<BudgetTier | "any", string> = {
  any: "any budget",
  under_200: "under $200",
  "200_500": "$200 to $500",
  "500_plus": "$500 plus",
};

export const DOWNTIME_LABELS: Record<Downtime | "any", string> = {
  any: "any downtime",
  none: "no downtime",
  minimal: "a day or two",
  days: "a few days is fine",
};
