import { useEffect, useState } from 'react';

/**
 * Custom hook to get authenticated user ID from localStorage
 * Returns null if user is not authenticated or ID not found
 */
export const useUserId = () => {
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(parseInt(storedUserId, 10));
    }
    setLoading(false);
  }, []);

  return { userId, loading };
};
