import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface DropdownSelectProps {
  label: string;
  icon?: LucideIcon;
  options: string[];
  defaultValue?: string;
  onChange?: (value: string) => void; // ✅ Renamed to match your parent component usage
}

export default function DropdownSelect({
  label,
  icon: Icon,
  options,
  defaultValue,
  onChange,
}: DropdownSelectProps) {
  const [selected, setSelected] = useState(defaultValue || options[0]);

  const handleSelect = (value: string) => {
    setSelected(value);
    onChange?.(value); // Call the unified prop
  };

  return (
    <div className="flex flex-col gap-0.5 w-fit">
      <label className="text-xs font-medium text-neutral-50">{label}</label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center justify-between w-40 h-7 px-2 text-xs bg-zinc-900 border-zinc-700 text-gray-200 hover:bg-zinc-800"
          >
            <span className="flex items-center gap-1.5 truncate">
              {Icon && <Icon className="w-3 h-3 text-amber-400 shrink-0" />}
              <span className="truncate">{selected}</span>
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-40 bg-zinc-900 border border-zinc-700 text-gray-200 text-xs"
          align="start"
        >
          {options.map((option) => (
            <DropdownMenuItem
              key={option}
              onClick={() => handleSelect(option)}
              className={`${
                option === selected ? "bg-zinc-800 text-amber-400" : ""
              }`}
            >
              {option}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
