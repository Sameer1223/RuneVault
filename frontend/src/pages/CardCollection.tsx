import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import cardData from "../data/cards.json";

// Function to organize cards by set
const organizeCardsBySet = () => {
  const sets = {
    origins: {
      id: "origins",
      name: "Riftbound Origins",
      stats: { 
        totalCards: 0, 
        totalLegendaries: 0, 
        release: "October 31, 2025" 
      },
      backgroundImage: "/origins.webp",
      cards: []
    },
    "proving-grounds": {
      id: "proving-grounds",
      name: "Riftbound Proving Grounds",
      stats: { 
        totalCards: 0, 
        totalLegendaries: 0, 
        release: "October 31, 2025" 
      },
      backgroundImage: "/proving-grounds.webp",
      cards: []
    },
    spiritforged: {
      id: "spiritforged",
      name: "Riftbound Spiritforged",
      stats: { 
        totalCards: "Coming Soon", 
        totalLegendaries: "Coming Soon", 
        release: "February 2026" 
      },
      backgroundImage: "/spiritforged.avif",
      cards: []
    },
    "new-horizons": {
      id: "new-horizons",
      name: "Riftbound New Horizons",
      stats: { 
        totalCards: 280, 
        totalLegendaries: 15, 
        release: "June 2026" 
      },
      backgroundImage: "/spiritforged.avif",
      cards: []
    }
  };

  // Filter cards for each set and count legendaries
  const originsCards = cardData.filter(card => 
    card.set === "Origins" && 
    !card.cardId.includes('s') && // Exclude special variants
    card.rarity !== "Alternate Art"
  );
  
  const provingGroundsCards = cardData.filter(card => 
    card.set === "Proving Grounds" && 
    !card.cardId.includes('s') // Exclude special variants
  );

  // Count legendaries for Origins (Overnumbered rarity)
  const originsLegendaries = originsCards.filter(card => 
    card.rarity === "Overnumbered"
  ).length;

  // Count legendaries for Proving Grounds (assuming Overnumbered rarity)
  const provingGroundsLegendaries = provingGroundsCards.filter(card => 
    card.rarity === "Overnumbered"
  ).length;

  // Update sets with actual data
  sets.origins.stats.totalCards = originsCards.length;
  sets.origins.stats.totalLegendaries = originsLegendaries;
  sets.origins.cards = originsCards.map(card => ({
    id: card.cardId,
    name: card.name,
    rarity: card.rarity === "Overnumbered" ? "Legendary" : 
            card.rarity === "Uncommon" ? "Rare" : card.rarity,
    collected: false,
    quantity: 0,
    foilQuantity: 0,
    image: `/TempCards/${card.cardId}.avif`,
    cardData: card // Include full card data for detail page
  }));

  sets["proving-grounds"].stats.totalCards = provingGroundsCards.length;
  sets["proving-grounds"].stats.totalLegendaries = provingGroundsLegendaries;
  sets["proving-grounds"].cards = provingGroundsCards.map(card => ({
    id: card.cardId,
    name: card.name,
    rarity: card.rarity === "Overnumbered" ? "Legendary" : 
            card.rarity === "Uncommon" ? "Rare" : card.rarity,
    collected: false,
    quantity: 0,
    foilQuantity: 0,
    image: `/TempCards/${card.cardId}.avif`,
    cardData: card
  }));

  return sets;
};

// Initialize setData with actual card data
export let setData = organizeCardsBySet();

// Function to update card collection status
export const updateCardCollection = (setId, cardId, collected) => {
  const set = setData[setId];
  if (set && set.cards) {
    const card = set.cards.find(c => c.id === cardId);
    if (card) {
      card.collected = collected;
      // If setting to not collected, also reset quantity to 0
      if (!collected) {
        card.quantity = 0;
      } else if (card.quantity === 0) {
        // If setting to collected and quantity is 0, set to 1
        card.quantity = 1;
      }
    }
  }
};

// Function to update card quantity - REMOVED MAX LIMIT OF 4
export const updateCardQuantity = (setId, cardId, quantity) => {
  const set = setData[setId];
  if (set && set.cards) {
    const card = set.cards.find(c => c.id === cardId);
    if (card) {
      card.quantity = Math.max(0, quantity); // Removed the Math.min(4, ...) limit
      card.collected = card.quantity > 0;
    }
  }
};

// Function to update foil quantity
export const updateFoilQuantity = (setId, cardId, foilQuantity) => {
  const set = setData[setId];
  if (set && set.cards) {
    const card = set.cards.find(c => c.id === cardId);
    if (card) {
      // Initialize foilQuantity if it doesn't exist
      if (card.foilQuantity === undefined) {
        card.foilQuantity = 0;
      }
      card.foilQuantity = Math.max(0, foilQuantity);
    }
  }
};

// Calculate collected counts from the actual card data
const calculateCollectedStats = (set) => {
  if (set.stats.totalCards === "Coming Soon") {
    return {
      cardsCollected: "Coming Soon",
      legendariesCollected: "Coming Soon"
    };
  }
  
  const cardsCollected = set.cards.filter(card => card.collected).length;
  const legendariesCollected = set.cards.filter(card => card.collected && card.rarity === "Legendary").length;
  
  return {
    cardsCollected,
    legendariesCollected
  };
};

