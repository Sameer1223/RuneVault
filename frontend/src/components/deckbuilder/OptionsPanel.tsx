import { useState, useEffect } from "react";
import { Save, Trash2, Upload, Download, ChevronLeft, ChevronRight } from "lucide-react";
import cardData from "../../data/cards.json";
import ExportModal from "../common/ExportModal";
import ImportModal from "../common/ImportModal";
import type { DeckData } from "@/data/emptyDeckTemplate";
import type { DeckInnerData } from "@/types/deck";
import { motion, AnimatePresence } from "framer-motion";
import { useDeckStats } from "../../hooks/useDeckStats";
import { useSwappableStat } from "../../hooks/useSwappableStat";
import Tooltip from "../ui/Tooltip";
import { buildDeckListText, resolveDeckListImport } from "@/utils/deckListFormat";

type CardEntry = (typeof cardData)[number];

interface OptionsPanelProps {
  onSave: () => void;
  onClear?: () => void;
  onImport: (deckData: DeckInnerData, importedCount: number, warnings: string[]) => void;
  deck: DeckData;
  deckId?: string;
}

export default function OptionsPanel({
  onSave,
  onClear,
  onImport,
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

  const { stats, handProbabilities } = useDeckStats(deck);
  const { current: handStat, next: nextHandStat, prev: prevHandStat, index: handStatIndex, count: handStatCount } = useSwappableStat(handProbabilities);

  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const handleExport = (format: string) => {
    // 🔹 Build lookup map for export
    const cardLookup: Record<string, CardEntry> = {};
    for (const c of cardData) cardLookup[c.cardId] = c;

    let output = "";

    if (format === "text") {
      output = buildDeckListText(deck, cardLookup);
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

  const handleImportSubmit = (text: string) => {
    setImportOpen(false);
    const result = resolveDeckListImport(text);
    onImport(result.deckData, result.importedCount, result.warnings);
  };

  return (
    <div className="flex flex-wrap gap-4 lg:gap-20 items-center">
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <button
          onClick={onSave}
          className="flex items-center gap-1.5 bg-[#caa368] hover:bg-[#d9b57a] text-zinc-900 font-semibold px-3 py-1.5 rounded-md text-sm transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </button>
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 bg-transparent border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 font-medium px-3 py-1.5 rounded-md text-sm transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>
        <button
          onClick={() => setImportOpen(true)}
          className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700 hover:border-[#caa368]/50 hover:bg-zinc-800 text-zinc-300 hover:text-white font-medium px-3 py-1.5 rounded-md text-sm transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          Import
        </button>
        <button
          onClick={() => setExportOpen(true)}
          className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700 hover:border-[#caa368]/50 hover:bg-zinc-800 text-zinc-300 hover:text-white font-medium px-3 py-1.5 rounded-md text-sm transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-10">
        {stats.map((stat) => (
          <div key={stat.label} className="flex gap-2 sm:gap-4">
            <span className="text-sm sm:text-base font-medium text-[#caa368] whitespace-nowrap">{stat.label}</span>
            <span className="text-sm sm:text-base font-semibold text-white">{stat.value}</span>
          </div>
        ))}

        {handStat && (
          <div className="flex items-center gap-0.5 bg-zinc-900/60 border border-zinc-700/60 rounded-md py-1 pl-1 pr-2">
            <button
              type="button"
              onClick={prevHandStat}
              title="Previous stat"
              className="flex items-center justify-center w-5 h-5 rounded text-zinc-500 hover:text-[#caa368] hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex gap-2 sm:gap-3 items-baseline px-1 min-w-0">
              {handStat.description ? (
                <Tooltip content={handStat.description}>
                  <span className="text-sm sm:text-base font-medium text-[#caa368] whitespace-nowrap cursor-help decoration-dotted underline-offset-4 hover:underline">
                    {handStat.label}
                  </span>
                </Tooltip>
              ) : (
                <span className="text-sm sm:text-base font-medium text-[#caa368] whitespace-nowrap">{handStat.label}</span>
              )}
              <span className="text-sm sm:text-base font-semibold text-white whitespace-nowrap">{handStat.value}</span>
              <span className="text-[10px] text-zinc-500 whitespace-nowrap">{handStatIndex + 1}/{handStatCount}</span>
            </div>

            <button
              type="button"
              onClick={nextHandStat}
              title="Next stat"
              className="flex items-center justify-center w-5 h-5 rounded text-zinc-500 hover:text-[#caa368] hover:bg-zinc-800 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
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

      <ImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onSubmit={handleImportSubmit}
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
