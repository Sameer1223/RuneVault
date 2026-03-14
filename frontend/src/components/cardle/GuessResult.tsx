import type { CardData } from "@/types/deck";
import type { ComparisonResult } from "@/utils/cardleGameUtils";

interface GuessResultProps {
  guessCard: CardData;
  result: ComparisonResult;
}

function StatComparison({ label, value, result }: { label: string; value: number | string; result: string }) {
  let bgColor = "bg-gray-700";
  let icon = "=";

  if (result === "correct") {
    bgColor = "bg-green-600";
    icon = "✓";
  } else if (result === "higher") {
    bgColor = "bg-blue-600";
    icon = "↑";
  } else if (result === "lower") {
    bgColor = "bg-orange-600";
    icon = "↓";
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`${bgColor} rounded px-2 py-1 text-xs font-bold text-white w-12 flex items-center justify-center`}>
        {icon}
      </div>
      <span className="text-xs font-semibold text-gray-300">{label}</span>
      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  );
}

export default function GuessResult({ guessCard, result }: GuessResultProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-3">
      <div className="flex gap-4 items-start">
        {/* Card Image */}
        <div className="flex-shrink-0">
          <img
            src={`/TempCards/${guessCard.cardId}.avif`}
            alt={guessCard.name}
            className="w-24 h-32 object-cover rounded"
          />
        </div>

        {/* Card Info and Comparisons */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-3">{guessCard.name}</h3>

          <div className="grid grid-cols-5 gap-3 mb-3">
            {/* Stats */}
            <StatComparison label="Energy" value={guessCard.energy ?? "—"} result={result.energy} />
            <StatComparison label="Power" value={guessCard.power ?? "—"} result={result.power} />
            <StatComparison label="Might" value={guessCard.might ?? "—"} result={result.might} />

            {/* Color Match */}
            <div className="flex flex-col items-center gap-1">
              <div className={`${result.color ? "bg-green-600" : "bg-gray-700"} rounded px-2 py-1 text-xs font-bold text-white w-12 flex items-center justify-center`}>
                {result.color ? "✓" : "✗"}
              </div>
              <span className="text-xs font-semibold text-gray-300">Color</span>
              <span className="text-sm font-bold text-white">{guessCard.colors?.[0] ?? "—"}</span>
            </div>

            {/* Type Match */}
            <div className="flex flex-col items-center gap-1">
              <div className={`${result.type ? "bg-green-600" : "bg-gray-700"} rounded px-2 py-1 text-xs font-bold text-white w-12 flex items-center justify-center`}>
                {result.type ? "✓" : "✗"}
              </div>
              <span className="text-xs font-semibold text-gray-300">Type</span>
              <span className="text-sm font-bold text-white">{guessCard.type}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
