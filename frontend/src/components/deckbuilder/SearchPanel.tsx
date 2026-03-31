import { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
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
    <div>
      <CardSearchBar
        onSearch={(value) => updateFilters({ query: value })}
      />

      {/* Dropdowns + Sliders */}
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-2">
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
            <div className="flex items-center justify-between w-full gap-2 mt-2">
              <div className="flex gap-2">
                {legendColors.map((color, i) => {
                  const disabled = isBattlefield;
                  return (
                    <Button
                      key={i}
                      variant="outline"
                      size="icon"
                      onClick={() => !disabled && handleColorClick(color)}
                      className={`rounded-full w-8 h-8 border-2 transition-all ${
                        filters.colorFilter.includes(color)
                          ? "scale-110 border-white"
                          : "opacity-80 hover:opacity-100"
                      } ${disabled ? "opacity-30 cursor-not-allowed pointer-events-none" : ""}`}
                      style={{
                        backgroundColor: color,
                      }}
                    />
                  );
                })}

                {!legendColors.length && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled
                      className="rounded-full w-8 h-8 bg-zinc-800 border-zinc-700"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      disabled
                      className="rounded-full w-8 h-8 bg-zinc-800 border-zinc-700"
                    />
                  </>
                )}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={handleResetFilters}
                className="rounded-full w-8 h-8 border-2 border-zinc-700 bg-zinc-900 hover:bg-zinc-800"
              >
                <RotateCcw className="w-4 h-4 text-gray-300" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sliders */}
        <div
          className={`flex flex-col p-4 rounded-md w-full space-y-2 transition-opacity ${
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
          className="flex gap-2 justify-center items-center"
        >
          {["Legends", "Battlefields", "Cards", "Runes"].map((label) => (
            <ToggleGroupItem
              key={label}
              value={label}
              className="flex-1 min-w-[110px] text-center
                bg-zinc-900 text-white border border-zinc-700
                hover:bg-zinc-800 py-0 h-[24px] text-xs
                rounded-xl transition-colors
                data-[state=on]:bg-amber-400 data-[state=on]:text-gray-900 
                data-[state=on]:hover:bg-amber-300"
            >
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}
