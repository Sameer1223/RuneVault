/** Base URL for all API requests */
// Ensure we have a trailing /api but not twice
const rawApiUrl = import.meta.env.VITE_API_URL || "";
export const API_BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

/** Card rarity types (without "All") */
export const RARITY_TYPES = ["Common", "Uncommon", "Rare", "Epic", "Alternate Art"] as const;

/** The 6 Riftbound domain colors, in a fixed display order */
export const DOMAIN_COLORS = ["Red", "Orange", "Yellow", "Green", "Blue", "Purple"] as const;

/** Domain color name -> curated hex swatch (used for filter chips, deck borders, etc.) */
export const DOMAIN_COLOR_HEX: Record<string, string> = {
  Red: "#e0483e",
  Orange: "#e8843a",
  Yellow: "#e0c23f",
  Green: "#4caf6e",
  Blue: "#4a8fe0",
  Purple: "#a466d4",
};

/** Card rarity types with "All" option for dropdowns */
export const RARITY_OPTIONS = ["All", ...RARITY_TYPES] as const;

/** Rarity name -> Tailwind text color class (used for collection stats and card accents) */
export const RARITY_COLOR_CLASS: Record<string, string> = {
  Common: "text-gray-300",
  Uncommon: "text-cyan-200",
  Rare: "text-rose-800",
  Epic: "text-orange-400",
  "Alternate Art": "text-amber-300",
};

/** Rarity name -> hex swatch (matches RARITY_COLOR_CLASS; used for card accent borders/rings) */
export const RARITY_COLOR_HEX: Record<string, string> = {
  Common: "#d1d5db",
  Uncommon: "#a5f3fc",
  Rare: "#9f1239",
  Epic: "#fb923c",
  "Alternate Art": "#fcd34d",
};

/** Legend image cover position percentages (vertical positioning for legend cards in deck backgrounds) */
export const LEGEND_IMAGE_COVER_MAP: Record<string, number> = {
  kaisa: 12,
  ahri: 27,
  sett: 3,
  jinx: 3,
  teemo: 20,
  volibear: 8,
  darius: 6,
  leesin: 12,
  viktor: 15,
  leona: 12,
  missfortune: 20,
  annie: 25,
  masteryi: 25,
  lux: 12,
  garen: 20,
  irelia: 18,
  draven: 5,
  rumble: 12,
  lucian: 5,
  reksai: 45,
  ornn: 15,
  jax: 40,
  azir: 16,
  ezreal: 25,
  renata: 6,
  sivir: 15,
  fiora: 15,
  jhin: 17,
  rengar: 35,
  pyke: 30,
  vi: 25,
  lillia: 22,
  vex: 25,
  ivern: 20,
  diana: 10,
  leblanc: 12,
  khazix: 52,
  poppy: 19,
  akali: 20,
  renekton: 15,
  zed: 50,
  nasus: 27,
  shen: 5,
  jayce: 10,
  mel: 10,
  ambessa: 14,
  kennen: 30
};

/** Legend name → signature spell card IDs */
export const LEGEND_SIGNATURE_MAP: Record<string, string[]> = {
    "Kai'Sa": ["OGN-248"],
    "Volibear": ["OGN-250"],
    "Jinx": ["OGN-252"],
    "Darius": ["OGN-254"],
    "Ahri": ["OGN-256"],
    "Lee Sin": ["OGN-258"],
    "Yasuo": ["OGN-260"],
    "Leona": ["OGN-262"],
    "Teemo": ["OGN-264"],
    "Viktor": ["OGN-266"],
    "Miss Fortune": ["OGN-268"],
    "Sett": ["OGN-270"],
    "Annie": ["OGS-018"],
    "Master Yi": ["OGS-020", "UNL-192"],
    "Lux": ["OGS-020"],
    "Garen": ["OGS-024"],
    "Rumble": ["SFD-182"],
    "Lucian": ["SFD-184"],
    "Draven": ["SFD-186"],
    "Rek'Sai": ["SFD-188"],
    "Ornn": ["SFD-190", "SFD-191", "SFD-192"],
    "Jax": ["SFD-194"],
    "Irelia": ["SFD-196"],
    "Azir": ["SFD-198"],
    "Ezreal": ["SFD-200"],
    "Renata": ["SFD-202"],
    "Sivir": ["SFD-204"],
    "Fiora": ["SFD-206"],
    "Jhin": ["UNL-182"],
    "Rengar": ["UNL-184"],
    "Pyke": ["UNL-186"],
    "Vi": ["UNL-188"],
    "Lillia": ["UNL-190"],
    "Vex": ["UNL-194"],
    "Ivern": ["UNL-196"],
    "Diana": ["UNL-198"],
    "LeBlanc": ["UNL-200"],
    "Kha'Zix": ["UNL-202"],
    "Poppy": ["UNL-204"],
    "Akali": ["VEN-140"],
    "Renekton": ["VEN-142"],
    "Zed": ["VEN-144"],
    "Nasus": ["VEN-146"],
    "Shen": ["VEN-148"],
    "Jayce": ["VEN-150"],
    "Mel": ["VEN-152"],
    "Ambessa": ["VEN-154"],
    "Kennen": ["VEN-156"]
};
