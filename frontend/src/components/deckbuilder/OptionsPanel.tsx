import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import cardData from "../../data/cards.json";
import ExportModal from "../common/ExportModal";
import type { DeckData } from "@/data/emptyDeckTemplate";
import { motion, AnimatePresence } from "framer-motion";
import { useDeckStats } from "../../hooks/useDeckStats";

type CardEntry = (typeof cardData)[number];

interface OptionsPanelProps {
  onSave: () => void;
  onClear?: () => void;
  deck: DeckData;
  deckId?: string;
}

export default function OptionsPanel({
  onSave,
  onClear,
  deck,
  deckId,
}: OptionsPanelProps) {
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (msg: string) => {
    setNotification(msg);
  };

  const { stats } = useDeckStats(deck);

  const [exportOpen, setExportOpen] = useState(false);

  const handleExport = (format: string) => {
    // 🔹 Build lookup map for export
    const cardLookup: Record<string, CardEntry> = {};
    for (const c of cardData) cardLookup[c.cardId] = c;

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
    showNotification(`${format.toUpperCase()} export copied to clipboard!`);
  };

  const handleLinkExport = () => {
    if (!deckId) {
      showNotification("Please save your deck first to generate a shareable link!");
      return;
    }
    const link = `${window.location.origin}/deckviewer/${deckId}`;
    navigator.clipboard.writeText(link);
    showNotification("Shareable link copied to clipboard!");
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
        onSelectFormat={(format) => {
          if (format === "link") {
            handleLinkExport();
          } else {
            handleExport(format);
          }
        }}
      />

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-10 left-1/2 z-[100] bg-white text-black px-6 py-3 rounded-full shadow-2xl font-medium"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
