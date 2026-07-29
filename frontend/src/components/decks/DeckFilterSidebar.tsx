import { useMemo, useState } from "react";
import { ArrowDownAZ, ArrowUpAZ, Crown, RotateCcw, SlidersHorizontal } from "lucide-react";
import type { DeckListFilters } from "@/types/deck";
import cardData from "@/data/cards.json";
import { DOMAIN_COLORS, DOMAIN_COLOR_HEX } from "@/lib/constants";
import DropdownSelect from "@/components/ui/DropdownSelect";

interface Props {
  onFiltersChange: (filters: DeckListFilters) => void;
  filters: DeckListFilters;
  className?: string;
}

const defaultFilters: DeckListFilters = {
  sortBy: "date",
  sortOrder: "asc",
  selectedColors: [],
  selectedLegend: null,
};

export default function DeckFilterSidebar({ onFiltersChange, filters, className = "" }: Props) {
  const [resetKey, setResetKey] = useState(0);

  const legendNames = useMemo(() => {
    const names = new Set<string>();
    for (const card of cardData) {
      if (card.type === "Legend") names.add(card.name.split(",")[0]);
    }
    return [...names].sort((a, b) => a.localeCompare(b));
  }, []);

  const legendOptions = useMemo(() => ["All Legends", ...legendNames], [legendNames]);

  const toggleColor = (color: string) => {
    const updated = filters.selectedColors.includes(color)
      ? filters.selectedColors.filter((c) => c !== color)
      : [...filters.selectedColors, color];
    onFiltersChange({ ...filters, selectedColors: updated });
  };

  const resetFilters = () => {
    onFiltersChange(defaultFilters);
    setResetKey((k) => k + 1);
  };

  const activeCount =
    filters.selectedColors.length + (filters.selectedLegend ? 1 : 0);

  return (
    <div
      className={`w-full lg:w-64 shrink-0 bg-[#181818] border-b lg:border-b-0 lg:border-r border-zinc-800/80 p-5 flex flex-col gap-6 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#caa368]" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white">Filters</h2>
        </div>
        {activeCount > 0 && (
          <span className="text-xs font-medium text-[#caa368] bg-[#caa368]/10 rounded-full px-2 py-0.5">
            {activeCount} active
          </span>
        )}
      </div>

      {/* Sort */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2">
          Sort By
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value as DeckListFilters["sortBy"] })}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-2.5 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-[#caa368] transition-colors"
        >
          <option value="date">Date Modified</option>
          <option value="name">Name</option>
        </select>
        <div className="flex mt-2 gap-2">
          <button
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              filters.sortOrder === "asc"
                ? "bg-[#caa368] border-[#caa368] text-zinc-900"
                : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
            }`}
            onClick={() => onFiltersChange({ ...filters, sortOrder: "asc" })}
          >
            <ArrowDownAZ className="w-3.5 h-3.5" /> Asc
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              filters.sortOrder === "desc"
                ? "bg-[#caa368] border-[#caa368] text-zinc-900"
                : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
            }`}
            onClick={() => onFiltersChange({ ...filters, sortOrder: "desc" })}
          >
            <ArrowUpAZ className="w-3.5 h-3.5" /> Desc
          </button>
        </div>
      </div>

      {/* Colors */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2">
          Colors
        </label>
        <div className="flex flex-wrap gap-2">
          {DOMAIN_COLORS.map((color) => {
            const active = filters.selectedColors.includes(color);
            return (
              <button
                key={color}
                onClick={() => toggleColor(color)}
                title={color}
                aria-pressed={active}
                className={`w-7 h-7 rounded-full border-2 transition-all duration-150 ${
                  active ? "border-white scale-110 shadow-[0_0_0_2px_rgba(202,163,104,0.5)]" : "border-zinc-700 hover:border-zinc-500"
                }`}
                style={{ backgroundColor: DOMAIN_COLOR_HEX[color] }}
              />
            );
          })}
        </div>
      </div>

      {/* Legends */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2">
          Legend
        </label>
        <DropdownSelect
          key={`legend-${resetKey}`}
          label=""
          icon={Crown}
          options={legendOptions}
          defaultValue={filters.selectedLegend ?? "All Legends"}
          fullWidth
          onChange={(value) =>
            onFiltersChange({
              ...filters,
              selectedLegend: value === "All Legends" ? null : value,
            })
          }
        />
      </div>

      {/* Reset */}
      <button
        onClick={resetFilters}
        className="mt-auto flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 hover:text-white py-2 rounded-md transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Reset Filters
      </button>
    </div>
  );
}
