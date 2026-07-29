import { PackageCheck } from "lucide-react";

interface CollectionModeToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export default function CollectionModeToggle({ enabled, onChange }: CollectionModeToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      title="Show which cards in this deck you own"
      className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium border transition-colors shrink-0 ${
        enabled
          ? "bg-[#caa368]/15 border-[#caa368] text-[#caa368]"
          : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-[#caa368]/50 hover:text-zinc-200"
      }`}
    >
      <PackageCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
      <span className="hidden sm:inline whitespace-nowrap">Collection Mode</span>
      <span
        className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors shrink-0 ${
          enabled ? "bg-[#caa368]" : "bg-zinc-700"
        }`}
      >
        <span
          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
            enabled ? "translate-x-3.5" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}
