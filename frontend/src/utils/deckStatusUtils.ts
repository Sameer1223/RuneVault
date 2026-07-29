import type { DeckInnerData } from "@/types/deck";
import { bannedCardIds } from "@/data/bannedCards";

const DECK_REQUIREMENTS = {
  main: 40,
  legend: 1,
  chosenChampion: 1,
  battlefields: 3,
  runes: 12,
};

function sumCounts(section?: Record<string, number>): number {
  return Object.values(section ?? {}).reduce((sum, n) => sum + n, 0);
}

/**
 * True if the deck meets every deck-building requirement (40 main, legend, champion,
 * 3 battlefields, 12 runes). The sideboard is exempt - it's the one section allowed
 * to be short of its 10-card cap without the deck counting as incomplete.
 */
export function isDeckComplete(deckData?: DeckInnerData): boolean {
  if (!deckData) return false;
  const mainCount = sumCounts(deckData.Main) + (deckData.ChosenChampion ? 1 : 0);
  return (
    mainCount === DECK_REQUIREMENTS.main &&
    (deckData.Legend ? 1 : 0) === DECK_REQUIREMENTS.legend &&
    (deckData.ChosenChampion ? 1 : 0) === DECK_REQUIREMENTS.chosenChampion &&
    (deckData.Battlefields?.length ?? 0) === DECK_REQUIREMENTS.battlefields &&
    sumCounts(deckData.Runes) === DECK_REQUIREMENTS.runes
  );
}

/** Returns the cardIds in this deck that are on the banned list. */
export function getBannedCardsInDeck(deckData?: DeckInnerData): string[] {
  if (!deckData) return [];
  const allIds = [
    deckData.Legend,
    deckData.ChosenChampion,
    ...Object.keys(deckData.Main ?? {}),
    ...Object.keys(deckData.Side ?? {}),
    ...Object.keys(deckData.Runes ?? {}),
    ...(deckData.Battlefields ?? []),
  ].filter(Boolean);
  return allIds.filter((id) => bannedCardIds.includes(id));
}

/** True if the deck contains at least one banned card. */
export function isDeckIllegal(deckData?: DeckInnerData): boolean {
  return getBannedCardsInDeck(deckData).length > 0;
}
