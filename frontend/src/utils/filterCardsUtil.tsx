import Fuse from "fuse.js";
import type { CardData } from "@/types/deck";

export interface CardFilters {
    query?: string;
    selectedType?: string | null;
    rarityFilter?: string;
    cardType?: string;
    setFilter?: string;
    energyRange?: [number, number];
    powerRange?: [number, number];
    mightRange?: [number, number];
    colorFilter?: string[] | null;
}

function matchesNonTextFilters(card: CardData, filters: CardFilters): boolean {
    if (filters.cardType && filters.cardType !== "All" && card.type !== filters.cardType)
        return false;

    if (filters.rarityFilter && filters.rarityFilter !== "All") {
        if (filters.rarityFilter === "Alternate Art") {
            if (card.rarity !== "Alternate Art" && card.rarity !== "Overnumbered") {
                return false;
            }
        }
        else if (card.rarity !== filters.rarityFilter) {
            return false;
        }
    }

    if (filters.setFilter && filters.setFilter !== "All" && card.set !== filters.setFilter)
        return false;

    if (filters.colorFilter && filters.colorFilter.length > 0) {
        if (!card.colors || !card.colors.every((c: string) => filters.colorFilter!.includes(c))) {
            return false;
        }
    }


    const isCostFilterChanged =
        filters.energyRange?.[0] !== 0 ||
        filters.energyRange?.[1] !== 12 ||
        filters.powerRange?.[0] !== 0 ||
        filters.powerRange?.[1] !== 4;

    // If cost filters have changed exclude any cards without energy (this means no power as well)
    if (isCostFilterChanged) {
        if (card.energy === undefined ||
            (card.energy !== undefined && (card.energy < (filters.energyRange?.[0] ?? 0) || card.energy > (filters.energyRange?.[1] ?? 12)))) {
            return false;
        }

        if (card.power !== undefined && (card.power < (filters.powerRange?.[0] ?? 0) || card.power > (filters.powerRange?.[1] ?? 4))){
            return false;
        }
    }

    const isMightFilterChanged = filters.mightRange?.[0] !== 0 || filters.mightRange?.[1] !== 10;
    if (isMightFilterChanged)
        if (card.might === undefined ||
            (card.might !== undefined && (card.might < (filters.mightRange?.[0] ?? 0) || card.might > (filters.mightRange?.[1] ?? 10)))) {
            return false;
        }

    // Handle type toggle (Legends/Battlefields/Cards/Runes)
    if (filters.selectedType) {
        const type = filters.selectedType.toLowerCase();
        if (type === "legends" && card.type !== "Legend") return false;
        if (type === "battlefields" && card.type !== "Battlefield") return false;
        if (type === "runes" && card.type !== "Rune") return false;
        if (type === "cards" && ["Legend", "Battlefield", "Rune"].includes(card.type)) return false;
    }

    return true;
}

export function filterCards(cardData: CardData[], filters: CardFilters) {
    const nonTextFiltered = cardData.filter((card) => matchesNonTextFilters(card, filters));

    const q = filters.query?.trim();
    if (!q) return nonTextFiltered;

    const lowerQ = q.toLowerCase();
    const exactMatches = nonTextFiltered.filter(
        (card) => card.name.toLowerCase().includes(lowerQ) || card.cardId.toLowerCase().includes(lowerQ)
    );
    if (exactMatches.length > 0) return exactMatches;

    // No exact substring match - fall back to fuzzy matching so small typos
    // or spacing mistakes (e.g. "kaisa" or "kai sa") still find "Kai'Sa").
    const fuse = new Fuse(nonTextFiltered, { keys: ["name", "cardId"], threshold: 0.35, ignoreLocation: true });
    return fuse.search(q).map((result) => result.item);
}
