import ProgressWheel from "@/components/common/ProgressWheel";

interface SetPanelProps {
    name: string;
    backgroundImage: string;
    releaseDate: string;
    collected: number;
    total: number;
    altCollected: number;
    altTotal: number;
    isComingSoon?: boolean;
    onClick?: () => void;
}

export default function SetPanel({
    name,
    backgroundImage,
    releaseDate,
    collected,
    total,
    altCollected,
    altTotal,
    isComingSoon = false,
    onClick
}: SetPanelProps) {
    const cardPct = total > 0 ? Math.round((collected / total) * 100) : 0;
    const altPct = altTotal > 0 ? Math.round((altCollected / altTotal) * 100) : 0;
    const missingCards = Math.max(0, total - collected);
    const missingAlts = Math.max(0, altTotal - altCollected);

    return (
        <div
            onClick={onClick}
            className="
                relative h-64 rounded-2xl overflow-hidden cursor-pointer group
                border border-white/15 bg-black/30
                shadow-xl shadow-black/40 hover:shadow-2xl hover:shadow-cyan-900/25
                transition-all duration-300 hover:-translate-y-1.5
            "
        >
            {/* Ambient backdrop */}
            <img
                src={backgroundImage}
                alt={name}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover opacity-30 blur-[2px] scale-110"
            />

            {/* Fitted artwork */}
            <img
                src={backgroundImage}
                alt={`${name} set art`}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover scale-[1.08] saturate-[1.12] contrast-[1.08] brightness-[0.96] transition-transform duration-500 group-hover:scale-[1.16]"
            />

            {/* Base overlays */}
            <div
                className="
                    absolute inset-0
                    bg-gradient-to-t from-black/92 via-black/70 to-black/30
                    group-hover:from-black/95 group-hover:via-black/78
                    transition-colors duration-300
                "
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.14),transparent_55%)]" />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />

            {isComingSoon && (
                <div className="absolute right-3 top-3 z-30 rounded-full border border-amber-300/35 bg-amber-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-100 backdrop-blur-sm">
                    Coming Soon
                </div>
            )}

            {/* Title (centered, fades on hover) */}
            <div
                className="
                    relative z-10 h-full flex items-center justify-center
                    transition-opacity duration-300
                    group-hover:opacity-0
                "
            >
                <h2 className="text-3xl font-semibold tracking-wide text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.8)]">
                    {name}
                </h2>
            </div>

            {/* Hover overlay */}
            <div
                className="
                    absolute inset-0 z-20
                    opacity-0 group-hover:opacity-100
                    transition-opacity duration-300
                "
            >
                <div className="h-full flex flex-col justify-center items-center px-5 gap-5 bg-black/45 backdrop-blur-[2px]">
                    <div className="text-center">
                        <div className="text-xl font-semibold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">{name}</div>
                        <div className="mt-1 text-xs text-slate-200">Released {releaseDate}</div>
                    </div>

                    {isComingSoon ? (
                        <div className="rounded-xl border border-white/20 bg-black/45 px-5 py-4 text-center text-sm text-slate-100">
                            <div className="font-semibold text-amber-200">This set is coming soon.</div>
                            <div className="mt-1 text-xs text-slate-300">Release target: {releaseDate}</div>
                        </div>
                    ) : (
                        <>
                            {/* Progress section */}
                            <div className="flex gap-10">
                                <Stat
                                    label="Cards Collected"
                                    collected={collected}
                                    total={total}
                                    percent={cardPct}
                                    missing={missingCards}
                                />

                                <Stat
                                    label="Alternate Arts"
                                    collected={altCollected}
                                    total={altTotal}
                                    percent={altPct}
                                    missing={missingAlts}
                                    accent
                                />
                            </div>

                            <div className="rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-[11px] text-slate-100">
                                Completion: <span className="font-semibold text-emerald-300">{cardPct}%</span> · Alt Arts: <span className="font-semibold text-cyan-300">{altPct}%</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Bottom metadata strip */}
            <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 text-xs text-slate-100 bg-black/60 border-t border-white/10">
                <span className="truncate">{releaseDate}</span>
                <span className="font-semibold text-white">{isComingSoon ? "Coming Soon" : `${collected}/${total}`}</span>
            </div>
        </div>
    );
}

interface StatProps {
    label: string;
    collected: number;
    total: number;
    percent: number;
    missing: number;
    accent?: boolean;
}

function Stat({ label, collected, total, percent, missing, accent = false }: StatProps) {
    return (
        <div className="flex flex-col items-center gap-3">
            <ProgressWheel
                collected={collected}
                total={total}
                size={56}
                color={accent ? "#38bdf8" : "#e5e7eb"}
                trackColor="rgba(255,255,255,0.15)"
            />

            <div className="text-center leading-tight">
                <div className="text-[11px] uppercase tracking-widest text-gray-100">
                    {label}
                </div>
                <div className="text-xs text-gray-200">
                    {collected} / {total} · {percent}%
                </div>
                <div className="text-[10px] text-gray-300">
                    Missing: {missing}
                </div>
            </div>
        </div>
    );
}
