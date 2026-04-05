/** Shape of a single card entry from cards.json */
export interface CardData {
    cardId: string;
    name: string;
    set: string;
    type: string;
    rarity: string;
    energy?: number;
    power?: number;
    might?: number;
    colors?: string[];
}

/** The inner deck data shape (card sections, legend, etc.) */
export interface DeckInnerData {
    Legend: string;
    ChosenChampion: string;
    Battlefields: string[];
    Main: Record<string, number>;
    Side: Record<string, number>;
    Runes: Record<string, number>;
}

/** The full deck object as stored/sent to the API */
export interface FullDeck {
    id?: string | number;
    user_id: string | null;
    name: string;
    deck_data: DeckInnerData;
    lastUpdated?: string;
    [key: string]: unknown;
}

/** Filter state used by the deck list sidebar */
export interface DeckListFilters {
    sortBy: "name" | "date";
    sortOrder: "asc" | "desc";
    showFavourites: boolean;
    selectedColors: string[];
    selectedLegend: string | null;
}
  