import { motion } from "framer-motion";
import { Button } from "../ui/button";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFormat: (format: string) => void;
}

export default function ExportModal({
  isOpen,
  onClose,
  onSelectFormat,
}: ExportModalProps) {

  if (!isOpen) return null;

  const exportOptions = [
    { label: "Copy Link", value: "link" },
    { label: "Plain Text", value: "text" },
    { label: "Tabletop Simulator", value: "tts" },
    { label: "Image (coming soon)", value: "image", disabled: true },
  ];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 
      bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="
          bg-[#1a1a1a] border border-[#3a3a3a] rounded-2xl p-6 
          shadow-xl w-[350px]
        "
      >
        <h2 className="text-xl font-semibold text-white mb-4">
          Export Deck
        </h2>

        <div className="flex flex-col gap-3">
          {exportOptions.map((opt) => (
            <Button
              key={opt.value}
              disabled={opt.disabled}
              onClick={() => {
                if (!opt.disabled) onSelectFormat(opt.value);
              }}
              className={`w-full justify-center rounded-xl py-2 text-base ${
                opt.disabled
                  ? "opacity-40 cursor-not-allowed"
                  : "bg-[#2a2a2a] hover:bg-[#3a3a3a]"
              }`}
            >
              {opt.label}
            </Button>
          ))}
        </div>

        <Button
          className="w-full mt-5 bg-[#333333] hover:bg-[#444444]"
          onClick={onClose}
        >
          Close
        </Button>
      </motion.div>
    </div>
  );
}
