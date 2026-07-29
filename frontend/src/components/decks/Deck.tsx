import { Pencil } from "lucide-react";
import { LEGEND_IMAGE_COVER_MAP } from "@/lib/constants";
import StatusTag from "./StatusTag";

interface DeckProps {
  name: string;
  dateModified: string;
  colors: [string, string];
  legend: string;
  backgroundImage?: string;
  onClick?: () => void;
  isSelected?: boolean;
  onEdit?: () => void; // optional edit handler
  isComplete?: boolean;
  isIllegal?: boolean;
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
  isComplete = true,
  isIllegal = false,
}: DeckProps) {
  const [fromColor, toColor] = colors;

  return (
    <div
      onClick={onClick}
      className={`relative w-full rounded-md p-[1px] cursor-pointer transition-all duration-200
        hover:scale-[1.01] ${isSelected ? "ring-2 ring-[#caa368]" : ""}`}
      style={{
        background: `linear-gradient(to right, ${fromColor}, ${toColor})`,
      }}
    >
      <div className="relative bg-zinc-900 rounded-md p-4 flex justify-between items-center overflow-hidden">
        {backgroundImage && (
          <img
            src={backgroundImage}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              objectPosition: `50% ${LEGEND_IMAGE_COVER_MAP[legend.toLowerCase().replace(/[^a-zA-Z]/g, '')] || 12}%`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-black/20 rounded-md pointer-events-none" />
        <div className="relative flex flex-col gap-1.5">
          <span className="text-white font-medium truncate">{name}</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {legend && <StatusTag label={legend} color="zinc" />}
            {!isComplete && <StatusTag label="Incomplete" color="orange" />}
            {isIllegal && <StatusTag label="Illegal" color="red" />}
          </div>
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
                onEdit?.();
              }}
            />
          </button>
          <span className="text-sm">{dateModified}</span>
        </div>
      </div>
    </div>
  );
}
