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
    user_id: localStorage.getItem('userId'),
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