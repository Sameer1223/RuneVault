import React, { useMemo, type ReactNode } from "react";
import cardData from "../data/cards.json";
import type { DeckData } from "@/data/emptyDeckTemplate";

type CardEntry = (typeof cardData)[number];

export interface DeckStat {
  label: string;
  value: ReactNode;
  description?: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface DeckStatsResult {
  stats: DeckStat[];
  handProbabilities: DeckStat[];
  energyData: ChartDataPoint[];
  powerData: ChartDataPoint[];
  typeData: ChartDataPoint[];
  typeColors: Record<string, string>;
}

function comb(a: number, b: number): number {
  if (b > a || b < 0) return 0;
  if (b === 0 || b === a) return 1;
  if (b > a / 2) b = a - b;
  let res = 1;
  for (let i = 1; i <= b; i++) {
    res = (res * (a - i + 1)) / i;
  }
  return res;
}

/** P(X = j) for a hypergeometric distribution: population N, K successes, n drawn. */
function hypergeomPMF(K: number, N: number, n: number, j: number): number {
  if (j < 0 || j > n || j > K || n - j > N - K) return 0;
  const totalWays = comb(N, n);
  if (totalWays === 0) return 0;
  return (comb(K, j) * comb(N - K, n - j)) / totalWays;
}

/** P(X >= k) for a hypergeometric distribution: population N, K successes, n drawn. */
function hypergeomAtLeast(K: number, N: number, n: number, k: number): number {
  if (K <= 0) return 0;
  let cumulative = 0;
  for (let j = 0; j < k; j++) {
    cumulative += hypergeomPMF(K, N, n, j);
  }
  return Math.max(0, 1 - cumulative);
}

export function useDeckStats(deck: DeckData | null): DeckStatsResult {
  // 🔹 Build lookup map once
  const cardLookup = useMemo(() => {
    const map: Record<string, CardEntry> = {};
    for (const c of cardData) map[c.cardId] = c;
    return map;
  }, []);

  const result = useMemo<DeckStatsResult>(() => {
    if (!deck) {
      return {
        stats: [] as DeckStat[],
        handProbabilities: [] as DeckStat[],
        energyData: [] as ChartDataPoint[],
        powerData: [] as ChartDataPoint[],
        typeData: [] as ChartDataPoint[],
        typeColors: {} as Record<string, string>
      };
    }

    let totalEnergy = 0;
    let totalPower = 0;
    let totalCards = 0;

    // track totals for charts
    const energyDistribution: Record<number, number> = {};
    const powerDistribution: Record<number, number> = {};

    // Type distribution: Units (Unit+Champion), Spells, Gear
    const typeDistribution: Record<string, number> = {
      "Units": 0,
      "Spells": 0,
      "Gear": 0
    };

    // track total power per color
    const colorPower: Record<string, number> = {};

    // hand-probability success counts
    let twoDropNoGear = 0;
    let twoDropWithGear = 0;
    let turn2PlayCount = 0;
    let sevenPlusCount = 0;

    for (const [id, count] of Object.entries(deck.Main)) {
      const card = cardLookup[id];
      if (!card) continue;

      const energy = card.energy ?? 0;
      const power = card.power ?? 0;
      const powerValue = power * count;
      const isUnitLike = card.type === "Unit" || card.type === "Champion";
      const isGear = card.type === "Gear";

      totalCards += count;
      totalEnergy += energy * count;
      totalPower += powerValue;

      // Distribution data
      energyDistribution[energy] = (energyDistribution[energy] || 0) + count;
      powerDistribution[power] = (powerDistribution[power] || 0) + count;

      // Type data
      if (isUnitLike) {
        typeDistribution["Units"] += count;
      } else if (card.type === "Spell") {
        typeDistribution["Spells"] += count;
      } else if (isGear) {
        typeDistribution["Gear"] += count;
      }

      // accumulate power by color
      if (card.colors && card.colors.length > 0) {
        for (const color of card.colors) {
          colorPower[color] = (colorPower[color] || 0) + powerValue / card.colors.length;
        }
      }

      // hand-probability success counts
      if (energy === 2 && isUnitLike) twoDropNoGear += count;
      if (energy === 2 && (isUnitLike || isGear)) twoDropWithGear += count;
      if (energy < 3 && isUnitLike) turn2PlayCount += count;
      if (energy >= 7) sevenPlusCount += count;
    }

    // Format chart data
    const energyData: ChartDataPoint[] = [
      { name: "1", value: energyDistribution[1] || 0 },
      { name: "2", value: energyDistribution[2] || 0 },
      { name: "3", value: energyDistribution[3] || 0 },
      { name: "4", value: energyDistribution[4] || 0 },
      { name: "5", value: energyDistribution[5] || 0 },
      { name: "6", value: energyDistribution[6] || 0 },
      {
        name: "7+",
        value: Object.entries(energyDistribution)
          .filter(([e]) => Number(e) >= 7)
          .reduce((acc, entry) => acc + (entry[1] as number), 0)
      }
    ];

    const powerData: ChartDataPoint[] = [
      { name: "1", value: powerDistribution[1] || 0 },
      { name: "2", value: powerDistribution[2] || 0 },
      { name: "3", value: powerDistribution[3] || 0 },
      { name: "4", value: powerDistribution[4] || 0 }
    ];

    const typeData: ChartDataPoint[] = ["Units", "Spells", "Gear"]
      .filter(t => typeDistribution[t] > 0)
      .map(t => ({ name: t, value: typeDistribution[t] }));

    const betterColors: Record<string, string> = {
      "Red": "#ef4444",
      "Blue": "#3b82f6",
      "Green": "#22c55e",
      "Yellow": "#eab308",
      "Purple": "#a855f7",
      "Orange": "#f97316"
    };

    const typeColors: Record<string, string> = {
      "Units": "#caa368",    // Gold
      "Spells": "#3b82f6",   // Blue
      "Gear": "#ef4444"      // Red
    };

    const avgEnergy = totalCards ? (totalEnergy / totalCards).toFixed(2) : "-";
    const avgPower = totalCards ? (totalPower / totalCards).toFixed(2) : "-";

    // Compute power breakdown ratio
    let powerBreakdown: ReactNode = "-";
    const colorEntries = Object.entries(colorPower).sort((a, b) => b[1] - a[1]);

    if (colorEntries.length >= 2 && totalPower > 0) {
      const [c1, p1] = colorEntries[0];
      const [c2, p2] = colorEntries[1];
      const total = p1 + p2;
      const pct1 = ((p1 / total) * 100).toFixed(0);
      const pct2 = ((p2 / total) * 100).toFixed(0);

      powerBreakdown = React.createElement("span", { className: "flex gap-2" },
        React.createElement("span", { style: { color: betterColors[c1] || c1 } }, `${pct1}%`),
        " / ",
        React.createElement("span", { style: { color: betterColors[c2] || c2 } }, `${pct2}%`)
      );
    } else if (colorEntries.length === 1 && totalPower > 0) {
      const [c1] = colorEntries[0];
      powerBreakdown = React.createElement("span", { style: { color: betterColors[c1] || c1 } }, "100%");
    }

    const stats: DeckStat[] = [
      { label: "Avg Energy", value: avgEnergy },
      { label: "Avg Power", value: avgPower },
      { label: "Power Split", value: powerBreakdown },
    ];

    // Opening hand hand-probability variants (7-card hand from the main deck)
    const HAND_SIZE = 7;
    const canCompute = totalCards >= HAND_SIZE;
    const formatAtLeastOne = (K: number) =>
      canCompute ? (hypergeomAtLeast(K, totalCards, HAND_SIZE, 1) * 100).toFixed(1) + "%" : "-";

    const handProbabilities: DeckStat[] = [
      {
        label: "2-Drop",
        value: formatAtLeastOne(twoDropNoGear),
        description: "Chance of drawing at least one 2-energy Unit in your opening hand including mulligan.",
      },
      {
        label: "2-Drop w/ Gear",
        value: formatAtLeastOne(twoDropWithGear),
        description: "Chance of drawing at least one 2-energy Unit OR Gear in your opening hand including mulligan.",
      },
      {
        label: "Going 2nd Play",
        value: formatAtLeastOne(turn2PlayCount),
        description: "Chance of drawing at least one Unit costing less than 3 energy in your opening hand including mulligan.",
      },
      {
        label: "Brick Hand",
        value: canCompute
          ? (hypergeomAtLeast(sevenPlusCount, totalCards, HAND_SIZE, 2) * 100).toFixed(1) + "%"
          : "-",
        description: "Chance of opening with 2 or more cards costing 7+ energy.",
      },
    ];

    return { stats, handProbabilities, energyData, powerData, typeData, typeColors };
  }, [deck, cardLookup]);

  return result;
}
