// import { useParams, useNavigate } from "react-router-dom";
// import { useState, useEffect, useCallback, useRef } from "react";
// // import {
// //     setData,
// //     updateCardQuantity,
// //     updateFoilQuantity
// // } from "../pages/CardCollection";
// import setData from "../data/sets.json";

// export default function CollectionDetail() {
//     const { setId } = useParams();
//     const navigate = useNavigate();

//     const [search, setSearch] = useState("");
//     const [rarityFilter, setRarityFilter] = useState("All");
//     const [setState, setSetState] = useState(null);
//     const [hoveredCard, setHoveredCard] = useState(null);
//     const [previewStyle, setPreviewStyle] = useState({});

//     const previewRef = useRef(null);

//     useEffect(() => {
//         const sourceSet = setData[setId];
//         if (!sourceSet) return;

//         const clonedSet = {
//             ...sourceSet,
//             cards: sourceSet.cards.map(card => ({
//                 ...card,
//                 foilQuantity: card.foilQuantity ?? 0
//             }))
//         };

//         setSetState(clonedSet);
//     }, [setId]);

//     const calculatePreviewPosition = useCallback((x, y) => {
//         const previewWidth = 384;
//         const previewHeight = 536;
//         const offset = 20;

//         let left = x + offset;
//         let top = y;

//         if (left + previewWidth > window.innerWidth) {
//             left = x - previewWidth - offset;
//         }

//         if (top + previewHeight > window.innerHeight) {
//             top = window.innerHeight - previewHeight - offset;
//         }

//         return {
//             position: "fixed",
//             left,
//             top,
//             zIndex: 50,
//             pointerEvents: "none"
//         };
//     }, []);

//     const handleCardHover = (card, event) => {
//         setHoveredCard(card);
//         setPreviewStyle(
//             calculatePreviewPosition(event.clientX, event.clientY)
//         );
//     };

//     const handleCardLeave = () => {
//         setHoveredCard(null);
//     };

//     if (!setState) {
//         return <div className="mt-20 text-center">Loading...</div>;
//     }

//     const totalCards = setState.stats.totalCards;
//     const collectedCount = setState.cards.filter(c => c.collected).length;

//     const rarityStats = setState.cards.reduce(
//         (acc, card) => {
//             if (!acc[card.rarity]) return acc;

//             acc[card.rarity].total++;
//             if (card.collected) acc[card.rarity].collected++;

//             return acc;
//         },
//         {
//             Common: { collected: 0, total: 0 },
//             Rare: { collected: 0, total: 0 },
//             Epic: { collected: 0, total: 0 },
//             Legendary: { collected: 0, total: 0 }
//         }
//     );

//     const filteredCards = setState.cards.filter(card => {
//         if (!card.name.toLowerCase().includes(search.toLowerCase())) {
//             return false;
//         }

//         if (rarityFilter !== "All" && card.rarity !== rarityFilter) {
//             return false;
//         }

//         return true;
//     });

//     const toggleCollected = card => {
//         const quantity = card.collected ? 0 : 1;
//         updateCardQuantity(setId, card.id, quantity);

//         setSetState(prev => ({
//             ...prev,
//             cards: prev.cards.map(c =>
//                 c.id === card.id
//                     ? { ...c, collected: !c.collected, quantity }
//                     : c
//             )
//         }));
//     };

//     const changeQuantity = (cardId, quantity) => {
//         updateCardQuantity(setId, cardId, quantity);

//         setSetState(prev => ({
//             ...prev,
//             cards: prev.cards.map(card =>
//                 card.id === cardId
//                     ? { ...card, quantity }
//                     : card
//             )
//         }));
//     };

//     const changeFoilQuantity = (cardId, foilQuantity) => {
//         updateFoilQuantity(setId, cardId, foilQuantity);

