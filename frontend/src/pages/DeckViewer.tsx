import MainDeck from "../components/deckbuilder/MainDeck";
import SideDeck from "../components/deckbuilder/SideDeck";
import RunesDeck from "../components/deckbuilder/RunesDeck";
import { Button } from "../components/ui/button";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { FullDeck } from "@/types/deck";
import CardImage from "@/components/CardImage";
import { API_BASE_URL } from "@/lib/constants";
import { useUserId } from "@/hooks/useUserId";
import { useAuthFetch } from "@/hooks/useAuthFetch";

export default function DeckViewer() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const deckId = searchParams.get("id");
    const { userId } = useUserId();
    const authFetch = useAuthFetch();

    const [deck, setDeck] = useState<FullDeck | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        const loadDeck = async () => {
            try {
                setLoading(true);
                setError(null);

                // First check for incoming deck via location state
                const incomingDeck = location.state?.deck as FullDeck;
                if (incomingDeck) {
                    setDeck(incomingDeck);
                    setIsOwner(incomingDeck.user_id === userId);
                    return;
                }

                // Then check for deck ID in query params
                if (deckId) {
                    const response = await fetch(`${API_BASE_URL}/api/decks/${deckId}`);
                    if (!response.ok) {
                        throw new Error("Failed to load deck");
                    }
                    const deckData = await response.json();
                    setDeck(deckData);
                    setIsOwner(deckData.userId === userId);
                    return;
                }

                // No deck found
                setError("No deck data found");
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load deck");
            } finally {
                setLoading(false);
            }
        };

        loadDeck();
    }, [location.state, deckId, userId]);
      
    if (loading) return <div className="text-white p-4">Loading deck...</div>;
    if (error) return <div className="text-red-400 p-4">{error}</div>;
    if (!deck) return <div className="text-white p-4">No deck data found.</div>;

    return (
        <div className="h-[calc(100vh-4rem)] mt-16 flex flex-col bg-[#121212] text-white gap-3 px-6 py-4">
            <div className="py-1 text-3xl font-semibold">{deck.name || "Untitled Deck"}</div>

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
                        {isOwner ? (
                            <div className="flex gap-5">
                                <Button onClick={() => navigate("/deckbuilder", { state: { deck } })}>Edit</Button>
                                <Button>Export</Button>
                                <Button onClick={() => {
                                    const shareUrl = `${window.location.origin}/deckviewer?id=${deck.id}`;
                                    navigator.clipboard.writeText(shareUrl);
                                }}>Copy Link</Button>
                                <Button onClick={async () => {
                                    if (window.confirm("Are you sure you want to delete this deck?")) {
                                        try {
                                            const response = await authFetch(`${API_BASE_URL}/api/decks/${deck.id}`, { method: "DELETE" });
                                            if (response.ok) {
                                                navigate("/decks");
                                            }
                                        } catch (err) {
                                            alert("Failed to delete deck");
                                        }
                                    }
                                }}>Delete</Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-400">📖 View-Only Mode</span>
                                <Button
                                    onClick={() => {
                                        const shareUrl = `${window.location.origin}/deckviewer?id=${deck.id}`;
                                        navigator.clipboard.writeText(shareUrl);
                                    }}
                                    className="ml-auto"
                                >
                                    Copy Link to Share
                                </Button>
                            </div>
                        )}
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
        </div>
    );
}
