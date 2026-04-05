import { useMemo, useState, type ReactNode } from "react";
import { Button } from "../ui/button";
import cardData from "../../data/cards.json";
import ExportModal from "../common/ExportModal";
import type { DeckData } from "@/data/emptyDeckTemplate";

type CardEntry = (typeof cardData)[number];

interface OptionsPanelProps {
  onSave: () => void;
  onClear?: () => void;
  deck: DeckData;
}

export default function OptionsPanel({
  onSave,
  onClear,
  deck,
}: OptionsPanelProps) {
  // 🔹 Build lookup map once
  const cardLookup = useMemo(() => {
    const map: Record<string, CardEntry> = {};
    for (const c of cardData) map[c.cardId] = c;
    return map;
  }, []);

  const stats = useMemo(() => {
    let totalEnergy = 0;
    let totalPower = 0;
    let totalCards = 0;

    // track total power per color
    const colorPower: Record<string, number> = {};

    for (const [id, count] of Object.entries(deck.Main)) {
      const card = cardLookup[id];
      if (!card) continue;

      const powerValue = (card.power ?? 0) * count;

      totalCards += count;
      totalEnergy += (card.energy ?? 0) * count;
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

const betterColors: Record<string, string> = {
    "Red": "#ff6666", // Lighter red
    "Blue": "#66a3ff", // Lighter blue
    "Green": "#99ff99", // Lighter green
  };
  
  // Compute power breakdown ratio
  let powerBreakdown: ReactNode = "-";
  const colorEntries = Object.entries(colorPower).sort((a, b) => b[1] - a[1]);
  
  if (colorEntries.length >= 2 && totalPower > 0) {
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
  } else if (colorEntries.length === 1 && totalPower > 0) {
    const [c1] = colorEntries[0];
    powerBreakdown = <span style={{ color: betterColors[c1] || c1 }}>100%</span>;
  }

    // Count 2-cost units/champions
    const twoCostCount = Object.entries(deck.Main).reduce((acc, [id, count]) => {
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
  }, [deck.Main, cardLookup]);

  const [exportOpen, setExportOpen] = useState(false);

  const handleExport = (format: string) => {
    let output = "";

    if (format === "text") {
      output += '1 ' + cardLookup[deck.Legend].name + '\n\n';
      output += '1 ' + cardLookup[deck.ChosenChampion].name + '\n\n';
      for (const [id, count] of Object.entries(deck.Main)) {
        output += count + ' ' + cardLookup[id].name + '\n';
      }
      output += '\n';
      for (const bf of deck.Battlefields || []) {
        output += '1 ' + cardLookup[bf].name + '\n';
      }
      output += '\n';
      for (const [id, count] of Object.entries(deck.Runes || {})) {
        output += count + ' ' +  cardLookup[id].name + '\n';
      }
      output += '\nSideboard:\n';
      for (const [id, count] of Object.entries(deck.Side || {})) {
        output += count + ' ' + cardLookup[id].name + '\n';
      }
    }

    if (format === "tts") {
      output += deck.Legend + '-1 ' + deck.ChosenChampion + '-1 ';
      for (const [id, count] of Object.entries(deck.Main)) {
        output += `${id}-1 `.repeat(count);
      }
      for (const [id, count] of Object.entries(deck.Side || {})) {
        output += `${id}-1 `.repeat(count);
      }
      for (const bf of deck.Battlefields || []) {
        output += `${bf}-1 `;
      }
      for (const [id, count] of Object.entries(deck.Runes || {})) {
        if (cardLookup[id].rarity === "Alternate Art") {
          output += `${id.slice(0, -1)}-2 `.repeat(count);
          continue;
        }
        output += `${id}-1 `.repeat(count);
      }
    }

    // Copy to clipboard
    navigator.clipboard.writeText(output);

    setExportOpen(false);
  };


  return (
    <div className="flex gap-20 items-center">
      <div className="flex gap-5">
        <Button onClick={onSave}>Save</Button>
        <Button onClick={onClear}>Clear</Button>
        <Button>Import</Button>
        <Button onClick={() => setExportOpen(true)}>Export</Button>
      </div>

      <div className="flex gap-10">
        {stats.map((stat) => (
          <div key={stat.label} className="flex gap-4">
            <span className="text-base font-medium text-[#caa368]">{stat.label}</span>
            <span className="text-base font-semibold text-white">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* NEW → modal */}
      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        onSelectFormat={handleExport}
      />
    </div>
  );
}
