import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

interface DropdownSelectProps {
  label: string
  icon?: LucideIcon
  options: string[]
  defaultValue?: string
  onSelect?: (value: string) => void
}

export default function DropdownSelect({
  label,
  icon: Icon,
  options,
  defaultValue,
  onSelect,
}: DropdownSelectProps) {
  const [selected, setSelected] = useState(defaultValue || options[0])

  const handleSelect = (value: string) => {
    setSelected(value)
    onSelect?.(value)
  }

  return (
    <div className="flex flex-col gap-1 w-fit">
      <label className="text-sm font-medium text-neutral-50s">{label}</label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center justify-between w-40 bg-zinc-900 border-zinc-700 text-gray-200 hover:bg-zinc-800"
          >
            <span className="flex items-center gap-2">
              {Icon && <Icon className="w-4 h-4 text-amber-400" />}
              {selected}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-40 bg-zinc-900 border border-zinc-700 text-gray-200"
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
  )
}