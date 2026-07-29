import MainDeck from "../components/deckbuilder/MainDeck";
import SideDeck from "../components/deckbuilder/SideDeck";
import RunesDeck from "../components/deckbuilder/RunesDeck";
import CollectionModeToggle from "../components/deckbuilder/CollectionModeToggle";
import { Pencil, Download, Link2, Trash2, ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { FullDeck } from "@/types/deck";
import CardImage from "@/components/CardImage";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/lib/constants";
import cardData from "../data/cards.json";
import { useDeckStats } from "@/hooks/useDeckStats";
import { useSwappableStat } from "@/hooks/useSwappableStat";
import { useCollection } from "@/hooks/useCollection";
import { isDeckIllegal } from "@/utils/deckStatusUtils";
import { computeMissingCards, formatMissingCardsList } from "@/utils/missingCardsUtil";
import StatusTag from "@/components/decks/StatusTag";
import Tooltip from "@/components/ui/Tooltip";
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip as RechartsTooltip, 
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from "recharts";

export default function DeckViewer() {
    const location = useLocation();
    const { deckId } = useParams();

    const [deck, setDeck] = useState<FullDeck | null>(null);
    const [loading, setLoading] = useState(true);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [notification, setNotification] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"viewer" | "stats">("viewer");
    const [collectionMode, setCollectionMode] = useState(false);
    const { ownedCount } = useCollection();

    const { stats, handProbabilities, energyData, powerData, typeData, typeColors } = useDeckStats(deck ? deck.deck_data : null);
    const { current: handStat, next: nextHandStat, prev: prevHandStat, index: handStatIndex, count: handStatCount } = useSwappableStat(handProbabilities);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    useEffect(() => {
        const incomingDeck = location.state?.deck as FullDeck;
    
        if (incomingDeck) {
          setDeck(incomingDeck);
          setLoading(false);
        } else if (deckId) {
          // Fetch deck from backend if not passed in state
          fetch(`${API_BASE_URL}/decks/${deckId}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    console.error(data.error);
                } else {
                    setDeck(data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
        } else {
          setLoading(false);
        }
      }, [location.state, deckId]);

    const handleCopyLink = () => {
        if (deck) {
            const link = `${window.location.origin}/deckviewer/${deck.id}`;
            navigator.clipboard.writeText(link);
            setNotification("Link copied to clipboard!");
        }
    };

    const handleCopyMissing = () => {
        if (!deck) return;
        const missing = computeMissingCards(deck.deck_data, ownedCount);
        if (missing.length === 0) {
            setNotification("You own every card in this deck!");
            return;
        }
        navigator.clipboard.writeText(formatMissingCardsList(missing));
        setNotification(`Missing cards list copied to clipboard (${missing.length} card${missing.length === 1 ? "" : "s"}).`);
    };

    if (loading) return <div className="text-white p-4">Loading deck...</div>;
    if (!deck) return <div className="text-white p-4">No deck data found.</div>;

    return (
        <div className="min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] lg:overflow-hidden mt-16 flex flex-col bg-[#121212] text-white gap-3 px-3 sm:px-6 py-4">
            <div className="py-1 flex flex-wrap items-center gap-3">
                <span className="text-xl sm:text-2xl lg:text-3xl font-semibold truncate">{deck.name}</span>
                {isDeckIllegal(deck.deck_data) && <StatusTag label="Illegal" color="red" />}
                <div className="flex items-center gap-2 ml-auto shrink-0">
                    {collectionMode && (
                        <button
                            onClick={handleCopyMissing}
                            title="Copy a list of the cards you're missing to your clipboard"
                            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium bg-zinc-900 border border-zinc-700 hover:border-[#caa368]/50 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                        >
                            <ClipboardList className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline whitespace-nowrap">Copy Missing</span>
                        </button>
                    )}
                    <CollectionModeToggle enabled={collectionMode} onChange={setCollectionMode} />
                </div>
            </div>

            <div id="Deck-Builder" className="flex flex-col lg:flex-row flex-1 gap-3 min-h-0">
                <div id="Cards-Panel" className="flex flex-col lg:flex-[3] gap-3 min-h-0">
                    <div id="Main-Deck" className="bg-[#1E1E1E] min-h-[420px] lg:min-h-0 lg:flex-[16] overflow-y-auto">
                        <MainDeck
                            legend={deck.deck_data.Legend}
                            battlefields={deck.deck_data.Battlefields}
                            chosenChampion={deck.deck_data.ChosenChampion}
                            main={deck.deck_data.Main}
                            onHoverCard={setHoveredCard}
                            onLeaveCard={() => {}}
                            collectionMode={collectionMode}
                            ownedCount={ownedCount}
                        />
                    </div>

                    <div id="Side-Deck-Stats" className="flex flex-col sm:flex-row gap-3 min-h-0 lg:flex-[4]">
                        <div id="Side-Deck" className="bg-[#1E1E1E] p-2 overflow-auto w-full sm:w-auto">
                            <SideDeck
                                side={deck.deck_data.Side}
                                onHoverCard={setHoveredCard}
                                onLeaveCard={() => {}}
                                collectionMode={collectionMode}
                                ownedCount={ownedCount}
                            />
                        </div>
                        <div id="Runes-Deck" className="bg-[#1E1E1E] p-2 overflow-auto w-full sm:w-auto">
                            <RunesDeck runes={deck.deck_data.Runes}/>
                        </div>
                    </div>

                    <div id="Options-Panel" className="bg-[#121212] lg:flex-[1] p-3">
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            <button className="flex items-center gap-1.5 bg-[#caa368] hover:bg-[#d9b57a] text-zinc-900 font-semibold px-3 py-1.5 rounded-md text-sm transition-colors">
                                <Pencil className="w-3.5 h-3.5" />
                                Edit
                            </button>
                            <button className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700 hover:border-[#caa368]/50 hover:bg-zinc-800 text-zinc-300 hover:text-white font-medium px-3 py-1.5 rounded-md text-sm transition-colors">
                                <Download className="w-3.5 h-3.5" />
                                Export
                            </button>
                            <button
                                onClick={handleCopyLink}
                                className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700 hover:border-[#caa368]/50 hover:bg-zinc-800 text-zinc-300 hover:text-white font-medium px-3 py-1.5 rounded-md text-sm transition-colors"
                            >
                                <Link2 className="w-3.5 h-3.5" />
                                Copy Link
                            </button>
                            <button className="flex items-center gap-1.5 bg-transparent border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 font-medium px-3 py-1.5 rounded-md text-sm transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                <div id="Right-Panel" className="flex flex-col lg:flex-[1.3] gap-3 min-h-[520px] lg:min-h-0">
                    <div id="Tabs" className="flex gap-2">
                        <button 
                            onClick={() => setActiveTab("viewer")}
                            className={`flex-1 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                                activeTab === "viewer" 
                                ? "bg-zinc-800 text-white border-b-2 border-[#caa368]" 
                                : "bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
                            }`}
                        >
                            Card Viewer
                        </button>
                        <button 
                            onClick={() => setActiveTab("stats")}
                            className={`flex-1 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                                activeTab === "stats" 
                                ? "bg-zinc-800 text-white border-b-2 border-[#caa368]" 
                                : "bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
                            }`}
                        >
                            Detailed Stats
                        </button>
                    </div>

                    <div id="Tab-Content" className="flex-1 min-h-0 bg-zinc-900/40 rounded-b-lg p-4 flex flex-col items-center overflow-y-auto">
                        {activeTab === "viewer" ? (
                            <div id="Card Viewer" className="flex flex-col items-center gap-4 w-full h-full">
                                <div className="flex items-center justify-center flex-1 w-full min-h-0">
                                    <div className="h-full aspect-[1/1.4] relative p-1">
                                        {hoveredCard ? (
                                            <CardImage
                                                cardId={hoveredCard}
                                                className="w-full h-full object-contain rounded-lg shadow-lg"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-500 text-sm text-center px-4">
                                                Hover over a card to preview
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {hoveredCard && (
                                    <div className="text-center shrink-0">
                                        <div className="text-[#caa368] font-semibold text-xl">
                                            {cardData.find(c => c.cardId === hoveredCard)?.name}
                                        </div>
                                        <div className="text-zinc-500 text-sm uppercase tracking-wider">
                                            {cardData.find(c => c.cardId === hoveredCard)?.type}
                                        </div>
                                    </div>
                                )}

                                <div className="w-full grid grid-cols-2 gap-x-6 gap-y-4 mt-4 px-6 shrink-0 pb-2">
                                    {stats.map((stat) => (
                                        <div key={stat.label} className="flex flex-col gap-1 border-b border-zinc-800 pb-2">
                                            <span className="text-xs text-[#caa368] uppercase font-bold tracking-tighter">
                                                {stat.label}
                                            </span>
                                            <span className="text-base text-white font-medium">
                                                {stat.value}
                                            </span>
                                        </div>
                                    ))}

                                    {handStat && (
                                        <div className="flex flex-col gap-1 border-b border-zinc-800 pb-2">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={prevHandStat}
                                                    title="Previous stat"
                                                    className="flex items-center justify-center w-4 h-4 rounded text-zinc-500 hover:text-[#caa368] hover:bg-zinc-800 transition-colors shrink-0"
                                                >
                                                    <ChevronLeft className="w-3 h-3" />
                                                </button>
                                                {handStat.description ? (
                                                    <Tooltip content={handStat.description} className="min-w-0 truncate">
                                                        <span className="text-xs text-[#caa368] uppercase font-bold tracking-tighter truncate cursor-help decoration-dotted underline-offset-4 hover:underline">
                                                            {handStat.label}
                                                        </span>
                                                    </Tooltip>
                                                ) : (
                                                    <span className="text-xs text-[#caa368] uppercase font-bold tracking-tighter truncate">
                                                        {handStat.label}
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={nextHandStat}
                                                    title="Next stat"
                                                    className="flex items-center justify-center w-4 h-4 rounded text-zinc-500 hover:text-[#caa368] hover:bg-zinc-800 transition-colors shrink-0"
                                                >
                                                    <ChevronRight className="w-3 h-3" />
                                                </button>
                                                <span className="text-[10px] text-zinc-500 ml-auto shrink-0">{handStatIndex + 1}/{handStatCount}</span>
                                            </div>
                                            <span className="text-base text-white font-medium">
                                                {handStat.value}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div id="Detailed Stats" className="w-full h-full flex flex-col gap-3 overflow-y-auto p-1">
                                {/* Bar Charts Section */}
                                <div className="flex-1 min-h-0 grid grid-cols-1 auto-rows-[minmax(160px,1fr)] gap-3">
                                    <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/50 flex flex-col">
                                        <h3 className="text-[#caa368] text-xs font-bold uppercase mb-2 flex items-center gap-2 shrink-0">
                                            <div className="w-1 h-3 bg-[#caa368]/50 rounded-full" />
                                            Energy Distribution
                                        </h3>
                                        <div className="flex-1 w-full min-h-0">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={energyData} margin={{ top: 5, right: 5, left: -35, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                                    <XAxis 
                                                        dataKey="name" 
                                                        stroke="#666" 
                                                        fontSize={10}
                                                        tickLine={false}
                                                        axisLine={false}
                                                    />
                                                    <YAxis 
                                                        stroke="#666" 
                                                        fontSize={10}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        allowDecimals={false}
                                                    />
                                                    <RechartsTooltip 
                                                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '4px', fontSize: '10px' }}
                                                        itemStyle={{ color: '#caa368', padding: 0 }}
                                                        cursor={{ fill: 'rgba(202, 163, 104, 0.05)' }}
                                                    />
                                                    <Bar dataKey="value" fill="#caa368" radius={[2, 2, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/50 flex flex-col">
                                        <h3 className="text-[#caa368] text-xs font-bold uppercase mb-2 flex items-center gap-2 shrink-0">
                                            <div className="w-1 h-3 bg-[#caa368]/50 rounded-full" />
                                            Power Distribution
                                        </h3>
                                        <div className="flex-1 w-full min-h-0">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={powerData} margin={{ top: 5, right: 5, left: -35, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                                    <XAxis 
                                                        dataKey="name" 
                                                        stroke="#666" 
                                                        fontSize={10}
                                                        tickLine={false}
                                                        axisLine={false}
                                                    />
                                                    <YAxis 
                                                        stroke="#666" 
                                                        fontSize={10}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        allowDecimals={false}
                                                    />
                                                    <RechartsTooltip 
                                                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '4px', fontSize: '10px' }}
                                                        itemStyle={{ color: '#6366f1', padding: 0 }}
                                                        cursor={{ fill: 'rgba(202, 163, 104, 0.05)' }}
                                                    />
                                                    <Bar dataKey="value" fill="#6366f1" radius={[2, 2, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/50 flex flex-col">
                                        <h3 className="text-[#caa368] text-xs font-bold uppercase mb-2 flex items-center gap-2 shrink-0">
                                            <div className="w-1 h-3 bg-[#caa368]/50 rounded-full" />
                                            Type Distribution
                                        </h3>
                                        <div className="flex-1 w-full flex items-center min-h-0">
                                            <div className="flex-1 h-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={typeData}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius="35%"
                                                            outerRadius="65%"
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                        >
                                                            {typeData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={typeColors[entry.name] || '#888'} />
                                                            ))}
                                                        </Pie>
                                                        <RechartsTooltip 
                                                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '4px', fontSize: '10px' }}
                                                            itemStyle={{ color: '#fff', padding: 0 }}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="flex flex-col gap-2 pr-4 shrink-0">
                                                {typeData.map((entry) => (
                                                    <div key={entry.name} className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: typeColors[entry.name] || '#888' }} />
                                                        <span className="text-xs text-zinc-300 font-semibold">{entry.name}</span>
                                                        <span className="text-xs text-white font-bold ml-auto pl-3">{entry.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                
            </div>

            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 20, x: "-50%" }}
                        className="fixed bottom-10 left-1/2 z-[100] bg-white text-black px-6 py-3 rounded-full shadow-2xl font-medium"
                    >
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
