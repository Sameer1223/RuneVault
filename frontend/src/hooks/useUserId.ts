import { useEffect, useState } from "react";

const USER_ID_EVENT = "runevault:userIdChanged";

function readUserId() {
  return localStorage.getItem("userId");
}

/**
 * Custom hook to get the authenticated user ID from localStorage.
 * Reactive: re-renders when the ID changes, including same-tab updates
 * made by useUserSync (native "storage" events only fire in OTHER tabs).
 */
export const useUserId = () => {
  const [userId, setUserId] = useState<string | null>(readUserId);

  useEffect(() => {
    const handleChange = () => setUserId(readUserId());
    window.addEventListener("storage", handleChange);
    window.addEventListener(USER_ID_EVENT, handleChange);
    return () => {
      window.removeEventListener("storage", handleChange);
      window.removeEventListener(USER_ID_EVENT, handleChange);
    };
  }, []);

  return { userId };
};

/** Call after writing localStorage's "userId" to notify same-tab listeners (e.g. useUserId). */
export function notifyUserIdChanged() {
  window.dispatchEvent(new Event(USER_ID_EVENT));
}
