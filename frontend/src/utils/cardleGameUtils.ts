import type { CardData } from "@/types/deck";

export interface ComparisonResult {
  energy: "correct" | "higher" | "lower" | "unknown" | "incorrect";
  power: "correct" | "higher" | "lower" | "unknown" | "incorrect";
  might: "correct" | "higher" | "lower" | "unknown" | "incorrect";
  color: "correct" | "partial" | "incorrect" | "unknown";
  type: boolean; // true if type matches
  set: boolean; // true if set matches
  rarity: boolean; // true if rarity matches
}

export function compareCards(guess: CardData, answer: CardData): ComparisonResult {
  return {
    energy: compareNumber(guess.energy, answer.energy),
    power: compareNumber(guess.power, answer.power),
    might: compareNumber(guess.might, answer.might),
    color: compareColors(guess, answer),
    type: guess.type === answer.type,
    set: guess.set === answer.set,
    rarity: guess.rarity === answer.rarity,
  };
}

function compareNumber(
  guess?: number,
  answer?: number
): "correct" | "higher" | "lower" | "unknown" | "incorrect" {
  if (guess === answer) return "correct";
  if (answer === undefined) return "incorrect";
  if (guess === undefined) return "incorrect";
  if (guess < answer) return "higher";
  if (guess > answer) return "lower";
  return "unknown";
}

function compareColors(
  guess: CardData,
  answer: CardData
): "correct" | "partial" | "incorrect" | "unknown" {
  const guessColors = guess.colors ?? [];
  const answerColors = answer.colors ?? [];

  if (guessColors.length === 0 || answerColors.length === 0) {
    return "unknown";
  }

  const guessSet = new Set(guessColors);
  const answerSet = new Set(answerColors);

  const hasOverlap = [...guessSet].some((color) => answerSet.has(color));
  if (!hasOverlap) return "incorrect";

  const sameLength = guessSet.size === answerSet.size;
  const exactMatch = sameLength && [...guessSet].every((color) => answerSet.has(color));
  return exactMatch ? "correct" : "partial";
}

export function getDailySeed(): string {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

export function getRandomCardBySeed(cards: CardData[], seed: string): CardData {
  if (cards.length === 0) {
    throw new Error("Cannot select daily card from an empty card pool");
  }

  // FNV-1a hash for better distribution across similar seeds
  let hash = 2166136261; // FNV-1a 32-bit offset basis
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619); // FNV prime
    hash >>>= 0; // keep unsigned 32-bit
  }

  // One pass of a Murmur-style finalizer to avalanche the bits further
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35);
  hash ^= hash >>> 16;
  hash >>>= 0;

  return cards[hash % cards.length];
}

export function getComparisonColor(result: "correct" | "higher" | "lower" | "unknown" | "incorrect"): string {
  if (result === "correct") return "bg-green-600";
  if (result === "higher") return "bg-blue-600";
  if (result === "lower") return "bg-orange-600";
  if (result === "incorrect") return "bg-red-700";
  return "bg-gray-600";
}
