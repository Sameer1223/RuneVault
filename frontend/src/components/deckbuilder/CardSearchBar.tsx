import * as React from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function CardSearchBar() {
  const [query, setQuery] = React.useState("")
  const [focused, setFocused] = React.useState(false)

  const cards = [
    "Stalwart Poro",
    "Daring Poro",
    "Hidden Blade",
    "Viktor",
    "Heimerdinger",
    "Void Seeker",
    "Stormbringer",
    "Defy",
  ]

  const filtered = query
    ? cards.filter((card) => card.toLowerCase().includes(query.toLowerCase()))
    : cards

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()

      if (filtered.length > 0) {
        // Select the first suggestion if available
        setQuery(filtered[0])
      }

      // Hide suggestions
      setFocused(false)

      // Trigger search logic here
      console.log("Searching for:", query || filtered[0])
    }
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search cards..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)} // allow click on item
          onKeyDown={handleKeyDown}
          className="pl-9 bg-zinc-900 border border-zinc-700 text-white 
                     placeholder:text-gray-500 focus:border-amber-400 focus:ring-amber-400 w-full"
        />
      </div>

      {focused && filtered.length > 0 && (
        <div className="absolute z-10 mt-2 w-full bg-zinc-900 border border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
          {filtered.map((card) => (
            <div
              key={card}
              onMouseDown={() => {
                setQuery(card)
                setFocused(false)
                console.log("Selected card:", card)
              }}
              className="px-3 py-2 cursor-pointer hover:bg-amber-500/20 text-sm text-gray-200"
            >
              {card}
            </div>
          ))}
        </div>
      )}

      {focused && filtered.length === 0 && (
        <div className="absolute z-10 mt-2 w-full bg-zinc-900 border border-zinc-700 rounded-md shadow-lg p-2 text-gray-400 text-sm">
          No results found
        </div>
      )}
    </div>
  )
}
