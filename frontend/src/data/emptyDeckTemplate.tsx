export type { DeckInnerData as DeckData } from "@/types/deck";
export type { FullDeck } from "@/types/deck";

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