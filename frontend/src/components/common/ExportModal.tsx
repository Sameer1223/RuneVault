import { motion } from "framer-motion";
import { Copy, FileText, Boxes, Image as ImageIcon, Download, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFormat: (format: string) => void;
}

const exportOptions: { label: string; value: string; icon: LucideIcon; disabled?: boolean; hint?: string }[] = [
  { label: "Copy Link", value: "link", icon: Copy },
  { label: "Plain Text", value: "text", icon: FileText },
  { label: "Tabletop Simulator", value: "tts", icon: Boxes },
  { label: "Image", value: "image", icon: ImageIcon, disabled: true, hint: "Coming soon" },
];

export default function ExportModal({
  isOpen,
  onClose,
  onSelectFormat,
}: ExportModalProps) {

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50
      bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-[#1a1a1a] border border-zinc-800 rounded-md p-6 pt-5 shadow-lg w-[360px] overflow-hidden"
      >
        {/* Accent bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#caa368]" />

        <div className="flex items-center gap-2 mb-5">
          <Download className="w-4 h-4 text-[#caa368]" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
            Export Deck
          </h2>
        </div>

        <div className="flex flex-col gap-2">
          {exportOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                disabled={opt.disabled}
                onClick={() => {
                  if (!opt.disabled) onSelectFormat(opt.value);
                }}
                className={`flex items-center gap-3 w-full rounded-md px-3 py-2.5 border text-sm text-left transition-colors ${
                  opt.disabled
                    ? "border-zinc-800 text-zinc-600 cursor-not-allowed"
                    : "border-zinc-800 text-zinc-200 hover:border-[#caa368]/50 hover:bg-zinc-900"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${opt.disabled ? "text-zinc-700" : "text-[#caa368]"}`} />
                <span className="flex-1">{opt.label}</span>
                {opt.hint && <span className="text-xs text-zinc-600">{opt.hint}</span>}
              </button>
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
