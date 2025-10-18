import { useState } from "react";
import Deck from "../components/decks/Deck";
import DeckFilterSidebar from "../components/decks/DeckFilterSidebar";
import DeckDetailsPanel from "../components/decks/DeckDetailsPanel";

export default function Decks() {
  const decks = [
    { name: "Silver Kai'sa", dateModified: "Oct 13, 2025", colors: ["#3b82f6", "#ef4444"], backgroundImage: "/kaisa.jpg", legend: "Kaisa" },
    { name: "Ahri Control", dateModified: "Oct 13, 2025", colors: ["#3b82f6", "#22c55e"], backgroundImage: "/ahri.jpg", legend: "Ahri" },
    { name: "Anti-Spell Sett", dateModified: "Oct 13, 2025", colors: ["#f97316", "#facc15"], backgroundImage: "/sett.jpg", legend: "Sett" },
    { name: "Jinx Discard", dateModified: "Oct 13, 2025", colors: ["#8b5cf6", "#ef4444"], backgroundImage: "/jinx.jpg", legend: "Jinx" },
    { name: "Teemo Hidden", dateModified: "Oct 13, 2025", colors: ["#3b82f6", "#8b5cf6"], backgroundImage: "/teemo.jpg", legend: "Teemo" },
  ];

  const [filters, setFilters] = useState({
    sortBy: "date" as "name" | "date",
    sortOrder: "asc" as "asc" | "desc",
    showFavourites: false,
    selectedColors: [] as string[],
    selectedLegend: null as string | null,
  });

  const [selectedDeck, setSelectedDeck] = useState<typeof decks[0] | null>(null);

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

  return (
    <div className="h-[calc(100vh-4rem)] mt-16 flex flex-col bg-[#121212] text-white">
      {/* Header with background image */}
      <div className="relative flex items-center justify-center h-64 w-full bg-[url('/leagueworld.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/50" />
        <h1 className="relative text-white text-8xl font-semibold z-10">Decks</h1>
      </div>

      {/* Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Filters */}
        <DeckFilterSidebar onFiltersChange={setFilters} filters={filters} />

        {/* Deck Lists */}
        <div className="flex-1 flex flex-col px-8 py-4 overflow-y-auto gap-3 border-x border-zinc-800">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">My Decks</h2>
            <button className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-3 py-1.5 rounded-md text-sm transition-all duration-200 shadow">
              + Create Deck
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {filteredDecks.map((deck, index) => (
              <Deck
                key={index}
                name={deck.name}
                dateModified={deck.dateModified}
                colors={deck.colors}
                backgroundImage={deck.backgroundImage}
                legend={deck.legend}
                onClick={() => setSelectedDeck(deck)}
              />
            ))}
          </div>
        </div>

        {/* RIGHT: Deck details */}
        <DeckDetailsPanel deck={selectedDeck} onClose={() => setSelectedDeck(null)}/>
      </div>
    </div>
  );
}
