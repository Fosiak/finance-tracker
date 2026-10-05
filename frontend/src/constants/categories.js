import {
  Car,
  Film,
  HeartPulse,
  Home,
  MoreHorizontal,
  Repeat,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";

// Single source of truth for the 8 categories the backend accepts
// (Transaction.Category in backend/transactions/models.py). Each entry
// carries both the CSS-variable chart color (for recharts fill/stroke)
// and the matching Tailwind classes for the Pill component, since
// Tailwind needs literal class strings to pick them up at build time.
//
// Note: LandingPage.jsx has its own, separate 4-category demo constant
// (housing/food/transport/leisure) used only for the marketing chart on
// the public landing page - that's intentionally not this list.
// chartColor is a literal hex (not var(--color-cat-*)) on purpose: recharts
// renders fill/stroke as raw SVG presentation attributes, where CSS custom
// property resolution is inconsistent across browsers/versions. The hex
// values below are kept in sync with the --color-cat-* tokens in index.css.
export const CATEGORIES = [
  {
    id: "housing",
    label: "Housing",
    icon: Home,
    chartColor: "#38bdf8",
    pillClass: "border-sky-500/20 bg-sky-500/10 text-sky-300",
  },
  {
    id: "food",
    label: "Food",
    icon: UtensilsCrossed,
    chartColor: "#fb923c",
    pillClass: "border-orange-500/20 bg-orange-500/10 text-orange-300",
  },
  {
    id: "transport",
    label: "Transport",
    icon: Car,
    chartColor: "#6366f1",
    pillClass: "border-indigo-500/20 bg-indigo-500/10 text-indigo-300",
  },
  {
    id: "entertainment",
    label: "Entertainment",
    icon: Film,
    chartColor: "#8b5cf6",
    pillClass: "border-violet-500/20 bg-violet-500/10 text-violet-300",
  },
  {
    id: "shopping",
    label: "Shopping",
    icon: ShoppingBag,
    chartColor: "#f472b6",
    pillClass: "border-pink-500/20 bg-pink-500/10 text-pink-300",
  },
  {
    id: "health",
    label: "Health",
    icon: HeartPulse,
    chartColor: "#2dd4bf",
    pillClass: "border-teal-500/20 bg-teal-500/10 text-teal-300",
  },
  {
    id: "subscriptions",
    label: "Subscriptions",
    icon: Repeat,
    chartColor: "#22d3ee",
    pillClass: "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
  },
  {
    id: "other",
    label: "Other",
    icon: MoreHorizontal,
    chartColor: "#94a3b8",
    pillClass: "border-border-default bg-white/[0.04] text-text-muted",
  },
];

export const CATEGORY_BY_ID = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category]),
);

export function getCategory(id) {
  return CATEGORY_BY_ID[id] ?? CATEGORY_BY_ID.other;
}
