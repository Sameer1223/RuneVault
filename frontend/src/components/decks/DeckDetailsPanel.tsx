import { motion, AnimatePresence } from "framer-motion";
import { Tag, Info, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import cardData from "@/data/cards.json";
import { useNavigate } from "react-router-dom";
import type { FullDeck } from "@/types/deck";

interface DeckDetailsPanelProps {
  deck: FullDeck | null;
  onClose: () => void;
  onDeleteClick: () => void;
}

export default function DeckDetailsPanel({ deck, onClose, onDeleteClick }: DeckDetailsPanelProps) {
  const navigate = useNavigate();

  function getCardNames(section: Record<string, number> | string[] | undefined) {
    if (!section) return [];

    if (Array.isArray(section)) {
      return section.map((cardId) => {
        const card = cardData.find((c) => c.cardId === cardId);
        return {
          name: card ? card.name : "Unknown Card",
          quantity: 1,
        };
      });
    }

    return Object.entries(section).map(([cardId, quantity]) => {
      const card = cardData.find((c) => c.cardId === cardId);
      return {
        name: card ? card.name : "Unknown Card",
        quantity,
      };
    });
  }

  if (!deck) return null;

  const legend = cardData.find((card) => card.cardId === deck.deck_data?.Legend);
  const mainCards = getCardNames(deck.deck_data?.Main);
  const battlefieldCards = getCardNames(deck.deck_data?.Battlefields);
  const sideCards = getCardNames(deck.deck_data?.Side);
  const runesCards = getCardNames(deck.deck_data?.Runes);

  const handleEditDeck = () => {
    // Navigate to deck builder with full deck object
    navigate("/deckbuilder", { state: { deck } });
  };

  const handleViewDeck = () => {
    // Navigate to deck viewer with full deck object
    navigate("/deckviewer", { state: { deck } });
  };

  return (
    <AnimatePresence>
      {deck && (
        <motion.div
          key="deck-details-container"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="relative flex h-full"
        >
          {/* Left: Deck info panel */}
          <div className="w-[400px] h-full bg-zinc-900 border-l border-zinc-800 p-6 flex flex-col shadow-xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white truncate">{deck.name}</h2>
              <div className="flex gap-2">
                {/* Edit Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleEditDeck}
                  className="flex items-center gap-1 bg-amber-400 hover:bg-amber-500 text-white text-xs"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </Button>

                {/* Delete Button */}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onDeleteClick}
                  className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                  Delete
                </Button>
              </div>
            </div>

            {/* Legend Image */}
            <div className="relative w-full aspect-[7/5] bg-zinc-800 rounded-lg overflow-hidden mb-5 flex items-center justify-center">
              {deck.deck_data?.Legend ? (
                <img
                  src={`/TempCards/${deck.deck_data.Legend}.avif`}
                  alt={`${legend?.name?.split(',')[0] ?? "Unknown"} card`}
                  className="object-cover object-top w-full h-full"
                />
              ) : (
                <p className="text-zinc-500 text-sm">No image available</p>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-3 py-2 text-sm text-zinc-200">
                {legend?.name ?? "Unknown Legend"}
              </div>
            </div>

            {/* Scrollable info */}
            <div className="flex-1 overflow-y-auto pr-1 scroll-styled">
              <div className="flex flex-col gap-4 text-sm text-zinc-300">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-400" />
                  <span>Last modified: {deck.lastUpdated ?? "Unknown"}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-zinc-400">Colors:</span>
                  <div className="flex gap-2">
                    {legend?.colors?.map((c: string, i: number) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full border border-zinc-700"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {Array.isArray(deck.tags) && deck.tags.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-amber-400" />
                      <span className="font-medium text-white">Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(deck.tags as string[]).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-zinc-800 rounded-md text-zinc-300 border border-zinc-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="font-medium text-white block mb-2">Notes</span>
                  <div className="bg-zinc-800 border border-zinc-700 rounded-md p-3 text-zinc-400 whitespace-pre-wrap min-h-[100px]">
                    {typeof deck.notes === "string" ? deck.notes : "No notes available."}
                  </div>
                </div>
              </div>
              <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleViewDeck}
                  className="flex items-center gap-1 mt-3 w-full bg-emerald-400 hover:bg-emerald-700 text-white text-sm"
              >
                View
              </Button>
            </div>
          </div>

          {/* Right: Deck cards panel */}
          <div className="w-[350px] h-full bg-zinc-900 border-l border-zinc-800 p-6 flex flex-col shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Deck List</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 scroll-styled flex flex-col gap-5">
              {[
                { title: "Runes", cards: runesCards },
                { title: "Battlefields", cards: battlefieldCards },
                { title: "Main Deck", cards: mainCards },
                { title: "Side Deck", cards: sideCards },
              ].map(
                (section) =>
                  section.cards.length > 0 && (
                    <div key={section.title}>
                      <h4 className="text-sm font-semibold text-amber-400 mb-2">
                        {section.title}
                      </h4>
                      <ul className="flex flex-col gap-2">
                        {section.cards.map((card, index) => (
                          <li
                            key={index}
                            className="h-8 flex justify-between items-center bg-zinc-950 rounded-md px-3 py-2 border border-zinc-800 hover:border-amber-400/50 transition"
                          >
                            <span className="text-zinc-200 text-xs">{card.name}</span>
                            <span className="text-zinc-400 text-sm">x{card.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
