import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { setData, updateCardQuantity } from "../pages/CardCollection";

export default function CollectionDetail() {
  const { setId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [rarityFilter, setRarityFilter] = useState("All");
  const [localSetData, setLocalSetData] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    // Create a deep copy of the set data to avoid mutating the original directly
    const set = JSON.parse(JSON.stringify(setData[setId]));
    setLocalSetData(set);
  }, [setId, refresh]);

  if (!localSetData) {
    return <div>Loading...</div>;
  }

  // Calculate collected counts from actual card data
  const collectedCount = localSetData.cards.filter(card => card.collected).length;
  const totalCards = localSetData.stats.totalCards;

  // Calculate rarity statistics
  const calculateRarityStats = () => {
    const stats = {
      Common: { collected: 0, total: 0 },
      Rare: { collected: 0, total: 0 },
      Epic: { collected: 0, total: 0 },
      Legendary: { collected: 0, total: 0 }
    };

    localSetData.cards.forEach(card => {
      if (stats[card.rarity]) {
        stats[card.rarity].total++;
        if (card.collected) {
          stats[card.rarity].collected++;
        }
      }
    });

    return stats;
  };

  const rarityStats = calculateRarityStats();

  const filteredCards = localSetData.cards.filter(card => 
    card.name.toLowerCase().includes(search.toLowerCase()) &&
    (rarityFilter === "All" || card.rarity === rarityFilter)
  );

  const handleCardClick = (cardId) => {
    const card = localSetData.cards.find(c => c.id === cardId);
    if (card) {
      // Toggle collection status - if already collected, uncollect it
      const newCollected = !card.collected;
      const newQuantity = newCollected ? 1 : 0;
      
      // Update the global data
      updateCardQuantity(setId, cardId, newQuantity);
      
      // Force re-render
      setRefresh(prev => prev + 1);
    }
  };

  const handleQuantityChange = (cardId, newQuantity, e) => {
    e.stopPropagation(); // Prevent card click event
    const card = localSetData.cards.find(c => c.id === cardId);
    if (card) {
      // Update the global data - no max limit
      updateCardQuantity(setId, cardId, newQuantity);
      
      // Force re-render
      setRefresh(prev => prev + 1);
    }
  };

  const handleBackToCollections = () => {
    navigate("/collection");
  };

  return (
    <div className="min-h-screen mt-16 bg-[#121212] text-white">
      {/* Header with Set Background */}
      <div className="relative h-80 w-full bg-cover bg-center" style={{ backgroundImage: `url(${localSetData.backgroundImage})` }}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 h-full flex items-center justify-between px-10">
          <div>
            <button 
              onClick={handleBackToCollections}
              className="mb-4 px-4 py-2 bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors"
            >
              ← Back to Collections
            </button>
            <h1 className="text-6xl font-bold">{localSetData.name}</h1>
            <p className="text-xl text-gray-300 mt-2">
              {totalCards === "Coming Soon" ? "Coming Soon" : `${collectedCount}/${totalCards} Cards Collected`}
            </p>
          </div>
        </div>
      </div>

      {/* Filters Bar with Rarity Stats */}
      <div className="bg-[#1a1a1a] border-y border-zinc-800 px-10 py-5 flex flex-wrap items-center gap-8">
        <div className="flex flex-col">
          <label className="text-sm text-gray-400 mb-1">Search Cards</label>
          <input
            type="text"
            placeholder="Search cards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#2a2a2a] text-white rounded-md p-2 w-64 outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-400 mb-1">Rarity</label>
          <select
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value)}
            className="bg-[#2a2a2a] text-white rounded-md p-2 w-48 outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option>All</option>
            <option>Common</option>
            <option>Rare</option>
            <option>Epic</option>
            <option>Legendary</option>
          </select>
        </div>

        {/* Rarity Stats - Centered counts */}
        {totalCards !== "Coming Soon" && (
          <div className="flex flex-wrap items-center gap-6">
            {/* Common Counter */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-gray-300 font-medium">Common</span>
              </div>
              <div className="text-lg font-bold text-gray-400 text-center">
                {rarityStats.Common.collected}/{rarityStats.Common.total}
              </div>
            </div>

            {/* Rare Counter */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-300 font-medium">Rare</span>
              </div>
              <div className="text-lg font-bold text-green-400 text-center">
                {rarityStats.Rare.collected}/{rarityStats.Rare.total}
              </div>
            </div>

            {/* Epic Counter */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-300 font-medium">Epic</span>
              </div>
              <div className="text-lg font-bold text-blue-400 text-center">
                {rarityStats.Epic.collected}/{rarityStats.Epic.total}
              </div>
            </div>

            {/* Legendary Counter */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-300 font-medium">Legendary</span>
              </div>
              <div className="text-lg font-bold text-purple-400 text-center">
                {rarityStats.Legendary.collected}/{rarityStats.Legendary.total}
              </div>
            </div>
          </div>
        )}

        {/* Stats Summary - Removed Legendary count */}
        <div className="flex items-center gap-6 ml-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">{collectedCount}</div>
            <div className="text-sm text-gray-400">Collected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">{totalCards === "Coming Soon" ? "?" : totalCards - collectedCount}</div>
            <div className="text-sm text-gray-400">Missing</div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="p-10">
        {totalCards === "Coming Soon" ? (
          <div className="text-center py-20">
            <h2 className="text-4xl font-bold text-gray-400">Coming Soon</h2>
            <p className="text-gray-500 mt-4">This set will be available in February 2026</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-2xl font-semibold mb-4">Cards ({filteredCards.length})</h3>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-amber-500 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${(collectedCount / totalCards) * 100}%` }}
                ></div>
              </div>
              <p className="text-gray-400 mt-2 text-sm">
                Progress: {collectedCount} of {totalCards} cards collected ({Math.round((collectedCount / totalCards) * 100)}%)
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {filteredCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${
                    card.collected 
                      ? 'border-amber-400 bg-gradient-to-br from-amber-500/10 to-amber-600/10' 
                      : 'border-gray-600 bg-gradient-to-br from-gray-700/50 to-gray-800/50 grayscale hover:grayscale-0'
                  }`}
                >
                  {/* Card Image */}
                  <div className="aspect-[3/4] bg-cover bg-center" style={{ backgroundImage: `url(${card.image})` }}>
                    <div className={`absolute inset-0 transition-all duration-300 ${!card.collected ? 'bg-black/70 hover:bg-black/50' : ''}`} />
                    
                    {/* Collection Status Indicator */}
                    <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                      card.collected 
                        ? 'bg-amber-400 border-amber-400' 
                        : 'bg-transparent border-gray-400'
                    }`}>
                      {card.collected && (
                        <svg className="w-4 h-4 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    {/* Quantity Indicator */}
                    {card.collected && card.quantity > 0 && (
                      <div className={`absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded-full ${
                        card.quantity >= 10 ? 'bg-green-500' : 
                        card.quantity >= 5 ? 'bg-blue-500' : 
                        card.quantity >= 2 ? 'bg-purple-500' : 
                        'bg-amber-500'
                      }`}>
                        {card.quantity > 1 ? `x${card.quantity}` : '✓'}
                      </div>
                    )}
                  </div>
                  
                  {/* Card Info */}
                  <div className="p-3">
                    <h3 className="font-semibold text-sm truncate">{card.name}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        card.rarity === 'Legendary' ? 'bg-purple-500/20 text-purple-300' :
                        card.rarity === 'Epic' ? 'bg-blue-500/20 text-blue-300' :
                        card.rarity === 'Rare' ? 'bg-green-500/20 text-green-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {card.rarity}
                      </span>
                      
                      {/* Quantity Controls - No max limit */}
                      <div className="flex items-center gap-1">
                        {card.collected ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => handleQuantityChange(card.id, Math.max(0, card.quantity - 1), e)}
                              className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded text-xs flex items-center justify-center transition-colors"
                              disabled={card.quantity === 0}
                            >
                              -
                            </button>
                            <span className="text-xs text-gray-300 w-4 text-center">
                              {card.quantity}
                            </span>
                            <button
                              onClick={(e) => handleQuantityChange(card.id, card.quantity + 1, e)}
                              className="w-6 h-6 bg-green-500 hover:bg-green-600 rounded text-xs flex items-center justify-center transition-colors"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 px-2 py-1">
                            Click to add
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredCards.length === 0 && (
              <div className="text-center py-20">
                <h3 className="text-2xl text-gray-400">No cards found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}