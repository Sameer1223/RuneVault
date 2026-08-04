import { useState, useMemo, useEffect } from "react";
import { Trophy, X } from "lucide-react";
import cardData from "@/data/cards.json";
import type { CardData } from "@/types/deck";
import CardImage from "@/components/CardImage";
import CardSearch from "@/components/cardle/CardSearch";
import GuessResult from "@/components/cardle/GuessResult";
import { GUESS_GRID_TEMPLATE, STATUS } from "@/components/cardle/guessResultConstants";
import ResultModal from "@/components/cardle/ResultModal";
import { compareCards, getDailySeed, getRandomCardBySeed, updateCareerStats, loadCareerStats, loadTodayProgress, saveTodayProgress } from "@/utils/cardleGameUtils";

const EXCLUDED_CARD_TYPES = new Set(["battlefield", "token", "legend", "rune", "alternate art", "overnumbered", "signature"]);

const COLUMN_HEADERS = ["Guess", "Card", "Energy", "Power", "Might", "Color", "Type", "Set", "Rarity"];

const LEGEND_ITEMS: { status: keyof typeof STATUS; label: string }[] = [
  { status: "correct", label: "Exact match" },
  { status: "incorrect", label: "No match" },
  { status: "higher", label: "Answer is higher" },
  { status: "lower", label: "Answer is lower" },
  { status: "partial", label: "Partial overlap" },
  { status: "unknown", label: "Not present" },
];

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
      <div className="flex h-full items-center justify-center text-zinc-400">
        Loading today's card...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#121418] text-white mt-16">
      <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-[#caa368]/5 blur-3xl" />
      <div className="pointer-events-none absolute top-24 -right-24 h-96 w-96 rounded-full bg-[#caa368]/5 blur-3xl" />

      <div className="relative mx-auto max-w-[1320px] px-4 py-8">
        {/* Result Modal - shown for both a win and a loss so either outcome can be shared */}
        {(gameWon || gameLost) && answerCard && (
          <ResultModal
            didWin={gameWon}
            cardName={answerCard.name}
            guessCount={guesses.length}
            maxGuesses={maxGuesses}
            streak={careerStats.currentStreak}
            averageGuesses={averageGuesses}
            guessDistribution={careerStats.guessDistribution}
          />
        )}

        {/* Header */}
        <div className="mb-6 overflow-hidden rounded-md border border-zinc-800 bg-[#1E1E1E] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center rounded-full border border-[#caa368]/40 bg-[#caa368]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#caa368]">
                Daily Challenge
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white">
                Riftboundle
              </h1>
              <p className="mt-1 text-sm text-zinc-400">Guess the daily card in {maxGuesses} tries</p>
            </div>

            <div className="rounded-md border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm">
              <div className="text-xs uppercase tracking-wide text-zinc-500">Seed</div>
              <div className="mt-0.5 font-medium text-zinc-200">{getDailySeed()}</div>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
              <span>Progress</span>
              <span>{guesses.length} / {maxGuesses}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-[#caa368] transition-all"
                style={{ width: `${(guesses.length / maxGuesses) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Game Status */}
        {gameWon && (
          <div className="mb-6 rounded-md border border-[#caa368]/40 bg-[#caa368]/10 p-5 text-center">
            <div className="flex items-center justify-center gap-2">
              <Trophy className="h-5 w-5 text-[#caa368]" />
              <p className="text-xl font-semibold text-white">{answerCard.name}</p>
            </div>
            <p className="mt-1 text-sm text-zinc-400">
              Solved in {guesses.length} {guesses.length === 1 ? "try" : "tries"}
            </p>
          </div>
        )}

        {gameLost && (
          <div className="mb-6 rounded-md border border-red-500/30 bg-red-500/5 p-5 text-center">
            <div className="flex items-center justify-center gap-2">
              <X className="h-5 w-5 text-red-400" />
              <p className="text-xl font-semibold text-white">{answerCard.name}</p>
            </div>
            <p className="mt-1 text-sm text-zinc-400">Out of guesses - better luck tomorrow</p>
            <CardImage
              cardId={answerCard.cardId}
              alt={answerCard.name}
              className="mx-auto mt-4 h-48 w-36 sm:h-64 sm:w-48 rounded-md border border-zinc-800 object-cover shadow-2xl"
            />
          </div>
        )}

        {/* Input */}
        {!gameWon && !gameLost && (
          <div className="relative z-40 mb-6 rounded-md border border-zinc-800 bg-[#1E1E1E] p-4">
            <p className="mb-2 text-sm text-zinc-400">Choose your next guess</p>
            <CardSearch
              cards={playableCardPool}
              onSelect={handleGuess}
              guessedCardIds={guessedCardIds}
            />
          </div>
        )}

        {/* Guesses */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Your Guesses</h2>
            <span className="text-xs text-zinc-500">{guessesRemaining} remaining</span>
          </div>

          {guesses.length > 0 && (
            <div className="overflow-x-auto rounded-md border border-zinc-800 bg-[#1E1E1E] scroll-styled">
              <div className="min-w-[1013px]">
                <div
                  className="grid border-b border-zinc-800 bg-zinc-900/60"
                  style={{ gridTemplateColumns: GUESS_GRID_TEMPLATE }}
                >
                  {COLUMN_HEADERS.map((header) => (
                    <div
                      key={header}
                      className="border-r border-zinc-800 px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500 last:border-r-0"
                    >
                      {header}
                    </div>
                  ))}
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
            </div>
          )}

          {guesses.length === 0 && (
            <div className="rounded-md border border-dashed border-zinc-800 bg-zinc-900/30 p-6 text-center text-sm text-zinc-500">
              No guesses yet, start typing a card name above.
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mb-8 rounded-md border border-zinc-800 bg-[#1E1E1E] p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-300">
            Legend &amp; Columns
          </h3>
          <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            <div className="space-y-3 rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Status icons</div>
              <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                {LEGEND_ITEMS.map(({ status, label }) => {
                  const meta = STATUS[status];
                  const { Icon } = meta;
                  return (
                    <div key={status} className="flex items-center gap-2">
                      <span
                        className={`${meta.badge} ${meta.text} flex h-5 w-5 shrink-0 items-center justify-center rounded-md`}
                      >
                        <Icon className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                      <span className="text-zinc-300">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 rounded-md border border-zinc-800 bg-zinc-900/40 p-3 text-xs">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Column details</div>
              <ul className="space-y-1.5 text-zinc-400">
                <li>
                  <span className="font-medium text-zinc-200">Energy / Power / Might:</span> arrows show whether the answer is higher or lower
                </li>
                <li>
                  <span className="font-medium text-zinc-200">Color:</span> checks for color overlap or an exact match
                </li>
                <li>
                  <span className="font-medium text-zinc-200">Type / Set / Rarity:</span> exact match only
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
