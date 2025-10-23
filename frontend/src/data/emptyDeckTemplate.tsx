export interface DeckData {
    name: string;
    Legend: string;
    ChosenChampion: string;
    Battlefields: string[];
    Main: Record<string, number>;
    Side: Record<string, number>;
    Runes: Record<string, number>;
}

export const emptyDeckTemplate: DeckData = {
    name: "Untitled Deck",
    Legend: "",
    ChosenChampion: "",
    Battlefields: [],
    Main: {},
    Side: {},
    Runes: {},
};