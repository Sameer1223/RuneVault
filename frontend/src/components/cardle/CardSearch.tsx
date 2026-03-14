import { useState, useMemo } from "react";
import type { CardData } from "@/types/deck";

interface CardSearchProps {
  cards: CardData[];
  onSelect: (card: CardData) => void;
  guessedCardIds: Set<string>;
  disabled?: boolean;
}

export default function CardSearch({ cards, onSelect, guessedCardIds, disabled = false }: CardSearchProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const availableCards = useMemo(() => {
    return cards.filter(
      card => !guessedCardIds.has(card.cardId) && card.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [cards, search, guessedCardIds]);

  const handleSelect = (card: CardData) => {
    onSelect(card);
    setSearch("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          disabled={disabled}
          placeholder="Search and select a card..."
          className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-50"
        />
        {search && (
          <button
            onClick={() => {
              setSearch("");
              setIsOpen(false);
            }}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && availableCards.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-600 rounded-lg mt-1 max-h-80 overflow-y-auto z-50">
          {availableCards.slice(0, 15).map((card) => (
            <button
              key={card.cardId}
              onClick={() => handleSelect(card)}
              className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 border-b border-gray-700 last:border-b-0 flex items-center gap-3"
            >
              <img
                src={`/TempCards/${card.cardId}.avif`}
                alt={card.name}
                className="w-8 h-12 object-cover rounded"
              />
              <div>
                <div className="font-semibold">{card.name}</div>
                <div className="text-xs text-gray-400">{card.type} • {card.colors?.join(", ")}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
