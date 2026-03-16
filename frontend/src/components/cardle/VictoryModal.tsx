import { useState } from "react";

interface VictoryModalProps {
  cardName: string;
  guessCount: number;
  maxGuesses: number;
  streak: number;
  averageGuesses: number;
}

export default function VictoryModal({
  cardName,
  guessCount,
  maxGuesses,
  streak,
  averageGuesses,
}: VictoryModalProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `🎉 I solved Riftboundle in ${guessCount} ${guessCount === 1 ? "guess" : "guesses"}!\n\n🔥 Streak: ${streak}\n📊 Average: ${averageGuesses} guesses`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="relative max-w-md w-full mx-4 rounded-3xl border border-emerald-300/30 bg-gradient-to-br from-emerald-950/80 to-slate-950/80 p-8 shadow-2xl backdrop-blur-md">
        {/* Celebration text */}
        <div className="text-center mb-6">
          <p className="text-5xl mb-3">🎉</p>
          <h2 className="text-3xl font-bold text-emerald-200 mb-1">Victory!</h2>
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

        {/* Share text preview */}
        <div className="mt-4 p-3 rounded-lg bg-black/40 border border-white/5 text-xs text-slate-300 whitespace-pre-wrap">
          {shareText}
        </div>
      </div>
    </div>
  );
}
