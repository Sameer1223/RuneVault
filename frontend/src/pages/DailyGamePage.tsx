import { useState, useMemo, useEffect } from "react";
import cardData from "@/data/cards.json";
import type { CardData } from "@/types/deck";
import CardSearch from "@/components/cardle/CardSearch";
import GuessResult from "@/components/cardle/GuessResult";
import { compareCards, getDailySeed, getRandomCardBySeed } from "@/utils/cardleGameUtils";

const EXCLUDED_CARD_TYPES = new Set(["battlefield", "token", "legend", "rune"]);

export default function DailyGamePage() {
  const [answerCard, setAnswerCard] = useState<CardData | null>(null);
  const [guesses, setGuesses] = useState<CardData[]>([]);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);

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

    // Load saved game state
    const savedGame = localStorage.getItem(`cardle_${seed}`);
    if (savedGame) {
      const { guesses: savedGuesses, won, lost } = JSON.parse(savedGame);
      setGuesses(savedGuesses);
      setGameWon(won);
      setGameLost(lost);
    }
  }, [playableCardPool]);

  const guessedCardIds = useMemo(() => new Set(guesses.map(g => g.cardId)), [guesses]);

  const handleGuess = (card: CardData) => {
    if (!answerCard || gameWon || gameLost) return;

    const newGuesses = [...guesses, card];
    setGuesses(newGuesses);

    const isWin = card.cardId === answerCard.cardId;
    const isLoss = newGuesses.length >= 6;

    setGameWon(isWin);
    setGameLost(isLoss && !isWin);

    // Save game state
    const seed = getDailySeed();
    localStorage.setItem(
      `cardle_${seed}`,
      JSON.stringify({
        guesses: newGuesses,
        won: isWin,
        lost: isLoss && !isWin,
      })
    );
  };

  if (!answerCard) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        Loading today's card...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white mt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2">Riftboundle</h1>
          <p className="text-gray-400">Guess the daily card in 6 tries</p>
          <p className="text-sm text-gray-500 mt-2">Seed: {getDailySeed()}</p>
        </div>

        {/* Game Status */}
        {gameWon && (
          <div className="bg-green-900 border border-green-600 rounded-lg p-4 mb-6 text-center">
            <p className="text-xl font-bold">🎉 You won! The card was {answerCard.name}</p>
            <p className="text-sm text-gray-300 mt-2">You guessed it in {guesses.length} {guesses.length === 1 ? 'try' : 'tries'}</p>
          </div>
        )}

        {gameLost && (
          <div className="bg-red-900 border border-red-600 rounded-lg p-4 mb-6 text-center">
            <p className="text-xl font-bold">😢 Game Over! The card was {answerCard.name}</p>
            <img
              src={`/TempCards/${answerCard.cardId}.avif`}
              alt={answerCard.name}
              className="w-48 h-64 object-cover rounded mx-auto mt-4"
            />
          </div>
        )}

        {/* Guesses */}
        <div className="mb-8">
          {guesses.map((guess, idx) => (
            <GuessResult key={idx} guessCard={guess} result={compareCards(guess, answerCard)} />
          ))}
        </div>

        {/* Input */}
        {!gameWon && !gameLost && (
          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-2">
              Guesses: {guesses.length} / 6
            </p>
            <CardSearch
              cards={playableCardPool}
              onSelect={handleGuess}
              guessedCardIds={guessedCardIds}
            />
          </div>
        )}

        {/* Legend */}
        <div className="bg-gray-800 rounded-lg p-4 mb-8">
          <h3 className="font-bold mb-3">How to play:</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-green-600 rounded px-2 py-1 text-xs font-bold w-8 flex items-center justify-center">✓</div>
                <span>Correct value</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-blue-600 rounded px-2 py-1 text-xs font-bold w-8 flex items-center justify-center">↑</div>
                <span>Value is higher</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-orange-600 rounded px-2 py-1 text-xs font-bold w-8 flex items-center justify-center">↓</div>
                <span>Value is lower</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-gray-700 rounded px-2 py-1 text-xs font-bold w-8 flex items-center justify-center">✗</div>
                <span>Doesn't match</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}