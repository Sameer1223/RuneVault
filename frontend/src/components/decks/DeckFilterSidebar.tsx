import type { DeckListFilters } from "@/types/deck";

interface Props {
  onFiltersChange: (filters: DeckListFilters) => void;
  filters: DeckListFilters;
}

export default function DeckFilterSidebar({ onFiltersChange, filters }: Props) {
  const colorOptions = ["#3b82f6", "#ef4444", "#22c55e", "#f97316", "#facc15", "#8b5cf6"];
  const legends = ["Kai'sa", "Ahri", "Sett", "Jinx", "Teemo"];

  const toggleColor = (color: string) => {
    const updated =
      filters.selectedColors.includes(color)
        ? filters.selectedColors.filter((c: string) => c !== color)
        : filters.selectedColors.length < 2
        ? [...filters.selectedColors, color]
        : filters.selectedColors;
    onFiltersChange({ ...filters, selectedColors: updated });
  };

  const resetFilters = () =>
    onFiltersChange({
      sortBy: "date",
      sortOrder: "asc",
      showFavourites: false,
      selectedColors: [],
      selectedLegend: null,
    });

  return (
    <div className="w-72 bg-[#181818] border-r border-zinc-800 p-4 flex flex-col gap-6">
      <h2 className="text-lg font-semibold">Filters</h2>

      {/* Sort */}
      <div>
        <label className="block text-sm text-zinc-400 mb-1">Sort By</label>
        <select
          value={filters.sortBy}
          onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value as DeckListFilters["sortBy"] })}
          className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm"
        >
          <option value="date">Date Modified</option>
          <option value="name">Name</option>
        </select>
        <div className="flex mt-2 gap-2">
          <button
            className={`flex-1 px-2 py-1 rounded text-sm border ${filters.sortOrder === "asc" ? "bg-amber-500 border-amber-500" : "border-zinc-700"}`}
            onClick={() => onFiltersChange({ ...filters, sortOrder: "asc" })}
          >
            A → Z
          </button>
          <button
            className={`flex-1 px-2 py-1 rounded text-sm border ${filters.sortOrder === "desc" ? "bg-amber-500 border-amber-500" : "border-zinc-700"}`}
            onClick={() => onFiltersChange({ ...filters, sortOrder: "desc" })}
          >
            Z → A
          </button>
        </div>
      </div>

      {/* Colors */}
      <div>
        <label className="block text-sm text-zinc-400 mb-2">Colors</label>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((color) => (
            <button
              key={color}
              onClick={() => toggleColor(color)}
              className={`w-6 h-6 rounded-full border-2 transition-all duration-150 ${
                filters.selectedColors.includes(color)
                  ? "border-amber-400 scale-110"
                  : "border-zinc-700"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Legends */}
      <div>
        <label className="block text-sm text-zinc-400 mb-2">Legend</label>
        <select
          value={filters.selectedLegend ?? ""}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              selectedLegend: e.target.value || null,
            })
          }
          className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm"
        >
          <option value="">All</option>
          {legends.map((legend) => (
            <option key={legend} value={legend}>
              {legend}
            </option>
          ))}
        </select>
      </div>

      {/* Reset */}
      <button
        onClick={resetFilters}
        className="mt-auto bg-zinc-800 hover:bg-zinc-700 text-sm text-white py-2 rounded transition"
      >
        Reset Filters
      </button>
    </div>
  );
}
