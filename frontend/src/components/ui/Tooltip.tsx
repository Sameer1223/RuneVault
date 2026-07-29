import type { ReactNode } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
  className?: string;
}

/** Lightweight hover tooltip - no extra dependency, pure CSS group-hover. */
export default function Tooltip({ content, children, className = "" }: TooltipProps) {
  return (
    <span className={`group/tip relative inline-flex ${className}`}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute z-50 hidden group-hover/tip:block bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs leading-relaxed text-zinc-300 shadow-lg text-left normal-case font-normal tracking-normal"
      >
        {content}
        <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 rotate-45 bg-zinc-900 border-r border-b border-zinc-700" />
      </span>
    </span>
  );
}
