import MainDeck from "../components/deckbuilder/MainDeck";
import SideDeck from "../components/deckbuilder/SideDeck";
import RunesDeck from "../components/deckbuilder/RunesDeck";
import DeckRequirements from "../components/deckbuilder/DeckRequirements";
import OptionsPanel from "../components/deckbuilder/OptionsPanel";
import SearchPanel from "../components/deckbuilder/SearchPanel";
import CardSearchPanel from "../components/deckbuilder/CardSearchPanel";
import { useEffect, useState } from "react";

export default function DeckBuilder() {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div className="h-[calc(100vh-4rem)] mt-16 flex flex-col bg-[#121212] text-white gap-3 px-6 py-4">
            <div className="py-1 text-3xl font-semibold">Deck Builder Title</div>

            <div id="Deck-Builder" className="flex flex-1 gap-3 min-h-0 relative">
                <div id="Cards-Panel" className="flex flex-col flex-[3] gap-3 min-h-0">
                    <div id="Main-Deck" className="bg-[#1E1E1E] flex-[16] min-h-0 overflow-hidden relative">
                        <MainDeck 
                            legend={""}
                            battlefields={[]}
                            chosenChampion={""}
                            main={{"OGN-213": 1}}
                            onHoverCard={(cardId) => setHoveredCard(cardId)}
                            onLeaveCard={() => setHoveredCard(null)}
                        />

                        {hoveredCard && (
                            <div
                                className="fixed z-50 pointer-events-none"
                                style={{
                                    left: mousePos.x + 15,  // small offset so it’s not directly under the cursor
                                    top: mousePos.y + 15,
                                }}
                            >
                                <img
                                    src={`/TempCards/${hoveredCard}.webp`}
                                    alt={hoveredCard}
                                    className="h-[400px] w-auto object-cover rounded-lg shadow-2xl"
                                />
                            </div>
                        )}
                    </div>

                    <div id="Side-Deck-Stats" className="flex flex-[4] gap-3 min-h-0">
                        <div id="Side-Deck" className="bg-[#1E1E1E] p-2 overflow-auto"><SideDeck /></div>
                        <div id="Runes-Deck" className="bg-[#1E1E1E] p-2 overflow-auto"><RunesDeck /></div>
                        <div id="Deck-Stats" className="bg-[#1E1E1E] flex-[2] p-2"><DeckRequirements /></div>
                    </div>

                    <div id="Options-Panel" className="bg-[#121212] flex-[1] p-3"><OptionsPanel /></div>
                </div>

                <div id="Search-Panel" className="flex flex-col flex-[1.3] gap-3 min-h-0">
                    <div id="Filters" className="bg-[#1E1E1E] flex-[1] p-3"><SearchPanel /></div>
                    <div id="Card-List" className="flex-[2] bg-stone-900 p-2 overflow-y-auto scroll-inside"><CardSearchPanel /></div>
                </div>
            </div>
        </div>
    );
}
