import MainDeck from "../components/deckbuilder/MainDeck";
import SideDeck from "../components/deckbuilder/SideDeck";
import RunesDeck from "../components/deckbuilder/RunesDeck";
import { Button } from "../components/ui/button";
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { FullDeck } from "@/types/deck";
import CardImage from "@/components/CardImage";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/lib/constants";
import cardData from "../data/cards.json";
import { useDeckStats } from "@/hooks/useDeckStats";
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

    const { stats, energyData, powerData, typeData, typeColors } = useDeckStats(deck ? deck.deck_data : null);

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
      
    if (loading) return <div className="text-white p-4">Loading deck...</div>;
    if (!deck) return <div className="text-white p-4">No deck data found.</div>;

    return (
        <div className="h-[calc(100vh-4rem)] mt-16 flex flex-col bg-[#121212] text-white gap-3 px-6 py-4">
            <div className="py-1 text-3xl font-semibold">{deck.name}</div>

            <div id="Deck-Builder" className="flex flex-1 gap-3 min-h-0">
                <div id="Cards-Panel" className="flex flex-col flex-[3] gap-3 min-h-0">
                    <div id="Main-Deck" className="bg-[#1E1E1E] flex-[16] min-h-0 overflow-hidden">
                        <MainDeck 
                            legend={deck.deck_data.Legend} 
                            battlefields={deck.deck_data.Battlefields} 
                            chosenChampion={deck.deck_data.ChosenChampion} 
                            main={deck.deck_data.Main}
                            onHoverCard={setHoveredCard}
                            onLeaveCard={() => {}}
                        />
                    </div>

                    <div id="Side-Deck-Stats" className="flex flex-[4] gap-3 min-h-0">
                        <div id="Side-Deck" className="bg-[#1E1E1E] p-2 overflow-auto">
                            <SideDeck side={deck.deck_data.Side} onHoverCard={setHoveredCard} onLeaveCard={() => {}}/>
                        </div>
                        <div id="Runes-Deck" className="bg-[#1E1E1E] p-2 overflow-auto">
                            <RunesDeck runes={deck.deck_data.Runes}/>
                        </div>
                    </div>

                    <div id="Options-Panel" className="bg-[#121212] flex-[1] p-3">
                        <div className="flex gap-5">
                            <Button>Edit</Button>
                            <Button>Export</Button>
                            <Button onClick={handleCopyLink}>Copy Link</Button>
                            <Button>Delete</Button>
                        </div>
                    </div>
                </div>

                <div id="Right-Panel" className="flex flex-col flex-[1.3] gap-3 min-h-0">
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

                    <div id="Tab-Content" className="flex-1 bg-zinc-900/40 rounded-b-lg p-4 flex flex-col items-center overflow-hidden">
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
                                </div>
                            </div>
                        ) : (
                            <div id="Detailed Stats" className="w-full h-full flex flex-col gap-3 overflow-hidden p-1">
                                {/* Bar Charts Section */}
                                <div className="flex-1 min-h-0 grid grid-cols-1 gap-3">
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
