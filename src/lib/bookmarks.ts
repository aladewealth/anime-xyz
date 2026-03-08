export interface BookmarkItem {
  id: string; // mal_id or mangadex_id
  type: "anime" | "manga";
  title: string;
  image: string;
  score: number | null;
  addedAt: string;
}

export interface ReadingProgress {
  mangaId: string;
  chapterId: string;
  chapterNumber: string;
  page: number;
  totalPages: number;
  updatedAt: string;
}

const BOOKMARKS_KEY = "animexyz_bookmarks";
const PROGRESS_KEY = "animexyz_progress";

// Bookmarks
export function getBookmarks(): BookmarkItem[] {
  try {
    return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function isBookmarked(id: string, type: "anime" | "manga"): boolean {
  return getBookmarks().some((b) => b.id === id && b.type === type);
}

export function toggleBookmark(item: BookmarkItem): boolean {
  const bookmarks = getBookmarks();
  const index = bookmarks.findIndex((b) => b.id === item.id && b.type === item.type);
  if (index >= 0) {
    bookmarks.splice(index, 1);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return false; // removed
  } else {
    bookmarks.unshift(item);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return true; // added
  }
}

export function removeBookmark(id: string, type: "anime" | "manga"): void {
  const bookmarks = getBookmarks().filter((b) => !(b.id === id && b.type === type));
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
}

// Reading/watching progress
export function getProgress(mangaId: string): ReadingProgress | null {
  try {
    const all: Record<string, ReadingProgress> = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
    return all[mangaId] || null;
  } catch {
    return null;
  }
}

export function getAllProgress(): Record<string, ReadingProgress> {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveProgress(progress: ReadingProgress): void {
  const all = getAllProgress();
  all[progress.mangaId] = { ...progress, updatedAt: new Date().toISOString() };
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
}