export default function Collections() {
  const [search, setSearch] = useState("");
  const [filterBy, setFilterBy] = useState("Release Date");
  const [sortOrder, setSortOrder] = useState("asc");
  const navigate = useNavigate();
  const [refresh, setRefresh] = useState(0); // Add refresh state for synchronization

  // Force periodic refresh to sync with global state
  useEffect(() => {
    const interval = setInterval(() => {
      setRefresh(prev => prev + 1);
    }, 1000); // Refresh every second to catch external changes
    
    return () => clearInterval(interval);
  }, []);

  // Create sets with calculated collected counts
  const sets = Object.values(setData).map(set => ({
    ...set,
    stats: {
      ...set.stats,
      ...calculateCollectedStats(set)
    }
  }));

  // Progress wheel component
  const ProgressWheel = ({ collected, total, size = 32, strokeWidth = 3 }) => {
    if (collected === "Coming Soon" || total === "Coming Soon") {
      return (
        <div className="flex items-center justify-center w-16 h-8 bg-gray-700/50 rounded-full border border-gray-600">
          <span className="text-sm font-medium text-gray-300">?</span>
        </div>
      );
    }

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (collected / total) * 100;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#374151"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f59e0b"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
          {collected}/{total}
        </div>
      </div>
    );
  };

  // Filter + Sort Logic
  const filteredSets = sets
    .filter((set) => set.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const order = sortOrder === "asc" ? 1 : -1;
      if (filterBy === "Release Date") {
        const dateA = new Date(a.stats.release).getTime();
        const dateB = new Date(b.stats.release).getTime();
        return order * (dateA - dateB);
      }
      if (filterBy === "Cards Collected") {
        if (a.stats.cardsCollected === "Coming Soon" && b.stats.cardsCollected === "Coming Soon") return 0;
        if (a.stats.cardsCollected === "Coming Soon") return order * 1;
        if (b.stats.cardsCollected === "Coming Soon") return order * -1;
        return order * (a.stats.cardsCollected - b.stats.cardsCollected);
      }
      if (filterBy === "Legendaries") {
        if (a.stats.legendariesCollected === "Coming Soon" && b.stats.legendariesCollected === "Coming Soon") return 0;
        if (a.stats.legendariesCollected === "Coming Soon") return order * 1;
        if (b.stats.legendariesCollected === "Coming Soon") return order * -1;
        return order * (a.stats.legendariesCollected - b.stats.legendariesCollected);
      }
      return 0;
    });

  const handleSetClick = (setId) => {
    navigate(`/collection/${setId}`);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="h-[calc(100vh-4rem)] mt-16 flex flex-col bg-[#121212] text-white">
      {/* Header with Integrated Search and Filters */}
      <div className="relative flex flex-col items-center justify-center h-80 w-full bg-[url('/leagueworld.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Reduced Title */}
        <h1 className="relative text-white text-6xl font-semibold z-10 mb-8">
          Collections
        </h1>
        
        {/* All Filters Integrated in Header */}
        <div className="relative z-10 w-full max-w-4xl px-10">
          <div className="flex flex-wrap items-end justify-center gap-6">
            {/* Search Bar */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-300 mb-2">Search Sets</label>
              <input
                type="text"
                placeholder="Search sets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-black/60 backdrop-blur-sm text-white rounded-xl p-3 w-64 outline-none focus:ring-2 focus:ring-amber-400 border border-gray-600"
              />
            </div>

            {/* Filter By */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-300 mb-2">Filter By</label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="bg-black/60 backdrop-blur-sm text-white rounded-xl p-3 w-48 outline-none focus:ring-2 focus:ring-amber-400 border border-gray-600"
              >
                <option>Release Date</option>
                <option>Cards Collected</option>
                <option>Legendaries</option>
              </select>
            </div>

            {/* Single Toggle Sort Button */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-300 mb-2">Order</label>
              <button
                onClick={toggleSortOrder}
                className="bg-black/60 backdrop-blur-sm text-gray-300 hover:bg-black/80 border border-gray-600 rounded-xl p-3 w-24 outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>{sortOrder === "asc" ? "Asc" : "Desc"}</span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${sortOrder === "desc" ? "rotate-180" : ""}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="flex-1 px-10 py-10 overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-8">Sets</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredSets.map((set, index) => (
            <div
              key={index}
              onClick={() => handleSetClick(set.id)}
              className="relative group overflow-hidden rounded-2xl bg-cover bg-center h-80 transition-all duration-300 hover:bg-black/70 cursor-pointer"
              style={{ backgroundImage: `url(${set.backgroundImage})` }}
            >
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/70 transition-all duration-300 rounded-2xl" />

              {/* Text and Stats */}
              <div className="relative z-10 p-6 flex flex-col justify-end h-full">
                {/* Centered Set Name */}
                <h3 className="text-2xl font-bold mb-3 text-center">{set.name}</h3>
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300">Total Cards</p>
                      <p className="text-gray-400 text-xs">
                        {set.stats.totalCards === "Coming Soon" 
                          ? "Coming Soon" 
                          : `${set.stats.cardsCollected}/${set.stats.totalCards}`}
                      </p>
                    </div>
                    <ProgressWheel 
                      collected={set.stats.cardsCollected} 
                      total={set.stats.totalCards} 
                      size={32}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300">Legendaries</p>
                      <p className="text-gray-400 text-xs">
                        {set.stats.totalLegendaries === "Coming Soon" 
                          ? "Coming Soon" 
                          : `${set.stats.legendariesCollected}/${set.stats.totalLegendaries}`}
                      </p>
                    </div>
                    <ProgressWheel 
                      collected={set.stats.legendariesCollected} 
                      total={set.stats.totalLegendaries} 
                      size={32}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-gray-300">Released</p>
                    <p className="text-gray-400 text-sm">{set.stats.release}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}