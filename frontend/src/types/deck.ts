export interface DeckData {
    deckId: number;
    userId: number;
    name: string;
    lastUpdated: string;
    format: string;
    Legend: string;
    Battlefields: string[];
    Main: Record<string, number>;
    Side: Record<string, number>;
    Runes: Record<string, number>;
}
  