import { useState, useMemo, useEffect } from "react";
import cardData from "@/data/cards.json";
import type { CardData } from "@/types/deck";
import CardSearch from "@/components/cardle/CardSearch";
import GuessResult from "@/components/cardle/GuessResult";
import { GUESS_GRID_TEMPLATE } from "@/components/cardle/guessResultConstants";
import VictoryModal from "@/components/cardle/VictoryModal";
import { compareCards, getDailySeed, getRandomCardBySeed, updateCareerStats, loadCareerStats, loadTodayProgress, saveTodayProgress } from "@/utils/cardleGameUtils";

const EXCLUDED_CARD_TYPES = new Set(["battlefield", "token", "legend", "rune", "alternate art", "overnumbered", "signature"]);

export default function DailyGamePage() {
  const [answerCard, setAnswerCard] = useState<CardData | null>(null);
  const [guesses, setGuesses] = useState<CardData[]>([]);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [careerStats, setCareerStats] = useState(loadCareerStats());
  const maxGuesses = 8;

  const playableCardPool = useMemo(
    () =>
      (cardData as CardData[]).filter(
        (card) => !EXCLUDED_CARD_TYPES.has((card.type ?? "").toLowerCase())
      ),
    []
  );

  useEffect(() => {
    // Initialize daily card
    const seed = getDailySeed();
    const card = getRandomCardBySeed(playableCardPool, seed);
    setAnswerCard(card);

    // Restore today's progress (guesses + status)
    const progress = loadTodayProgress(seed);
    if (progress) {
      const cardsById = new Map(playableCardPool.map((c) => [c.cardId, c] as const));
      const restoredGuesses = progress.guessIds
        .map((id) => cardsById.get(id))
        .filter((c): c is CardData => Boolean(c));

      setGuesses(restoredGuesses);
      setGameWon(progress.won);
      setGameLost(progress.lost);
    }

    // Load career stats (no per-game state restored)
    setCareerStats(loadCareerStats());
  }, [playableCardPool]);

  const guessedCardIds = useMemo(() => new Set(guesses.map(g => g.cardId)), [guesses]);
  const guessesRemaining = Math.max(0, maxGuesses - guesses.length);
  const averageGuesses = careerStats.totalWins > 0
    ? Math.round((careerStats.totalGuessesTaken / careerStats.totalWins) * 10) / 10
    : 0;

  const handleGuess = (card: CardData) => {
    if (!answerCard || gameWon || gameLost) return;

    const newGuesses = [...guesses, card];
    setGuesses(newGuesses);

    const isWin = card.cardId === answerCard.cardId;
    const isLoss = newGuesses.length >= maxGuesses;

    setGameWon(isWin);
    setGameLost(isLoss && !isWin);

    const seed = getDailySeed();
    saveTodayProgress(
      seed,
      newGuesses.map((g) => g.cardId),
      isWin,
      isLoss && !isWin
    );

    if (isWin || isLoss) {
      // Update career stats only when the game is finished
      const updatedStats = updateCareerStats(isWin, newGuesses.length, seed, maxGuesses);
      setCareerStats(updatedStats);
    }
  };

  if (!answerCard) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        Loading today's card...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white mt-16">
      <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute top-24 -right-24 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-[1320px] px-4 py-8">
        {/* Victory Modal */}
        {gameWon && answerCard && (
          <VictoryModal
            cardName={answerCard.name}
            guessCount={guesses.length}
            maxGuesses={maxGuesses}
            streak={careerStats.currentStreak}
            averageGuesses={averageGuesses}
            guessDistribution={careerStats.guessDistribution}
          />
        )}

        {/* Header */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                Daily Challenge
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-300 via-indigo-300 to-fuchsia-300 bg-clip-text text-transparent">
                Riftboundle
              </h1>
              <p className="mt-1 text-sm text-slate-300">Guess the daily card in {maxGuesses} tries</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
              <div className="font-semibold text-white">Seed</div>
              <div className="text-slate-400">{getDailySeed()}</div>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
              <span>Progress</span>
              <span>{guesses.length} / {maxGuesses}</span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 transition-all"
                style={{ width: `${(guesses.length / maxGuesses) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Game Status */}
        {gameWon && (
          <div className="mb-6 rounded-2xl border border-emerald-300/30 bg-emerald-500/15 p-5 text-center backdrop-blur-md">
            <p className="text-2xl font-bold text-emerald-200">🎉 You won! {answerCard.name}</p>
            <p className="mt-2 text-sm text-emerald-100/90">Solved in {guesses.length} {guesses.length === 1 ? 'try' : 'tries'}</p>
          </div>
        )}

        {gameLost && (
          <div className="mb-6 rounded-2xl border border-rose-300/30 bg-rose-500/15 p-5 text-center backdrop-blur-md">
            <p className="text-2xl font-bold text-rose-200">😢 Game Over! {answerCard.name}</p>
            <img
              src={`/TempCards/${answerCard.cardId}.avif`}
              alt={answerCard.name}
              className="mx-auto mt-4 h-64 w-48 rounded-xl border border-white/10 object-cover shadow-2xl"
            />
          </div>
        )}

        {/* Input */}
        {!gameWon && !gameLost && (
          <div className="relative z-40 mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <p className="mb-2 text-sm text-slate-300">
              Choose your next guess
            </p>
            <CardSearch
              cards={playableCardPool}
              onSelect={handleGuess}
              guessedCardIds={guessedCardIds}
            />
          </div>
        )}

        {/* Guesses */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Your Guesses</h2>
            <span className="text-xs text-slate-400">{guessesRemaining} remaining</span>
          </div>

          {guesses.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-gradient-to-b from-slate-900/70 to-black/30 shadow-2xl shadow-black/25">
              <div className="grid border-b border-white/10 bg-white/[0.04] backdrop-blur-sm" style={{ gridTemplateColumns: GUESS_GRID_TEMPLATE }}>
                <div className="border-r border-white/10 px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Guess</div>
                <div className="border-r border-white/10 px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Card</div>
                <div className="border-r border-white/10 px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Energy</div>
                <div className="border-r border-white/10 px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Power</div>
                <div className="border-r border-white/10 px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Might</div>
                <div className="border-r border-white/10 px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Color</div>
                <div className="border-r border-white/10 px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Type</div>
                <div className="border-r border-white/10 px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Set</div>
                <div className="px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Rarity</div>
              </div>

              {[...guesses].reverse().map((guess, idx) => {
                const guessNumber = guesses.length - idx;

                return (
                  <GuessResult
                    key={guess.cardId}
                    guessCard={guess}
                    result={compareCards(guess, answerCard)}
                    guessNumber={guessNumber}
                  />
                );
              })}
            </div>
          )}

          {guesses.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/20 bg-white/[0.03] p-6 text-center text-sm text-slate-400">
              No guesses yet — start typing a card name below.
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">Legend & Columns</h3>
          <div className="grid grid-cols-1 gap-3 text-sm text-slate-300 md:grid-cols-2">
            <div className="space-y-2 rounded-lg bg-black/20 p-3">
              <div className="font-semibold text-slate-200">Status icons</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-md bg-green-600 font-bold">✓</span><span>Exact match</span></div>
                <div className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-md bg-red-700 font-bold">✗</span><span>No match</span></div>
                <div className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 font-bold">↑</span><span>Answer is higher</span></div>
                <div className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-600 font-bold">↓</span><span>Answer is lower</span></div>
                <div className="col-span-2 flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-md bg-yellow-600 font-bold">◐</span><span>Partial color overlap</span></div>
                <div className="col-span-2 flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-700 font-bold">—</span><span>Value not present / unknown</span></div>
              </div>
            </div>

            <div className="space-y-2 rounded-lg bg-black/20 p-3 text-xs">
              <div className="font-semibold text-slate-200 text-sm">Column meanings</div>
              <ul className="space-y-1.5 text-slate-300">
                <li><span className="font-semibold text-slate-100">Energy / Power / Might:</span> Numbers with icons showing greater, less than, or equal</li>
                <li><span className="font-semibold text-slate-100">Color:</span> Checks color overlap or match</li>
                <li><span className="font-semibold text-slate-100">Type / Set / Rarity:</span> Checks if matches exactly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}