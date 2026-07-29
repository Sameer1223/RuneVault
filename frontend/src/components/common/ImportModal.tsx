import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, X } from "lucide-react";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
}

export default function ImportModal({ isOpen, onClose, onSubmit }: ImportModalProps) {
  const [text, setText] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text);
    setText("");
  };

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
        className="relative bg-[#1a1a1a] border border-zinc-800 rounded-md p-6 pt-5 shadow-lg w-[480px] max-w-[90vw] overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#caa368]" />

        <div className="flex items-center gap-2 mb-1">
          <Upload className="w-4 h-4 text-[#caa368]" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
            Import Deck
          </h2>
        </div>
        <p className="text-xs text-zinc-500 mb-3 leading-relaxed">
          Paste a decklist in the same plain-text format used by "Export &rarr; Plain Text". This will
          <span className="text-red-400 font-medium"> replace your current deck</span>.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"Legend: ...\nChosen Champion: ...\n\nMain Deck:\n3 Card Name\n...\n\nSideboard:\n2 Card Name"}
          className="w-full h-64 bg-zinc-900 border border-zinc-700 rounded-md p-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-[#caa368] resize-none scroll-styled"
        />

        <div className="flex justify-end gap-2.5 mt-4">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 hover:text-white text-zinc-300 text-sm font-medium transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#caa368] hover:bg-[#d9b57a] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#caa368] text-zinc-900 font-semibold text-sm transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Import &amp; Replace
          </button>
        </div>
      </motion.div>
    </div>
  );
}
