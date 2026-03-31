import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import setData from "../data/sets.json";
import SetPanel from "../components/collection/SetPanel";
import cards from "@/data/cards.json";
import { useUserId } from "@/hooks/useUserId";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { API_BASE_URL } from "@/lib/constants";

export default function Sets() {
    const navigate = useNavigate();
    const { userId } = useUserId();
    const authFetch = useAuthFetch();

    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("release");
    const [sortOrder, setSortOrder] = useState("asc");
    const [userCollection, setUserCollection] = useState<Record<string, number>>({});
    const [foilCollection, setFoilCollection] = useState<Record<string, number>>({});

    const isAltArtRarity = (rarity?: string) => {
        return rarity === "Alternate Art" || rarity === "Overnumbered" || rarity === "Signature";
    };

    useEffect(() => {
        const fetchCollection = async () => {
            if (!userId) return;

            try {
                const res = await authFetch(`${API_BASE_URL}/api/collection/${encodeURIComponent(userId)}`);
                if (!res.ok) return;

                const data = await res.json();
                setUserCollection(data.collection || {});
                setFoilCollection(data.foil_collection || {});
            } catch (error) {
                console.error("Failed to fetch user collection for sets page:", error);
            }
        };

        fetchCollection();
    }, [userId]);

    const userSetProgress = useMemo(() => {
        const setsByName = Object.values(setData).reduce<Record<string, string>>((acc, set) => {
            acc[set.name] = set.id;
            return acc;
        }, {});

        return (cards as Array<{ cardId: string; set?: string; rarity?: string }>).reduce<Record<string, { collected: number; alts: number }>>((acc, card) => {
            const setName = card.set;
            if (!setName) return acc;

            const setId = setsByName[setName];
            if (!setId) return acc;

            const owned = (userCollection[card.cardId] ?? 0) + (foilCollection[card.cardId] ?? 0);
            if (owned <= 0) return acc;

            if (!acc[setId]) {
                acc[setId] = { collected: 0, alts: 0 };
            }

            if (isAltArtRarity(card.rarity)) {
                acc[setId].alts += 1;
            } else {
                // Primary completion should exclude alternate-art cards
                acc[setId].collected += 1;
            }

            return acc;
        }, {});
    }, [userCollection, foilCollection]);

    const sets = useMemo(() => {
        const altTotalsBySetName = (cards as Array<{ set?: string; rarity?: string }>).reduce<Record<string, number>>((acc, card) => {
            const setName = card.set;
            if (!setName) return acc;
            if (isAltArtRarity(card.rarity)) {
                acc[setName] = (acc[setName] ?? 0) + 1;
            }
            return acc;
        }, {});

        return Object.entries(setData)
            .map(([id, set]) => {
                const progress = userSetProgress[set.id] ?? {
                    collected: 0,
                    alts: 0
                };

                const altTotal = altTotalsBySetName[set.name] ?? 0;
                const isComingSoon = set.totalCards === 0 || new Date(set.releaseDate).getTime() > Date.now();

                return {
                    id,
                    name: set.name,
                    releaseDate: set.releaseDate,
                    backgroundImage: set.backgroundImage,
                    totalCards: set.totalCards,
                    collected: progress.collected,
                    alts: progress.alts,
                    altTotal,
                    isComingSoon,
                };
            })
            .filter((set) =>
                set.name.toLowerCase().includes(search.toLowerCase())
            )
            .sort((a, b) => {
                let result = 0;

                switch (sortBy) {
                    case "alphabetical":
                        result = a.name.localeCompare(b.name);
                        break;

                    case "cards":
                        result = a.collected - b.collected;
                        break;

                    case "release":
                    default:
                        result =
                            new Date(a.releaseDate).getTime() -
                            new Date(b.releaseDate).getTime();
                        break;
                }

                return sortOrder === "asc" ? result : -result;
            });
    }, [search, sortBy, sortOrder, userSetProgress]);

    return (
        <div className="h-[calc(100vh-4rem)] mt-16 flex flex-col bg-[#121212] text-white">
            {/* Header */}
            <div className="relative flex items-center justify-center h-64 bg-[url('/leagueworld.jpg')] bg-cover bg-center">
                <div className="absolute inset-0 bg-black/50" />
                <h1 className="relative text-8xl font-semibold z-10">
                    Collection
                </h1>
            </div>

            {/* Filters */}
                <div className="px-10 py-6 border-b border-white/5">
                    <div
                        className="
                            flex flex-wrap items-center gap-4
                            bg-black/40 backdrop-blur-md
                            border border-white/10
                            rounded-2xl px-6 py-4
                        "
                    >
                        {/* Search */}
                        <div className="flex-1 min-w-[220px]">
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search sets..."
                                className="
                                    w-full bg-black/60
                                    border border-white/10
                                    rounded-xl px-4 py-2.5 text-sm
                                    outline-none
                                    focus:border-white/20
                                    focus:ring-2 focus:ring-white/10
                                    transition
                                "
                            />
                        </div>

                        {/* Divider */}
                        <div className="hidden sm:block h-8 w-px bg-white/10" />

                        {/* Sort by */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                                Sort
                            </span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="
                                    bg-black/60
                                    border border-white/10
                                    rounded-xl px-3 py-2 text-sm
                                    outline-none
                                    hover:bg-white/5
                                    transition
                                "
                            >
                                <option value="release">Release</option>
                                <option value="cards">Collected</option>
                                <option value="alphabetical">A–Z</option>
                            </select>
                        </div>

                        {/* Order toggle */}
                        <button
                            onClick={() =>
                                setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                            }
                            className="
                                flex items-center gap-2
                                bg-black/60 border border-white/10
                                rounded-xl px-4 py-2 text-sm
                                hover:bg-white/5 transition
                            "
                        >
                            <span className="text-gray-300">
                                {sortOrder === "asc" ? "Ascending" : "Descending"}
                            </span>
                            <span className="text-gray-400">
                                {sortOrder === "asc" ? "↑" : "↓"}
                            </span>
                        </button>
                    </div>
                </div>

            {/* Sets Grid */}
            <div className="flex-1 p-10 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sets.map((set) => (
                        <SetPanel
                            key={set.name}
                            name={set.name}
                            backgroundImage={set.backgroundImage}
                            releaseDate={set.releaseDate}
                            collected={set.collected}
                            total={set.totalCards}
                            altCollected={set.alts}
                            altTotal={set.altTotal}
                            isComingSoon={set.isComingSoon}
                            onClick={() =>
                                navigate(`/collection/${set.id}`, {
                                    state: {
                                        name: set.name,
                                        releaseDate: set.releaseDate,
                                        backgroundImage: set.backgroundImage,
                                        totalCards: set.totalCards,
                                        collected: set.collected,
                                        alts: set.alts
                                    }
                                })
                            }
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
