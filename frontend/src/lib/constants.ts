/** Base URL for all API requests */
export const API_BASE_URL = import.meta.env.VITE_API_URL || "";

/** Card rarity types (without "All") */
export const RARITY_TYPES = ["Common", "Uncommon", "Rare", "Epic", "Alternate Art"] as const;

/** Card rarity types with "All" option for dropdowns */
export const RARITY_OPTIONS = ["All", ...RARITY_TYPES] as const;

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
    "Master Yi": ["OGS-020"],
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
};
