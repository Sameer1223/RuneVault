import { useState, useEffect, useCallback } from "react";
import { Filter, Layers, RotateCcw } from "lucide-react";
import DropdownSelect from "../ui/DropdownSelect";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import CardSearchBar from "./CardSearchBar";
import RangeSlider from "../ui/RangeSlider";
import cardData from "../../data/cards.json";
import { RARITY_OPTIONS } from "@/lib/constants";
import type { CardFilters } from "@/utils/filterCardsUtil";

interface SearchPanelProps {
  onFilterChange: (filters: CardFilters) => void;
  selectedLegend?: { legendId: string };
}

export default function SearchPanel({
  onFilterChange,
  selectedLegend,
}: SearchPanelProps) {
  const defaultFilters = {
    query: "",
    selectedType: "Legends" as string,
    rarityFilter: "All",
    cardType: "All",
    setFilter: "All",
    energyRange: [0, 12] as [number, number],
    powerRange: [0, 4] as [number, number],
    mightRange: [0, 10] as [number, number],
    colorFilter: [] as string[],
  };

  const [filters, setFilters] = useState(defaultFilters);
  const [legendColors, setLegendColors] = useState<string[]>([]);
  const [dropdownKeys, setDropdownKeys] = useState(0);
  const [sliderKeys, setSliderKeys] = useState(0);
  const [availableSets] = useState(() => {
    const sets = Array.from(new Set(cardData.map((card) => card.set)));
    return ["All", ...sets.sort()] as string[];
  });

  const updateFilters = useCallback(
    (updates: Partial<typeof filters>) => {
      setFilters((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const isNonCardType =
    filters.selectedType === "Legends" ||
    filters.selectedType === "Battlefields" ||
    filters.selectedType === "Runes";

  const isBattlefield = filters.selectedType === "Battlefields";

  useEffect(() => {
    if (selectedLegend) {
      const legendCard = cardData.find(
        (card) => card.cardId === selectedLegend.legendId
      );
      setLegendColors(legendCard?.colors ?? []);
    } else {
      setLegendColors([]);
      updateFilters({ colorFilter: [] });
    }
  }, [selectedLegend]);

  const handleColorClick = (color: string) => {
    updateFilters({
      colorFilter: filters.colorFilter.includes(color)
        ? filters.colorFilter.filter((c) => c !== color)
        : [...filters.colorFilter, color],
    });
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setDropdownKeys((k) => k + 1);
    setSliderKeys((k) => k + 1);
  };

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);


  return (
    <div className="flex flex-col gap-2">
      <CardSearchBar
        onSearch={(value) => updateFilters({ query: value })}
      />

      {/* Dropdowns + Sliders */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Dropdowns + Colors */}
        <div className="flex flex-col gap-1.5">
          {/* Rarity Dropdown */}
          <div className={isBattlefield ? "opacity-50 pointer-events-none" : ""}>
            <DropdownSelect
              key={`rarity-${dropdownKeys}`}
              label="Rarity"
              icon={Filter}
              options={[...RARITY_OPTIONS]}
              defaultValue={isBattlefield ? "Uncommon" : "All"}
              onChange={(val) => updateFilters({ rarityFilter: val })}
            />
          </div>

          {/* Set Dropdown */}
          <div>
            <DropdownSelect
              key={`set-${dropdownKeys}`}
              label="Set"
              icon={Filter}
              options={availableSets}
              defaultValue="All"
              onChange={(val) => updateFilters({ setFilter: val })}
            />
          </div>

          {/* Type Dropdown */}
          <div className={isNonCardType ? "opacity-50 pointer-events-none" : ""}>
            <DropdownSelect
              key={`type-${dropdownKeys}`}
              label="Type"
              icon={Layers}
              options={["All", "Champion", "Unit", "Spell", "Gear"]}
              defaultValue="All"
              onChange={(val) => updateFilters({ cardType: val })}
            />
          </div>

          {/* Color Buttons + Reset */}
          <div className="flex items-center justify-between w-full gap-2 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              {legendColors.map((color, i) => {
                const disabled = isBattlefield;
                const active = filters.colorFilter.includes(color);
                return (
                  <button
                    key={i}
                    onClick={() => !disabled && handleColorClick(color)}
                    aria-pressed={active}
                    className={`rounded-full w-7 h-7 border-2 transition-all duration-150 ${
                      active
                        ? "border-white scale-110 shadow-[0_0_0_2px_rgba(202,163,104,0.5)]"
                        : "border-zinc-700 opacity-80 hover:opacity-100 hover:border-zinc-500"
                    } ${disabled ? "opacity-30 cursor-not-allowed pointer-events-none" : ""}`}
                    style={{ backgroundColor: color }}
                  />
                );
              })}

              {!legendColors.length && (
                <>
                  <div className="rounded-full w-7 h-7 bg-zinc-800 border border-zinc-700" />
                  <div className="rounded-full w-7 h-7 bg-zinc-800 border border-zinc-700" />
                </>
              )}
            </div>

            <button
              onClick={handleResetFilters}
              title="Reset filters"
              className="flex items-center justify-center w-7 h-7 rounded-md border border-zinc-700 bg-zinc-900 hover:border-[#caa368]/50 hover:bg-zinc-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Sliders */}
        <div
          className={`flex flex-col gap-1.5 w-full transition-opacity ${
            isNonCardType ? "opacity-40 pointer-events-none" : ""
          }`}
        >
          <RangeSlider
            key={`energy-${sliderKeys}`}
            label="Energy"
            min={0}
            max={12}
            defaultValue={[0, 12]}
            onChange={(value) => updateFilters({ energyRange: value })}
          />
          <RangeSlider
            key={`power-${sliderKeys}`}
            label="Power"
            min={0}
            max={4}
            defaultValue={[0, 4]}
            onChange={(value) => updateFilters({ powerRange: value })}
          />
          <RangeSlider
            key={`might-${sliderKeys}`}
            label="Might"
            min={0}
            max={10}
            defaultValue={[0, 10]}
            onChange={(value) => updateFilters({ mightRange: value })}
          />
        </div>
      </div>

      {/* Bottom Toggles */}
      <div className="flex justify-center">
        <ToggleGroup
          key={`toggle-${dropdownKeys}`}
          type="single"
          value={filters.selectedType}
          onValueChange={(value) => {
            if (value) updateFilters({ selectedType: value });
          }}
          className="flex flex-wrap gap-2 justify-center items-center"
        >
          {["Legends", "Battlefields", "Cards", "Runes"].map((label) => (
            <ToggleGroupItem
              key={label}
              value={label}
              className="flex-1 min-w-[90px] sm:min-w-[110px] text-center
                bg-zinc-900 text-zinc-200 border border-zinc-700
                hover:bg-zinc-800 hover:border-[#caa368]/40 hover:text-white py-0 h-6 text-xs font-medium
                rounded-md transition-colors
                data-[state=on]:bg-[#caa368] data-[state=on]:text-zinc-900 data-[state=on]:border-[#caa368] data-[state=on]:font-semibold
                data-[state=on]:hover:bg-[#d9b57a]"
            >
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}
