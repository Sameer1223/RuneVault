import MainDeck from "../components/deckbuilder/MainDeck";
import SideDeck from "../components/deckbuilder/SideDeck";
import RunesDeck from "../components/deckbuilder/RunesDeck";
import { Button } from "../components/ui/button";
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { FullDeck } from "@/types/deck";
import CardImage from "@/components/CardImage";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/lib/constants";

export default function DeckViewer() {
    const location = useLocation();
    const { deckId } = useParams();

    const [deck, setDeck] = useState<FullDeck | null>(null);
    const [loading, setLoading] = useState(true);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [notification, setNotification] = useState<string | null>(null);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    useEffect(() => {
        const incomingDeck = location.state?.deck as FullDeck;
    
        if (incomingDeck) {
          setDeck(incomingDeck);
          setLoading(false);
        } else if (deckId) {
          // Fetch deck from backend if not passed in state
          fetch(`${API_BASE_URL}/api/decks/${deckId}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    console.error(data.error);
                } else {
                    setDeck(data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
        } else {
          setLoading(false);
        }
      }, [location.state, deckId]);

    const handleCopyLink = () => {
        if (deck) {
            const link = `${window.location.origin}/deckviewer/${deck.id}`;
            navigator.clipboard.writeText(link);
            setNotification("Link copied to clipboard!");
        }
    };
      
    if (loading) return <div className="text-white p-4">Loading deck...</div>;
    if (!deck) return <div className="text-white p-4">No deck data found.</div>;

    return (
        <div className="h-[calc(100vh-4rem)] mt-16 flex flex-col bg-[#121212] text-white gap-3 px-6 py-4">
            <div className="py-1 text-3xl font-semibold">{deck.name}</div>

            <div id="Deck-Builder" className="flex flex-1 gap-3 min-h-0">
                <div id="Cards-Panel" className="flex flex-col flex-[3] gap-3 min-h-0">
                    <div id="Main-Deck" className="bg-[#1E1E1E] flex-[16] min-h-0 overflow-hidden">
                        <MainDeck 
                            legend={deck.deck_data.Legend} 
                            battlefields={deck.deck_data.Battlefields} 
                            chosenChampion={deck.deck_data.ChosenChampion} 
                            main={deck.deck_data.Main}
                            onHoverCard={setHoveredCard}
                            onLeaveCard={() => {}}
                        />
                    </div>

                    <div id="Side-Deck-Stats" className="flex flex-[4] gap-3 min-h-0">
                        <div id="Side-Deck" className="bg-[#1E1E1E] p-2 overflow-auto">
                            <SideDeck side={deck.deck_data.Side} onHoverCard={setHoveredCard} onLeaveCard={() => {}}/>
                        </div>
                        <div id="Runes-Deck" className="bg-[#1E1E1E] p-2 overflow-auto">
                            <RunesDeck runes={deck.deck_data.Runes}/>
                        </div>
                    </div>

                    <div id="Options-Panel" className="bg-[#121212] flex-[1] p-3">
                        <div className="flex gap-5">
                            <Button>Edit</Button>
                            <Button>Export</Button>
                            <Button onClick={handleCopyLink}>Copy Link</Button>
                            <Button>Delete</Button>
                        </div>
                    </div>
                </div>

                <div id="Card Viewer" className="flex flex-col flex-[1.3] items-center gap-3 min-h-0">
                    <div className="flex items-center justify-center w-[70%] aspect-[1/1.4] bg-zinc-900 rounded-lg shadow-lg">
                        {hoveredCard ? (
                            <CardImage
                                cardId={hoveredCard}
                                className="w-full h-full object-cover rounded-lg"
                            />
                        ) : (
                            <div className="text-zinc-500 text-sm">Hover over a card to preview</div>
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 20, x: "-50%" }}
                        className="fixed bottom-10 left-1/2 z-[100] bg-white text-black px-6 py-3 rounded-full shadow-2xl font-medium"
                    >
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
