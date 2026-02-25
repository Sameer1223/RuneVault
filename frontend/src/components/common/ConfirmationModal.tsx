import React from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  mode: "save" | "confirm" | "alert";
  title?: string;
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export default function ConfirmationModal({
  isOpen,
  mode,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  // save + alert = OK only
  const isSimple = mode === "save" || mode === "alert";

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">

      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={() => {
          // Only confirm modals close on backdrop click
          if (!isSimple) onCancel?.();
        }}
      />

      {/* MODAL */}
      <div
        className="relative bg-[#1f1f1f] text-white p-6 rounded-2xl shadow-2xl w-[340px] border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title (comes from DeckBuilder) */}
        <h2 className="text-xl font-semibold mb-4 text-center">
          {title}
        </h2>

        {/* Message */}
        <p className="text-center text-gray-300 mb-6">
          {message}
        </p>

        {/* BUTTONS */}
        {isSimple ? (
          <button
            onClick={onConfirm}
            className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-600 transition"
          >
            OK
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
            >
              Confirm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
