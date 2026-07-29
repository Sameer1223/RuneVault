type TagColor = "zinc" | "orange" | "red";

const COLOR_CLASSES: Record<TagColor, string> = {
  zinc: "text-zinc-400 border-zinc-400/60",
  orange: "text-orange-400 border-orange-400/60",
  red: "text-red-400 border-red-400/60",
};

interface StatusTagProps {
  label: string;
  color: TagColor;
  className?: string;
}

export default function StatusTag({ label, color, className = "" }: StatusTagProps) {
  return (
    <span
      className={`inline-flex items-center bg-black/45 border rounded-md px-2 py-0.5 text-[11px] font-medium leading-none whitespace-nowrap ${COLOR_CLASSES[color]} ${className}`}
    >
      {label}
    </span>
  );
}
