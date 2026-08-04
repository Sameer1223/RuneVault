import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Flame, Target, Copy, Check, X } from "lucide-react";

interface ResultModalProps {
  didWin: boolean;
  cardName: string;
  guessCount: number;
  maxGuesses: number;
  streak: number;
  averageGuesses: number;
  guessDistribution: Record<string, number>;
}

const SHARE_URL = "https://runevault.app/riftboundle";

export default function ResultModal({
  didWin,
  cardName,
  guessCount,
  maxGuesses,
  streak,
  averageGuesses,
  guessDistribution,
}: ResultModalProps) {
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

  // Today's bucket is "Fail" on a loss, otherwise the number of guesses taken.
  const todayLabel = didWin ? String(guessCount) : "Fail";

  // Bars are scaled relative to the biggest bucket (rather than raw counts) so
  // a long history doesn't produce a wall of blocks in the shared message.
  const distributionText = distributionRows
    .filter((row) => row.count > 0)
    .map((row) => {
      const barLength = Math.max(1, Math.round((row.count / maxCount) * 8));
      const isToday = row.label === todayLabel;
      return `${row.label.padEnd(5)}${"█".repeat(barLength)} ${row.count}${isToday ? " ←" : ""}`;
    })
    .join("\n");

  const headline = didWin
    ? `🎯 I completed today's Riftboundle in ${guessCount} guesses!`
    : `💀 I failed today's Riftboundle!`;

  const shareText = [
    headline,
    // A loss always resets the streak to 0, so the line would just read
    // "0 day streak" - drop it entirely rather than share a dead stat.
    ...(streak > 0 ? [`🔥 ${streak} day streak`] : []),
    ``,
    `Guess distribution`,
    distributionText || "No history yet",
    ``,
    `Try it yourself at`,
    SHARE_URL,
  ].join("\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const accent = didWin ? "#caa368" : "#ef4444";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={() => setIsOpen(false)}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md overflow-hidden rounded-md border border-zinc-800 bg-[#1a1a1a] p-6 pt-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent bar */}
        <div className="absolute left-0 right-0 top-0 h-[3px]" style={{ backgroundColor: accent }} />

        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-3 top-3 rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
          aria-label="Close result modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-5 text-center">
          <div
            className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full border"
            style={{ borderColor: `${accent}66`, backgroundColor: `${accent}1a` }}
          >
            {didWin ? (
              <Trophy className="h-6 w-6" style={{ color: accent }} />
            ) : (
              <X className="h-6 w-6" style={{ color: accent }} />
            )}
          </div>
          <h2 className="text-xl font-semibold text-white">
            {didWin ? "Solved it!" : "Out of guesses"}
          </h2>
          <p className="mt-1 text-sm text-zinc-400">{cardName}</p>
        </div>

        {/* Guesses bar */}
        <div className="mb-5 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Guesses</span>
            <span className="font-semibold" style={{ color: accent }}>
              {guessCount} / {maxGuesses}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(guessCount / maxGuesses) * 100}%`, backgroundColor: accent }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-md border border-zinc-800 bg-zinc-900/60 p-3 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <Flame className="h-4 w-4 text-[#caa368]" />
              <span className="text-2xl font-semibold text-white">{streak}</span>
            </div>
            <div className="mt-1 text-xs text-zinc-500">Current streak</div>
          </div>
          <div className="rounded-md border border-zinc-800 bg-zinc-900/60 p-3 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <Target className="h-4 w-4 text-[#caa368]" />
              <span className="text-2xl font-semibold text-white">{averageGuesses}</span>
            </div>
            <div className="mt-1 text-xs text-zinc-500">Avg. guesses</div>
          </div>
        </div>

        {/* Distribution */}
        <div className="mb-5 rounded-md border border-zinc-800 bg-zinc-900/60 p-3">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Guess distribution
          </div>
          <div className="space-y-1.5">
            {distributionRows.map((row) => {
              const isToday = row.label === todayLabel;
              return (
                <div key={row.label} className="flex items-center gap-2">
                  <div className="w-8 text-xs font-medium text-zinc-500">{row.label}</div>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isToday
                          ? row.label === "Fail"
                            ? "bg-red-500"
                            : "bg-[#caa368]"
                          : row.label === "Fail"
                            ? "bg-red-500/40"
                            : "bg-zinc-600"
                      }`}
                      style={{ width: `${(row.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <div className="w-6 text-right text-xs text-zinc-500">{row.count}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Share */}
        <button
          onClick={handleCopy}
          className={`flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${
            copied
              ? "border border-[#caa368]/50 bg-[#caa368]/20 text-[#caa368]"
              : "bg-[#caa368] text-zinc-900 hover:bg-[#d9b57a]"
          }`}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied to clipboard" : "Share result"}
        </button>
      </motion.div>
    </div>
  );
}
