import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  mode: "save" | "confirm" | "alert" | "delete";
  title?: string;
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const DEFAULT_TITLES: Record<ConfirmationModalProps["mode"], string> = {
  save: "Notice",
  alert: "Notice",
  confirm: "Please Confirm",
  delete: "Confirm Deletion",
};

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
  const isDestructive = mode === "delete";
  const Icon = isSimple ? CheckCircle2 : AlertTriangle;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">

      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={() => {
          // Only confirm modals close on backdrop click
          if (!isSimple) onCancel?.();
        }}
      />

      {/* MODAL */}
      <div
        className="relative bg-[#1a1a1a] text-white p-6 pt-5 rounded-md shadow-lg w-[360px] border border-zinc-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Severity accent bar */}
        <div className={`absolute top-0 left-0 right-0 h-[3px] ${isDestructive ? "bg-red-500" : "bg-[#caa368]"}`} />

        {/* Icon + Title */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-9 h-9 shrink-0 rounded-md border flex items-center justify-center ${
              isDestructive
                ? "text-red-400 bg-red-500/10 border-red-500/30"
                : "text-[#caa368] bg-[#caa368]/10 border-[#caa368]/30"
            }`}
          >
            <Icon className="w-4 h-4" strokeWidth={2} />
          </div>
          <h2 className="text-base font-semibold">
            {title || DEFAULT_TITLES[mode]}
          </h2>
        </div>

        {/* Message */}
        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
          {message}
        </p>

        {/* BUTTONS */}
        {isSimple ? (
          <div className="flex justify-end">
            <button
              onClick={onConfirm}
              className="px-6 py-2 rounded-md bg-[#caa368] hover:bg-[#d9b57a] text-zinc-900 font-semibold text-sm transition-colors"
            >
              OK
            </button>
          </div>
        ) : (
          <div className="flex justify-end gap-2.5">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-md bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 hover:text-white text-zinc-300 text-sm font-medium transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                isDestructive
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-[#caa368] hover:bg-[#d9b57a] text-zinc-900"
              }`}
            >
              {isDestructive ? "Delete" : "Confirm"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
