import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import Deck from "../components/decks/Deck";
import DeckFilterSidebar from "../components/decks/DeckFilterSidebar";
import DeckDetailsPanel from "../components/decks/DeckDetailsPanel";
import cardData from "../data/cards.json";
import { emptyDeckTemplate } from "../data/emptyDeckTemplate";
import ConfirmationModal from "../components/common/ConfirmationModal";
import { useUserId } from "../hooks/useUserId";
import { useAuthFetch } from "../hooks/useAuthFetch";
import { API_BASE_URL, DOMAIN_COLOR_HEX } from "@/lib/constants";
import type { FullDeck } from "@/types/deck";
import { formatDate } from "@/utils/formatDate";
import { isDeckComplete, isDeckIllegal } from "@/utils/deckStatusUtils";

export default function Decks() {
    const { userId } = useUserId();
    const [decks, setDecks] = useState<FullDeck[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const authFetch = useAuthFetch();

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deckToDelete, setDeckToDelete] = useState<FullDeck | null>(null);

    const onRequestDelete = (deck: FullDeck) => {
      setDeckToDelete(deck);
      setDeleteModalOpen(true);
    };
    
    const confirmDelete = async () => {
      if (!deckToDelete?.id) return;
    
      try {
        const res = await authFetch(`${API_BASE_URL}/decks/${deckToDelete.id}`, {
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

    const handleSaveNotes = async (deckId: string, notes: string) => {
      const res = await authFetch(`${API_BASE_URL}/decks/${deckId}`, {
        method: "PUT",
        body: JSON.stringify({ notes }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to save notes");
      }

      setDecks((prev) => prev.map((d) => (d.id === deckId ? { ...d, notes } : d)));
      setSelectedDeck((prev) => (prev && prev.id === deckId ? { ...prev, notes } : prev));
    };



  useEffect(() => {
    if (!userId) return;

    const fetchDecks = async () => {
      try {
        setLoading(true);

        const res = await authFetch(
          `${API_BASE_URL}/decks/user/${userId}`
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
    selectedColors: [] as string[],
    selectedLegend: null as string | null,
  });

  const [selectedDeck, setSelectedDeck] = useState<typeof decks[0] | null>(null);

  const decksWithLegend = decks.map((deck) => {
    const legend = cardData.find((card) => card.cardId === deck.deck_data?.Legend);
    return { deck, legend, legendName: legend ? legend.name.split(",")[0] : null };
  });

  const filteredDecks = decksWithLegend
    .filter(
      ({ legend }) =>
        filters.selectedColors.length === 0 ||
        filters.selectedColors.some((color) => legend?.colors?.includes(color))
    )
    .filter(({ legendName }) => !filters.selectedLegend || legendName === filters.selectedLegend)
    .sort((a, b) => {
      const order = filters.sortOrder === "asc" ? 1 : -1;
      return filters.sortBy === "name"
        ? order * a.deck.name.localeCompare(b.deck.name)
        : order * (new Date(b.deck.lastUpdated ?? 0).getTime() - new Date(a.deck.lastUpdated ?? 0).getTime());
    });

  const handleDeckClick = (deck: typeof decks[0]) => {
    if (selectedDeck && selectedDeck.name === deck.name) {
      setSelectedDeck(null); // close if same deck clicked again
    } else {
      setSelectedDeck(deck);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] lg:overflow-hidden mt-16 flex flex-col bg-[#121418] text-white">
      {/* Header */}
      <div className="relative flex items-center justify-center h-40 sm:h-52 lg:h-64 w-full bg-[url('/leagueworld.jpg')] bg-cover bg-center shrink-0">
        <div className="absolute inset-0 bg-gradient-to-t from-[#121418] via-black/60 to-black/40" />
        <div className="relative z-10 flex flex-col items-center gap-1">
          <h1 className="text-white text-4xl sm:text-6xl lg:text-8xl font-semibold">Your Decks</h1>
        </div>
      </div>

      {/* Layout */}
      <div className="flex flex-col lg:flex-row flex-1 lg:overflow-hidden relative min-h-0">
        {/* Filters */}
        <DeckFilterSidebar onFiltersChange={setFilters} filters={filters} />

        {/* Deck list */}
        <div
          className={`flex-1 flex flex-col px-4 sm:px-8 py-4 gap-3 lg:overflow-y-auto scroll-styled lg:border-x border-zinc-800/80 transition-all duration-300 ease-in-out ${
            selectedDeck ? "lg:mr-[40%]" : "mr-0"
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg sm:text-xl font-semibold">My Decks</h2>
            <button
              className="flex items-center gap-1.5 bg-[#caa368] hover:bg-[#d9b57a] text-zinc-900 font-semibold px-3 py-1.5 rounded-md text-sm transition-colors shadow"
              onClick={() => navigate("/deckbuilder", { state: { deck: emptyDeckTemplate } })}
            >
              <Plus className="w-4 h-4" />
              Create Deck
            </button>
          </div>

          {loading ? (
            <div
              className={`grid gap-3 ${selectedDeck ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-2"}`}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[72px] rounded-md bg-zinc-900 border border-zinc-800/80 animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-red-400 py-16">
              <span className="text-sm">{error}</span>
            </div>
          ) : filteredDecks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-zinc-500 py-16">
              <span className="text-sm">
                {decks.length === 0 ? "You haven't built any decks yet." : "No decks match these filters."}
              </span>
            </div>
          ) : (
            <div
              className={`grid gap-3 transition-all duration-300 ease-in-out ${
                selectedDeck ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-2"
              }`}
            >
              {filteredDecks.map(({ deck, legend, legendName }, index) => {
                const imageUrl = legendName ? `/Banners/${legendName.toLowerCase().replace(/[^a-zA-Z]/g, "")}.jpg` : undefined;
                const deckColors = (legend?.colors ?? []).map((c) => DOMAIN_COLOR_HEX[c] ?? c);
                return (
                  <Deck
                    key={deck.id ?? index}
                    name={deck.name}
                    dateModified={formatDate(deck.lastUpdated)}
                    colors={(deckColors.length ? deckColors : ["#3a3a3a", "#2a2a2a"]) as [string, string]}
                    backgroundImage={imageUrl}
                    legend={legendName ?? "Unknown"}
                    isComplete={isDeckComplete(deck.deck_data)}
                    isIllegal={isDeckIllegal(deck.deck_data)}
                    onClick={() => handleDeckClick(deck)}
                    onEdit={() => navigate("/deckbuilder", { state: { deck } })}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Details panel */}
        <div
          className={`fixed lg:absolute top-0 right-0 h-full w-full lg:w-[40%] bg-[#1E1E1E] border-l border-zinc-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${
            selectedDeck ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <DeckDetailsPanel
            deck={selectedDeck}
            onClose={() => setSelectedDeck(null)}
            onDeleteClick={() => { if (selectedDeck) onRequestDelete(selectedDeck); }}
            onSaveNotes={handleSaveNotes}
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
