import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import cards from "@/data/cards.json";
import setData from "../data/sets.json";
import CardTile from "@/components/collection/CardTile";
import { useUserId } from "@/hooks/useUserId";
import { useAuthFetch } from "@/hooks/useAuthFetch";

export default function SetCollection() {
    const { setId } = useParams();
    const location = useLocation();
    const setDetails = location.state || {};
    const { name, releaseDate, backgroundImage, totalCards } = setDetails;
    const navigate = useNavigate();

    const { userId, loading: userLoading } = useUserId();
    const authFetch = useAuthFetch();

    // fallback: if the navigation state didn't provide the set name, try to look it up
    let displayName = name;
    if (!displayName && setId) {
        const matchKey = Object.keys(setData).find(k => {
            const s = setData[k];
            if (!s) return false;
            return (
                (s.id && s.id.toLowerCase() === setId.toLowerCase()) ||
                (s.name && s.name.toLowerCase() === setId.toLowerCase()) ||
                k.toLowerCase() === setId.toLowerCase()
            );
        });

        if (matchKey) displayName = setData[matchKey].name;
    }
    const [search, setSearch] = useState("");

    // User collection from API
    const [userCollection, setUserCollection] = useState<Record<string, number>>({});
    const [foilCollection, setFoilCollection] = useState<Record<string, number>>({});

    // Fetch initial user collection
    useEffect(() => {
        const fetchCollection = async () => {
            if (!userId) return; // Don't fetch if userId is not loaded yet
            
            try {
                const res = await authFetch(`http://127.0.0.1:5000/api/collection/${encodeURIComponent(userId)}`);
                if (res.ok) {
                    const data = await res.json();
                    setUserCollection(data.collection || {});
                    setFoilCollection(data.foil_collection || {});
                } else {
                    console.error("Failed to fetch collection");
                }
            } catch (error) {
                console.error("Error fetching collection:", error);
            } finally {
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
        try {
            const res = await authFetch(`http://127.0.0.1:5000/api/collection/${encodeURIComponent(userId!)}`, {
                method: "PATCH",
                body: JSON.stringify({ card_id: cardId, delta, is_foil: isFoil })
            });

            if (!res.ok) {
                throw new Error("Failed to sync collection");
            }

            // Reconcile with server
            const serverData = await res.json();
            setUserCollection(serverData.collection || {});
            setFoilCollection(serverData.foil_collection || {});

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

    const rarityTypes = ["Common", "Uncommon", "Rare", "Epic", "Alternate Art"];

    const rarityStats = useMemo(() => {
        const totals = {};
        const collectedCounts = {};
        rarityTypes.forEach(r => {
            totals[r] = 0;
            collectedCounts[r] = 0;
        });

        viewCards.forEach(card => {
            const r = card.rarity || "Common";
            if (totals[r] === undefined) {
                totals[r] = 0;
                collectedCounts[r] = 0;
            }
            totals[r] = (totals[r] ?? 0) + 1;
            if ((card.collected ?? 0) > 0) {
                collectedCounts[r] = (collectedCounts[r] ?? 0) + 1;
            }
        });

        return { totals, collectedCounts };
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
                </div>
            </header>

            <div className="p-10">
                <div className="bg-transparent mb-6">
                    <div className="w-full max-w-6xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row items-center gap-4 bg-gradient-to-r from-white/3 via-white/2 to-white/3 border border-white/8 rounded-3xl p-4 shadow-md">
                            <div className="flex items-center gap-3 flex-1">
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

                            <div className="flex gap-3 flex-wrap justify-end">
                                {rarityTypes.map((r) => {
                                    const colorClass =
                                        r === "Common" ? "text-gray-300" :
                                        r === "Uncommon" ? "text-green-400" :
                                        r === "Rare" ? "text-blue-400" :
                                        r === "Epic" ? "text-purple-400" :
                                        "text-pink-400";

                                    const emoji =
                                        r === "Common" ? "⚪" :
                                        r === "Uncommon" ? "🟢" :
                                        r === "Rare" ? "🔵" :
                                        r === "Epic" ? "🟣" :
                                        "⭐";

                                    const collectedNum = rarityStats.collectedCounts[r] ?? 0;
                                    const totalNum = rarityStats.totals[r] ?? 0;

                                    return (
                                        <div key={r} className="flex items-center gap-2 bg-black/30 px-3 py-2 rounded-lg border border-white/6">
                                            <span className={`${colorClass} text-lg`}>{emoji}</span>
                                            <div className="text-sm text-gray-200">
                                                <div className="font-semibold">{r}</div>
                                                <div className="text-gray-400">{collectedNum}/{totalNum}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filtered.map(card => (
                        <CardTile
                            key={card.cardId}
                            card={card}
                            owned={card.collected}
                            foil={card.foilCollected}
                            onChangeOwned={delta =>
                                updateCollection(card.cardId, delta)
                            }
                            onChangeFoil={delta =>
                                updateCollection(card.cardId, delta, true)
                            }
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
