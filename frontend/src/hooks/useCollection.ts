import { useCallback, useEffect, useState } from "react";
import { useUserId } from "./useUserId";
import { useAuthFetch } from "./useAuthFetch";
import { API_BASE_URL } from "@/lib/constants";

/** Fetches the current user's real card collection (normal + foil counts) for ownership checks. */
export function useCollection() {
  const { userId } = useUserId();
  const authFetch = useAuthFetch();
  const [collection, setCollection] = useState<Record<string, number>>({});
  const [foilCollection, setFoilCollection] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchCollection = async () => {
      setLoading(true);
      try {
        const res = await authFetch(`${API_BASE_URL}/collection/${encodeURIComponent(userId)}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setCollection(data.collection || {});
            setFoilCollection(data.foil_collection || {});
          }
        }
      } catch (error) {
        console.error("Failed to fetch collection:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCollection();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const ownedCount = useCallback(
    (cardId: string) => (collection[cardId] ?? 0) + (foilCollection[cardId] ?? 0),
    [collection, foilCollection]
  );

  return { collection, foilCollection, loading, ownedCount };
}
