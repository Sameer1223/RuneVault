export interface DeckData {
    name: string;
    Legend: string;
    ChosenChampion: string;
    Battlefields: string[];
    Main: Record<string, number>;
    Side: Record<string, number>;
    Runes: Record<string, number>;
}

export const emptyDeckTemplate = {
    user_id: parseInt(localStorage.getItem('userId') || '0', 10), // Get from localStorage or fallback to 1
    name: "Untitled Deck",
    deck_data: {
        Legend: "",
        Battlefields: [],
        ChosenChampion: "",
        Main: {},
        Side: {},
        Runes: {},
    },
};