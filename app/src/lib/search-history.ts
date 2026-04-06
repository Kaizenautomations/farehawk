export interface SearchHistoryEntry {
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string;
  cabin_class: string;
  timestamp: number;
  saved?: boolean;
}

const STORAGE_KEY = "farehawk_search_history";
const MAX_ENTRIES = 10;

export function getSearchHistory(): SearchHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addSearchHistory(entry: Omit<SearchHistoryEntry, "timestamp">) {
  const history = getSearchHistory();
  // Remove duplicate routes
  const filtered = history.filter(
    (h) =>
      !(
        h.origin === entry.origin &&
        h.destination === entry.destination &&
        h.departure_date === entry.departure_date
      )
  );
  filtered.unshift({ ...entry, timestamp: Date.now() });
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(filtered.slice(0, MAX_ENTRIES))
  );
}

export function clearSearchHistory() {
  // Preserve saved entries when clearing history
  const saved = getSearchHistory().filter((h) => h.saved);
  if (saved.length > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function getSavedSearches(): SearchHistoryEntry[] {
  return getSearchHistory().filter((h) => h.saved === true);
}

export function toggleSaveSearch(entry: SearchHistoryEntry): boolean {
  const history = getSearchHistory();
  const idx = history.findIndex(
    (h) =>
      h.origin === entry.origin &&
      h.destination === entry.destination &&
      h.departure_date === entry.departure_date
  );
  if (idx === -1) return false;
  const newSaved = !history[idx].saved;
  history[idx].saved = newSaved;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return newSaved;
}
