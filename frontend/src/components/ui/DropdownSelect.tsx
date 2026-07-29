import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { type LucideIcon } from "lucide-react";

interface DropdownSelectProps {
  label: string;
  icon?: LucideIcon;
  options: string[];
  defaultValue?: string;
  onChange?: (value: string) => void; // ✅ Renamed to match your parent component usage
  fullWidth?: boolean;
}

export default function DropdownSelect({
  label,
  icon: Icon,
  options,
  defaultValue,
  onChange,
  fullWidth = false,
}: DropdownSelectProps) {
  const [selected, setSelected] = useState(defaultValue || options[0]);

  const handleSelect = (value: string) => {
    setSelected(value);
    onChange?.(value); // Call the unified prop
  };

  return (
    <div className={`flex flex-col gap-0.5 ${fullWidth ? "w-full" : "w-fit"}`}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {label}
        </label>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`flex items-center justify-between ${fullWidth ? "w-full" : "w-40"} h-7 px-2 text-xs bg-zinc-900 border-zinc-700 text-zinc-200 hover:border-[#caa368]/50 hover:bg-zinc-800 hover:text-white transition-colors`}
          >
            <span className="flex items-center gap-1.5 truncate">
              {Icon && <Icon className="w-3 h-3 text-[#caa368] shrink-0" />}
              <span className="truncate">{selected}</span>
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className={`${fullWidth ? "w-[var(--radix-dropdown-menu-trigger-width)]" : "w-40"} bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs scroll-styled`}
          align="start"
        >
          {options.map((option) => (
            <DropdownMenuItem
              key={option}
              onClick={() => handleSelect(option)}
              className={`hover:bg-zinc-800 hover:text-white transition-colors ${
                option === selected ? "bg-zinc-800 text-[#caa368]" : ""
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
