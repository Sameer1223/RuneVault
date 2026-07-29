import { motion } from "framer-motion";
import { MousePointerClick, MousePointer2, ArrowLeftRight, Copy, Pencil, PackageCheck, X, HelpCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface HowToModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const tips: { icon: LucideIcon; text: string }[] = [
  { icon: MousePointerClick, text: "Left-click a card in the search panel to add it to your deck." },
  { icon: MousePointer2, text: "Right-click any card to remove it." },
  { icon: ArrowLeftRight, text: "Left-click a card already in your Main Deck or Side Deck to select it, then use the swap bar to move it to the sideboard - or select cards in both to swap them." },
  { icon: Copy, text: "Ctrl+click (⌘+click on Mac) a card already in your deck to add another copy instantly, without searching for it again." },
  { icon: Pencil, text: "Click the deck title to rename it - the text is auto-selected so you can just start typing." },
  { icon: PackageCheck, text: "Toggle Collection Mode to see which cards in this deck you actually own." },
];

export default function HowToModal({ isOpen, onClose }: HowToModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-[#1a1a1a] border border-zinc-800 rounded-md p-6 pt-5 shadow-lg w-[420px] max-w-[90vw] overflow-hidden"
      >
        {/* Accent bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#caa368]" />

        <div className="flex items-center gap-2 mb-5">
          <HelpCircle className="w-4 h-4 text-[#caa368]" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
            Shortcuts &amp; Tips
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {tips.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <div key={i} className="flex items-start gap-3">
                <Icon className="w-4 h-4 text-[#caa368] shrink-0 mt-0.5" />
                <span className="text-sm text-zinc-300 leading-snug">{tip.text}</span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end mt-5">
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 hover:text-white text-zinc-300 text-sm font-medium transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
