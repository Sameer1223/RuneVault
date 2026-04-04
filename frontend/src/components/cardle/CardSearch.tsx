import { useState, useMemo, useRef, useEffect } from "react";
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
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
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
          className="w-full rounded-xl border border-white/15 bg-slate-900/80 py-3 pl-10 pr-10 text-white placeholder:text-slate-400 shadow-lg shadow-black/20 outline-none transition focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/30 disabled:opacity-50"
        />
        {search && (
          <button
            onClick={() => {
              setSearch("");
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && availableCards.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-[90] mt-2 max-h-80 overflow-y-auto rounded-xl border border-white/15 bg-slate-900/95 p-1 shadow-2xl shadow-black/40 backdrop-blur-xl">
          {availableCards.slice(0, 15).map((card) => (
            <button
              key={card.cardId}
              onClick={() => handleSelect(card)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-white transition hover:bg-white/10"
            >
              <CardImage
                cardId={card.cardId}
                alt={card.name}
                className="h-12 w-8 rounded border border-white/10 object-cover"
              />
              <div className="min-w-0">
                <div className="truncate font-semibold">{card.name}</div>
                <div className="truncate text-xs text-slate-400">{card.type} • {card.colors?.join(", ") || "No Color"}</div>
              </div>
              <div className="ml-auto text-[10px] font-medium tracking-wide text-slate-500">{card.cardId}</div>
            </button>
          ))}
        </div>
      )}

      {isOpen && search.trim().length > 0 && availableCards.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-[90] mt-2 rounded-xl border border-white/15 bg-slate-900/95 px-4 py-3 text-sm text-slate-400 shadow-2xl shadow-black/40 backdrop-blur-xl">
          No matching cards.
        </div>
      )}
    </div>
  );
}
