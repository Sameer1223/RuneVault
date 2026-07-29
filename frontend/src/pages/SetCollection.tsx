import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect, useRef } from "react";
import { Minus, Plus, LayoutGrid } from "lucide-react";
import cards from "@/data/cards.json";
import setData from "../data/sets.json";
import CardTile from "@/components/collection/CardTile";
import { useUserId } from "@/hooks/useUserId";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { API_BASE_URL, RARITY_TYPES, RARITY_COLOR_CLASS } from "@/lib/constants";

const MIN_COLUMNS = 3;
const MAX_COLUMNS = 10;
const DEFAULT_COLUMNS = 6;

function readStoredColumns(): number {
    const stored = Number(localStorage.getItem("collectionColumns"));
    if (Number.isFinite(stored) && stored >= MIN_COLUMNS && stored <= MAX_COLUMNS) return stored;
    return DEFAULT_COLUMNS;
}

export default function SetCollection() {
    const { setId } = useParams();
    const location = useLocation();
    const setDetails = location.state || {};
    const { name, releaseDate, backgroundImage, totalCards } = setDetails;
    const navigate = useNavigate();

    const { userId } = useUserId();
    const authFetch = useAuthFetch();

    // fallback: if the navigation state didn't provide the set name, try to look it up
    let displayName = name;
    if (!displayName && setId) {
        const sData = setData as Record<string, { id: string; name: string; releaseDate: string; backgroundImage: string; totalCards: number }>;
        const matchKey = Object.keys(sData).find(k => {
            const s = sData[k];
            if (!s) return false;
            return (
                (s.id && s.id.toLowerCase() === setId.toLowerCase()) ||
                (s.name && s.name.toLowerCase() === setId.toLowerCase()) ||
                k.toLowerCase() === setId.toLowerCase()
            );
        });

        if (matchKey) displayName = sData[matchKey].name;
    }
    const [search, setSearch] = useState("");
    const [columns, setColumns] = useState(readStoredColumns);

    useEffect(() => {
        localStorage.setItem("collectionColumns", String(columns));
    }, [columns]);

    // User collection from API
    const [userCollection, setUserCollection] = useState<Record<string, number>>({});
    const [foilCollection, setFoilCollection] = useState<Record<string, number>>({});

    // Tracks the latest in-flight request per card+type so a slow/out-of-order
    // response can't clobber a newer optimistic update when clicking fast.
    const requestSeqRef = useRef<Record<string, number>>({});

    // Fetch initial user collection
    useEffect(() => {
        const fetchCollection = async () => {
            if (!userId) return; // Don't fetch if userId is not loaded yet
            
            try {
                const res = await authFetch(`${API_BASE_URL}/collection/${encodeURIComponent(userId)}`);
                if (res.ok) {
                    const data = await res.json();
                    setUserCollection(data.collection || {});
                    setFoilCollection(data.foil_collection || {});
                } else {
                    console.error("Failed to fetch collection");
                }
            } catch (error) {
                console.error("Error fetching collection:", error);
            }
        };

        fetchCollection();
    }, [userId]);


    const setCards = useMemo(() => {
        return cards.filter(
            c => c.set === name
        );
    }, [setId]);


    function updateCollection(cardId: string, delta: number, isFoil: boolean = false) {
        // 1. Optimistically update UI
        const setter = isFoil ? setFoilCollection : setUserCollection;
        setter(prev => {
            const next = { ...prev };
            const current = next[cardId] ?? 0;
            const updated = Math.max(0, current + delta);

            if (updated === 0) {
                delete next[cardId];
            } else {
                next[cardId] = updated;
            }

            return next;
        });

        // 2. Fire-and-forget server update
        sendUpdate(cardId, delta, isFoil);
    }

    async function sendUpdate(cardId: string, delta: number, isFoil: boolean = false) {
        if (!userId) return;

        const key = `${isFoil ? "foil" : "normal"}:${cardId}`;
        const seq = (requestSeqRef.current[key] ?? 0) + 1;
        requestSeqRef.current[key] = seq;

        try {
            const res = await authFetch(`${API_BASE_URL}/collection/${encodeURIComponent(userId)}`, {
                method: "PATCH",
                body: JSON.stringify({ card_id: cardId, delta, is_foil: isFoil })
            });

            if (!res.ok) {
                throw new Error("Failed to sync collection");
            }

            const serverData = await res.json();

            // A newer request for this same card has since been fired - its own
            // response will reconcile the count, so applying this stale one now
            // would clobber the newer optimistic update and cause a visible flicker.
            if (requestSeqRef.current[key] !== seq) return;

            // Reconcile only this card's count (not the whole map) so a response
            // for one card can't stomp on optimistic edits made to other cards.
            const authoritative = isFoil ? serverData.foil_collection?.[cardId] : serverData.collection?.[cardId];
            const setter = isFoil ? setFoilCollection : setUserCollection;
            setter(prev => {
                const next = { ...prev };
                if (!authoritative) delete next[cardId];
                else next[cardId] = authoritative;
                return next;
            });

        } catch (err) {
            console.error(err);
        }
    }


    const viewCards = useMemo(() => {
        return setCards.map(card => {
            const owned = userCollection[card.cardId] ?? 0;

            const foilOwned = foilCollection[card.cardId] ?? 0;

            return {
                ...card,
                collected: owned,
                foilCollected: foilOwned
            };
        });
    }, [setCards, userCollection, foilCollection]);

    const rarityTypes = RARITY_TYPES;

    const rarityIconMap: Record<string, string> = {
        Common: "/Rarities/common.avif",
        Uncommon: "/Rarities/uncommon.avif",
        Rare: "/Rarities/rare.avif",
        Epic: "/Rarities/epic.avif",
        "Alternate Art": "/Rarities/alternate-art.avif",
    };

    const normalizeRarity = (rarity?: string) => {
        if (!rarity) return "Common";
        if (rarity === "Overnumbered" || rarity === "Signature" || rarity === "Alternate Art") {
            return "Alternate Art";
        }
        return rarity;
    };

    const rarityStats = useMemo(() => {
        const totals: Record<string, number> = {};
        const collectedCounts: Record<string, number> = {};
        rarityTypes.forEach(r => {
            totals[r] = 0;
            collectedCounts[r] = 0;
        });

        viewCards.forEach(card => {
            const r = normalizeRarity(card.rarity);
            if (totals[r] === undefined) {
                totals[r] = 0;
                collectedCounts[r] = 0;
            }
            totals[r] = (totals[r] ?? 0) + 1;
            if ((card.collected ?? 0) > 0) {
                collectedCounts[r] = (collectedCounts[r] ?? 0) + 1;
            }
        });

        const totalAll = Object.values(totals).reduce((a, b) => a + b, 0);
        const collectedAll = Object.values(collectedCounts).reduce((a, b) => a + b, 0);

        return { totals, collectedCounts, totalAll, collectedAll };
    }, [viewCards]);

    const filtered = viewCards.filter(card =>
        card.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen mt-16 bg-[#121212] text-white">
            <header
                className="relative h-48 flex items-center"
                style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${backgroundImage || "/leagueworld.jpg"})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}
            >
                <button
                    onClick={() => navigate(-1)}
                    className="absolute left-6 top-4 z-20 bg-black/50 hover:bg-black/60 text-white rounded-full p-2 flex items-center gap-2 border border-white/10"
                >
                    <span className="text-lg">←</span>
                    <span className="hidden sm:inline text-sm">Back</span>
                </button>
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative w-full max-w-6xl mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-md">{displayName || setId}</h1>
                    <div className="mt-2 flex flex-wrap gap-4 items-center">
                        {releaseDate && <span className="text-sm text-gray-200/80">Release: {releaseDate}</span>}
                        {totalCards != null && <span className="text-sm text-gray-200/80">Total Cards: {totalCards}</span>}
                    </div>
                    {rarityStats.totalAll > 0 && (
                        <div className="mt-4 max-w-md">
                            <div className="flex justify-between text-xs text-gray-300 mb-1">
                                <span>Collection progress</span>
                                <span className="font-semibold text-[#caa368]">
                                    {rarityStats.collectedAll}/{rarityStats.totalAll}
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/10">
                                <div
                                    className="h-full bg-gradient-to-r from-[#caa368] to-[#e8c98a] rounded-full transition-all duration-500"
                                    style={{ width: `${(rarityStats.collectedAll / rarityStats.totalAll) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <div className="p-10">
                <div className="bg-transparent mb-6">
                    <div className="w-full max-w-6xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row items-center gap-4 bg-gradient-to-r from-white/3 via-white/2 to-white/3 border border-white/8 rounded-3xl p-4 shadow-md">
                            <div className="flex items-center gap-3 flex-1 w-full md:w-auto">
                                <div className="p-2 bg-black/40 rounded-lg">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-90"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                </div>
                                <input
                                    className="w-full bg-transparent placeholder-gray-400 text-white outline-none px-3 py-2"
                                    placeholder="Search cards..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-2 bg-black/30 px-2 py-2 rounded-lg border border-white/6 shrink-0">
                                <LayoutGrid className="w-4 h-4 text-gray-400 ml-1" />
                                <button
                                    onClick={() => setColumns(c => Math.max(MIN_COLUMNS, c - 1))}
                                    disabled={columns <= MIN_COLUMNS}
                                    title="Fewer columns (bigger cards)"
                                    className="w-6 h-6 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded disabled:opacity-30 disabled:hover:bg-zinc-800 transition-colors"
                                >
                                    <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-sm text-gray-200 w-4 text-center font-medium">{columns}</span>
                                <button
                                    onClick={() => setColumns(c => Math.min(MAX_COLUMNS, c + 1))}
                                    disabled={columns >= MAX_COLUMNS}
                                    title="More columns (smaller cards)"
                                    className="w-6 h-6 flex items-center justify-center bg-zinc-800 hover:bg-[#caa368] text-zinc-300 hover:text-zinc-900 rounded disabled:opacity-30 disabled:hover:bg-zinc-800 disabled:hover:text-zinc-300 transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="flex gap-3 flex-wrap justify-end">
                                {rarityTypes.map((r) => {
                                    const collectedNum = rarityStats.collectedCounts[r] ?? 0;
                                    const totalNum = rarityStats.totals[r] ?? 0;

                                    return (
                                        <div key={r} className="flex items-center gap-2 bg-black/30 px-3 py-2 rounded-lg border border-white/6">
                                            <img
                                                src={rarityIconMap[r]}
                                                alt={`${r} rarity icon`}
                                                className="h-5 w-5 rounded-sm object-cover"
                                            />
                                            <div className="text-sm text-gray-200">
                                                <div className={`font-semibold ${RARITY_COLOR_CLASS[r] ?? "text-gray-300"}`}>{r}</div>
                                                <div className="text-gray-400">{collectedNum}/{totalNum}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                    {filtered.map(card => (
                        <CardTile
                            key={card.cardId}
                            card={card}
                            owned={card.collected}
                            foil={card.foilCollected}
                            onChangeOwned={(delta: number) =>
                                updateCollection(card.cardId, delta)
                            }
                            onChangeFoil={(delta: number) =>
                                updateCollection(card.cardId, delta, true)
                            }
                            compact={columns >= 8}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
