const STORAGE_KEY = "favorites";

export function getFavorites(): string[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isFavorite(documentPath: string): boolean {
  return getFavorites().includes(documentPath);
}

export function toggleFavorite(documentPath: string): string[] {
  const current = getFavorites();
  const updated = current.includes(documentPath)
    ? current.filter((p) => p !== documentPath)
    : [...current, documentPath];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
