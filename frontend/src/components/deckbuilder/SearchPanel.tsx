import { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import { Filter, Layers, RotateCcw } from "lucide-react";
import DropdownSelect from "../ui/DropdownSelect";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import CardSearchBar from "./CardSearchBar";
import RangeSlider from "../ui/RangeSlider";
import cardData from "../../data/cards.json";

interface SearchPanelProps {
  onFilterChange: (filters: any) => void;
  selectedLegend?: { legendId: string };
}

export default function SearchPanel({ onFilterChange, selectedLegend }: SearchPanelProps) {
  const defaultFilters = {
    query: "",
    selectedType: null as string | null,
    rarityFilter: "All",
    cardType: "All",
    energyRange: [0, 12] as [number, number],
    powerRange: [0, 4] as [number, number],
    mightRange: [0, 10] as [number, number],
    colorFilter: [] as string[],
  };  

  const [filters, setFilters] = useState(defaultFilters);
  const [legendColors, setLegendColors] = useState<string[]>([]);

  // Sync Dropdown defaults manually after reset
  const [dropdownKeys, setDropdownKeys] = useState(0);
  const [sliderKeys, setSliderKeys] = useState(0);

  // Watch for selectedLegend updates
  useEffect(() => {
    if (selectedLegend) {
      const legendCard = cardData.find(
        (card) => card.cardId === selectedLegend
      );
      setLegendColors(legendCard?.colors ?? []);
    } else {
      setLegendColors([]);
      updateFilters({ colorFilter: [] });
    }
  }, [selectedLegend]);

  const updateFilters = useCallback(
    (updates: Partial<typeof filters>) => {
      setFilters((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const handleColorClick = (color: string) => {
    console.log(filters.colorFilter);
    updateFilters({
      colorFilter: filters.colorFilter?.includes(color)
        ? filters.colorFilter.filter((c) => c !== color)
        : [...filters.colorFilter, color],
    });
  };

  // Reset everything
  const handleResetFilters = () => {
    setFilters(defaultFilters);

    // Force dropdowns and sliders to re-render with defaults
    setDropdownKeys((k) => k + 1);
    setSliderKeys((k) => k + 1);
  };

  // Emit to parent whenever filters change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  return (
    <div>
      {/* Search Bar */}
      <CardSearchBar
        onSearch={(value) => updateFilters({ query: value })}
      />

      {/* Dropdowns + Sliders */}
      <div className="flex gap-10">
        <div className="flex items-center gap-5">
          <div className="flex flex-col gap-4">
            <DropdownSelect
              key={`rarity-${dropdownKeys}`} // forces re-render on reset
              label="Rarity"
              icon={Filter}
              options={["All", "Common", "Uncommon", "Rare", "Epic", "Overnumbered"]}
              defaultValue="All"
              onChange={(val) => updateFilters({ rarityFilter: val })}
            />
            <DropdownSelect
              key={`type-${dropdownKeys}`} // forces re-render on reset
              label="Type"
              icon={Layers}
              options={["All", "Champion", "Unit", "Spell", "Gear"]}
              defaultValue="All"
              onChange={(val) => updateFilters({ cardType: val })}
            />

            {/* Legend Color Buttons + Reset */}
            <div className="flex items-center justify-between w-full gap-2">
              <div className="flex gap-2">
                {legendColors.map((color, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="icon"
                    onClick={() => handleColorClick(color)}
                    className={`rounded-full w-8 h-8 border-2 transition-all
                      ${filters.colorFilter?.includes(color)
                        ? "scale-110 border-white"
                        : "opacity-80 hover:opacity-100"}
                    `}
                    style={{
                      backgroundColor: legendColors.length ? color : "#333",
                      cursor: legendColors.length ? "pointer" : "not-allowed",
                    }}
                  />
                ))}

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

              {/* Reset Button */}
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

        {/* Range sliders */}
        <div className="flex flex-col p-4 rounded-md w-full space-y-2">
          <RangeSlider
            key={`energy-${sliderKeys}`} // forces re-render on reset
            label="Energy"
            min={0}
            max={12}
            defaultValue={[0, 12]}
            onChange={(value) => updateFilters({ energyRange: value })}
          />
          <RangeSlider
            key={`power-${sliderKeys}`} // forces re-render on reset
            label="Power"
            min={0}
            max={4}
            defaultValue={[0, 4]}
            onChange={(value) => updateFilters({ powerRange: value })}
          />
          <RangeSlider
            key={`might-${sliderKeys}`} // forces re-render on reset
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
          key={`toggle-${dropdownKeys}`} // re-render toggles on reset
          type="single"
          value={filters.selectedType ?? ""}
          onValueChange={(value) => {
            const newType = value === filters.selectedType ? null : value;
            updateFilters({ selectedType: newType });
          }}
          className="flex gap-2 justify-center items-center"
        >
          {["Legends", "Battlefields", "Cards", "Runes"].map((label) => (
            <ToggleGroupItem
              key={label}
              value={label.toLowerCase()}
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
