/** Formats an ISO date string into a short, human-readable date (e.g. "Jul 23, 2026"). */
export function formatDate(dateString?: string | null): string {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
