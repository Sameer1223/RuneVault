import { useState } from "react";

interface VictoryModalProps {
  cardName: string;
  guessCount: number;
  maxGuesses: number;
  streak: number;
  averageGuesses: number;
  guessDistribution: Record<string, number>;
}

export default function VictoryModal({
  cardName,
  guessCount,
  maxGuesses,
  streak,
  averageGuesses,
  guessDistribution,
}: VictoryModalProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const distributionRows = [
    ...Array.from({ length: maxGuesses }, (_, idx) => {
      const label = `${idx + 1}`;
      return { label, count: guessDistribution[label] ?? 0 };
    }),
    { label: "Fail", count: guessDistribution.fail ?? 0 },
  ];

  const maxCount = Math.max(1, ...distributionRows.map((row) => row.count));
  const distributionText = distributionRows
    .filter((row) => row.count > 0)
    .map((row) => `${row.label}: ${"█".repeat(Math.min(row.count, 10))} (${row.count})`)
    .join("\n");

  const shareText = `🎉 I solved Riftboundle in ${guessCount} ${guessCount === 1 ? "guess" : "guesses"}!\n\n🔥 Streak: ${streak}\n📊 Average: ${averageGuesses} guesses\n\nGuess Distribution:\n${distributionText || "No history yet"}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="relative mx-4 w-full max-w-md rounded-3xl border border-emerald-300/30 bg-gradient-to-br from-emerald-950/80 to-slate-950/80 p-6 shadow-2xl backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-3 top-3 rounded-md px-2 py-1 text-slate-300 transition hover:bg-white/10 hover:text-white"
          aria-label="Close victory modal"
        >
          ✕
        </button>
        {/* Celebration text */}
        <div className="mb-4 text-center">
          <p className="mb-2 text-4xl">🎉</p>
          <h2 className="mb-1 text-2xl font-bold text-emerald-200">Victory!</h2>
          <p className="text-emerald-100/70 text-sm">{cardName}</p>
        </div>

        {/* Guesses bar */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">Guesses</span>
            <span className="font-semibold text-emerald-200">{guessCount} / {maxGuesses}</span>
          </div>
          <div className="h-3 rounded-full bg-slate-800/50 overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all"
              style={{ width: `${(guessCount / maxGuesses) * 100}%` }}
            />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-lg bg-black/30 border border-white/10 p-3 text-center">
            <div className="text-2xl font-bold text-cyan-300">{streak}</div>
            <div className="text-xs text-slate-400 mt-1">Current Streak</div>
          </div>
          <div className="rounded-lg bg-black/30 border border-white/10 p-3 text-center">
            <div className="text-2xl font-bold text-indigo-300">{averageGuesses}</div>
            <div className="text-xs text-slate-400 mt-1">Avg. Guesses</div>
          </div>
        </div>

        {/* Distribution chart */}
        <div className="mb-5 rounded-xl border border-white/10 bg-black/25 p-3">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-300">Guess Distribution</div>
          <div className="space-y-2">
            {distributionRows.map((row) => (
              <div key={row.label} className="flex items-center gap-2">
                <div className="w-8 text-xs font-semibold text-slate-300">{row.label}</div>
                <div className="h-3 flex-1 overflow-hidden rounded-full border border-white/10 bg-slate-900/70">
                  <div
                    className={`h-full transition-all ${row.label === "Fail" ? "bg-rose-500/80" : "bg-cyan-400/80"}`}
                    style={{ width: `${(row.count / maxCount) * 100}%` }}
                  />
                </div>
                <div className="w-8 text-right text-xs text-slate-300">{row.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
            copied
              ? "bg-emerald-600/80 text-emerald-50"
              : "bg-emerald-600 hover:bg-emerald-500 text-white"
          }`}
        >
          {copied ? "✓ Copied to clipboard" : "📋 Copy result"}
        </button>
      </div>
    </div>
  );
}
