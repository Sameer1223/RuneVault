/**
 * Get card image path with automatic fallback.
 * Tries AVIF first, if it doesn't exist the <img> onError will load PNG instead.
 */
export function getCardImagePath(cardId: string): string {
  return `/TempCards/${cardId}.avif`;
}

/**
 * Get fallback PNG path for use in onError handlers
 */
export function getCardImageFallback(cardId: string): string {
  return `/TempCards/${cardId}.png`;
}

/**
 * Get rarity icon path with automatic fallback.
 * Tries AVIF first, if it doesn't exist the <img> onError will load PNG instead.
 */
export function getRarityIconPath(rarity: string): string {
  const rarityMap: Record<string, string> = {
    "Common": "common",
    "Uncommon": "uncommon",
    "Rare": "rare",
    "Epic": "epic",
    "Alternate Art": "alternate-art",
  };
  
  const iconName = rarityMap[rarity] || "common";
  return `/Rarities/${iconName}.avif`;
}

/**
 * Get fallback PNG path for rarity icons
 */
export function getRarityIconFallback(rarity: string): string {
  const rarityMap: Record<string, string> = {
    "Common": "common",
    "Uncommon": "uncommon",
    "Rare": "rare",
    "Epic": "epic",
    "Alternate Art": "alternate-art",
  };
  
  const iconName = rarityMap[rarity] || "common";
  return `/Rarities/${iconName}.png`;
}
