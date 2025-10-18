import MainDeck from "../components/deckbuilder/MainDeck";
import SideDeck from "../components/deckbuilder/SideDeck";
import RunesDeck from "../components/deckbuilder/RunesDeck";
import DeckRequirements from "../components/deckbuilder/DeckRequirements";
import OptionsPanel from "../components/deckbuilder/OptionsPanel";
import SearchPanel from "../components/deckbuilder/SearchPanel";
import CardSearchPanel from "../components/deckbuilder/CardSearchPanel";
import { Button } from "../components/ui/button";

import { useEffect, useState } from "react";

export default function DeckViewer() {
    const [deck, setDeck] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    
    // Fetch deck list
    useEffect(() => {
        fetch("/test_deck.json")
            .then((res) => res.json())
            .then((data) => setDeck(data))
            .catch((err) => console.error("Error fetching deck data:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-white p-4">Loading deck...</div>;
    if (!deck) return <div className="text-white p-4">No deck data found.</div>;

    return (
        <div className="h-[calc(100vh-4rem)] mt-16 flex flex-col bg-[#121212] text-white gap-3 px-6 py-4">
            <div className="py-1 text-3xl font-semibold">Deck Title</div>

            <div id="Deck-Builder" className="flex flex-1 gap-3 min-h-0">
                <div id="Cards-Panel" className="flex flex-col flex-[3] gap-3 min-h-0">
                    <div id="Main-Deck" className="bg-[#1E1E1E] flex-[16] min-h-0 overflow-hidden">
                        <MainDeck 
                            legend={deck.Legend} 
                            battlefields={deck.Battlefields} 
                            chosenChampion={deck.ChosenChampion} 
                            main={deck.Main}
                            onHoverCard={setHoveredCard}
                            onLeaveCard={() => {}}
                        />
                    </div>

                    <div id="Side-Deck-Stats" className="flex flex-[4] gap-3 min-h-0">
                        <div id="Side-Deck" className="bg-[#1E1E1E] p-2 overflow-auto">
                            <SideDeck side={deck.Side} onHoverCard={setHoveredCard} onLeaveCard={() => {}}/>
                        </div>
                        <div id="Runes-Deck" className="bg-[#1E1E1E] p-2 overflow-auto">
                            <RunesDeck runes={deck.Runes}/>
                        </div>
                    </div>

                    <div id="Options-Panel" className="bg-[#121212] flex-[1] p-3">
                        <div className="flex gap-5">
                            <Button>Edit</Button>
                            <Button>Export</Button>
                            <Button>Copy Link</Button>
                            <Button>Delete</Button>
                        </div>
                    </div>
                </div>

                <div id="Card Viewer" className="flex flex-col flex-[1.3] items-center gap-3 min-h-0">
                    <div className="flex items-center justify-center w-[70%] aspect-[1/1.4] bg-zinc-900 rounded-lg shadow-lg">
                        {hoveredCard ? (
                            <img
                                src={`TempCards/${hoveredCard}.webp`}
                                alt={hoveredCard}
                                className="w-full h-full object-cover rounded-lg"
                            />
                        ) : (
                            <div className="text-zinc-500 text-sm">Hover over a card to preview</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
