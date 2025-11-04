import cardData from "../data/cards.json";
import EditableDeckTitle from "../components/deckbuilder/EditableDeckTitle";
import MainDeck from "../components/deckbuilder/MainDeck";
import SideDeck from "../components/deckbuilder/SideDeck";
import RunesDeck from "../components/deckbuilder/RunesDeck";
import DeckRequirements from "../components/deckbuilder/DeckRequirements";
import OptionsPanel from "../components/deckbuilder/OptionsPanel";
import SearchPanel from "../components/deckbuilder/SearchPanel";
import CardSearchPanel from "../components/deckbuilder/CardSearchPanel";

import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { DeckData, emptyDeckTemplate } from "../data/emptyDeckTemplate";
import { addCardToDeckUtil, removeCardFromDeckUtil, setDeckNameUtil } from "@/utils/deckBuilderUtils";
import { filterCards, CardFilters } from "@/utils/filterCardsUtil";

export default function DeckBuilder() {
    const location = useLocation();
    const incomingDeck = location.state?.deck;

    const [deck, setDeck] = useState<DeckData>(() => {
        if (incomingDeck) return incomingDeck;
        const saved = localStorage.getItem("deckData");
        return saved ? JSON.parse(saved) : emptyDeckTemplate;
    });

    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [filters, setFilters] = useState<any>({});

    const filteredCards = useMemo(() => filterCards(cardData, filters), [filters]);
    
    const addCardToDeck = (cardId: string) => {
        setDeck(prevDeck => addCardToDeckUtil(prevDeck, cardId));
    };

    const removeCardFromDeck = (cardId: string) => {
        setDeck(prevDeck => removeCardFromDeckUtil(prevDeck, cardId));
        // Clear hover image if this card was being hovered
        setHoveredCard(prev => (prev === cardId ? null : prev));
    };      

    // Hover effect
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    // Save deck in local storage
    useEffect(() => {
        localStorage.setItem("deckData", JSON.stringify(deck));
    }, [deck]);

    // If incomingDeck changes, update state
    useEffect(() => {
        if (incomingDeck) {
            setDeck(incomingDeck);
        }
    }, [incomingDeck]);

    const saveDeck = async () => {
        try {
          console.log("Saving deck:", deck);
      
          const isNew = !deck.id;
          const method = isNew ? "POST" : "PUT";
          const url = `http://127.0.0.1:5000/api/decks/${isNew ? "" : `${deck.id}`}`;
      
          // Ensure timestamp is updated before saving
          const deckToSave = {
            ...deck,
            lastUpdated: new Date().toISOString(),
          };
      
          const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(deckToSave),
          });
      
          if (!response.ok) {
            throw new Error(`Failed to ${isNew ? "create" : "update"} deck`);
          }
      
          const result = await response.json();
          console.log("Server response:", result);
      
          // Update state with returned deck (important for new ones)
          if (isNew && result.id) {
            setDeck(prev => ({
              ...prev,
              id: result.id,
              lastUpdated: result.lastUpdated ?? new Date().toISOString(),
            }));
          }
      
          alert(isNew ? "Deck created successfully!" : "Deck updated successfully!");
        } catch (error) {
          console.error("Error saving deck:", error);
          alert("Failed to save deck. Please try again.");
        }
    };

    const clearDeck = () => {
        setDeck(emptyDeckTemplate);
    };
      
  
    if (!deck.deck_data) {
        // If the deck data is null or undefined, show a loading message
        return <div>Loading deck data...</div>; 
    }

    return (
        <div className="h-[calc(100vh-4rem)] mt-16 flex flex-col bg-[#121418] text-white gap-3 px-6 py-4">
            <EditableDeckTitle
                initialTitle={deck.name || "Untitled Deck"}
                onTitleChange={(newTitle) =>
                    setDeck(prevDeck => setDeckNameUtil(prevDeck, newTitle))
                }
            />

            <div id="Deck-Builder" className="flex flex-1 gap-3 min-h-0 relative">
                <div id="Cards-Panel" className="flex flex-col flex-[3] gap-3 min-h-0">
                    <div id="Main-Deck" className="bg-[#1E1E1E] flex-[16] min-h-0 overflow-hidden relative">
                        <MainDeck 
                            legend={deck.deck_data.Legend}
                            battlefields={deck.deck_data.Battlefields}
                            chosenChampion={deck.deck_data.ChosenChampion}
                            main={deck.deck_data.Main}
                            onHoverCard={(cardId) => setHoveredCard(cardId)}
                            onLeaveCard={() => setHoveredCard(null)}
                            onRemoveCard={removeCardFromDeck}
                        />

                        {hoveredCard && (
                            <div className="fixed z-50 pointer-events-none"
                                style={{
                                    left: mousePos.x + 15,  // small offset so it’s not directly under the cursor
                                    top: mousePos.y + 15,
                                }}
                            >
                                <img
                                    src={`/TempCards/${hoveredCard}.avif`}
                                    alt={hoveredCard}
                                    className="h-[400px] w-auto object-cover rounded-lg shadow-2xl"
                                />
                            </div>
                        )}
                    </div>

                    <div id="Side-Deck-Stats" className="flex flex-[4] gap-3 min-h-0">
                        <div id="Side-Deck" className="bg-[#1E1E1E] p-2 overflow-auto">
                            <SideDeck side={deck.deck_data.Side} onRemoveCard={removeCardFromDeck}/>
                        </div>
                        <div id="Runes-Deck" className="bg-[#1E1E1E] p-2 overflow-auto">
                            <RunesDeck runes={deck.deck_data.Runes} onRemoveCard={removeCardFromDeck}/>
                        </div>
                        <div id="Deck-Stats" className="bg-[#1E1E1E] flex-[2] p-2"><DeckRequirements deck={deck.deck_data}/></div>
                    </div>

                    <div id="Options-Panel" className="bg-[#121212] flex-[1] p-3"><OptionsPanel onSave={saveDeck} onClear={clearDeck}/></div>
                </div>

                <div id="Search-Panel" className="flex flex-col flex-[1.3] gap-3 min-h-0">
                    <div id="Filters" className="bg-[#1E1E1E] flex-[1] p-3">
                        <SearchPanel onFilterChange={setFilters} selectedLegend={deck.deck_data.Legend}/>
                    </div>
                    <div id="Card-List" className="flex-[2] bg-stone-900 p-2 overflow-y-auto scroll-inside">
                        <CardSearchPanel cards={filteredCards} onAddCard={addCardToDeck} onRemoveCard={removeCardFromDeck}/>
                    </div>
                </div>
            </div>
        </div>
    );
}
