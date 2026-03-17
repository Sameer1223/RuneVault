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
  return `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
}

export interface CareerStats {
  currentStreak: number;
  totalWins: number;
  totalGuessesTaken: number;
  guessDistribution: Record<string, number>;
  lastPlayedSeed?: string;
  lastResultBucket?: string;
}

const STATS_KEY = 'cardle_stats';
const DAILY_PROGRESS_KEY = 'cardle_today_progress';

export interface DailyProgress {
  seed: string;
  guessIds: string[];
  won: boolean;
  lost: boolean;
}

function getDefaultCareerStats(): CareerStats {
  return {
    currentStreak: 0,
    totalWins: 0,
    totalGuessesTaken: 0,
    guessDistribution: {},
    lastPlayedSeed: undefined,
    lastResultBucket: undefined,
  };
}

export function loadCareerStats(): CareerStats {
  try {
    const saved = localStorage.getItem(STATS_KEY);
    if (!saved) return getDefaultCareerStats();

    const parsed = JSON.parse(saved) as Partial<CareerStats>;
    return {
      ...getDefaultCareerStats(),
      ...parsed,
      guessDistribution: parsed.guessDistribution ?? {},
    };
  } catch {
    return getDefaultCareerStats();
  }
}

export function updateCareerStats(
  won: boolean,
  guessCount: number,
  currentSeed: string,
  maxGuesses: number
): CareerStats {
  const stats = loadCareerStats();
  const previousSeed = stats.lastPlayedSeed;
  const isSameDay = previousSeed === currentSeed;
  const currentBucket = won
    ? String(Math.min(Math.max(guessCount, 1), maxGuesses))
    : "fail";

  if (isSameDay) {
    // If this day was already recorded, replace previous bucket with current bucket.
    // This keeps distribution accurate and avoids duplicate inflation.
    if (stats.lastResultBucket === currentBucket) {
      return stats;
    }

    if (stats.lastResultBucket) {
      const prevCount = stats.guessDistribution[stats.lastResultBucket] ?? 0;
      stats.guessDistribution[stats.lastResultBucket] = Math.max(0, prevCount - 1);
    }

    stats.guessDistribution[currentBucket] = (stats.guessDistribution[currentBucket] ?? 0) + 1;
    stats.lastResultBucket = currentBucket;
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    return stats;
  }

  if (won) {
    stats.currentStreak += 1;
    stats.totalWins += 1;
    stats.totalGuessesTaken += guessCount;
    stats.guessDistribution[currentBucket] = (stats.guessDistribution[currentBucket] ?? 0) + 1;
  } else {
    stats.currentStreak = 0;
    stats.guessDistribution[currentBucket] = (stats.guessDistribution[currentBucket] ?? 0) + 1;
  }

  stats.lastPlayedSeed = currentSeed;
  stats.lastResultBucket = currentBucket;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  return stats;
}

export function getAverageGuesses(): number {
  const stats = loadCareerStats();
  return stats.totalWins > 0 ? Math.round((stats.totalGuessesTaken / stats.totalWins) * 10) / 10 : 0;
}

export function saveTodayProgress(seed: string, guessIds: string[], won: boolean, lost: boolean): void {
  const payload: DailyProgress = { seed, guessIds, won, lost };
  localStorage.setItem(DAILY_PROGRESS_KEY, JSON.stringify(payload));
}

export function loadTodayProgress(seed: string): DailyProgress | null {
  try {
    const raw = localStorage.getItem(DAILY_PROGRESS_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as DailyProgress;
    if (parsed.seed !== seed) {
      // Day rolled over: remove stale temporary progress
      localStorage.removeItem(DAILY_PROGRESS_KEY);
      return null;
    }
    return parsed;
  } catch {
    // Corrupt payload should not linger
    localStorage.removeItem(DAILY_PROGRESS_KEY);
    return null;
  }
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
