import type { CardData } from "@/types/deck";
import type { ComparisonResult } from "@/utils/cardleGameUtils";
import { GUESS_GRID_TEMPLATE } from "./guessResultConstants";

interface GuessResultProps {
  guessCard: CardData;
  result: ComparisonResult;
  guessNumber: number;
}

type StatusMeta = {
  badge: string;
  text: string;
  icon: string;
};

const CELL_BASE = "flex items-center border-r border-white/10 px-2 py-1.5 last:border-r-0";
const GUESS_COL_W = {
  guess: "",
  card: "",
  energy: "",
  power: "",
  might: "",
  color: "",
  type: "",
  set: "",
  rarity: "",
};

function getStatStatus(result: string): StatusMeta {
  if (result === "correct") return { badge: "bg-emerald-500/15 ring-1 ring-emerald-300/35", text: "text-emerald-200", icon: "✓" };
  if (result === "higher") return { badge: "bg-sky-500/15 ring-1 ring-sky-300/35", text: "text-sky-200", icon: "↑" };
  if (result === "lower") return { badge: "bg-amber-500/15 ring-1 ring-amber-300/35", text: "text-amber-200", icon: "↓" };
  if (result === "incorrect") return { badge: "bg-rose-500/15 ring-1 ring-rose-300/35", text: "text-rose-200", icon: "✗" };
  return { badge: "bg-slate-500/15 ring-1 ring-slate-300/25", text: "text-slate-300", icon: "—" };
}

function StatusBadge({ status }: { status: StatusMeta }) {
  return (
    <span className={`${status.badge} ${status.text} relative flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-md text-[10px] font-bold`}>
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative z-10">{status.icon}</span>
    </span>
  );
}

function DataCell({
  value,
  status,
  widthClass,
  allowWrap = false,
}: {
  value: string | number;
  status: StatusMeta;
  widthClass: string;
  allowWrap?: boolean;
}) {
  return (
    <div className={`${CELL_BASE} ${widthClass}`}>
      <div className="flex w-full items-center justify-between gap-2 rounded-md bg-white/[0.03] px-2 py-1.5">
        <span className={`${allowWrap ? "whitespace-normal leading-tight" : "truncate"} text-xs font-medium text-slate-100`}>
          {value}
        </span>
        <StatusBadge status={status} />
      </div>
    </div>
  );
}

function ColorDataCell({ value, status, swatches }: { value: string; status: StatusMeta; swatches: string[] }) {
  return (
    <div className={`${CELL_BASE} ${GUESS_COL_W.color}`}>
      <div className="flex w-full items-center justify-between gap-2 rounded-md bg-white/[0.03] px-2 py-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex items-center gap-1">
            {swatches.length > 0 ? (
              swatches.map((swatch) => (
                <span
                  key={swatch}
                  className="h-2.5 w-2.5 rounded-full border border-white/50"
                  style={{ backgroundColor: swatch }}
                  title={swatch}
                />
              ))
            ) : (
              <span className="text-[10px] text-slate-500">No color</span>
            )}
          </div>
          <span className="truncate text-xs font-medium text-slate-100">{value}</span>
        </div>

        <StatusBadge status={status} />
      </div>
    </div>
  );
}

export default function GuessResult({ guessCard, result, guessNumber }: GuessResultProps) {
  const colorValue = guessCard.colors?.length ? guessCard.colors.join(", ") : "—";

  const colorBadge =
    result.color === "correct"
      ? { badge: "bg-emerald-500/15 ring-1 ring-emerald-300/35", text: "text-emerald-200", icon: "✓" }
      : result.color === "partial"
        ? { badge: "bg-yellow-500/15 ring-1 ring-yellow-300/35", text: "text-yellow-200", icon: "◐" }
        : result.color === "incorrect"
          ? { badge: "bg-rose-500/15 ring-1 ring-rose-300/35", text: "text-rose-200", icon: "✗" }
          : { badge: "bg-slate-500/15 ring-1 ring-slate-300/25", text: "text-slate-300", icon: "—" };

  const rowTone = guessNumber % 2 === 0 ? "bg-white/[0.03]" : "bg-white/[0.015]";

  return (
    <div className={`group grid border-b border-white/10 ${rowTone} last:border-b-0 hover:bg-white/[0.05] transition-colors`} style={{ gridTemplateColumns: GUESS_GRID_TEMPLATE }}>
      <div className={`${CELL_BASE} ${GUESS_COL_W.guess}`}>
        <span className="inline-flex rounded-md bg-cyan-500/10 px-2 py-1 text-xs font-semibold text-cyan-200 ring-1 ring-cyan-300/20">#{guessNumber}</span>
      </div>

      <div className={`${CELL_BASE} ${GUESS_COL_W.card}`}>
        <div className="flex items-center gap-2">
          <img
            src={`/TempCards/${guessCard.cardId}.avif`}
            alt={guessCard.name}
            className="relative z-10 h-28 w-20 rounded-md object-cover shadow-lg shadow-black/30 ring-1 ring-white/10 transition-transform duration-300 ease-out hover:z-30 hover:scale-[1.9] hover:shadow-2xl hover:shadow-black/60"
          />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold leading-tight text-white">{guessCard.name}</div>
            <div className="mt-0.5 inline-flex rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-300 ring-1 ring-white/10">{guessCard.cardId}</div>
          </div>
        </div>
      </div>

      <DataCell value={guessCard.energy ?? "—"} status={getStatStatus(result.energy)} widthClass={GUESS_COL_W.energy} />
      <DataCell value={guessCard.power ?? "—"} status={getStatStatus(result.power)} widthClass={GUESS_COL_W.power} />
      <DataCell value={guessCard.might ?? "—"} status={getStatStatus(result.might)} widthClass={GUESS_COL_W.might} />
      <ColorDataCell value={colorValue} status={colorBadge} swatches={guessCard.colors ?? []} />
      <DataCell
        value={guessCard.type}
        status={result.type ? { badge: "bg-emerald-500/15 ring-1 ring-emerald-300/35", text: "text-emerald-200", icon: "✓" } : { badge: "bg-rose-500/15 ring-1 ring-rose-300/35", text: "text-rose-200", icon: "✗" }}
        widthClass={GUESS_COL_W.type}
      />
      <DataCell
        value={guessCard.set}
        status={result.set ? { badge: "bg-emerald-500/15 ring-1 ring-emerald-300/35", text: "text-emerald-200", icon: "✓" } : { badge: "bg-rose-500/15 ring-1 ring-rose-300/35", text: "text-rose-200", icon: "✗" }}
        widthClass={GUESS_COL_W.set}
        allowWrap
      />
      <DataCell
        value={guessCard.rarity}
        status={result.rarity ? { badge: "bg-emerald-500/15 ring-1 ring-emerald-300/35", text: "text-emerald-200", icon: "✓" } : { badge: "bg-rose-500/15 ring-1 ring-rose-300/35", text: "text-rose-200", icon: "✗" }}
        widthClass={GUESS_COL_W.rarity}
      />
    </div>
  );
}
