import * as React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import cardData from "../../data/cards.json";

interface CardSearchBarProps {
  onSearch: (query: string) => void;
}

export default function CardSearchBar({ onSearch }: CardSearchBarProps) {
  const [query, setQuery] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);

  const normalizedQuery = query.trim().toLowerCase();

  // Dynamic filtering as user types
  const filtered = React.useMemo(() => {
    if (!normalizedQuery) return [];
    return cardData.filter((card) => {
      const name = card.name?.toLowerCase() ?? "";
      const id = card.cardId?.toLowerCase() ?? "";
      return name.includes(normalizedQuery) || id.includes(normalizedQuery);
    });
  }, [normalizedQuery]);

  const handleSelect = (name: string) => {
    setQuery(name);
    onSearch(name);
    setIsFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch(query);
      setIsFocused(false);
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search cards..."
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            onSearch(value); // keeps external filter live
            if (value.trim() !== "") setIsFocused(true);
          }}
          onFocus={() => {
            if (query.trim() !== "") setIsFocused(true);
          }}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          onKeyDown={handleKeyDown}
          className="pl-9 bg-zinc-900 border border-zinc-700 text-white
                     placeholder:text-gray-500 focus:border-[#caa368] focus:ring-[#caa368] w-full"
        />
      </div>

      {/* Suggestions dropdown */}
      {isFocused && filtered.length > 0 && (
        <div className="absolute z-10 mt-2 w-full bg-zinc-900 border border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto scroll-styled">
          {filtered.map((card) => (
            <div
              key={card.cardId}
              onMouseDown={() => handleSelect(card.name)}
              className="px-3 py-2 cursor-pointer hover:bg-[#caa368]/10 hover:text-white text-sm text-gray-200 transition-colors"
            >
              {card.name}
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {isFocused && query.trim() !== "" && filtered.length === 0 && (
        <div className="absolute z-10 mt-2 w-full bg-zinc-900 border border-zinc-700 rounded-md shadow-lg p-2 text-gray-400 text-sm">
          No results found
        </div>
      )}
    </div>
  );
}
