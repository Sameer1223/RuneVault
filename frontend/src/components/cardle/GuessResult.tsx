import type { CardData } from "@/types/deck";
import type { ComparisonResult } from "@/utils/cardleGameUtils";
import { GUESS_GRID_TEMPLATE, STATUS, type StatusMeta } from "./guessResultConstants";
import CardImage from "../CardImage";

interface GuessResultProps {
  guessCard: CardData;
  result: ComparisonResult;
  guessNumber: number;
}

const CELL_BASE = "flex items-center border-r border-zinc-800 px-2 py-1.5 last:border-r-0";

function getStatStatus(result: string): StatusMeta {
  if (result === "correct") return STATUS.correct;
  if (result === "higher") return STATUS.higher;
  if (result === "lower") return STATUS.lower;
  if (result === "incorrect") return STATUS.incorrect;
  return STATUS.unknown;
}

function StatusBadge({ status }: { status: StatusMeta }) {
  const { Icon } = status;
  return (
    <span
      className={`${status.badge} ${status.text} flex h-5 w-5 shrink-0 items-center justify-center rounded-md`}
    >
      <Icon className="h-3 w-3" strokeWidth={2.5} />
    </span>
  );
}

function DataCell({
  value,
  status,
  allowWrap = false,
}: {
  value: string | number;
  status: StatusMeta;
  allowWrap?: boolean;
}) {
  return (
    <div className={CELL_BASE}>
      <div className="flex w-full items-center justify-between gap-2 rounded-md bg-white/[0.03] px-2 py-1.5">
        <span
          className={`${allowWrap ? "whitespace-normal leading-tight" : "truncate"} text-xs font-medium text-zinc-100`}
        >
          {value}
        </span>
        <StatusBadge status={status} />
      </div>
    </div>
  );
}

function ColorDataCell({ value, status, swatches }: { value: string; status: StatusMeta; swatches: string[] }) {
  return (
    <div className={CELL_BASE}>
      <div className="flex w-full items-center justify-between gap-2 rounded-md bg-white/[0.03] px-2 py-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex items-center gap-1">
            {swatches.length > 0 ? (
              swatches.map((swatch) => (
                <span
                  key={swatch}
                  className="h-2.5 w-2.5 rounded-full border border-white/40"
                  style={{ backgroundColor: swatch }}
                  title={swatch}
                />
              ))
            ) : (
              <span className="text-[10px] text-zinc-500">No color</span>
            )}
          </div>
          <span className="truncate text-xs font-medium text-zinc-100">{value}</span>
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
      ? STATUS.correct
      : result.color === "partial"
        ? STATUS.partial
        : result.color === "incorrect"
          ? STATUS.incorrect
          : STATUS.unknown;

  const boolStatus = (matches: boolean) => (matches ? STATUS.correct : STATUS.incorrect);

  const rowTone = guessNumber % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent";

  return (
    <div
      className={`grid border-b border-zinc-800 ${rowTone} transition-colors last:border-b-0 hover:bg-white/[0.04]`}
      style={{ gridTemplateColumns: GUESS_GRID_TEMPLATE }}
    >
      <div className={CELL_BASE}>
        <span className="inline-flex rounded-md bg-[#caa368]/10 px-2 py-1 text-xs font-semibold text-[#caa368] ring-1 ring-[#caa368]/25">
          #{guessNumber}
        </span>
      </div>

      <div className={CELL_BASE}>
        <div className="flex items-center gap-2">
          <CardImage
            cardId={guessCard.cardId}
            alt={guessCard.name}
            className="relative z-10 h-28 w-20 rounded-md object-cover shadow-lg shadow-black/30 ring-1 ring-white/10 transition-transform duration-300 ease-out hover:z-30 hover:scale-[1.9] hover:shadow-2xl hover:shadow-black/60"
          />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold leading-tight text-white">{guessCard.name}</div>
            <div className="mt-0.5 inline-flex rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-400 ring-1 ring-white/10">
              {guessCard.cardId}
            </div>
          </div>
        </div>
      </div>

      <DataCell value={guessCard.energy ?? "—"} status={getStatStatus(result.energy)} />
      <DataCell value={guessCard.power ?? "—"} status={getStatStatus(result.power)} />
      <DataCell value={guessCard.might ?? "—"} status={getStatStatus(result.might)} />
      <ColorDataCell value={colorValue} status={colorBadge} swatches={guessCard.colors ?? []} />
      <DataCell value={guessCard.type} status={boolStatus(result.type)} />
      <DataCell value={guessCard.set} status={boolStatus(result.set)} allowWrap />
      <DataCell value={guessCard.rarity} status={boolStatus(result.rarity)} />
    </div>
  );
}
