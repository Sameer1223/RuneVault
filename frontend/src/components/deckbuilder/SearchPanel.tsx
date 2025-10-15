import { useState } from "react";
import { Button } from '../ui/button';
import { Filter, Layers, BadgeDollarSign, BadgeEuro } from "lucide-react"
import DropdownSelect from "../ui/DropdownSelect";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import CardSearchBar from "./CardSearchBar";
import RangeSlider from "../ui/RangeSlider";

const typeFilterItems = [
    { value: "legends", label: "Legends" },
    { value: "battlefields", label: "Battlefields" },
    { value: "cards", label: "Cards" },
    { value: "runes", label: "Runes" },
  ];

export default function SearchPanel() {
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const toggleOptions = ["Legends", "Battlefields", "Cards", "Runes"];

    const handleToggleChange = (value: string) => {
        // Clicking the same button again clears it (returns to "all")
        setSelectedType(value === selectedType ? null : value);
        const activeFilter = value === selectedType ? "all" : value;
        console.log("Type filter:", activeFilter || "all");
    };


    return (
        <div>
            <CardSearchBar />
            <div className="flex gap-10">
                <div className="flex items-center gap-5">
                    <div className="flex flex-col gap-4">
                        <DropdownSelect 
                            label="Set"
                            icon={Filter}
                            options={["All", "Common", "Rare", "Legendary"]}
                        />
                        <DropdownSelect
                            label="Type"
                            icon={Layers}
                            options={["All", "Champion", "Unit", "Spell", "Gear"]}
                        />
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" className="bg-zinc-900 rounded-full">
                                <BadgeDollarSign className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="bg-zinc-900 rounded-full">
                                <BadgeEuro className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col p-4 rounded-md w-full space-y-2">
                    <RangeSlider
                        label="Energy"
                        min={0}
                        max={12}
                        defaultValue={[0, 12]}
                        onChange={(value) => console.log("Energy:", value)}
                    />
                    <RangeSlider
                        label="Power"
                        min={0}
                        max={4}
                        defaultValue={[0, 4]}
                        onChange={(value) => console.log("Power:", value)}
                    />
                    <RangeSlider
                        label="Might"
                        min={0}
                        max={10}
                        defaultValue={[0, 10]}
                        onChange={(value) => console.log("Might:", value)}
                    />
                </div>
            </div>
            <div className="flex justify-center">
                <ToggleGroup
                    type="single"
                    value={selectedType ?? ""}
                    onValueChange={handleToggleChange}
                    className="flex gap-2 justify-center items-center"
                >
                    {toggleOptions.map((label) => (
                    <ToggleGroupItem
                        key={label}
                        value={label.toLowerCase()}
                        className="
                        flex-1 min-w-[110px] text-center
                        bg-zinc-900 text-white border border-zinc-700
                        hover:bg-zinc-800 py-0 h-[24px] text-xs
                        rounded-xl
                        transition-colors
                        data-[state=on]:bg-amber-400 data-[state=on]:text-gray-900 
                        data-[state=on]:hover:bg-amber-300
                        [&:first-child]:rounded-l-xl [&:last-child]:rounded-r-xl
                        "
                    >
                        {label}
                    </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            </div>
        </div>
    );
}