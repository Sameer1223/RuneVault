import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { useState } from "react";
import type { DeckInnerData } from "@/types/deck";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFormat: (format: string) => void;
  fullDeck?: { id?: string | number; name: string; deck_data: DeckInnerData };
}

export default function ExportModal({
  isOpen,
  onClose,
  onSelectFormat,
  fullDeck,
}: ExportModalProps) {
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      setIsLoading(true);
      setStatusMessage(null);

      // If deck has no ID, it needs to be saved first
      if (!fullDeck?.id) {
        setStatusMessage({
          type: "info",
          text: "Please save your deck first before creating a shareable link.",
        });
        setIsLoading(false);
        return;
      }

      // Generate shareable link
      const shareUrl = `${window.location.origin}/deckviewer?id=${fullDeck.id}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);

      setStatusMessage({
        type: "success",
        text: "Link copied to clipboard!",
      });

      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
        setStatusMessage(null);
      }, 2000);
    } catch (error) {
      setStatusMessage({
        type: "error",
        text: "Failed to copy link. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

        {statusMessage && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm text-center ${
              statusMessage.type === "success"
                ? "bg-green-900/30 text-green-300"
                : statusMessage.type === "error"
                ? "bg-red-900/30 text-red-300"
                : "bg-blue-900/30 text-blue-300"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {exportOptions.map((opt) => (
            <Button
              key={opt.value}
              disabled={opt.disabled || isLoading}
              onClick={() => {
                if (!opt.disabled && !isLoading) {
                  if (opt.value === "link") {
                    handleCopyLink();
                  } else {
                    onSelectFormat(opt.value);
                  }
                }
              }}
              className={`w-full justify-center rounded-xl py-2 text-base ${
                opt.disabled || isLoading
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
          disabled={isLoading}
        >
          Close
        </Button>
      </motion.div>
    </div>
  );
}
