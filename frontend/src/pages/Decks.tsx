import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Deck from "../components/decks/Deck";
import DeckFilterSidebar from "../components/decks/DeckFilterSidebar";
import DeckDetailsPanel from "../components/decks/DeckDetailsPanel";
import cardData from "../data/cards.json";
import { emptyDeckTemplate } from "../data/emptyDeckTemplate";
import ConfirmationModal from "../components/common/ConfirmationModal";
import { useUserId } from "../hooks/useUserId";
import { useAuthFetch } from "../hooks/useAuthFetch";
import { API_BASE_URL } from "@/lib/constants";
import type { FullDeck } from "@/types/deck";

export default function Decks() {
    const { userId } = useUserId();
    const [decks, setDecks] = useState<FullDeck[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const authFetch = useAuthFetch();

    const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' } as const;
    
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deckToDelete, setDeckToDelete] = useState<FullDeck | null>(null);

    const onRequestDelete = (deck: FullDeck) => {
      setDeckToDelete(deck);
      setDeleteModalOpen(true);
    };
    
    const confirmDelete = async () => {
      if (!deckToDelete?.id) return;
    
      try {
        const res = await authFetch(`${API_BASE_URL}/api/decks/${deckToDelete.id}`, {
          method: "DELETE",
        });
    
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message);
        }
    
        // close panel + modal
        setDeleteModalOpen(false);
        setSelectedDeck(null);
    
        // refresh list
        setDecks((prev) => prev.filter((d) => d.id !== deckToDelete.id));
      } catch (err) {
        alert("Failed to delete deck." + (err instanceof Error ? err.message : "Unknown error"));
      }
    };
    


  useEffect(() => {
    if (!userId) return;

    const fetchDecks = async () => {
      try {
        setLoading(true);

        const res = await authFetch(
          `${API_BASE_URL}/api/decks/user/${userId}`
        );

        if (!res.ok) throw new Error("Failed to fetch decks");

        const data = await res.json();
        setDecks(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchDecks();
  }, [userId]);

  const [filters, setFilters] = useState({
    sortBy: "date" as "name" | "date",
    sortOrder: "asc" as "asc" | "desc",
    showFavourites: false,
    selectedColors: [] as string[],
    selectedLegend: null as string | null,
  });

  const [selectedDeck, setSelectedDeck] = useState<typeof decks[0] | null>(null);

  if (loading) return <div className="text-center mt-10">Loading decks...</div>;
  if (error) return <div className="text-center mt-10 text-red-400">{error}</div>;

  const filteredDecks = decks
    .filter(
      (deck) =>
        filters.selectedColors.length === 0 ||
        filters.selectedColors.some((color) => Array.isArray(deck.colors) && (deck.colors as string[]).includes(color))
    )
    .filter(
      (deck) =>
        !filters.selectedLegend || deck.legend === filters.selectedLegend
    )
    .sort((a, b) => {
      const order = filters.sortOrder === "asc" ? 1 : -1;
      return filters.sortBy === "name"
        ? order * a.name.localeCompare(b.name)
        : order * (new Date(b.lastUpdated ?? 0).getTime() - new Date(a.lastUpdated ?? 0).getTime());
    });

  const handleDeckClick = (deck: typeof decks[0]) => {
    if (selectedDeck && selectedDeck.name === deck.name) {
      setSelectedDeck(null); // close if same deck clicked again
    } else {
      setSelectedDeck(deck);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] mt-16 flex flex-col bg-[#121212] text-white">
      {/* Header */}
      <div className="relative flex items-center justify-center h-64 w-full bg-[url('/leagueworld.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/50" />
        <h1 className="relative text-white text-8xl font-semibold z-10">Decks</h1>
      </div>

      {/* Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Filters */}
        <DeckFilterSidebar onFiltersChange={setFilters} filters={filters} />

        {/* Deck list */}
        <div
          className={`flex-1 flex flex-col px-8 py-4 overflow-y-auto gap-3 border-x border-zinc-800 transition-all duration-300 ease-in-out ${
            selectedDeck ? "mr-[40%]" : "mr-0"
          }`}
        >
          <div className="scroll-inside flex-1 pr-2 -mr-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">My Decks</h2>
              <button
                className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-3 py-1.5 rounded-md text-sm transition-all duration-200 shadow"
                onClick={() => navigate("/deckbuilder", { state: { deck: emptyDeckTemplate } })}
              >
                + Create Deck
              </button>
            </div>

            {/* Deck grid (2 columns until a deck is selected) */}
            <div
              className={`grid gap-3 transition-all duration-300 ease-in-out ${
                selectedDeck ? "grid-cols-1" : "grid-cols-2"
              }`}
            >
              {filteredDecks.map((deck, index) => {
                const legend = cardData.find((card) => card.cardId === deck.deck_data?.Legend);
                const legendName = legend ? legend.name.split(',')[0] : null;
                const imageUrl = legendName ? `/Banners/${legendName.toLowerCase().replace(/[^a-zA-Z]/g, "")}.jpg` : undefined;
                return (
                  <Deck
                    key={index}
                    name={deck.name}
                    dateModified={deck.lastUpdated ? new Date(deck.lastUpdated).toLocaleDateString('en-US', dateOptions) : "Unknown"}
                    colors={(legend?.colors ?? ['#333', '#333']) as [string, string]}
                    backgroundImage={imageUrl}
                    legend={legendName ?? "Unknown"}
                    onClick={() => handleDeckClick(deck)}
                    onEdit={() => navigate("/deckbuilder", { state: { deck } })}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Right panel — slightly wider now */}
        <div
          className={`absolute top-0 right-0 h-full w-[40%] bg-[#1E1E1E] border-l border-zinc-800 shadow-lg transform transition-transform duration-300 ease-in-out ${
            selectedDeck ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <DeckDetailsPanel
            deck={selectedDeck}
            onClose={() => setSelectedDeck(null)}
            onDeleteClick={() => { if (selectedDeck) onRequestDelete(selectedDeck); }}
          />
        </div>
      </div>
      <ConfirmationModal
        isOpen={deleteModalOpen}
        mode="delete"
        message={`Are you sure you want to delete "${deckToDelete?.name}"?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />

    </div>
  );
}
