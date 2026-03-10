import ProgressWheel from "@/components/common/ProgressWheel";

export default function SetPanel({
    name,
    backgroundImage,
    releaseDate,
    collected,
    total,
    altCollected,
    altTotal,
    onClick
}) {
    return (
        <div
            onClick={onClick}
            className="
                relative h-56 rounded-2xl overflow-hidden cursor-pointer group
                shadow-lg hover:shadow-2xl
                transition-all duration-300 hover:-translate-y-1
            "
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
            }}
        >
            {/* Base gradient overlay */}
            <div
                className="
                    absolute inset-0
                    bg-gradient-to-t from-black/90 via-black/55 to-black/30
                    group-hover:from-black/95 group-hover:via-black/70
                    transition-colors duration-300
                "
            />

            {/* Title (centered, fades out on hover) */}
            <div
                className="
                    relative z-10 h-full flex items-center justify-center
                    transition-opacity duration-300
                    group-hover:opacity-0
                "
            >
                <h2 className="text-3xl font-semibold tracking-wide text-white">
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
                <div className="h-full flex flex-col justify-center items-center px-6 gap-6">
                    {/* Progress section */}
                    <div className="flex gap-14">
                        <Stat
                            label="Cards Collected"
                            collected={collected}
                            total={total}
                        />

                        <Stat
                            label="Alternate Arts"
                            collected={altCollected}
                            total={altTotal}
                            accent
                        />
                    </div>

                    {/* Divider */}
                    <div className="w-24 h-px bg-white/10" />

                    {/* Release date */}
                    <div className="text-xs tracking-wide text-gray-400">
                        Released {releaseDate}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Stat({ label, collected, total, accent }) {
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
                <div className="text-[11px] uppercase tracking-widest text-gray-300">
                    {label}
                </div>
                <div className="text-xs text-gray-400">
                    {collected} / {total}
                </div>
            </div>
        </div>
    );
}
