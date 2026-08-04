import type { LucideIcon } from "lucide-react";
import { Check, X, ChevronUp, ChevronDown, Contrast, Minus } from "lucide-react";

export const GUESS_GRID_TEMPLATE =
  "64px minmax(260px,2fr) minmax(72px,0.75fr) minmax(72px,0.75fr) minmax(72px,0.75fr) minmax(118px,0.95fr) minmax(105px,0.95fr) minmax(120px,1fr) minmax(130px,1.1fr)";

export type StatusKey = "correct" | "higher" | "lower" | "incorrect" | "partial" | "unknown";

export type StatusMeta = {
  badge: string;
  text: string;
  Icon: LucideIcon;
};

/**
 * Shared status vocabulary. Both the guess grid and the on-page legend render
 * from this, so the icon set can't drift out of sync between the two.
 */
export const STATUS: Record<StatusKey, StatusMeta> = {
  correct: { badge: "bg-emerald-500/15 ring-1 ring-emerald-400/30", text: "text-emerald-300", Icon: Check },
  higher: { badge: "bg-sky-500/15 ring-1 ring-sky-400/30", text: "text-sky-300", Icon: ChevronUp },
  lower: { badge: "bg-sky-500/15 ring-1 ring-sky-400/30", text: "text-sky-300", Icon: ChevronDown },
  incorrect: { badge: "bg-red-500/15 ring-1 ring-red-400/30", text: "text-red-300", Icon: X },
  partial: { badge: "bg-[#caa368]/15 ring-1 ring-[#caa368]/40", text: "text-[#caa368]", Icon: Contrast },
  unknown: { badge: "bg-zinc-700/30 ring-1 ring-zinc-600/40", text: "text-zinc-500", Icon: Minus },
};
