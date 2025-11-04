import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Deck from "../components/decks/Deck";
import DeckFilterSidebar from "../components/decks/DeckFilterSidebar";
import DeckDetailsPanel from "../components/decks/DeckDetailsPanel";
import cardData from "../data/cards.json";
import { emptyDeckTemplate } from "../data/emptyDeckTemplate";

export default function Decks() {
  // const decks = [
  //   { name: "Silver Kai'sa", dateModified: "Oct 13, 2025", colors: ["#3b82f6", "#ef4444"], backgroundImage: "/kaisa.jpg", legend: "Kaisa" },
  //   { name: "Ahri Control", dateModified: "Oct 13, 2025", colors: ["#3b82f6", "#22c55e"], backgroundImage: "/ahri.jpg", legend: "Ahri" },
  //   { name: "Anti-Spell Sett", dateModified: "Oct 13, 2025", colors: ["#f97316", "#facc15"], backgroundImage: "/sett.jpg", legend: "Sett" },
  //   { name: "Jinx Discard", dateModified: "Oct 13, 2025", colors: ["#8b5cf6", "#ef4444"], backgroundImage: "/jinx.jpg", legend: "Jinx" },
  //   { name: "Teemo Hidden", dateModified: "Oct 13, 2025", colors: ["#3b82f6", "#8b5cf6"], backgroundImage: "/teemo.jpg", legend: "Teemo" },
  // ];

    // @TODO: Replace with real user data
    const userId = 1;
    const [decks, setDecks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };

    useEffect(() => {
      const fetchDecks = async () => {
        try {
          const res = await fetch(`http://127.0.0.1:5000/api/decks/user/${userId}`);
          if (!res.ok) throw new Error("Failed to fetch decks");
          const data = await res.json();
          setDecks(data);
        } catch (err: any) {
          setError(err.message);
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
        filters.selectedColors.some((color) => deck.colors.includes(color))
    )
    .filter(
      (deck) =>
        !filters.selectedLegend || deck.legend === filters.selectedLegend
    )
    .sort((a, b) => {
      const order = filters.sortOrder === "asc" ? 1 : -1;
      return filters.sortBy === "name"
        ? order * a.name.localeCompare(b.name)
        : order * (new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime());
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
              const imageUrl = legend ? `/${legendName.toLowerCase().replace(/[^a-zA-Z]/g, "")}.jpg` : null;
              
              return (
                <Deck
                  key={index}
                  name={deck.name}
                  dateModified={new Date(deck.lastUpdated).toLocaleDateString('en-US', dateOptions)}
                  colors={legend.colors ?? []}
                  backgroundImage={imageUrl}
                  legend={legendName}
                  onClick={() => handleDeckClick(deck)}
                />
              );
            })}
          </div>
        </div>

        {/* Right panel — slightly wider now */}
        <div
          className={`absolute top-0 right-0 h-full w-[40%] bg-[#1E1E1E] border-l border-zinc-800 shadow-lg transform transition-transform duration-300 ease-in-out ${
            selectedDeck ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <DeckDetailsPanel deck={selectedDeck} onClose={() => setSelectedDeck(null)} />
        </div>
      </div>
    </div>
  );
}
