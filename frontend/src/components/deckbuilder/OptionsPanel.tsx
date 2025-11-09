import { useMemo } from "react";
import { Button } from "../ui/button";
import cardData from "../../data/cards.json";

interface CardData {
  id: string;
  name: string;
  energy: number;
  power: number;
  colors: string[];
}

interface OptionsPanelProps {
  onSave: () => void;
  onClear?: () => void;
  mainDeck: Record<string, number>;
}

export default function OptionsPanel({
  onSave,
  onClear,
  mainDeck,
}: OptionsPanelProps) {
  // 🔹 Build lookup map once
  const cardLookup = useMemo(() => {
    const map: Record<string, CardData> = {};
    for (const c of cardData) map[c.cardId] = c;
    return map;
  }, []);

  const stats = useMemo(() => {
    let totalEnergy = 0;
    let totalPower = 0;
    let totalCards = 0;

    // track total power per color
    const colorPower: Record<string, number> = {};

    for (const [id, count] of Object.entries(mainDeck)) {
      const card = cardLookup[id];
      if (!card) continue;

      const powerValue = card.power * count;

      totalCards += count;
      totalEnergy += card.energy * count;
      totalPower += powerValue;

      // accumulate power by color
      if (card.colors && card.colors.length > 0) {
        for (const color of card.colors) {
          colorPower[color] = (colorPower[color] || 0) + powerValue / card.colors.length;
        }
      }
    }

    const avgEnergy = totalCards ? (totalEnergy / totalCards).toFixed(2) : "-";
    const avgPower = totalCards ? (totalPower / totalCards).toFixed(2) : "-";

const betterColors = {
    "Red": "#ff6666", // Lighter red
    "Blue": "#66a3ff", // Lighter blue
    "Green": "#99ff99", // Lighter green
  };
  
  // Compute power breakdown ratio
  let powerBreakdown = "-";
  const colorEntries = Object.entries(colorPower).sort((a, b) => b[1] - a[1]);
  
  if (colorEntries.length >= 2) {
    const [c1, p1] = colorEntries[0];
    const [c2, p2] = colorEntries[1];
    const total = p1 + p2;
    const pct1 = ((p1 / total) * 100).toFixed(0);
    const pct2 = ((p2 / total) * 100).toFixed(0);
  
    powerBreakdown = (
      <>
        <span style={{ color: betterColors[c1] || c1 }}>{pct1}%</span> /{" "}
        <span style={{ color: betterColors[c2] || c2 }}>{pct2}%</span>
      </>
    );
  } else if (colorEntries.length === 1) {
    const [c1, p1] = colorEntries[0];
    powerBreakdown = <span style={{ color: betterColors[c1] || c1 }}>100%</span>;
  }

    // Count 2-cost units/champions
    const twoCostCount = Object.entries(mainDeck).reduce((acc, [id, count]) => {
        const card = cardLookup[id];
        if (!card) return acc;
        if (card.energy === 2 && (card.type === "Unit" || card.type === "Champion")) {
            return acc + count;
        }
        return acc;
    }, 0);
    
    // Hypergeometric probability function
    function hypergeomAtLeastOne(K: number, N: number, n: number) {
        if (K <= 0) return 0;
        const comb = (a: number, b: number) => {
            if (b > a) return 0;
            let num = 1;
            let den = 1;
            for (let i = 1; i <= b; i++) {
                num *= a - (b - i);
                den *= i;
            }
            return num / den;
        };
        const pNoHits = comb(N - K, n) / comb(N, n);
        return 1 - pNoHits;
    }
    
    // Compute probability for 39-card deck, 7 drawn
    const twoDropProbValue = hypergeomAtLeastOne(twoCostCount, 39, 7);
    const twoDropProb = `${(twoDropProbValue * 100).toFixed(1)}%`;
  

    return [
      { label: "Avg Energy", value: avgEnergy },
      { label: "Avg Power", value: avgPower },
      { label: "Power Breakdown", value: powerBreakdown },
      { label: "2-Drop Probability", value: twoDropProb },
    ];
  }, [mainDeck, cardLookup]);

  return (
    <div className="flex gap-20 items-center">
      <div className="flex gap-5">
        <Button onClick={onSave}>Save</Button>
        <Button onClick={onClear}>Clear</Button>
        <Button>Import</Button>
        <Button>Export</Button>
      </div>

      <div className="flex gap-10">
        {stats.map((stat) => (
          <div key={stat.label} className="flex gap-4">
            <span className="text-base font-medium text-[#caa368]">{stat.label}</span>
            <span className="text-base font-semibold text-white">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
