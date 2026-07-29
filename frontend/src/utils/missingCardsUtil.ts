import cardData from "@/data/cards.json";
import type { DeckInnerData } from "@/types/deck";

type CardEntry = (typeof cardData)[number];

export interface MissingCardEntry {
  cardId: string;
  name: string;
  owned: number;
  needed: number;
}

/** Tallies how many of each card the deck needs vs. how many the user owns, across every zone. */
export function computeMissingCards(
  deck: DeckInnerData,
  ownedCount: (cardId: string) => number
): MissingCardEntry[] {
  const needed: Record<string, number> = {};

  const addNeed = (cardId?: string, count = 1) => {
    if (!cardId) return;
    needed[cardId] = (needed[cardId] ?? 0) + count;
  };

  addNeed(deck.Legend);
  addNeed(deck.ChosenChampion);
  (deck.Battlefields ?? []).forEach((id) => addNeed(id));
  Object.entries(deck.Main ?? {}).forEach(([id, count]) => addNeed(id, count));
  Object.entries(deck.Side ?? {}).forEach(([id, count]) => addNeed(id, count));
  Object.entries(deck.Runes ?? {}).forEach(([id, count]) => addNeed(id, count));

  const cardLookup: Record<string, CardEntry> = {};
  for (const c of cardData) cardLookup[c.cardId] = c;

  const missing: MissingCardEntry[] = [];
  for (const [cardId, need] of Object.entries(needed)) {
    const owned = Math.min(ownedCount(cardId), need);
    if (owned < need) {
      missing.push({ cardId, name: cardLookup[cardId]?.name ?? cardId, owned, needed: need });
    }
  }

  return missing.sort((a, b) => a.name.localeCompare(b.name));
}

/** Formats missing cards as "{count}x Name" lines (count = copies still needed), one per card. */
export function formatMissingCardsList(missing: MissingCardEntry[]): string {
  return missing.map((m) => `${m.needed - m.owned}x ${m.name}`).join("\n");
}
