import type { CardData } from "@/types/deck";

export interface ComparisonResult {
  energy: "correct" | "higher" | "lower" | "unknown";
  power: "correct" | "higher" | "lower" | "unknown";
  might: "correct" | "higher" | "lower" | "unknown";
  color: boolean; // true if color matches
  type: boolean; // true if type matches
}

export function compareCards(guess: CardData, answer: CardData): ComparisonResult {
  return {
    energy: compareNumber(guess.energy ?? 0, answer.energy ?? 0),
    power: compareNumber(guess.power ?? 0, answer.power ?? 0),
    might: compareNumber(guess.might ?? 0, answer.might ?? 0),
    color: hasMatchingColor(guess, answer),
    type: guess.type === answer.type,
  };
}

function compareNumber(
  guess: number,
  answer: number
): "correct" | "higher" | "lower" | "unknown" {
  if (guess === answer) return "correct";
  if (guess > answer) return "higher";
  if (guess < answer) return "lower";
  return "unknown";
}

function hasMatchingColor(guess: CardData, answer: CardData): boolean {
  const guessColors = guess.colors ?? [];
  const answerColors = answer.colors ?? [];
  return guessColors.some(color => answerColors.includes(color));
}

export function getDailySeed(): string {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

export function getRandomCardBySeed(cards: CardData[], seed: string): CardData {
  // Simple seeded random using seed string
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % cards.length;
  return cards[index];
}

export function getComparisonColor(result: keyof Omit<ComparisonResult, "color" | "type">): string {
  if (typeof result === 'string' && result === "correct") return "bg-green-600";
  if (result === "higher") return "bg-blue-600";
  if (result === "lower") return "bg-orange-600";
  return "bg-gray-600";
}