//         setSetState(prev => ({
//             ...prev,
//             cards: prev.cards.map(card =>
//                 card.id === cardId
//                     ? { ...card, foilQuantity }
//                     : card
//             )
//         }));
//     };

//     return (
//         <div className="min-h-screen mt-16 bg-[#121212] text-white">
//             <div
//                 className="relative h-80 bg-cover bg-center"
//                 style={{ backgroundImage: `url(${setState.backgroundImage})` }}
//             >
//                 <div className="absolute inset-0 bg-black/60" />
//                 <div className="relative z-10 h-full px-10 flex flex-col justify-center">
//                     <button
//                         onClick={() => navigate("/collection")}
//                         className="mb-4 w-fit px-4 py-2 bg-amber-500 rounded-lg hover:bg-amber-600"
//                     >
//                         ← Back to Collections
//                     </button>

//                     <h1 className="text-6xl font-bold">{setState.name}</h1>
//                     <p className="text-xl text-gray-300 mt-2">
//                         {totalCards === "Coming Soon"
//                             ? "Coming Soon"
//                             : `${collectedCount}/${totalCards} Cards Collected`}
//                     </p>
//                 </div>
//             </div>

//             <div className="bg-[#1a1a1a] border-y border-zinc-800 px-10 py-5 flex flex-wrap gap-8">
//                 <div>
//                     <label className="text-sm text-gray-400">Search</label>
//                     <input
//                         value={search}
//                         onChange={e => setSearch(e.target.value)}
//                         className="block mt-1 bg-[#2a2a2a] rounded-md p-2 w-64"
//                     />
//                 </div>

//                 <div>
//                     <label className="text-sm text-gray-400">Rarity</label>
//                     <select
//                         value={rarityFilter}
//                         onChange={e => setRarityFilter(e.target.value)}
//                         className="block mt-1 bg-[#2a2a2a] rounded-md p-2 w-48"
//                     >
//                         <option>All</option>
//                         <option>Common</option>
//                         <option>Rare</option>
//                         <option>Epic</option>
//                         <option>Legendary</option>
//                     </select>
//                 </div>
//             </div>

//             <div className="p-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
//                 {filteredCards.map(card => (
//                     <div
//                         key={card.id}
//                         className={`rounded-xl border-2 cursor-pointer transition hover:scale-105 ${
//                             card.collected
//                                 ? "border-amber-400"
//                                 : "border-gray-600 grayscale"
//                         }`}
//                         onClick={() => toggleCollected(card)}
//                     >
//                         <div
//                             className="aspect-[3/4] bg-cover bg-center"
//                             style={{ backgroundImage: `url(${card.image})` }}
//                             onMouseEnter={e => handleCardHover(card, e)}
//                             onMouseLeave={handleCardLeave}
//                         />

//                         <div className="p-3">
//                             <h3 className="text-sm font-semibold truncate">
//                                 {card.name}
//                             </h3>

//                             {card.collected && (
//                                 <div className="mt-2 flex gap-2">
//                                     <button
//                                         onClick={e => {
//                                             e.stopPropagation();
//                                             changeQuantity(
//                                                 card.id,
//                                                 Math.max(0, card.quantity - 1)
//                                             );
//                                         }}
//                                     >
//                                         −
//                                     </button>

//                                     <span>{card.quantity}</span>

//                                     <button
//                                         onClick={e => {
//                                             e.stopPropagation();
//                                             changeQuantity(
//                                                 card.id,
//                                                 card.quantity + 1
//                                             );
//                                         }}
//                                     >
//                                         +
//                                     </button>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             {hoveredCard && (
//                 <div ref={previewRef} style={previewStyle}>
//                     <div
//                         className="w-96 h-[536px] bg-contain bg-no-repeat bg-center rounded-xl border-2 border-amber-400 bg-black"
//                         style={{ backgroundImage: `url(${hoveredCard.image})` }}
//                     />
//                 </div>
//             )}
//         </div>
//     );
// }
