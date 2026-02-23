/**
 * Custom hook to get authenticated user ID from localStorage
 */
export const useUserId = () => {
  const userId = localStorage.getItem("userId");
  return { userId };
};