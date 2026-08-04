import { useState, useMemo, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import type { CardData } from "@/types/deck";
import CardImage from "../CardImage";

interface CardSearchProps {
  cards: CardData[];
  onSelect: (card: CardData) => void;
  guessedCardIds: Set<string>;
  disabled?: boolean;
}

export default function CardSearch({ cards, onSelect, guessedCardIds, disabled = false }: CardSearchProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
          placeholder="Search and select a card..."
          className="w-full rounded-md border border-zinc-700 bg-zinc-900 py-2.5 pl-10 pr-10 text-white placeholder:text-zinc-500 outline-none transition-colors focus:border-[#caa368] disabled:opacity-50"
        />
        {search && (
          <button
            onClick={() => {
              setSearch("");
              setIsOpen(false);
            }}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && availableCards.length > 0 && (
        <div className="scroll-styled absolute left-0 right-0 top-full z-[90] mt-2 max-h-80 overflow-y-auto rounded-md border border-zinc-700 bg-[#1a1a1a] p-1 shadow-2xl shadow-black/40">
          {availableCards.slice(0, 15).map((card) => (
            <button
              key={card.cardId}
              onClick={() => handleSelect(card)}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-white transition-colors hover:bg-[#caa368]/10"
            >
              <CardImage
                cardId={card.cardId}
                alt={card.name}
                className="h-12 w-8 rounded border border-zinc-800 object-cover"
              />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{card.name}</div>
                <div className="truncate text-xs text-zinc-500">{card.type} · {card.colors?.join(", ") || "No Color"}</div>
              </div>
              <div className="ml-auto text-[10px] font-medium tracking-wide text-zinc-600">{card.cardId}</div>
            </button>
          ))}
        </div>
      )}

      {isOpen && search.trim().length > 0 && availableCards.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-[90] mt-2 rounded-md border border-zinc-700 bg-[#1a1a1a] px-4 py-3 text-sm text-zinc-500 shadow-2xl shadow-black/40">
          No matching cards.
        </div>
      )}
    </div>
  );
}
