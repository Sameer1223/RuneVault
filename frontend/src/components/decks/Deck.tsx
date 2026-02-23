import { Pencil } from "lucide-react";

interface DeckProps {
  name: string;
  dateModified: string;
  colors: [string, string];
  legend: string;
  backgroundImage?: string;
  onClick?: () => void;
  isSelected?: boolean;
  onEdit?: () => void; // optional edit handler
}

export default function Deck({
  name,
  dateModified,
  colors,
  legend,
  backgroundImage,
  onClick,
  isSelected,
  onEdit,
}: DeckProps) {
  const [fromColor, toColor] = colors;

  const legendCover = {
    kaisa: 12,
    ahri: 27,
    sett: 3,
    jinx: 3,
    teemo: 20,
    volibear: 8,
    darius: 6,
    leesin: 12,
    viktor: 15,
    leona: 12,
    missfortune: 20,
    annie: 25,
    masteryi: 25,
    lux: 12,
    garen: 20,
    irelia: 18,
    draven: 5,
    rumble: 12,
    lucian: 5,
    reksai: 45,
    ornn: 15,
    jax: 40,
    azir: 16,
    ezreal: 25,
    renata: 6,
    sivir: 15,
    fiora: 15
  };

  return (
    <div
      onClick={onClick}
      className={`relative w-[750px] rounded-md p-[1px] cursor-pointer transition-all duration-200 
        hover:scale-[1.01] ${isSelected ? "ring-2 ring-amber-400" : ""}`}
      style={{
        background: `linear-gradient(to right, ${fromColor}, ${toColor})`,
      }}
    >
      <div
        className="relative bg-zinc-900 rounded-md p-4 flex justify-between items-center"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: `50% ${legendCover[legend.toLowerCase().replace(/[^a-zA-Z]/g, '')] || 12}%`,
        }}
      >
        <div className="absolute inset-0 bg-black/40 rounded-md pointer-events-none" />
        <div className="relative flex flex-col">
          <span className="text-white font-medium truncate">{name}</span>
          {legend && <span className="text-sm text-zinc-400">{legend}</span>}
        </div>

        {/* Right side: date + edit icon */}
        <div className="relative flex items-center space-x-2 text-zinc-300">
          <button
            onClick={(e) => {
              e.stopPropagation(); // prevent triggering onClick for deck
              onEdit?.();
            }}
            className="p-1 rounded hover:bg-zinc-800 transition"
            title="Edit deck"
          >
            <Pencil
              size={16}
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            />
          </button>
          <span className="text-sm">{dateModified}</span>
        </div>
      </div>
    </div>
  );
}
